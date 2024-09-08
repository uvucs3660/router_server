const { queryDatabase } = require('./database');

async function load(path, json_path) {
  if (json_path) {
    return await queryDatabase(`
      SELECT jsonb_path_query_array(data, $2) AS result
      FROM document_store
      WHERE path = $1;`, [path, json_path]);
  } else {
    return await queryDatabase('SELECT * FROM document_store WHERE path = $1', [path]);
  }
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

async function saveUrl(id,url) {
  return await queryDatabase(`
    INSERT INTO short_urls (short_id, url) VALUES ($1, $2)
    ON CONFLICT (id) DO UPDATE SET url = $2 RETURNING short_id;`
    ,[id,url] );
}


module.exports = {
  load,
  save,
  combine,
  loadUrl,
  saveUrl
};
