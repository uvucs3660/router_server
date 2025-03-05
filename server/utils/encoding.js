const crypto = require('crypto');
const base64url = require('base64url');

// Base64 encode
function base64Encode(data) {
  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }
  
  return Buffer.from(data).toString('base64');
}

// Base64 decode
function base64Decode(encodedData) {
  try {
    const decoded = Buffer.from(encodedData, 'base64').toString('utf8');
    
    // Try to parse as JSON if possible
    try {
      return JSON.parse(decoded);
    } catch {
      return decoded;
    }
  } catch (error) {
    console.error('Error decoding base64:', error);
    return null;
  }
}

// Base64URL encode (safe for URLs)
function base64UrlEncode(data) {
  if (typeof data === 'object') {
    data = JSON.stringify(data);
  }
  
  return base64url.encode(data);
}

// Base64URL decode
function base64UrlDecode(encodedData) {
  try {
    const decoded = base64url.decode(encodedData);
    
    // Try to parse as JSON if possible
    try {
      return JSON.parse(decoded);
    } catch {
      return decoded;
    }
  } catch (error) {
    console.error('Error decoding base64url:', error);
    return null;
  }
}

// Generate a secure random token
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Hash a string (e.g., for passwords)
function hashString(string, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(string, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

// Verify a hash
function verifyHash(string, hash, salt) {
  const hashVerify = crypto.pbkdf2Sync(string, salt, 10000, 64, 'sha512').toString('hex');
  return hashVerify === hash;
}

module.exports = {
  base64Encode,
  base64Decode,
  base64UrlEncode,
  base64UrlDecode,
  generateToken,
  hashString,
  verifyHash
};