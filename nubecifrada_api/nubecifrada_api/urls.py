from django.contrib import admin
from django.urls import path
from django.shortcuts import redirect
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from nubecifrada_api.users.views import *

def redirect_to_admin(request):
    return redirect('/admin/')


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/grupos/', ObtenerGruposView.as_view(), name='obtener_grupos'),
    path("api/create-group/", CreateGroupView.as_view(), name="create_group"),
    path('', redirect_to_admin),
]
