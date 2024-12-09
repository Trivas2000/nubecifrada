from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Clave primaria como UUID
    uuid_user = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    llave_publica = models.CharField(max_length=255, null=True, blank=True, default=None) #esta habria que borrarla 
 
class GrupoCompartido(models.Model):
    # Clave primaria como UUID
    uuid_grupo = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    nombre_grupo = models.CharField(max_length=255, unique=True)
    uuid_user_admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name="admin_grupos")
    llave_publica_grupo = models.CharField(max_length=255, null=True, blank=True, default=None)

    def __str__(self):
        return f"Grupo {self.nombre_grupo} (Admin: {self.uuid_user_admin})"

# Clase para los integrantes del grupo
class IntegrantesGrupo(models.Model):
    # Clave primaria como UUID
    uuid_integrantes = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    uuid_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="grupos_usuario")
    uuid_grupo = models.ForeignKey(GrupoCompartido, on_delete=models.CASCADE, related_name="integrantes")
    uuid_user_invitador = models.ForeignKey(User, on_delete=models.CASCADE, related_name="invitador",default=None)
    llave_maestra_cifrada = models.BinaryField(default=b'')  # esto tambien habria que borrarlo 
    llave_publica_usuario = models.CharField(max_length=255, null=True, blank=True, default=None)

    def __str__(self):
        return f"Usuario {self.uuid_user} en Grupo {self.uuid_grupo}"

# Clase para los archivos compartidos
class ArchivosCompartidos(models.Model):
    # Clave primaria como UUID
    uuid_archivo = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    uuid_grupo = models.ForeignKey(GrupoCompartido, on_delete=models.CASCADE, related_name="archivos")
    ruta_archivo = models.CharField(max_length=255,default="")
    nombre_archivo = models.CharField(max_length=255,default="")
    uuid_user_subidor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="archivos_subidos",default=None)

    def __str__(self):
        return f"Archivo {self.uuid_archivo} en Grupo {self.uuid_grupo}"
