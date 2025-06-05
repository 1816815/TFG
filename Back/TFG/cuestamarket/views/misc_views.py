from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET', 'POST'])
def prueba_conexion(request):
    """
    Test view to verify connection

    This view is a simple test to verify that the connection to the API is
    working. It returns a JSON response with a message.

    Returns:
        Response: A JSON response with a message
    """
    return Response({'message': 'Hello world'}, status=status.HTTP_200_OK)
