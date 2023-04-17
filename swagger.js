const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API de ISOS CAPACITACIONES',
            version: '1.0.0',
            description: 'Documentación de la API\n Primero crea una empresa y de ahí puedes usar todo',
        },
        tags: [
          { name: 'Trabajadores', description: 'Endpoints para gestionar trabajadores' },
          { name: 'Empresas', description: 'Endpoints para gestionar empresas' },
        ],
        components: {
            schemas: {
              Trabajador: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  nombre: { type: 'string' },
                  dni: { type: 'string' },
                  telefono: { type: 'string' },
                  email: { type: 'string' },
                  direccion: { type: 'string' },
                  fecha_nacimiento: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
              TrabajadorInput: {
                type: 'object',
                properties: {
                  nombre: { type: 'string' },
                  dni: { type: 'string' },
                  telefono: { type: 'string' },
                  email: { type: 'string' },
                  direccion: { type: 'string' },
                  fecha_nacimiento: { type: 'string' },
                },
                required: ['nombre', 'dni', 'telefono', 'email', 'direccion', 'fecha_nacimiento'],
              },
              Empresa: {
                type: 'object',
                properties: {
                  id: { type: 'integer' },
                  nombreEmpresa: { type: 'string' },
                  direccion: { type: 'string' },
                  nombreGerente: { type: 'string' },
                  numeroContacto: { type: 'string' },
                  imagenLogo: { type: 'string' },
                  imagenCertificado: { type: 'string' },
                  RUC: { type: 'string' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                },
              },
              EmpresaInput: {
                type: 'object',
                properties: {
                  nombreEmpresa: { type: 'string' },
                  direccion: { type: 'string' },
                  nombreGerente: { type: 'string' },
                  numeroContacto: { type: 'string' },
                  imagenLogo: { type: 'string', format: 'binary' },
                  imagenCertificado: { type: 'string', format: 'binary' },
                  RUC: { type: 'string' },
                },
                required: ['nombreEmpresa', 'direccion', 'nombreGerente', 'numeroContacto', 'RUC'],
              }
            },
          },
    },
    apis: ['./routes/*.js'], // Rutas de la API
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = function(app) {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
