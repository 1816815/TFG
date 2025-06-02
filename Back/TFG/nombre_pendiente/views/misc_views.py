from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET', 'POST'])
def prueba_conexion(request):
    return Response({'message': 'Hola mundo'}, status=status.HTTP_200_OK)
