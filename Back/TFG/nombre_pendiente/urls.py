from django.urls import include, path
from . import views
from .views import RegisterView, CustomTokenObtainPairView, CookieTokenRefreshView, LogoutView, UserAdminViewSet, RoleListView
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'admin/users', UserAdminViewSet, basename='admin-users')

urlpatterns: list = [
     path('', views.prueba_conexion, name='holamundo'),
     path('generar-grafica/', views.generar_grafica, name='generar_grafica'),


     path('', include(router.urls)),

     path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
     path('token/refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),

     path('register/', RegisterView.as_view(), name='register'),
     path('logout/', LogoutView.as_view(), name='logout'),

     path('roles/', RoleListView.as_view(), name='role-list'),

]