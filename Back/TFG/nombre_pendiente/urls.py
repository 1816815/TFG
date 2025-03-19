from django.urls import include, path
from . import views
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


router = DefaultRouter()





urlpatterns: list = [
     path('', views.prueba_conexion, name='holamundo'),
     path('generar-grafica/', views.generar_grafica, name='generar_grafica'),


     path('', include(router.urls)),

     path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
     path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),



]