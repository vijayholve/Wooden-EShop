from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.contrib.auth.models import User
from .serializers import UserRegistrationSerializer, CustomerProfileSerializer
from .models import Customer
from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.filters import SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Customer # Assuming CustomUser from .models
from .serializers import UserSerializer
# You may need to create a pagination.py file if you haven't, or rely on a setting in settings.py
# If you don't have a custom pagination class, Django uses the default set in settings.
# from backend.pagination import StandardResultsSetPagination 

class UserViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and managing CustomUser instances for the admin dashboard.
    """
    # Queryset: Show all users for staff/admin to manage
    # Customer model doesn't have 'email' directly; order by related User email
    queryset = Customer.objects.select_related('user').all().order_by('user__email')
    serializer_class = UserSerializer
    
    # Security: Only authenticated admin/staff users should access this list
    permission_classes = [IsAuthenticated, IsAdminUser]
    
    # Enable filtering and searching
    filter_backends = [DjangoFilterBackend, SearchFilter]
    search_fields = ['email', 'first_name', 'last_name']
    
    # Note: DRF handles the default GET list method and pagination automatically.
    # We add a custom action to map to your non-standard URL pattern /users/list/
    # This action allows /api/v1/users/list/?page=1&size=10 to work correctly.
    @action(detail=False, methods=['get'], url_path='list')
    def list_users(self, request, *args, **kwargs):
        """Maps /users/list/ to the standard list functionality."""
        return self.list(request, *args, akwargs)

class CustomerViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows customers to be created (register) and viewed/edited (profile).
    
    - POST /api/v1/users/ -> Registration (Requires AllowAny)
    - GET/PUT/PATCH /api/v1/users/me/ -> View/Edit own profile (Requires Authentication)
    """
    queryset = User.objects.all().select_related('customer_profile')
    
    # By default, require authentication for listing, retrieving, updating
    permission_classes = [permissions.IsAuthenticated] 
    
    def get_serializer_class(self):
        """
        Selects the appropriate serializer based on the action.
        """
        # Use registration serializer for account creation
        if self.action == 'create':
            return UserRegistrationSerializer
        
        # Use a serializer that includes profile details for authenticated actions
        # When retrieving or updating, we want the nested profile data
        if self.action in ['retrieve', 'update', 'partial_update', 'me']:
            # We use the registration serializer here since it contains the nested profile
            return UserRegistrationSerializer 
        
        # For listing all users (typically admin-only), stick to a basic user serializer
        return UserRegistrationSerializer

    def get_queryset(self):
        """
        Limits the queryset so users can only perform actions on their own data.
        Admins/Staff can see all.
        """
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return User.objects.all().select_related('customer_profile')
        
        # Standard customers can only access their own user object
        return User.objects.filter(pk=user.pk).select_related('customer_profile')

    def get_permissions(self):
        """
        Allows unauthenticated users to POST (register).
        """
        if self.action == 'create':
            self.permission_classes = [permissions.AllowAny]
        else:
            # All other actions (me, update, retrieve, list) require authentication
            self.permission_classes = [permissions.IsAuthenticated]
        return super().get_permissions()

    # --- Custom Action for Profile Retrieval ---
    @action(detail=False, methods=['get', 'put', 'patch'], url_path='me')
    def me(self, request):
        """
        Allows an authenticated user to view, update, or partially update their own profile.
        Route: /api/v1/users/me/
        """
        if not request.user.is_authenticated:
            # This case should be caught by permission_classes, but serves as a fail-safe
            return Response({"detail": "Authentication credentials were not provided."}, status=status.HTTP_401_UNAUTHORIZED)
            
        user = request.user
        
        if request.method == 'GET':
            # Retrieve action
            # Ensure the customer_profile exists so response isn't null
            Customer.objects.get_or_create(user=user)
            serializer = self.get_serializer(user)
            return Response(serializer.data)

        elif request.method in ['PUT', 'PATCH']:
            # Update action (PUT/PATCH)
            
            # The serializer must be initialized with the instance to update
            # We get the user and prepare to update it with the incoming data
            serializer = self.get_serializer(
                user, 
                data=request.data, 
                partial=request.method == 'PATCH' # partial is True for PATCH
            )
            serializer.is_valid(raise_exception=True)
            
            # Since the user is updating their profile, they shouldn't be able to change
            # the core User fields like 'id' or 'is_staff' but can change the nested fields.
            
            # We need a custom update logic to handle the nested profile update
            profile_data = request.data.get('customer_profile', {})
            
            # Update core User fields if provided (e.g., email, first_name)
            user.first_name = request.data.get('first_name', user.first_name)
            user.last_name = request.data.get('last_name', user.last_name)
            user.email = request.data.get('email', user.email)
            user.save()

            # Ensure the related Customer profile exists, then update its fields
            customer_profile, _ = Customer.objects.get_or_create(user=user)
            if profile_data:
                for attr, value in profile_data.items():
                    setattr(customer_profile, attr, value)
                customer_profile.save()

            # Re-serialize and return the full updated object
            return Response(self.get_serializer(user).data)
        
        return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
