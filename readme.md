# ISOS CAPACITACIÓN BACKEND

API isos CAPACITACIÓN

## Demo backend railway

```bash
    https://expressjs-postgres-production-9d5a.up.railway.app/

    ejemplo:
    https://expressjs-postgres-production-9d5a.up.railway.app/api/v1/empresas
```

## Installation local

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

### Ruta de empresas

```bash
   GET/POST   /api/v1/empresas
   GET/PATCH/DELETE /api/v1/empresas/id
   GET /api/v1/id/logo
   GET /api/v1/id/certificado 
```
Ejemplos de peticiones:

Primero crear una empresa antes de crear trabajadores

#### POST /api/v1/empresas

```bash
    {
        "nombreEmpresa":"prueba",
        "direccion":"alguna vez",
        "nombreGerente":"prueba",
        "numeroContacto": "928924575",
        "imagenLogo": foto.png ,
        "imagenCertificado": foto.png,
        "RUC": "20012318904"
    }
```
Recordar que en imagenLogo e imagenCertificado son archivos los que recibe

respuesta de post ejemplo y devolución en get

```bash
    {
        "createdAt": "2023-04-13T06:48:36.718Z",
        "id": 1,
        "nombreEmpresa": "isos",
        "direccion": "avenida siempre viva",
        "nombreGerente": "emerson",
        "numeroContacto": "928924575",
        "imagenLogo": "f0a8f03cf1589f571afd988bf1513f85",
        "imagenCertificado": "26b56c20645548df5cbfb70aa69ba406",
        "RUC": "201001234"
    }
```




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
        },
        "empresaId": 1
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