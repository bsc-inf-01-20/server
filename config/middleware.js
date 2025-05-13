// config/middleware.js
const helmet = require('helmet');
const express = require('express');

module.exports = (app) => {
  // 1. Force CORS on All Responses
  app.use((req, res, next) => {
    const allowedOrigins = ['http://localhost:3000', 'https://your-vercel-app.vercel.app'];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });

  // 2. Use Helmet without CORS restrictions
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }));

  // 3. Other middleware
  app.use(express.json());
};