from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate

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


