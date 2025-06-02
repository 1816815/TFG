from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    prueba_conexion,
    generar_grafica,
    RegisterView,
    CustomTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
    UserAdminViewSet,
    RoleListView,
    UserProfileView,
)

router = DefaultRouter()
router.register(r'admin/users', UserAdminViewSet, basename='admin-users')

urlpatterns = [
    path('', prueba_conexion, name='holamundo'),
    path('generar-grafica', generar_grafica, name='generar_grafica'),
    path('', include(router.urls)),
    path('token', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('register', RegisterView.as_view(), name='register'),
    path('logout', LogoutView.as_view(), name='logout'),
    path('users/my-profile', UserProfileView.as_view(), name='my-profile'),
    path('roles', RoleListView.as_view(), name='role-list'),
]
