# NubeCifrada ☁️

## Backend - Django

### 1. Configurar la Base de Datos
- Yo use postgrest
- Crea una base de datos llamada `nubecifrada`.

### 2. Crear Archivo `.env`
Crea un archivo `.env` en el directorio raíz del proyecto con el siguiente contenido:

```env
DATABASE_NAME=nubecifrada
DATABASE_USER=postgres
DATABASE_PASSWORD=1123
DATABASE_HOST=localhost
DATABASE_PORT=5432
ALLOWED_HOSTS=*
CSRF_TRUSTED_ORIGINS=http://localhost:5173
{{
```

### 4. Activar el Entorno Virtual

### 5.  Instalar Dependencias

```
pip install -r requirements.txt
```

### Ejecutar Migraciones

```
python manage.py makemigrations
python manage.py migrate
```

### Crear Superusuario

```
python manage.py createsuperuser
```

###  Iniciar el Servidor

```
python manage.py runserver
```

## Frontend - React

### 1. Instalar Dependencias
En otra terminal, dentro del directorio del proyecto React, instala los paquetes de npm con:
```
npm install
```


###  Iniciar el Servidor

npm run dev


Por medio del front deberia poder iniciar sesion con superusuario, deberia funcionar con otro tipo de usuarios pero no lo probe equisde
