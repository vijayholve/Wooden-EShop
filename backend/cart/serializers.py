from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductSerializer 

class CartItemReadSerializer(serializers.ModelSerializer):
    """
    Serializer for viewing CartItem details (READ-ONLY).
    Includes nested product details and calculates the subtotal.
    """
    # Use the existing ProductSerializer to include full product details
    product = ProductSerializer(read_only=True)
    
    # Calculate subtotal using the model property
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'quantity', 'price_at_addition', 'subtotal'
        ]

class CartItemWriteSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating CartItems (WRITE-ONLY).
    Only requires the product ID and quantity from the user.
    """
    # Requires only the product's primary key (ID) for input
    product_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = CartItem
        # Note: 'cart' is excluded because it is set automatically in the view
        fields = ['product_id', 'quantity'] 
        
    def validate(self, data):
        """
        Validates product ID exists and checks stock level.
        """
        from products.models import Product # Import locally to avoid circular dependency
        
        # Check if the product exists
        try:
            product = Product.objects.get(id=data['product_id'])
        except Product.DoesNotExist:
            raise serializers.ValidationError({"product_id": "Product with this ID does not exist."})

        # Check if the product is in stock
        if product.in_stock_quantity < data['quantity']:
            raise serializers.ValidationError({
                "quantity": f"Only {product.in_stock_quantity} units of this product are in stock."
            })
            
        data['product'] = product # Pass the product object to the create/update methods
        return data
        
    def create(self, validated_data):
        """
        Custom create method handles updating the cart item if it already exists, 
        or creating a new one otherwise.
        """
        # Get the Cart instance from the context set in the ViewSet
        cart = self.context.get('cart')
        product = validated_data['product']
        quantity = validated_data['quantity']
        
        # Store the current price for order integrity
        price_at_addition = product.current_price 

        # Check if the item already exists in the cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart, 
            product=product,
            defaults={
                'quantity': quantity,
                'price_at_addition': price_at_addition
            }
        )
        
        if not created:
            # If item exists, update the quantity (default behavior is to replace/set the quantity)
            cart_item.quantity = quantity
            cart_item.price_at_addition = price_at_addition # Update price in case it changed
            cart_item.save()
            
        return cart_item

class CartSerializer(serializers.ModelSerializer):
    """
    Main serializer for the entire Cart object.
    """
    # Nested serializer to show all items in the cart (Read-Only)
    items = CartItemReadSerializer(many=True, read_only=True) 
    
    # Expose calculated properties from the Cart model
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = [
            'id', 'user', 'created_at', 'updated_at', 'items', 
            'total_items', 'total_price'
        ]
        read_only_fields = ['user']
    