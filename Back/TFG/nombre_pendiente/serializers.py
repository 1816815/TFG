from rest_framework import serializers
from .models import User, Role
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name']

class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'role_id', 'password']
        extra_kwargs = {
            'password': {'write_only': True, 'required': False},
        }

    def create(self, validated_data):
        role_id = validated_data.pop('role_id', None)
        password = validated_data.pop('password', None)
        
        # Crear el usuario
        user = User(**validated_data)
        
        # Establecer la contraseña si se proporcionó
        if password:
            user.set_password(password)
        
        # Asignar rol si se proporcionó
        if role_id:
            try:
                role = Role.objects.get(id=role_id)
                user.role = role
            except Role.DoesNotExist:
                pass
                
        user.save()
        return user
    
    def update(self, instance, validated_data):
        role_id = validated_data.pop('role_id', None)
        password = validated_data.pop('password', None)
        
        # Actualizar campos básicos
        for key, value in validated_data.items():
            setattr(instance, key, value)
        
        # Actualizar contraseña si se proporcionó
        if password:
            instance.set_password(password)
            
        # Actualizar rol si se proporcionó
        if role_id is not None:
            try:
                role = Role.objects.get(id=role_id)
                instance.role = role
            except Role.DoesNotExist:
                instance.role = None
                
        instance.save()
        return instance

    