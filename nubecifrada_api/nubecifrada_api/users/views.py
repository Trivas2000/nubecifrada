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

       # Obtener los UUID de los grupos en los que el usuario está como integrante
        grupos_usuario = IntegrantesGrupo.objects.filter(uuid_user=usuario).values_list('uuid_grupo', flat=True)
        
        # Obtener los grupos correspondientes usando los UUIDs
        grupos = GrupoCompartido.objects.filter(uuid_grupo__in=grupos_usuario)

        # Serializar los grupos
        serializer = GrupoCompartidoSerializer(grupos, many=True)
        # Retornar la respuesta
        return Response(serializer.data)
    

class CreateGroupView(APIView):
    """
    clase para poder crear un grupo, se crea el registro en ambas tablas,
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # Obtener el nombre del grupo del cuerpo de la solicitud
        group_name = request.data.get("name")
        if not group_name:
            return Response({"error": "El nombre del grupo es obligatorio"}, status=400)
        try:
            # Generar claves del grupo
            public_key = str(2)
            # Crear el grupo en la base de datos
            try:
                print(" se empieza a crear grupo")
                grupo = GrupoCompartido.objects.create(
                    uuid_grupo=uuid.uuid4(),
                    nombre_grupo=group_name,
                    uuid_user_admin=request.user,
                    public_key=public_key,
                )
                print("se crea grupo")
            except Exception as e:
                print(e)


            # Añadir al creador del grupo como integrante
            integrante = IntegrantesGrupo.objects.create(
                uuid_user=request.user,
                uuid_grupo=grupo
            )

            # Devolver la clave privada para que pueda ser guardada localmente por el cliente
            return Response({
                "message": "Grupo creado exitosamente",
                "group_id": str(grupo.uuid_grupo),
                "public_key": public_key,
            })

        except Exception as e:
            return Response({"error": f"Error al crear el grupo: {str(e)}"}, status=500)
        

class IntegrantesGrupoView(APIView):
    def get(self, request, uuid_grupo):
        try:
            grupo = GrupoCompartido.objects.get(uuid_grupo=uuid_grupo)
            integrantes = IntegrantesGrupo.objects.filter(uuid_grupo=grupo)
            serializer = IntegrantesGrupoSerializer(integrantes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except GrupoCompartido.DoesNotExist:
            return Response({"error": "Grupo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)