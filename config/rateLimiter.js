const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000,
  message: 'Too many requests from this IP, please try again later'
});

const directionsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000,
  message: 'Too many directions requests, please try again later'
});

module.exports = { apiLimiter, directionsLimiter };