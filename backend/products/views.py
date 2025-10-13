from rest_framework import viewsets
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing Product instances.
    Provides standard CRUD operations (Create, Read, Update, Delete) via API.
    """
    # Only show available products by default, unless the user is an admin
    queryset = Product.objects.filter(is_available=True).order_by('name')
    serializer_class = ProductSerializer
    lookup_field = 'slug' # Allows lookup using the URL slug instead of the ID
    
    # Optional: You could override get_queryset to allow staff/admins to see all products
    # def get_queryset(self):
    #     if self.request.user.is_staff:
    #         return Product.objects.all().order_by('name')
    #     return self.queryset

    # Optional: You could override perform_create/update for complex image/feature saving
