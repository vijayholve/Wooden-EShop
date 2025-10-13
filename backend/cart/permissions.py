from rest_framework import permissions
from .models import Cart, CartItem

class IsCartOwner(permissions.BasePermission):
    """
    Custom permission to only allow owners of a cart to access or edit it.
    """
    def has_object_permission(self, request, view, obj):
        # The object (obj) here is the Cart instance
        if isinstance(obj, Cart):
            return obj.user == request.user
        
        # The object (obj) here is the CartItem instance
        if isinstance(obj, CartItem):
            return obj.cart.user == request.user
            
        return False
