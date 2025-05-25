const { Pool } = require('pg');

const dev = process.env.EDDY_DB_URL;
const prod = process.env.CLASS_DB_URL;

const connect = dev ? dev : prod;
const urlObject = new URL(connect);
console.log("Database connection string: postgres://", urlObject.hostname + urlObject.pathname);
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

async function saveBinaryData(filename, path) {
  try {
    const client = await pool.connect();

    const binaryData = fs.readFileSync(filePath);

    const result = await client.query(
      'INSERT INTO blob_store (filename, data) VALUES ($1, $2) RETURNING id',
      [filename, binaryData]
    );

    console.log(`Binary data saved with ID: ${result.rows[0].id}`);
  } catch (err) {
    console.error('Error saving binary data:', err);
  } finally {
    await client.end();
  }
}

async function loadBinaryData(id, outputFilePath) {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT data FROM blob_store WHERE path = $1', [id]);

    if (result.rows.length > 0) {
      const binaryData = result.rows[0].data;

      fs.writeFileSync(outputFilePath, binaryData);
      console.log(`Binary data loaded and saved to: ${outputFilePath}`);
    } else {
      console.log('Binary data not found.');
    }
  } catch (err) {
    console.error('Error loading binary data:', err);
  } finally {
    await client.end();
  }
}

module.exports = {
  queryDatabase
};
