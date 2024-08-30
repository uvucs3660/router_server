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

module.exports = {
  load,
  save
};
