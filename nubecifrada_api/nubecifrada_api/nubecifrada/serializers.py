from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import *

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod

    # Se sobreescribe el método get_token para añadir el nombre de usuario al token
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token

    # Se sobreescribe el método validate para validar el nombre de usuario
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        if username is None:
            raise AuthenticationFailed('El nombre de usuario es obligatorio.')

        user = authenticate(username=username, password=password)
        if user is None:
            raise AuthenticationFailed('Credenciales inválidas.')

        return super().validate(attrs)



class GrupoCompartidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrupoCompartido
        fields = ['uuid_grupo', 'nombre_grupo', 'generador_grupo', 'modulo_grupo']


class IntegrantesGrupoSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='uuid_user.username', read_only=True)
    llave_publica_invitador = serializers.CharField(source='uuid_user_invitador.llave_publica_usuario', read_only=True)

    class Meta:
        model = IntegrantesGrupo
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['uuid_user', 'username', 'email', 'first_name', 'last_name']

class ArchivosCompartidosSerializer(serializers.ModelSerializer):
    nombre_usuario = serializers.CharField(source='uuid_user_subidor.username', read_only=True)

    class Meta:
        model = ArchivosCompartidos
        fields = ['uuid_archivo', 'nombre_archivo', 'ruta_archivo', 'uuid_user_subidor', 'nombre_usuario']

