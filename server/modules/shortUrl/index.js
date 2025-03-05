const crypto = require('crypto');
const { executeQuery } = require('../data');

// Generate a short code
function generateShortCode(length = 6) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = crypto.randomBytes(length);
  let result = '';
  
  for (let i = 0; i < length; i++) {
    const index = bytes[i] % characters.length;
    result += characters[index];
  }
  
  return result;
}

// Create a short URL
async function createShortUrl(originalUrl, customCode = null) {
  try {
    // Use custom code or generate a new one
    const shortCode = customCode || generateShortCode();
    
    // Check if the custom code already exists
    if (customCode) {
      const checkQuery = 'SELECT * FROM short_urls WHERE short_code = $1';
      const checkResult = await executeQuery(checkQuery, [customCode]);
      
      if (checkResult.rows.length > 0) {
        return {
          success: false,
          error: 'Custom code already in use'
        };
      }
    }
    
    // Insert the new short URL
    const query = `
      INSERT INTO short_urls (short_code, original_url, created_at)
      VALUES ($1, $2, NOW())
      RETURNING id, short_code, original_url, created_at, access_count
    `;
    
    const result = await executeQuery(query, [shortCode, originalUrl]);
    
    return {
      success: true,
      shortCode,
      originalUrl,
      created: result.rows[0].created_at
    };
  } catch (error) {
    console.error('Error creating short URL:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get original URL from short code
async function getOriginalUrl(shortCode) {
  try {
    const query = `
      UPDATE short_urls
      SET access_count = access_count + 1, last_accessed = NOW()
      WHERE short_code = $1
      RETURNING original_url, access_count
    `;
    
    const result = await executeQuery(query, [shortCode]);
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Short URL not found'
      };
    }
    
    return {
      success: true,
      originalUrl: result.rows[0].original_url,
      accessCount: result.rows[0].access_count
    };
  } catch (error) {
    console.error('Error retrieving original URL:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Get statistics for a short URL
async function getUrlStats(shortCode) {
  try {
    const query = `
      SELECT short_code, original_url, created_at, access_count, last_accessed
      FROM short_urls
      WHERE short_code = $1
    `;
    
    const result = await executeQuery(query, [shortCode]);
    
    if (result.rows.length === 0) {
      return {
        success: false,
        error: 'Short URL not found'
      };
    }
    
    return {
      success: true,
      stats: result.rows[0]
    };
  } catch (error) {
    console.error('Error retrieving URL statistics:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  createShortUrl,
  getOriginalUrl,
  getUrlStats
};