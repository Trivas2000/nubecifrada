from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Clave primaria como UUID
    uuid_user = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)

class GrupoCompartido(models.Model):
    # Clave primaria como UUID
    uuid_grupo = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    nombre_grupo = models.CharField(max_length=255, unique=True)
    uuid_user_admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name="admin_grupos")
    public_key = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Grupo {self.nombre_grupo} (Admin: {self.uuid_user_admin})"

# Clase para los integrantes del grupo
class IntegrantesGrupo(models.Model):
    # Clave primaria como UUID
    uuid_integrantes = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    uuid_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="grupos_usuario")
    uuid_grupo = models.ForeignKey(GrupoCompartido, on_delete=models.CASCADE, related_name="integrantes")

    def __str__(self):
        return f"Usuario {self.uuid_user} en Grupo {self.uuid_grupo}"

# Clase para los archivos compartidos
class ArchivosCompartidos(models.Model):
    # Clave primaria como UUID
    uuid_archivo = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
    uuid_grupo = models.ForeignKey(GrupoCompartido, on_delete=models.CASCADE, related_name="archivos")
    path_archivo = models.CharField(max_length=255)

    def __str__(self):
        return f"Archivo {self.uuid_archivo} en Grupo {self.uuid_grupo}"
