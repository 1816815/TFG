# views/__init__.py

from .auth_views import (
    RegisterView,
    CustomTokenObtainPairView,
    CookieTokenRefreshView,
    LogoutView,
)

from .admin_views import (
    UserAdminViewSet,
    RoleListView,
    IsAdminUserRole,
)

from .profile_views import (
    UserProfileView,
)

from .graph_views import (
    generar_grafica,
)

from .misc_views import (
    prueba_conexion,
)

# Reexportar explícitamente para autocompletado y limpieza
__all__ = [
    # Auth
    "RegisterView", "CustomTokenObtainPairView", "CookieTokenRefreshView", "LogoutView",

    # Admin
    "UserAdminViewSet", "RoleListView", "IsAdminUserRole",

    # Perfil
    "UserProfileView",

    # Gráficas
    "generar_grafica",

    # Misceláneo
    "prueba_conexion",
]
