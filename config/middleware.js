const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');

module.exports = (app) => {
  // Security headers
  app.use(helmet());

  // CORS configuration with allowed origins
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  }));

  // Body parser for JSON requests
  app.use(express.json());

  // HTTP request logging (more detailed in production)
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
};
