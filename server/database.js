const { Pool } = require('pg');

const dev = process.env.DEV_DB_URL;
const prod = process.env.CLASS_DB_URL;

const connect = dev ? dev : prod;

const pool = new Pool({
  connectionString: connect
});

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
