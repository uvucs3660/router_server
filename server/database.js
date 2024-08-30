const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DEV_DB_URL
});
console.log("Connected to database");

async function queryDatabase(query, params) {
    console.log("queryDatabase: ", query, params);
    const client = await pool.connect();
  try {
    return await client.query(query, params);
  } finally {
    client.release();
  }
}

module.exports = {
  queryDatabase
};
