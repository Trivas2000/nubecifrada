from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):

    # Se cambia el campo 'id' por 'uuid_user' usandi UUIDField
    uuid_user = models.UUIDField(primary_key=True, default=uuid.uuid4, unique=True)
