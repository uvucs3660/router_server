const Router = require('koa-router');
const { load, save, combine, allrows } = require('../store');
const path = require('path');
const fs = require('fs');

const router = new Router({ prefix: '/data' });

router.get('/:path*', async (ctx) => {
  const path = ctx.params.path;
  const { json_path } = ctx.query;

  console.log("GET path: " + path);

  const result = await load(path, json_path);
  ctx.body = result.rows[0].data;
});

router.post('/:path*', async (ctx) => {
  let path = ctx.params.path;
  console.log("POST path: " + path);
  const jsonStr = JSON.stringify(ctx.request.body);
  // this should be able to json schema validate here.
  const result = await save(path, jsonStr);
  ctx.body = result.rows;
  ctx.body[0]['data'] = ctx.request.body;
});

router.put('/:path*', async (ctx) => {
  let path = ctx.params.path;
  console.log("PUT path: " + path);
  const jsonStr = JSON.stringify(ctx.request.body);
  const result = await combine(path, jsonStr);
  ctx.body = result.rows;
  ctx.body[0]['data'] = ctx.request.body;
});

// Helper function to create directory if it doesn't exist
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

router.get('/export', async (ctx) => {
  const result = await allrows('%');

  for (const file of result.rows) {
    const filePath = path.resolve(file.path);
    const data = JSON.stringify(file.data);
    try {
      // Write data to the specified path
      ensureDirectoryExistence(filePath);
      fs.writeFileSync(filePath, data, 'utf8');
    } catch (error) {
      ctx.status = 500;
      ctx.body = { error: 'Failed to write files', details: error.message };
    }
  }

  ctx.status = 200;
  ctx.body = { message: 'Files written successfully.' };
});

module.exports = router;