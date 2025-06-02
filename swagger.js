const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API',
      version: '1.0.0',
      description: 'Auto-generated API documentation',
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'https://server-nu-peach.vercel.app/api',
      },
    ],
  },
  apis: ['./routes/*.js', './controllers/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = {
  swaggerUi,
  swaggerSpec,
};