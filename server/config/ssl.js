const fs = require('fs');
const path = require('path');

let httpsOptions = {};

try {
  httpsOptions = {
    key: fs.readFileSync(path.join(__dirname, '../ssl/privkey.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../ssl/fullchain.pem'))
  };
} catch (error) {
  console.warn('SSL certificates not found or invalid. HTTPS server may not start properly.');
  console.warn(error.message);
  
  // Generate self-signed certificates for development
  if (process.env.NODE_ENV === 'development') {
    // Create placeholder certificates for development
    httpsOptions = {
      key: '-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7VJTUt9Us8cKj\nMzEfYyjiWA4R4/M2bS1GB4t7NXp98C3SC6dVMvDuictGeurT8jNbvJZHtCSuYEvu\nNMoSfm76oqFvAp8Gy0iz5sxjZmSnXyCdPEovGhLa0VzMaQ8s+CLOyS56YyCFGeJZ\n-----END PRIVATE KEY-----',
      cert: '-----BEGIN CERTIFICATE-----\nMIIDBjCCAe4CCQDcvXBOEVM0UTANBgkqhkiG9w0BAQsFADBFMQswCQYDVQQGEwJB\nVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50ZXJuZXQgV2lkZ2l0\ncyBQdHkgTHRkMB4XDTE5MDEwMTAxMDEwMVoXDTIwMDEwMTAxMDEwMVowRTELMAkG\n-----END CERTIFICATE-----'
    };
  }
}

module.exports = httpsOptions;