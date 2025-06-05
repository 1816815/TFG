from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings
from rest_framework.permissions import BasePermission
from rest_framework import status
from mi_tfg import settings
from datetime import datetime, timedelta, timezone

from ..serializers import RegisterSerializer

class RegisterView(APIView):
    """
    View for registering new users.

    This view handles the registration of new users by accepting a
    POST request with user data, validating it, and creating a new
    User instance if the data is valid.

    Attributes:
        permission_classes (list): List of permission classes for the view,
            allowing unrestricted access.

    Methods:
        post(request): Handles POST requests to register a new user.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Handle POST requests to register a new user.

        This method validates the incoming user data using the
        RegisterSerializer and creates a new User instance if the
        data is valid.

        Args:
            request (Request): The HTTP request object containing user data.

        Returns:
            Response: A Response object with a success message and status code
            if the user is registered successfully, or an error message and
            status code if the data is invalid.
        """
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "Usuario registrado correctamente"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom view for obtaining token pairs (access and refresh tokens).

    This view extends the TokenObtainPairView to customize the behavior of
    token generation. It sets the access and refresh tokens as cookies
    in the response for easier client-side management.

    Attributes:
        serializer_class (Serializer): The serializer class used for token
            pair generation, set to TokenObtainPairSerializer.
    """
    serializer_class = TokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        """
        Handle POST requests to obtain token pairs.

        This method extends the default behavior by setting the generated
        access and refresh tokens as HTTP-only cookies in the response.

        Args:
            request (Request): The HTTP request object.
            *args: Additional positional arguments.
            **kwargs: Additional keyword arguments.

        Returns:
            Response: The response object with access and refresh tokens
            set as cookies.
        """
        response = super().post(request, *args, **kwargs)

        refresh_token = response.data.get("refresh")
        access_token = response.data.get("access")

        if refresh_token:
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/',
                max_age=7 * 24 * 60 * 60,
            )
        
        if access_token:
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/',
                max_age=api_settings.ACCESS_TOKEN_LIFETIME.total_seconds(),
            )

        return response


class CookieTokenRefreshView(TokenRefreshView):
    """
    A view that takes a refresh token from a cookie and returns a new access token.
    
    This view is used to obtain a new access token when the existing one has expired.
    It takes the refresh token from the cookie and returns a new access token.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        """
        Returns a new access token based on the refresh token in the cookie.
        """
        refresh_token = request.COOKIES.get('refresh_token')
        if not refresh_token:
            return Response({'detail': 'No refresh token provided'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            new_access_token = str(token.access_token)

            response = Response({'access_token': new_access_token}, status=status.HTTP_200_OK)
            response.set_cookie(
                key='access_token',
                value=new_access_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/',
                max_age=settings.SIMPLE_JWT['ACCESS_TOKEN_LIFETIME'].total_seconds(),
            )
            return response
        except Exception:
            return Response({'detail': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    """
    View for logging out. Deletes the refresh token cookie and blacklists it.
    """
    def post(self, request):
        """
        Logs out the user, deleting the refresh token cookie and blacklisting it.
        """
        refresh_token = request.COOKIES.get('refresh_token')
        response = Response({'detail': 'Logged out'}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')
        response.delete_cookie('access_token')
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass
        return response

class IsClient(BasePermission):
    """
    Checks if the user is authenticated and has client role, or is an admin or staff.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role.name == 'client' or request.user.role.name == 'admin' or request.user.is_staff


class IsAdmin(BasePermission):
    """
    Checks if the user is authenticated and has admin role or is staff.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role.name == 'admin' or request.user.is_staff
