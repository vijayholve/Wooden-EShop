from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemReadSerializer, CartItemWriteSerializer
from .permissions import IsCartOwner

class CartViewSet(viewsets.GenericViewSet):
    """
    API endpoints for managing the user's shopping cart.
    A user can only interact with their own cart.
    
    Primary Route: /api/v1/cart/ (retrieves the user's current cart)
    Item Management: /api/v1/cart/items/ (for adding, updating, removing items)
    """
    # The initial queryset is for the Cart model
    queryset = Cart.objects.all()
    
    # Require authentication for all actions
    permission_classes = [permissions.IsAuthenticated, IsCartOwner]

    def get_object(self):
        """
        Custom method to ensure the user only interacts with their own cart.
        """
        # The cart model signal ensures every authenticated user has a cart
        return get_object_or_404(Cart, user=self.request.user)

    def get_serializer_class(self):
        """
        Selects the serializer based on the action.
        """
        if self.action in ['add_item', 'update_item', 'remove_item']:
            return CartItemWriteSerializer
        if self.action == 'list' or self.action == 'retrieve':
            return CartSerializer
        # Fallback to the full CartSerializer
        return CartSerializer 
        
    def retrieve(self, request, pk=None):
        """
        Retrieve the currently logged-in user's cart (GET /api/v1/cart/{cart_pk}/)
        Note: Since we use list() for the main cart view, this retrieve is mainly for 
        specific cart IDs, which is not typically needed in this design.
        We'll use list() for the main 'my cart' view.
        """
        instance = self.get_object()
        # Perform object-level permission check
        self.check_object_permissions(request, instance)
        serializer = CartSerializer(instance)
        return Response(serializer.data)

    def list(self, request):
        """
        Retrieve the currently logged-in user's cart (GET /api/v1/cart/)
        We override list to return only the user's cart instance.
        """
        # This will fetch the unique cart associated with the logged-in user
        instance = self.get_object() 
        # No need for check_object_permissions here as get_object already limits the query
        serializer = CartSerializer(instance)
        return Response(serializer.data)
        
    # --- Custom Actions for Item Management ---

    @action(detail=False, methods=['post'], url_path='items/add')
    def add_item(self, request):
        """
        Add a new item to the cart or update the quantity of an existing item.
        POST /api/v1/cart/items/add/
        Body: {"product_id": 1, "quantity": 2}
        """
        cart = self.get_object()
        serializer = self.get_serializer(data=request.data, context={'cart': cart})
        serializer.is_valid(raise_exception=True)
        
        # The create method in the serializer handles the logic: 
        # adding a new item or updating quantity/price of existing item
        cart_item = serializer.create(serializer.validated_data) 
        
        # Return the updated cart item details
        return Response(
            CartItemReadSerializer(cart_item).data, 
            status=status.HTTP_201_CREATED
        )

    @action(detail=False, methods=['delete'], url_path=r'items/(?P<item_pk>[^/.]+)')
    def remove_item(self, request, item_pk=None):
        """
        Remove a specific CartItem from the cart.
        DELETE /api/v1/cart/items/{item_pk}/
        """
        cart = self.get_object()
        
        # Find the cart item within the user's cart
        cart_item = get_object_or_404(CartItem, pk=item_pk, cart=cart)
        
        # Perform the deletion
        cart_item.delete()
        
        # Return the updated cart summary
        updated_cart = self.get_object()
        return Response(
            CartSerializer(updated_cart).data, 
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['put', 'patch'], url_path=r'items/(?P<item_pk>[^/.]+)')
    def update_item(self, request, item_pk=None):
        """
        Update the quantity of a specific CartItem.
        PUT/PATCH /api/v1/cart/items/{item_pk}/
        Body: {"quantity": 5}
        """
        cart = self.get_object()
        cart_item = get_object_or_404(CartItem, pk=item_pk, cart=cart)
        
        # We use the WriteSerializer here to validate stock and product constraints
        serializer = self.get_serializer(
            cart_item, 
            data=request.data, 
            partial=request.method == 'PATCH', 
            context={'cart': cart}
        )
        serializer.is_valid(raise_exception=True)
        
        # Update only the quantity field directly
        new_quantity = serializer.validated_data.get('quantity')
        if new_quantity is not None:
            cart_item.quantity = new_quantity
            cart_item.save()

        # Return the updated cart item details
        return Response(
            CartItemReadSerializer(cart_item).data, 
            status=status.HTTP_200_OK
        )
