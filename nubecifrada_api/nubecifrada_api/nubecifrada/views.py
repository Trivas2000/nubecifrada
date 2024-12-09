from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.http import HttpResponse, Http404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .serializers import *
from .models import *
import uuid
import os
from .generateGroupPublicKeys import generate_group_keys
'''
CustomTokenObtainPairView: Vista personalizada para la obtención de tokens JWT. 
Permite incluir información adicional del usuario (UUID y nombre de usuario) en la respuesta.

ObtenerGruposView: Vista para obtener los grupos a los que pertenece el usuario autenticado.
Requiere autenticación y devuelve información de los grupos donde el usuario está como integrante.

ObtenerArchivosGrupoView: Vista para listar los archivos compartidos en un grupo específico.
Requiere autenticación y valida la existencia del grupo antes de listar sus archivos.

CreateGroupView: Vista para crear un nuevo grupo. El creador se añade automáticamente como integrante del grupo.
Incluye validación del nombre del grupo y manejo de errores en la creación.

IntegrantesGrupoView: Vista para obtener la lista de integrantes de un grupo específico.
Requiere autenticación y valida la existencia del grupo antes de devolver los datos.

ObtenerUsuariosView: Vista para listar todos los usuarios registrados en la plataforma.
Requiere autenticación y serializa los datos de los usuarios.

UploadEncryptedFileView: Vista para subir y guardar un archivo cifrado en el sistema.
Incluye validación de la existencia del grupo y del usuario subidor antes de registrar el archivo.

DescargarArchivoView: Vista para descargar un archivo cifrado previamente subido al sistema.
Valida la existencia del archivo tanto en la base de datos como en el sistema de archivos.
'''
class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para la obtención de tokens.
    """

    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            user = serializer.user

            response.data['uuid_user'] = str(user.uuid_user)
            response.data['username'] = user.username

            return response

        except Exception as e:
            print(f"Error autenticando usuario: {e}")  # Log para depuración
            return Response({"detail": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)


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
        except IntegrantesGrupo.DoesNotExist:
            return Response({"error": "No se encontraron grupos para el usuario"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ObtenerArchivosGrupoView(APIView):
    """
    Vista para obtener los archivos compartidos en un grupo específico.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, uuid_grupo):
        """
        Método GET para obtener los archivos compartidos en un grupo.
        """
        try:
            # Verificar que el grupo existe
            grupo = GrupoCompartido.objects.get(uuid_grupo=uuid_grupo)

            # Obtener los archivos compartidos en el grupo
            archivos = ArchivosCompartidos.objects.filter(uuid_grupo=grupo)

            
            # Serializar los archivos
            serializer = ArchivosCompartidosSerializer(archivos, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except GrupoCompartido.DoesNotExist:
            return Response({"error": "Grupo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except ArchivosCompartidos.DoesNotExist:
            return Response({"error": "No se encontraron archivos para el grupo"}, status=status.HTTP_404_NOT_FOUND)
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

            # Crear el grupo
            grupo = GrupoCompartido.objects.create(
                uuid_grupo=uuid.uuid4(),
                nombre_grupo=group_name,
                uuid_user_admin=request.user,
           
            )

            # Añadir al creador del grupo como integrante
            IntegrantesGrupo.objects.create(
                uuid_user=request.user,
                uuid_grupo=grupo,
                uuid_user_invitador=request.user,
                llave_maestra_cifrada=b''
            )

            # Responder con éxito
            return Response({
                "message": "Grupo creado exitosamente",
                "group_id": str(grupo.uuid_grupo)
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


@api_view(['DELETE'])
def eliminar_integrante(request, uuid_grupo, uuid_integrante):
    try:
        print(uuid_grupo, uuid_integrante)
        integrante = IntegrantesGrupo.objects.get(uuid_grupo=uuid_grupo, uuid_user=uuid_integrante)
        integrante.delete()
        return Response({"message": "Integrante eliminado correctamente"}, status=status.HTTP_200_OK)
    except IntegrantesGrupo.DoesNotExist:
        return Response({"error": "Integrante no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



@api_view(['POST'])
def anadir_integrante(request, uuid_grupo, uuid_integrante):
    try:
        # Validar que el grupo existe
        grupo = GrupoCompartido.objects.get(uuid_grupo=uuid_grupo)

        # Validar que el usuario existe
        usuario = User.objects.get(uuid_user=uuid_integrante)

        # Crear el integrante
        IntegrantesGrupo.objects.create(uuid_grupo=grupo, uuid_user=usuario,uuid_user_invitador=request.user,llave_maestra_cifrada=b'')

        return Response({"message": "Integrante añadido correctamente"}, status=status.HTTP_201_CREATED)

    except GrupoCompartido.DoesNotExist:
        return Response({"error": "Grupo no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except User.DoesNotExist:
        return Response({"error": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ObtenerUsuariosView(APIView):
    """
    Vista para obtener todos los usuarios registrados.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            # Obtener todos los usuarios
            usuarios = User.objects.all()

            # Serializar los usuarios
            serializer = UserSerializer(usuarios, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


class UploadEncryptedFileView(APIView):
    def post(self, request):
        file = request.FILES.get('file')
        uuid_grupo = request.data.get('uuid_grupo')
        uuid_user_subidor = request.data.get('uuid_user')
        nombre_archivo = request.data.get('nombre_archivo')
        
        # Guardar el archivo cifrado
        file_path = default_storage.save(f"encrypted_files/{file.name}", file)


        
        # Obtener la instancia de GrupoCompartido
        try:
            grupo = GrupoCompartido.objects.get(uuid_grupo=uuid_grupo)
        except GrupoCompartido.DoesNotExist:
            return Response({"error": "Grupo no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # Obtener la instancia de User
        try:
            user_subidor = User.objects.get(uuid_user=uuid_user_subidor)
        except User.DoesNotExist:
            return Response({"error": "Usuario subidor no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        # Crear el registro en la base de datos
        ArchivosCompartidos.objects.create(
            uuid_grupo=grupo,
            ruta_archivo=file_path,
            nombre_archivo=nombre_archivo,
            uuid_user_subidor = user_subidor
        )
        return Response({"message": "Archivo cifrado subido correctamente"}, status=status.HTTP_201_CREATED)

class DescargarArchivoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, uuid_archivo):
        try:
            archivo = ArchivosCompartidos.objects.get(uuid_archivo=uuid_archivo)
            file_path = archivo.ruta_archivo
            print(file_path)
            with open(file_path, 'rb') as f:
                print("Leyendo archivo")
                file_data = f.read()

            response = HttpResponse(file_data, content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{archivo.nombre_archivo}"'
            return response
        except ArchivosCompartidos.DoesNotExist:
            raise Http404("Archivo no encontrado en la base de datos")
        except FileNotFoundError:
            raise Http404("Archivo no encontrado en el sistema de archivos")
        except Exception as e:
            return HttpResponse(status=500, content=str(e))