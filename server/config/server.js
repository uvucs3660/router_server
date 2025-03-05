const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  httpPort: process.env.HTTP_PORT || 8080,
  httpsPort: process.env.HTTPS_PORT || 8443,
  baseUrl: process.env.BASE_URL || 'localhost',
  environment: process.env.NODE_ENV || 'development'
};