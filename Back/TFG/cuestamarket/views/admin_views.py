from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView

from ..models import User, Role
from ..serializers import UserSerializer, RoleSerializer
from .auth_views import IsAdmin


class UserAdminViewSet(viewsets.ModelViewSet):
    """
    Viewset for User model.

    This viewset provides CRUD operations and custom actions for user management
    by admins.

    Attributes:
        queryset (QuerySet): The queryset for the viewset. It is a QuerySet of
            all User instances.
        serializer_class (Serializer): The serializer for the viewset. It is
            UserSerializer.
        permission_classes (list): The list of permissions required to access
            this viewset. It requires the user to be authenticated and to be
            an admin.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

    def update(self, request, *args, **kwargs):
        """
        Updates an user instance.

        Args:
            request (Request): The HTTP request object.
            *args: Additional positional arguments.
            **kwargs: Additional keyword arguments.

        Returns:
            Response: A Response object containing the serialized user data.

        Raises:
            ValidationError: If the request data is invalid.
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """
        Deactivates a user.

        Args:
            request (Request): The HTTP request object.
            pk (int): The ID of the user to deactivate.

        Returns:
            Response: A Response object containing the serialized user data.
        """
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response(self.get_serializer(instance).data)

    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """
        Activates a user.

        Args:
            request (Request): The HTTP request object.
            pk (int): The ID of the user to activate.

        Returns:
            Response: A Response object containing the serialized user data.
        """
        instance = self.get_object()
        instance.is_active = True
        instance.save()
        return Response(self.get_serializer(instance).data)

class RoleListView(APIView):
    """
    API view for listing all roles.

    This view is responsible for handling GET requests to retrieve
    all roles in the system. It requires the user to have admin
    permissions to access the endpoint.

    Attributes:
        permission_classes (list): A list of permission classes that
            are required to access this view. It requires the user
            to be an admin.

    Methods:
        get(request): Handles GET requests to retrieve all roles
            and returns them in a serialized format.
    """
    permission_classes = [IsAdmin]

    def get(self, request):
        """
        Retrieve all roles.

        Args:
            request (Request): The HTTP request object.

        Returns:
            Response: A Response object containing serialized roles data.
        """
        roles = Role.objects.all()
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data)
