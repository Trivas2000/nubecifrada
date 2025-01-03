# NubeCifrada ☁️

## Backend - Django

### 1. Configurar la Base de Datos
- Yo use postgrest
- Crea una base de datos llamada `nubecifrada`

Instalar si es necesario y recordar las credenciales de `usuario` y `contraseña` que se piden cuando se instala. 
Si usaran otra BD tienen que acordarse de sus credenciales. 

Si usan postgrest en la terminal correr lo siguente:
```
psql -U postgres
```
Una vez adentro, crear base de datos:

```
CREATE DATABASE nubecifrada;
```


### 2. Crear Archivo `.env`
Crea un archivo `.env` agregue uno de ejemplo en donde se deberia crear

```env
DATABASE_NAME=nubecifrada
DATABASE_USER=*Completar* -> Es el usuario de postgres cuando se instala al incio, por defecto se crea un usuario postgres.
DATABASE_PASSWORD=*Completar* -> Ademas en la instalación les pide contraseña asociado a ese usuario, esa es la contraseña que va aqui.
DATABASE_HOST=localhost
DATABASE_PORT=5432
ALLOWED_HOSTS=*
CSRF_TRUSTED_ORIGINS=http://localhost:5173

```


### 4. Crear y Activar el Entorno Virtual
```
crear + activar
```

### 5. Instalar Dependencias

```
pip install -r requirements.txt
```

### 6. Ejecutar Migraciones

```
python manage.py makemigrations
python manage.py migrate
```

### 7. Crear Superusuario

```
python manage.py createsuperuser
```

### 8. Iniciar el Servidor

```
python manage.py runserver
```
Se deberia poder acceder al panel de administracion de django con el superusuario

## Frontend - React

### 1. Instalar Dependencias
En otra terminal, dentro del directorio del proyecto React, instala los paquetes de npm con:
```
npm install
```


###  Iniciar el Servidor

```
npm run dev
```

## Como utilizar:


### 1. Crear dos usuarios desde la terminal:

```
http://127.0.0.1:8000/admin
```

### 2. Iniciar sesion con usuario 1 en:

```
http://localhost:5173/
```

### 3. Crear grupo asignando nombre

### 4. Ingresar al grupo y apretar boton generar tus claves u1

### 5. Invitar a usuario 2

### 6. Ingresar con usuario 2, volviendo a recargar :

```
http://localhost:5173/
```

### 7. Ingresar al grupo y  apretar boton generar tus claves para u2

### 8. Ingresar con usuario 1, volviendo a recargar nuevamente:

```
http://localhost:5173/
```

### 9. Ingresar al grupo (se genera comunicacion con v2, visible por la consola de inspector), ahora es posible compartir archivos txt con el usuario que invitaste c:

### 10. Subir un archivo de prueba, que podra ser accesible por ti y usuario invitado. 

### 11. Ingresar con ususario2 y descargar archivo c:


