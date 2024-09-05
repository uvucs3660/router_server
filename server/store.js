const { queryDatabase } = require('./database');

async function load(path) {
  return await queryDatabase('SELECT * FROM document_store WHERE path = $1', [path]);
}

async function save(path, data) {
  return await queryDatabase(`
    INSERT INTO document_store (path, data) VALUES ($1, $2)
    ON CONFLICT (path) DO UPDATE SET data = $2 RETURNING path;`,
    [path, data]);
}

async function combine(path,data){
  return await queryDatabase(`    
    UPDATE document_store
    SET data = data || $2::jsonb
    WHERE path = $1;`,
    [path, data]);
}

async function loadUrl(id) {
  return await queryDatabase('SELECT * FROM short_urls WHERE short_id = $1', [id]);
}

async function saveUrl(url) {
  return await queryDatabase(`
    INSERT INTO short_urls (url) VALUES ($1) RETURNING short_id;`,[url] );
}


module.exports = {
  load,
  save,
  combine,
  loadUrl,
  saveUrl
};
