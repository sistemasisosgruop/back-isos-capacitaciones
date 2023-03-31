# ISOS CAPACITACIÓN BACKEND

API isos CAPACITACIÓN



## Installation

Clona el repositorio

```bash
  npm install
```
Configura el .env con el archivo .env.example

```bash
    PORT=
    DATABASE_URL='postgres://postgres:password@localhost:port/database'
    API_KEY=
    JWT_SECRET=
```


    
## Rutas hasta el momento


### Ruta de trabajadores
```bash
   GET/POST/PATCH/DELETE   /api/v1/trabajadores
   GET /api/v1/trabajadores/id
```
Ejemplo de petición:

en post(obligatorio) y patch(cualquiera de los valores), en los demás la query id

```bash
    {
        "nombres":"",
        "apellidoPaterno":"",
        "apellidoMaterno":"",
        "dni": "",
        "genero": "masculino", 
        "edad": 18,
        "areadetrabajo": "IT",
        "cargo": "Empleado",
        "fechadenac": "08/12/1998",
        "user":{
            "username": "",
            "contraseña": ""
        }
    }
```


### Ruta de administradores

```bash
   GET/POST/PATCH/DELETE   /api/v1/administradores
   GET /api/v1/administradores/id
```

Ejemplo de petición:

en post(obligatorio) y patch(cualquiera de los valores), en los demás la query id

```bash
    {
        "nombres":"Super Admin",
        "edad": 25,
        "contacto":"928924575",
        "user":{
            "username": "12345678",
            "contraseña": "12345678",
            "rol": "Administrador"
        }
    }
```

### Rutas de Usuarios

```bash
   GET/POST/PATCH/DELETE   /api/v1/usuarios
   GET /api/v1/usuarios/id
```

### Ruta de login
```bash
   POST /api/v1/auth/login   
```
Ejemplo de petición:

en post(obligatorio)

```bash
    {
        "username": "12345678",
        "contraseña": "12345678"
    }

```
respuesta:

```bash
    {
        "user": {
            "id": 1,
            "username": "12345678",
            "rol": "Trabajador",
            "createdAt": ""
            },
        "token": ""
    }

```