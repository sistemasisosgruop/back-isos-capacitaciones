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
#### PATCH /api/v1/empresas/1

```bash
    {
        "nombreEmpresa":"reto",
    }
```
Puedes mandar cualquier de los datos y patch lo cambiará 

#### GET /api/v1/empresas
Usa la ruta GET para traer todas las empresas
#### GET /api/v1/empresas/id
Usa la ruta para traer la empresa con el ID
#### GET /api/v1/empresas/id/logo y GET /api/v1/empresas/id/certificado
Usa la ruta para pedir el archivo de logo

Ejemplo de como hacer la petición
```bash
    const response = await fetch(`${url}/api/v1/empresas/${id}/${logo o certificado}`)
    const logo = await response.blob();
    return logo
```
Ejemplo de mostrar el logo
```bash
    const url = URL.createObjectURL(new Blob([logo]));
    const logoElement = document.getElementById("logo");
    logoElement.src = url;
```



### Ruta de trabajadores
```bash
   GET/POST   /api/v1/trabajadores
   GET/PATCH/DELETE /api/v1/trabajadores/id
```

#### POST /api/v1/trabajadores

Ejemplo de petición:

El DNI es unico e igual el username, sí se repite te dirá error

```bash
    {
        "nombres":"Emerson",
        "apellidoPaterno":"Vilallta",
        "apellidoMaterno":"Quispe",
        "dni": "72895310",
        "genero": "M",
        "edad": 25,
        "areadetrabajo": "IT",
        "cargo": "Empleado",
        "fechadenac": "08/12/1998",
        "user":{
            "username": "72895310",
            "contraseña": "72895382"
        },
        "empresaId":1
    }
```

Respuesta de petición:

```bash
    {
        "createdAt": "2023-04-13T07:15:43.297Z",
        "id": 9,
        "nombres": "Emerson",
        "apellidoPaterno": "Vilallta",
        "apellidoMaterno": "Quispe",
        "dni": "72895310",
        "genero": "M",
        "edad": 25,
        "areadetrabajo": "IT",
        "cargo": "Empleado",
        "fechadenac": "1998-08-12",
        "user": {
            "rol": "Trabajador",
            "createdAt": "2023-04-13T07:15:43.299Z",
            "id": 10,
            "username": "72895310",
            "contraseña": "$2b$10$cpZU6KkqhLPZJrnBbnxPMOyGHbdq4oHF8eq0E/lSI9uhWN8HNkl6q"
        },
        "empresaId": 1,
        "userId": 10
    }
```

#### PATCH /api/v1/trabajadores/id

Manda varios cambios o un solo cambio

```bash
    {
        "edad": 40
    }
```

#### GET /api/v1/trabajadores o GET /api/v1/trabajadores/id

Trae todos los trabajadores o bien solo uno depende del ID

#### POST /api/v1/trabajadores/cargaexcel/empresaId

Manda el archivo excel predeterminado, y crea todos los trabajadores
del id de la empresa

Ejemplo de petición:

```bash
    const url = `${prod}api/v1/trabajadores/cargaexcel/${empresaId}`
    const formData = new FormData();
        formData.append('file', archivo);
        fetch(url, {
          method: 'POST',
          body: formData
        })
```
Respuesta
```bash
    {
        "msg": "Creados correctamente"
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