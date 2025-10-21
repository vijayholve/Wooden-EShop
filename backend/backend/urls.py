"""
URL configuration for ecommerce_backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/X.Y/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from cart.views import CartViewSet # <-- NEW IMPORT

# Import the ViewSets from your apps
from products.views import ProductViewSet
from users.views import CustomerViewSet 

# Import JWT Views
from rest_framework_simplejwt.views import ( # <-- NEW IMPORT
    TokenObtainPairView,
    TokenRefreshView,
)

# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'products', ProductViewSet) 
router.register(r'users', CustomerViewSet) 
router.register(r'cart', CartViewSet, basename='cart') # <-- NEW: Cart ViewSet

urlpatterns = [
    # Django Admin
    path('admin/', admin.site.urls),

    # JWT Authentication Endpoints (NEW)
    # 1. Login/Get Token: POST username/password to get access/refresh token
    path('api/v1/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # 2. Refresh Token: POST refresh token to get a new access token
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # DRF Login/Logout (optional, but useful for Browsable API)
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),

    # API Root for the ViewSets
    # Primary API namespace (versioned)
    path('api/v1/', include(router.urls)),
    # Backwards-compatible unversioned API root (keeps existing clients working)
    path('api/', include(router.urls)),
    # Include users/me endpoints under the requested prefix
    path('api/users/v1/', include('users.urls')),
]

# Note: In a real-world project, you would also need to configure serving MEDIA_URL 
# during development by adding these lines (requires 'from django.conf import settings' 
# and 'from django.conf.urls.static import static' imports at the top):
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
