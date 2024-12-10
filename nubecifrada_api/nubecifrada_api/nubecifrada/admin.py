from django.contrib import admin
from .models import User, GrupoCompartido, ArchivosCompartidos, IntegrantesGrupo


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """
    Define la clase UserAdmin.
    """
    list_display = ('uuid_user', 'username', 'email', 'is_staff', 'is_active')
    search_fields = ('username', 'email')
    list_filter = ('is_staff', 'is_active')

    # Sobrescribir el método save_model para encriptar la contraseña
    def save_model(self, request, obj, form, change):
        """
        Sobrescribir el método save_model para encriptar la contraseña
        si se modifica en el formulario.
        """
        if 'password' in form.cleaned_data:
            # Encriptar la contraseña si se modifica
            obj.set_password(form.cleaned_data['password'])
        super().save_model(request, obj, form, change)


@admin.register(GrupoCompartido)
class GrupoCompartidoAdmin(admin.ModelAdmin):
    """
    Administra los grupos compartidos.
    """
    list_display = ('uuid_grupo', 'nombre_grupo', 'uuid_user_admin', 'generador_grupo', 'modulo_grupo')
    search_fields = ('nombre_grupo', 'uuid_user_admin__username')
    list_filter = ('uuid_user_admin',)


@admin.register(IntegrantesGrupo)
class IntegrantesGrupoAdmin(admin.ModelAdmin):
    """
    Administra los integrantes de los grupos.
    """
    list_display = ('uuid_integrantes', 'uuid_user', 'uuid_grupo', 'uuid_user_invitador', 'llave_publica_usuario','llave_maestra_cifrada')
    search_fields = ('uuid_user__username', 'uuid_grupo__nombre_grupo')
    list_filter = ('uuid_grupo', 'uuid_user')


@admin.register(ArchivosCompartidos)
class ArchivosCompartidosAdmin(admin.ModelAdmin):
    """
    Administra los archivos compartidos.
    """
    list_display = ('uuid_archivo', 'uuid_grupo', 'nombre_archivo', 'uuid_user_subidor', 'ruta_archivo')
    search_fields = ('nombre_archivo', 'uuid_user_subidor__username')
    list_filter = ('uuid_grupo',)