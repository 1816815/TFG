from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..serializers import UserSerializer

class UserProfileView(APIView):
    """
    UserProfileView handles user profile retrieval and updates.

    This view requires authentication and provides two main endpoints:
    - GET: Retrieve the current user's profile data.
    - PUT: Update the current user's profile data with the provided information.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Retrieve the current user's profile data.

        Args:
            request (Request): The HTTP request object.

        Returns:
            Response: A Response object containing serialized user data.
        """
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        """
        Update the current user's profile data.

        Args:
            request (Request): The HTTP request object containing new data.

        Returns:
            Response: A Response object containing the updated user data or errors.
        """
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
