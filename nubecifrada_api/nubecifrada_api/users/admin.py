from django.contrib import admin
from .models import User


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """
    Define the UserAdmin class
    """

    list_display = ('uuid_user', 'username', 'email')
    search_fields = ('username', 'email')
