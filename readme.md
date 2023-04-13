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

### Ruta de empresas

```bash
   GET/POST   /api/v1/empresas
   GET/PATCH/DELETE /api/v1/empresas/id
```
Ejemplo de petición:

primero crear una empresa antes de crear trabajadores

```bash
    {
        "nombreEmpresa":"prueba",
        "direccion":"alguna vez",
        "nombreGerente":"prueba",
        "numeroContacto":928924575,
        "imagenLogo":"prueba.png",
        "imagenCertificado":"prueba.png",
        "RUC": 20012318904
    }
```
respuesta de post ejemplo y devolución en get

```bash
    {
        "createdAt": "2023-04-04T22:27:23.482Z",
        "id": 1,
        "nombreEmpresa": "prueba",
        "direccion": "alguna vez",
        "nombreGerente": "prueba",
        "numeroContacto": 928924575,
        "imagenLogo": "prueba.png",
        "imagenCertificado": "prueba.png",
        "RUC": 20012318904
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