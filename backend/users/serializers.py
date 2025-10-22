from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Customer
# from rest_framework import serializers
# from .models import CustomUser # Assuming your custom user model is CustomUser

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the CustomUser model, used for listing users in the dashboard.
    """
    class Meta:
        model = Customer
        fields = (
            'id', 
            'email', 
            'first_name', 
            'last_name', 
            'is_staff', 
            'is_active',
            'date_joined'
        )
        read_only_fields = fields

class CustomerProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the Customer profile details (address, phone, etc.).
    Used for retrieving and updating existing customer profiles.
    """
    class Meta:
        model = Customer
        # Note: 'user' field is excluded as it's managed by the UserSerializer
        fields = [
            'phone_number', 'street_address', 'city', 'state', 'zip_code', 
            'country', 'date_of_birth', 'is_subscribed_to_newsletter'
        ]
        read_only_fields = ['created_at', 'updated_at']

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for registering a new User and their linked Customer profile.
    """
    # Nested field to handle the Customer profile details during registration
    customer_profile = CustomerProfileSerializer()
    
    # Re-declare password write-only for security
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 'password', 
            'customer_profile',
        ]
        extra_kwargs = {'email': {'required': True}}

    def create(self, validated_data):
        """
        Custom create method to handle creating both the User and Customer profile.
        """
        # 1. Extract the nested profile data
        profile_data = validated_data.pop('customer_profile')
        
        # 2. Create the User object (this handles password hashing automatically)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # 3. Create the linked Customer profile
        Customer.objects.create(user=user, **profile_data)
        
        return user
