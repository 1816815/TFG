from django.urls import path, include
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
    SurveyViewSet,
    SurveyInstanceViewSet,
    SurveyConfigurationViewSet,
    SurveySubmissionAPIView,
    SurveyPublicAPIView,
    ParticipationResultsAPIView
)

router = DefaultRouter()
router.register(r'admin/users', UserAdminViewSet, basename='admin-users')
router.register(r'surveys', SurveyViewSet, basename='survey')

urlpatterns = [
    path('', prueba_conexion, name='holamundo'),
    path('generar-grafica', generar_grafica, name='generar_grafica'),

    # Routers base
    path('', include(router.urls)),

    # Auth
    path('token', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', CookieTokenRefreshView.as_view(), name='token_refresh'),
    path('register', RegisterView.as_view(), name='register'),
    path('logout', LogoutView.as_view(), name='logout'),

    # Usuarios y roles
    path('users/my-profile', UserProfileView.as_view(), name='my-profile'),
    path('roles', RoleListView.as_view(), name='role-list'),

    # Rutas anidadas para instancias
    path('surveys/<int:survey_id>/instances/', SurveyInstanceViewSet.as_view({'get': 'list', 'post': 'create'}), name='survey-instance-list'),
    path('surveys/<int:survey_id>/instances/<int:pk>/', SurveyInstanceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='survey-instance-detail'),

    # Configuración de encuesta
    path('surveys/<int:survey_id>/configuration/', SurveyConfigurationViewSet.as_view({'get': 'retrieve', 'put': 'update'}), name='survey-config'),

    # Encuesta pública y envío
    path('surveys/<int:survey_id>/public/', SurveyPublicAPIView.as_view(), name='survey-public'),
    path('surveys/<int:survey_id>/submit/', SurveySubmissionAPIView.as_view(), name='survey-submit'),

    # Resultados
    path('participations/<int:participation_id>/results/', ParticipationResultsAPIView.as_view(), name='participation-results'),
]
