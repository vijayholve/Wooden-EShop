from django.urls import path
from .views import CustomerViewSet

# Bind the custom 'me' action of the CustomerViewSet to explicit routes
users_me_view = CustomerViewSet.as_view({
    'get': 'me',
    'put': 'me',
    'patch': 'me',
})

urlpatterns = [
    # Resulting full URL with project include: /api/users/v1/users/me/
    path('users/me/', users_me_view, name='users-me'),
]

