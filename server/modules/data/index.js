const path = require('path');
const fs = require('fs').promises;
const { Pool } = require('pg');

// Configure PostgreSQL connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'routedb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function executeQuery(query, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(query, params);
    return result;
  } finally {
    client.release();
  }
}

async function load(path, jsonPath = null) {
  const query = `
    SELECT id, path, data, created_at, updated_at 
    FROM data_store 
    WHERE path = $1 
    ORDER BY updated_at DESC 
    LIMIT 1
  `;
  
  const result = await executeQuery(query, [path]);
  
  if (result.rows.length === 0) {
    return { rows: [{ data: {} }] };
  }
  
  // Extract specific data if jsonPath is provided
  if (jsonPath) {
    try {
      const jsonPathParts = jsonPath.split('.');
      let data = result.rows[0].data;
      
      for (const part of jsonPathParts) {
        data = data[part];
        if (data === undefined) {
          return { rows: [{ data: {} }] };
        }
      }
      
      result.rows[0].data = data;
    } catch (error) {
      console.error('Error extracting JSON path:', error);
      return { rows: [{ data: {} }] };
    }
  }
  
  return result;
}

async function save(path, jsonData) {
  if (typeof jsonData === 'object') {
    jsonData = JSON.stringify(jsonData);
  }
  
  const query = `
    INSERT INTO data_store (path, data) 
    VALUES ($1, $2::jsonb) 
    RETURNING id, path, data, created_at, updated_at
  `;
  
  return await executeQuery(query, [path, jsonData]);
}

async function combine(path, jsonData) {
  // First load existing data
  const existingResult = await load(path);
  const existingData = existingResult.rows[0].data || {};
  
  // Parse new data
  const newData = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
  
  // Deep merge the objects
  const mergedData = deepMerge(existingData, newData);
  
  // Save the merged data
  return await save(path, JSON.stringify(mergedData));
}

async function allrows(pathPattern) {
  const query = `
    SELECT DISTINCT ON (path) id, path, data, created_at, updated_at 
    FROM data_store 
    WHERE path LIKE $1 
    ORDER BY path, updated_at DESC
  `;
  
  return await executeQuery(query, [pathPattern]);
}

// Helper function to deep merge objects
function deepMerge(target, source) {
  if (typeof source !== 'object' || source === null) {
    return source;
  }
  
  const output = { ...target };
  
  Object.keys(source).forEach(key => {
    if (source[key] instanceof Object && key in target) {
      output[key] = deepMerge(target[key], source[key]);
    } else {
      output[key] = source[key];
    }
  });
  
  return output;
}

module.exports = {
  load,
  save,
  combine,
  allrows,
  executeQuery
};