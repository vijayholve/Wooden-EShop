from django.db import models
from django.contrib.auth.models import User

class Customer(models.Model):
    """
    Customer profile that extends the default Django User model.
    This model holds e-commerce specific data like addresses and phone number.
    """
    # Links the Customer Profile one-to-one with the built-in Django User model
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='customer_profile')
    
    # Contact Details
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    
    # Primary Shipping Address (can be extended with a separate Address model later)
    street_address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    zip_code = models.CharField(max_length=20, blank=True, null=True)
    country = models.CharField(max_length=100, default='Unknown')

    # Additional Customer Info
    date_of_birth = models.DateField(blank=True, null=True)
    is_subscribed_to_newsletter = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.username}"
