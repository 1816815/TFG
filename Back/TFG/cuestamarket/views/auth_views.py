from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.settings import api_settings
from rest_framework.permissions import BasePermission
from rest_framework import status
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from mi_tfg import settings
import os
from ..models import User
from datetime import datetime, timedelta, timezone
from ..utils import send_activation_email
from ..serializers import RegisterSerializer

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            send_activation_email(user, request)
            return Response({"message": "Usuario registrado. Revisa tu email para activar tu cuenta."},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ActivateUserView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = get_object_or_404(User, pk=uid)
        except (TypeError, ValueError, OverflowError):
            return Response({"error": "Enlace inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({"message": "Cuenta activada correctamente."})
        else:
            return Response({"error": "Token inválido o expirado."}, status=status.HTTP_400_BAD_REQUEST)

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

class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email requerido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"message": "Si el email está registrado, recibirás un enlace."}, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        reset_url = f"{os.getenv('FRONTEND_URL')}/reset-password/{uid}/{token}"

        html_message = render_to_string("emails/password_reset_mail.html", {
            "user": user,
            "reset_url": reset_url,
        })

        plain_message = f"Hola {user.username},\n\nPara cambiar tu contraseña, visita este enlace:\n{reset_url}"

        email_obj = EmailMultiAlternatives(
            subject="Restablecer contraseña",
            body=plain_message,
            to=[user.email],
        )
        email_obj.attach_alternative(html_message, "text/html")
        email_obj.send()

        return Response({"message": "Si el email está registrado, recibirás un enlace."}, status=status.HTTP_200_OK)

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("password")

        if not all([uid, token, new_password]):
            return Response({"error": "Datos incompletos."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            uid_decoded = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=uid_decoded)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Enlace inválido."}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Token inválido o expirado."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            return Response({"error": " ".join(e.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Contraseña restablecida correctamente."}, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        current_password = request.data.get("currentPassword")
        new_password = request.data.get("newPassword")

        if not user.check_password(current_password):
            return Response({"error": "Contraseña actual incorrecta."}, status=400)

        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            return Response({"error": e.messages}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Contraseña actualizada correctamente."})

    
class PasswordValidationView(APIView):
    def post(self, request):
        password = request.data.get('password')
        user = request.user if request.user.is_authenticated else None
        try:
            validate_password(password, user=user)
        except ValidationError as e:
            return Response({'valid': False, 'errors': e.messages}, status=status.HTTP_400_BAD_REQUEST)

        return Response({'valid': True}, status=status.HTTP_200_OK)


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
