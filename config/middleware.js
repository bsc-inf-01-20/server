const cors = require('cors');
const helmet = require('helmet');
const express = require('express');

module.exports = (app) => {
  // 1. COMPLETELY DISABLE CORS (TEMPORARY ONLY)
  app.use(cors({
    origin: '*',                 // Allow all origins
    methods: '*',               // Allow all methods
    allowedHeaders: '*',        // Allow all headers
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));

  // 2. Disable Helmet's CORS restrictions
  app.use(helmet({
    crossOriginResourcePolicy: false
  }));

  // 3. Other middleware
  app.use(express.json());
};