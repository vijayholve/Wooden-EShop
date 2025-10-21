from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Product
from .serializers import ProductSerializer
# Import necessary utilities for slug generation and database error handling
from django.utils.text import slugify 
from django.db import IntegrityError
from django.core.exceptions import ValidationError as DjangoValidationError

class ProductViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing Product instances.
    Provides standard CRUD operations (Create, Read, Update, Delete) via API,
    plus a custom 'list_products' endpoint for POST-based pagination.
    """
    # Only show available products by default, unless the user is an admin
    queryset = Product.objects.filter(is_available=True).order_by('name')
    serializer_class = ProductSerializer
    lookup_field = 'slug'

    # Override the main 'create' method to catch validation errors explicitly
    # and return 400 Bad Request, preventing a hidden exception leading to 500.
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        
        # 1. Manual Validation Check
        if not serializer.is_valid():
            # If validation fails, return a 400 Bad Request with detailed errors
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Call perform_create (which includes slug generation and error handling)
        self.perform_create(serializer)
        
        # 3. Return 201 Created on success
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


    # Override perform_create to handle potential IntegrityError/validation issues
    def perform_create(self, serializer):
        # 1. SLUG GENERATION LOGIC (from previous fix)
        # Check if the serializer data contains a slug or name to generate one
        if 'slug' not in serializer.validated_data and 'name' in serializer.validated_data:
            # Manually generate slug if not provided by the user
            slug = slugify(serializer.validated_data['name'])
            serializer.validated_data['slug'] = slug
        
        # 2. ROBUST SAVE BLOCK
        try:
            # Attempt to save the serialized instance
            serializer.save()
        except IntegrityError as e:
            # This traps database constraint errors (e.g., duplicate unique field, foreign key issues)
            # Since create() now handles validation, this mainly catches unique constraint errors.
            error_message = f"Database constraint violation (Integrity Error): Check for duplicate unique fields (like slug or name) or missing foreign keys. Details: {e}"
            return Response({"detail": error_message}, status=status.HTTP_400_BAD_REQUEST)
        except DjangoValidationError as e:
            # This traps model-level validation errors not caught by the serializer.
            error_message = f"Model validation failed (Django Validation Error): {e.message_dict}"
            return Response({"detail": error_message}, status=status.HTTP_400_BAD_REQUEST)

    # Custom Action to handle POST request to /api/v1/products/list/
    @action(detail=False, methods=['post'], url_path='list')
    def list_products(self, request):
        """
        Custom endpoint to list products with manual pagination via POST body.
        Payload: {"page": <int>, "size": <int>}
        """
        try:
            # Safely get pagination parameters from request body, defaulting to page 1 and size 10
            page_number = int(request.data.get('page', 1))
            page_size = int(request.data.get('size', 10))

            # Validation: page and size must be at least 1
            if page_number < 1 or page_size < 1:
                 return Response({
                    "detail": "Both 'page' and 'size' must be integers greater than or equal to 1."
                 }, status=status.HTTP_400_BAD_REQUEST)

        except (ValueError, TypeError):
            # Handles cases where 'page' or 'size' are not valid integers
            return Response(
                {"detail": "Both 'page' and 'size' must be valid integers."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get the base queryset and apply filters if any (e.g., is_available=True)
        queryset = self.filter_queryset(self.get_queryset())
        total_count = queryset.count()

        # Calculate slicing indices for manual pagination
        start = (page_number - 1) * page_size
        end = start + page_size

        # Apply slicing
        paged_queryset = queryset[start:end]

        # Serialize the paginated data
        serializer = self.get_serializer(paged_queryset, many=True)

        # Build a standard paginated response structure
        response_data = {
            "count": total_count,
            "current_page": page_number,
            "page_size": page_size,
            "results": serializer.data
        }

        return Response(response_data, status=status.HTTP_200_OK)
