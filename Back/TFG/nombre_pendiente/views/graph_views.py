import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
import io
import base64
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view

@api_view(['POST'])
def generar_grafica(request):
    try:
        data = request.data.get('data')
        if not data:
            return Response({"error": "No se proporcionaron datos"}, status=400)
        df = pd.DataFrame(data)
        if df.empty or df.shape[1] < 2:
            return Response({"error": "Datos insuficientes"}, status=400)
        plt.figure(figsize=(8, 6))
        sns.lineplot(data=df)
        plt.title("Gráfico Generado")
        buffer = io.BytesIO()
        plt.savefig(buffer, format="png")
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        return Response({"image": f"data:image/png;base64,{image_base64}"})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
