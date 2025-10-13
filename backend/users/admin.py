from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import Customer

class CustomerInline(admin.StackedInline):
    """
    Allows editing the Customer profile directly on the User admin page.
    """
    model = Customer
    can_delete = False
    verbose_name_plural = 'Customer Profile Details'
    # Define the fields to display/edit
    fieldsets = [
        (None, {'fields': ('phone_number', 'is_subscribed_to_newsletter', 'date_of_birth')}),
        ('Primary Address', {'fields': ('street_address', 'city', 'state', 'zip_code', 'country')}),
    ]

class UserAdmin(BaseUserAdmin):
    """
    Custom UserAdmin to integrate the Customer Inline profile.
    """
    inlines = (CustomerInline,)
    # Custom fieldsets can be defined here if needed

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Register the standalone Customer model (mostly for direct viewing, though inline is preferred)
# admin.site.register(Customer) 
