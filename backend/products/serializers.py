from rest_framework import serializers
from .models import Product, ProductImage, ProductFeature

class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for product images."""
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_main', 'order']

class ProductFeatureSerializer(serializers.ModelSerializer):
    """Serializer for product features (key-value pairs)."""
    class Meta:
        model = ProductFeature
        fields = ['id', 'feature_name', 'feature_value']

class ProductSerializer(serializers.ModelSerializer):
    """
    Main serializer for the Product model, including nested images and features.
    """
    # Nested serializers for read-only display
    images = ProductImageSerializer(many=True, read_only=True)
    features = ProductFeatureSerializer(many=True, read_only=True)
    
    # Calculated field for the final price
    final_price = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        source='get_discounted_price', 
        read_only=True
    )

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'brand', 'short_description', 'long_description', 
            'theme', 'genre', 'price', 'discount_percent', 'final_price',
            'stock_quantity', 'is_available', 'created_at', 'updated_at', 
            'images', 'features'
        ]
        read_only_fields = ('created_at', 'updated_at', 'slug')
