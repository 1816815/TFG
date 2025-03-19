from django.shortcuts import get_object_or_404

from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated

import base64
import io
import json
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns


@api_view(['GET', 'POST'])
def prueba_conexion(request):
    return Response({'message': 'Hola mundo'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def generar_grafica(request):
    try:
        # Recibir JSON desde el frontend
        data = request.data.get('data')
        if not data:
            return Response({"error": "No se proporcionaron datos"}, status=400)
        
        # Convertir JSON a DataFrame de pandas
        df = pd.DataFrame(data)

        # Asegurar que hay datos suficientes
        if df.empty or df.shape[1] < 2:
            return Response({"error": "Datos insuficientes"}, status=400)
        
        # Crear gráfico con seaborn
        plt.figure(figsize=(8, 6))
        sns.lineplot(data=df)
        plt.title("Gráfico Generado")
        plt.xlabel("Índice")
        plt.ylabel("Valores")

        # Guardar el gráfico en base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format="png")
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()

        return Response({"image": f"data:image/png;base64,{image_base64}"})

    except Exception as e:
        return Response({"error": str(e)}, status=500)