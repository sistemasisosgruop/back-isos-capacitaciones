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
		"habilitado":true
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
        "messsage": "Creados correctamente"
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

### Ruta de capacitaciones

```bash
   GET/POST   /api/v1/capacitaciones
   GET/PATCH/DELETE /api/v1/capacitaciones/id
   POST /api/v1/capacitaciones/:idcapacitacion/examen
   GET /api/v1/id/certificado 
```
Ejemplos de peticiones:

Primero crear una empresa antes de crear trabajadores

No es necesario que mandes un examen la primera vez, por eso genera otra ruta para mandar el examen 

#### POST /api/v1/capacitaciones

```bash
    {
        "nombre":"prueba",
        "instructor":"alguna vez",
        "fechaInicio":"prueba",
        "fechaCulminacion": "928924575",
        "urlVideo": "https://example.com" ,
        "certificado": "archivo imagen",
        "examen": {
                "titulo": "Ejemplo de examen",
                "preguntas": [
                    {
                    "texto": "¿Cuál es la capital de Francia?",
                    "opcion1": "Madrid",
                    "opcion2": "París",
                    "opcion3": "Londres",
                    "opcion4": "Roma",
                    "opcion5": "Berlín",
                    "respuesta_correcta": 2,
                    "puntajeDePregunta": 4
                    },
                    {
                    "texto": "¿Quién pintó la Mona Lisa?",
                    "opcion1": "Vincent van Gogh",
                    "opcion2": "Leonardo da Vinci",
                    "opcion3": "Pablo Picasso",
                    "opcion4": "Claude Monet",
                    "opcion5": "Salvador Dalí",
                    "respuesta_correcta": 2,
                    "puntajeDePregunta": 5
                    },
                    {
                    "texto": "¿Cuál es el animal más rápido del mundo?",
                    "opcion1": "Cebra",
                    "opcion2": "Leopardo",
                    "opcion3": "Guepardo",
                    "opcion4": "León",
                    "opcion5": "Tigre",
                    "respuesta_correcta": 3,
                    "puntajeDePregunta": 7
                    }
                ]
            }

    }
```
Recordar que en certificado son imagenes, usted puede crear el examen ahí junto a la capacitación o aparte

#### POST api/v1/capacitaciones/:idcapacitacion/examen
```bash
{
  "titulo": "Ejemplo de examen",
  "preguntas": [
    {
      "texto": "¿Cuál es la capital de Francia?",
      "opcion1": "Madrid",
      "opcion2": "París",
      "opcion3": "Londres",
      "opcion4": "Roma",
      "opcion5": "Berlín",
      "respuesta_correcta": 2,
			"puntajeDePregunta": 4
    },
    {
      "texto": "¿Quién pintó la Mona Lisa?",
      "opcion1": "Vincent van Gogh",
      "opcion2": "Leonardo da Vinci",
      "opcion3": "Pablo Picasso",
      "opcion4": "Claude Monet",
      "opcion5": "Salvador Dalí",
      "respuesta_correcta": 2,
			"puntajeDePregunta": 5
    },
    {
      "texto": "¿Cuál es el animal más rápido del mundo?",
      "opcion1": "Cebra",
      "opcion2": "Leopardo",
      "opcion3": "Guepardo",
      "opcion4": "León",
      "opcion5": "Tigre",
      "respuesta_correcta": 3,
			"puntajeDePregunta": 7
    }
  ]
}

```
Ejemplos de capacitaciones
LINK DEMO
```bash
    https://expressjs-postgres-production-9d5a.up.railway.app/api/v1/capacitaciones
```

#### PATCH /api/v1/capacitaciones/1

```bash
    {
        "nombre":"reto",
    }
```
Puedes mandar cualquier de los datos y patch lo cambiará 

#### GET /api/v1/capacitaciones
Usa la ruta GET para traer todas las empresas
#### GET /api/v1/capacitaciones/id
Usa la ruta para traer la empresa con el ID


### Ruta de examenes

    ```bash
        GET api/v1/examenes
        GET api/v1/examenes/preguntas
        GET api/v1/examenes/:examenid
    ```

Todas las rutas para pedir examenes o las preguntas

Ejemplo de examenes en GET
```bash
    [
	{
		"id": 1,
		"titulo": "Ejemplo de examen",
		"puntaje": 0,
		"createdAt": "2023-04-20T04:14:29.271Z",
		"capacitacionId": 1,
		"capacitacion": {
			"id": 1,
			"nombre": "Administrativa",
			"instructor": "Miguel",
			"fechaInicio": "2023-04-06",
			"fechaCulminacion": "2023-04-19",
			"urlVideo": "https://www.youtube.com/watch?v=HrRruQIC6gY",
			"certificado": "firmas\\3af67b4cdc27a432888adea4f6d632b3",
			"createdAt": "2023-04-20T04:10:24.553Z"
		},
		"pregunta": [
			{
				"id": 3,
				"texto": "¿Cuál es el animal más rápido del mundo?",
				"opcion1": "Cebra",
				"opcion2": "Leopardo",
				"opcion3": "Guepardo",
				"opcion4": "León",
				"opcion5": "Tigre",
				"respuesta_correcta": 3,
				"puntajeDePregunta": 7,
				"examenId": 1
			},
			{
				"id": 2,
				"texto": "¿Quién pintó la Mona Lisa?",
				"opcion1": "Vincent van Gogh",
				"opcion2": "Leonardo da Vinci",
				"opcion3": "Pablo Picasso",
				"opcion4": "Claude Monet",
				"opcion5": "Salvador Dalí",
				"respuesta_correcta": 2,
				"puntajeDePregunta": 5,
				"examenId": 1
			},
			{
				"id": 1,
				"texto": "¿Cuál es la capital de Francia?",
				"opcion1": "Madrid",
				"opcion2": "París",
				"opcion3": "Londres",
				"opcion4": "Roma",
				"opcion5": "Berlín",
				"respuesta_correcta": 2,
				"puntajeDePregunta": 4,
				"examenId": 1
			}
		]
	}
]
```

### RUTA REPORTE

```bash
    GET api/v1/reporte
    POST api/v1/darexamen/:apacitacionesId/:trabajadorId/:examenId

```
#### POST dar examem

Ejemplo de post dar examen, genera reporte automaticamente

```bash
    /api/v1/reporte/darexamen/1/12/1

    {
	"respuestas": [2,3,3] 
    }
```

respuesta a la peticion POST
```bash
{
	"asistenciaCapacitación": false,
	"createdAt": "2023-04-20T10:32:39.900Z",
	"id": 1,
	"notaExamen": 11,
	"asistenciaExamen": true,
	"rptpregunta1": 2,
	"rptpregunta2": 3,
	"rptpregunta3": 3,
	"rptpregunta4": 0,
	"rptpregunta5": 0,
	"trabajadorId": 12,
	"examenId": 1,
	"capacitacionId": 1
}
```

#### Peticion GET de reporte

Ejemplo de respuesta
```bash
[
	{
		"id": 1,
		"notaExamen": 11,
		"asistenciaCapacitación": false,
		"asistenciaExamen": true,
		"rptpregunta1": 2,
		"rptpregunta2": 3,
		"rptpregunta3": 3,
		"rptpregunta4": 0,
		"rptpregunta5": 0,
		"createdAt": "2023-04-20T10:32:39.900Z",
		"trabajadorId": 12,
		"examenId": 1,
		"capacitacionId": 1,
		"examen": {
			"id": 1,
			"titulo": "Ejemplo de examen",
			"puntaje": 0,
			"createdAt": "2023-04-20T04:14:29.271Z",
			"capacitacionId": 1
		},
		"capacitacion": {
			"id": 1,
			"nombre": "Administrativa",
			"instructor": "Miguel",
			"fechaInicio": "2023-04-06",
			"fechaCulminacion": "2023-04-19",
			"urlVideo": "https://www.youtube.com/watch?v=HrRruQIC6gY",
			"certificado": "firmas\\3af67b4cdc27a432888adea4f6d632b3",
			"createdAt": "2023-04-20T04:10:24.553Z"
		},
		"trabajador": {
			"id": 12,
			"nombres": "EMERSON EDWARD",
			"apellidoPaterno": "VILLALTA",
			"apellidoMaterno": "QUISPE",
			"dni": "12345876",
			"genero": "M",
			"edad": 25,
			"fechadenac": "1998-12-08",
			"areadetrabajo": "MINA",
			"cargo": "TÉCNICO DE CAMPO",
			"habilitado": true,
			"createdAt": "2023-04-20T04:04:29.040Z",
			"userId": 13,
			"empresaId": 1
		}
	}
]
```

### RUTA TEST

```bash
    GET/POST  api/v1/test
    GET/PATCH/DELETE api/v1/test/:id

```

#### POST test

Mandas los detalles del test, y los ID de las empresas
```bash
    { 
	"detalle": "pruebaT", 
 	"urlTest": "https://www.youtube.com/watch?v=7JqeQM_9h_8",
	"fechaCr": "2023-04-18",
	"fechaVen":"2023-04-17",
	"empresas": [
		1,3
	] 
}
```

#### PATCH api/v1/test/:id

Mandas lo que quieras cambiar del test

```bash
{ 
	"detalle": "pruebaTest", 
 	"urlTest": "https://www.youtube.com/watch?v=7JqeQM_9h_8",
	"fechaCr": "2023-04-14",
	"fechaVen":"2023-04-19",
	"empresas": [
		1,2
	] 
}
```

#### GET

Ambos get te generan todos los test y si mandas un ID el test con el ID

#### DELETE

Puedes borrar los tests


### RUTA REPORTE

Esta ruta genera reportes sí existe una capacitación y un examen, y un trabajador perteneciente a la empresa de la capacitacion 

```bash
    GET  api/v1/reporte
    GET  api/v1/reporte/:id
    PATCH api/v1/reporte/darexamen/:capacitacionId/:trabajadorId/:examenId

```

#### GET 

Mandas los detalles de reporte, y reporte ID sí manda

Report all
```bash
    [
	{
		"id": 2,
		"notaExamen": 0,
		"asistenciaExamen": false,
		"rptpregunta1": 0,
		"rptpregunta2": 0,
		"rptpregunta3": 0,
		"rptpregunta4": 0,
		"rptpregunta5": 0,
		"createdAt": "2023-04-27T13:25:49.078Z",
		"trabajadorId": 2,
		"examenId": 1,
		"capacitacionId": 1,
		"examen": {
			"id": 1,
			"titulo": "Ejemplo de examen",
			"fechadeExamen": "2023-04-27",
			"createdAt": "2023-04-27T13:25:36.322Z",
			"capacitacionId": 1
		},
		"capacitacion": {
			"id": 1,
			"nombre": "Admin",
			"instructor": "algunavezenpostman",
			"fechaInicio": "2023-02-28",
			"fechaCulminacion": "2023-04-24",
			"urlVideo": "https://example.com",
			"certificado": "firmas\\0f0dc7b4cdd4065dd114b94f33a5b0c9",
			"horas": 72,
			"fechaAplazo": null,
			"createdAt": "2023-04-27T13:25:36.288Z"
		},
		"trabajador": {
			"id": 2,
			"nombres": "MODESTO ENRIQUE",
			"apellidoPaterno": "AYALA",
			"apellidoMaterno": "NINASIVINCHA",
			"dni": "29329147",
			"genero": "M",
			"edad": 53,
			"fechadenac": "1969-08-13",
			"areadetrabajo": "MINA",
			"cargo": "TÉCNICO DE CAMPO",
			"habilitado": true,
			"createdAt": "2023-04-27T13:22:51.144Z",
			"userId": 2,
			"empresaId": 1
		}
	},
	{
		"id": 3,
		"notaExamen": 0,
		"asistenciaExamen": false,
		"rptpregunta1": 0,
		"rptpregunta2": 0,
		"rptpregunta3": 0,
		"rptpregunta4": 0,
		"rptpregunta5": 0,
		"createdAt": "2023-04-27T13:25:49.080Z",
		"trabajadorId": 3,
		"examenId": 1,
		"capacitacionId": 1,
		"examen": {
			"id": 1,
			"titulo": "Ejemplo de examen",
			"fechadeExamen": "2023-04-27",
			"createdAt": "2023-04-27T13:25:36.322Z",
			"capacitacionId": 1
		},
		"capacitacion": {
			"id": 1,
			"nombre": "Admin",
			"instructor": "algunavezenpostman",
			"fechaInicio": "2023-02-28",
			"fechaCulminacion": "2023-04-24",
			"urlVideo": "https://example.com",
			"certificado": "firmas\\0f0dc7b4cdd4065dd114b94f33a5b0c9",
			"horas": 72,
			"fechaAplazo": null,
			"createdAt": "2023-04-27T13:25:36.288Z"
		},
		"trabajador": {
			"id": 3,
			"nombres": "JAIME LINCOLN SCOTT",
			"apellidoPaterno": "COLQUE",
			"apellidoMaterno": "VARGAS",
			"dni": "71637483",
			"genero": "M",
			"edad": 28,
			"fechadenac": "1993-10-08",
			"areadetrabajo": "MINA",
			"cargo": "TÉCNICO DE CAMPO",
			"habilitado": true,
			"createdAt": "2023-04-27T13:22:51.144Z",
			"userId": 3,
			"empresaId": 1
		}
	},
	{ ... ...
```

Cuando manda con un id

```bash
    {
	"reporte": {
		"id": 1,
		"notaExamen": 7,
		"asistenciaExamen": true,
		"rptpregunta1": 3,
		"rptpregunta2": 5,
		"rptpregunta3": 4,
		"rptpregunta4": 1,
		"rptpregunta5": 3,
		"createdAt": "2023-04-27T13:25:49.074Z",
		"trabajadorId": 1,
		"examenId": 1,
		"capacitacionId": 1,
		"examen": {
			"id": 1,
			"titulo": "Ejemplo de examen",
			"fechadeExamen": "2023-04-27",
			"createdAt": "2023-04-27T13:25:36.322Z",
			"capacitacionId": 1
		},
		"capacitacion": {
			"id": 1,
			"nombre": "Admin",
			"instructor": "algunavezenpostman",
			"fechaInicio": "2023-02-28",
			"fechaCulminacion": "2023-04-24",
			"urlVideo": "https://example.com",
			"certificado": "firmas\\0f0dc7b4cdd4065dd114b94f33a5b0c9",
			"horas": 72,
			"habilitado":true,
			"fechaAplazo": null,
			"createdAt": "2023-04-27T13:25:36.288Z"
		},
		"trabajador": {
			"id": 1,
			"nombres": "ERIKA VANESA",
			"apellidoPaterno": "AVENDAÑO",
			"apellidoMaterno": "QUISPE",
			"dni": "72220521",
			"genero": "F",
			"edad": 29,
			"fechadenac": "1993-09-12",
			"areadetrabajo": "MINA",
			"cargo": "TÉCNICO DE CAMPO",
			"habilitado": true,
			"createdAt": "2023-04-27T13:22:51.143Z",
			"userId": 1,
			"empresaId": 1
		}
	},
	"empresa": {
		"id": 1,
		"nombreEmpresa": "isos group",
		"direccion": "avenida siempre viva",
		"nombreGerente": "emerson",
		"numeroContacto": "928924575",
		"imagenLogo": "8d1b0483475226db0857c6550502ffd6",
		"imagenCertificado": "b7a09c6e954774e69f6d79caf5951ba3",
		"RUC": "201001234",
		"createdAt": "2023-04-27T13:21:35.230Z"
	}
}

```


#### PATCH dar Examen

Mandas lo que quieras cambiar del test

Debes enviar el token que te dio en el login

BearerToken


```bash

api/v1/reporte/darexamen/1/1/1
capacitacion 1
trabajador 1
examen 1

{
  "respuestas": [
    {
      "preguntaId": 25,
      "respuesta": 3
    },
    {
      "preguntaId": 27,
      "respuesta": 1
    },
    {
      "preguntaId": 29,
      "respuesta": 3
    },
    {
      "preguntaId": 28,
      "respuesta": 4
    },
    {
      "preguntaId": 26,
      "respuesta": 5
    }
  ]
}

```
RESPUESTA
```bash
{
	"id": 27,
	"notaExamen": 7,
	"asistenciaExamen": true,
	"rptpregunta1": 3,
	"rptpregunta2": 5,
	"rptpregunta3": 1,
	"rptpregunta4": 4,
	"rptpregunta5": 3,
	"createdAt": "2023-04-27T23:36:37.625Z",
	"trabajadorId": "1",
	"examenId": "5",
	"capacitacionId": "5"
}
```
