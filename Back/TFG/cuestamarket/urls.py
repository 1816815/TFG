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
    ParticipationResultsAPIView,
    submit_survey,
    survey_stats
    
)

router = DefaultRouter()
router.register(r'admin/users', UserAdminViewSet, basename='admin-users')
router.register(r'surveys', SurveyViewSet, basename='survey')
router.register(r'survey-instances', SurveyInstanceViewSet, basename='survey-instance')
router.register(r'survey-configuration', SurveyConfigurationViewSet, basename='survey-configuration')

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


    # Encuesta pública y envío
    path('surveys/<int:instance_id>/public/', SurveyPublicAPIView.as_view(), name='survey-public'),
    path('surveys/<int:instance_id>/submit/', submit_survey, name='survey-submit'),
    path('participations/<int:participation_id>/results/', ParticipationResultsAPIView.as_view(), name='participation-results'),
    path('surveys/<int:survey_id>/instances/<int:instance_id>/stats/', survey_stats, name='survey-stats'),


]
