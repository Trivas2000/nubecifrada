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
        fields = ['uuid_grupo', 'nombre_grupo', 'uuid_user_admin']

class IntegrantesGrupoSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='uuid_user.username', read_only=True)

    class Meta:
        model = IntegrantesGrupo
        fields = ['uuid_integrantes', 'uuid_user', 'uuid_grupo','username']
