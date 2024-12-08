from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
from .serializers import *
from .models import *
import uuid

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para la obtención de tokens.
    """
    serializer_class = CustomTokenObtainPairSerializer


class ObtenerGruposView(APIView):
    """
    Vista para obtener los grupos a los que pertenece el usuario autenticado.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """
        Método GET para obtener los grupos en los que el usuario está como integrante.
        """
        try:
            usuario = request.user
            # Obtener los UUID de los grupos donde el usuario es integrante
            grupos_usuario = IntegrantesGrupo.objects.filter(uuid_user=usuario).values_list('uuid_grupo', flat=True)

            # Obtener los detalles de los grupos
            grupos = GrupoCompartido.objects.filter(uuid_grupo__in=grupos_usuario)

            # Serializar los grupos
            serializer = GrupoCompartidoSerializer(grupos, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CreateGroupView(APIView):
    """
    Vista para crear un grupo y registrar al creador como integrante.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Obtener el nombre del grupo desde la solicitud
        group_name = request.data.get("name")
        if not group_name:
            return Response({"error": "El nombre del grupo es obligatorio"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Generar una clave pública simulada (puedes reemplazar esta lógica)
            public_key = str(2)
            grupo = None  # Inicializa la variable para evitar errores de referencia

            # Crear el grupo
            grupo = GrupoCompartido.objects.create(
                uuid_grupo=uuid.uuid4(),
                nombre_grupo=group_name,
                uuid_user_admin=request.user,
                public_key=public_key,
            )

            # Añadir al creador del grupo como integrante
            IntegrantesGrupo.objects.create(
                uuid_user=request.user,
                uuid_grupo=grupo
            )

            # Responder con éxito
            return Response({
                "message": "Grupo creado exitosamente",
                "group_id": str(grupo.uuid_grupo),
                "public_key": public_key,
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({"error": f"Error al crear el grupo: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class IntegrantesGrupoView(APIView):
    """
    Vista para obtener los integrantes de un grupo específico.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, uuid_grupo):
        try:
            # Verificar que el grupo existe
            grupo = GrupoCompartido.objects.get(uuid_grupo=uuid_grupo)

            # Obtener los integrantes del grupo
            integrantes = IntegrantesGrupo.objects.filter(uuid_grupo=grupo)

            # Serializar los datos
            serializer = IntegrantesGrupoSerializer(integrantes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except GrupoCompartido.DoesNotExist:
            return Response({"error": "Grupo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
