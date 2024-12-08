from django.contrib import admin
from .models import User, GrupoCompartido, ArchivosCompartidos, IntegrantesGrupo


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """
    Define the UserAdmin class
    """

    list_display = ('uuid_user', 'username', 'email')
    search_fields = ('username', 'email')

@admin.register(GrupoCompartido)
class GrupoCompartidoAdmin(admin.ModelAdmin):
    list_display = ('uuid_grupo', 'nombre_grupo', 'uuid_user_admin')
    search_fields = ('nombre_grupo', 'uuid_user_admin')

# Registrar el modelo ArchivosCompartidos
@admin.register(IntegrantesGrupo)
class IntegrantesGrupoAdmin(admin.ModelAdmin):
    list_display = ('uuid_integrantes', 'uuid_user', 'uuid_grupo')
    search_fields = ('uuid_user__username', 'uuid_grupo__nombre_grupo')
    list_filter = ('uuid_grupo',)

@admin.register(ArchivosCompartidos)
class ArchivosCompartidosAdmin(admin.ModelAdmin):
    list_display = ('uuid_archivo', 'uuid_grupo', 'path_archivo')
    search_fields = ('path_archivo',)
    list_filter = ('uuid_grupo',)
