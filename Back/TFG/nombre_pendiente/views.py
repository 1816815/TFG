import math
from django.conf import settings
from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.decorators import api_view, action
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import RegisterSerializer, UserSerializer, RoleSerializer
from .models import User, Role

import os
import numpy as np
import base64
import io
import json
import csv
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns


@api_view(['GET', 'POST'])
def prueba_conexion(request):
    return Response({'message': 'Hola mundo'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def generar_grafica(request):
    try:
        # Recieve JSON from frontend
        data = request.data.get('data')
        if not data:
            return Response({"error": "No se proporcionaron datos"}, status=400)
        
        # Convert JSON to Pandas DataFrame
        df = pd.DataFrame(data)

        if df.empty or df.shape[1] < 2:
            return Response({"error": "Datos insuficientes"}, status=400)
        
        # Create graphic on seaborn
        plt.figure(figsize=(8, 6))
        sns.lineplot(data=df)
        plt.title("Gráfico Generado")
        plt.xlabel("Índice")
        plt.ylabel("Valores")

        # Save graphic on base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format="png")
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()

        return Response({"image": f"data:image/png;base64,{image_base64}"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "Usuario registrado correctamente"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = TokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        refresh_token = response.data.get("refresh")
        if refresh_token:
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/',
                max_age=7 * 24 * 60 * 60
            )
        return response

 
class CookieTokenRefreshView(TokenRefreshView):
    """
    Class to refresh the access token using the refresh token stored in cookies.
    The refresh token is sent in the request body, and a new access token is returned in the response.
    """
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            return Response({'detail': 'No refresh token provided'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            access_token = str(token.access_token)
            new_refresh_token = str(token)

            response = Response({'access': access_token}, status=status.HTTP_200_OK)
            response.set_cookie(
                key='refresh_token',
                value=new_refresh_token,
                httponly=True,
                secure=False,
                samesite='Lax',
                path='/',
                max_age=7 * 24 * 60 * 60
            )

            return response

        except Exception as e:
            return Response({'detail': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
        
class LogoutView(APIView):
    def post(self, request):
        refresh_token = request.COOKIES.get('refresh_token')

        response = Response({'detail': 'Logged out'}, status=status.HTTP_200_OK)
        response.delete_cookie('refresh_token')

        if not refresh_token:
            return response

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()  # Blaclist the refresh token
        except TokenError:
            pass

        return response
    
class IsAdminUserRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role.name == 'admin' or request.user.is_staff

class UserAdminViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUserRole]

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as e:
            print("Validation error:", e.detail)
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        self.perform_update(serializer)
        return Response(serializer.data)
     #Método para desactivar en lugar de borrar
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
        
    # Método para reactivar un usuario
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        instance = self.get_object()
        instance.is_active = True
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class RoleListView(APIView):
    permission_classes = [IsAdminUserRole]

    def get(self, request):
        roles = Role.objects.all()
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data)