from django.contrib import admin
from django.urls import path
from django.shortcuts import redirect
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from nubecifrada_api.nubecifrada.views import *

def redirect_to_admin(request):
    return redirect('/admin/')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/grupos/', ObtenerGruposView.as_view(), name='obtener_grupos'),
    path("api/create-group/", CreateGroupView.as_view(), name="create_group"),
    path('', redirect_to_admin),
    path('api/grupos/<uuid:uuid_grupo>/integrantes/', IntegrantesGrupoView.as_view(), name='integrantes-grupo'),
    path('api/grupo/<uuid:uuid_grupo>/integrante/<uuid:uuid_integrante>/eliminar/', eliminar_integrante, name='eliminar_integrante'),
    path('api/grupo/<uuid:uuid_grupo>/integrante/<uuid:uuid_integrante>/anadir/', anadir_integrante, name='anadir_integrante')
]
