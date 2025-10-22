from django.urls import path ,include
from .views import CustomerViewSet
from .views import UserViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
# Registers UserViewSet at the base path, typically mapped to /api/v1/users/
router.register(r'', UserViewSet, basename='user')


# Bind the custom 'me' action of the CustomerViewSet to explicit routes
users_me_view = CustomerViewSet.as_view({
    'get': 'me',
    'put': 'me',
    'patch': 'me',
})

urlpatterns = [
    # Resulting full URL with project include: /api/users/v1/users/me/
    path('users/me/', users_me_view, name='users-me'),
        path('', include(router.urls)),

]

