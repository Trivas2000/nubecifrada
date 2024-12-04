from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import *
from .models import *
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class ObtenerGruposView(APIView):
    """
    Vistapara obtener los grupos a los que el usuario pertenece.
    """
    permission_classes = [IsAuthenticated] 

    def get(self, request):
        """
        Método GET para obtener los grupos en los que el usuario está como integrante.
        """
        # Obtener el usuario autenticado
        usuario = request.user
        # Obtener los grupos en los que el usuario está como integrante
        grupos_usuario = IntegrantesGrupo.objects.filter(uuid_user=usuario)
        # Obtener los grupos correspondientes
        grupos = GrupoCompartido.objects.filter(uuid_grupo__in=[grupo.uuid_grupo for grupo in grupos_usuario])
        # Serializar los grupos
        serializer = GrupoCompartidoSerializer(grupos, many=True)
        # Retornar la respuesta
        return Response(serializer.data)