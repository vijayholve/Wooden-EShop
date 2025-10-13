from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from products.models import Product

class Cart(models.Model):
    """
    Represents a user's shopping cart. Every authenticated user gets one cart.
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart of {self.user.username}"
    
    @property
    def total_items(self):
        """Calculates the total number of items (quantity) in the cart."""
        return sum(item.quantity for item in self.items.all())

    @property
    def total_price(self):
        """Calculates the total price of all items in the cart."""
        return sum(item.subtotal for item in self.items.all())

class CartItem(models.Model):
    """
    Represents a specific product and quantity within a Cart.
    """
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    
    # Store the price at the time the item was added/updated to track potential changes
    # This is a common practice for e-commerce to ensure order integrity.
    price_at_addition = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        # Ensures a user can only have one of a specific product in their cart
        unique_together = ('cart', 'product')

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in {self.cart.user.username}'s cart"
    
    @property
    def subtotal(self):
        """Calculates the subtotal for this item (price * quantity)."""
        return self.price_at_addition * self.quantity

# --- Signals to automatically create a Cart for a new User ---
@receiver(post_save, sender=User)
def create_user_cart(sender, instance, created, **kwargs):
    """
    Signal receiver to automatically create a Cart instance when a new User is created.
    """
    if created:
        # Only create a cart if the user object was just created
        Cart.objects.create(user=instance)

# Ensure the signal is connected when the app is ready (handled by Django)
