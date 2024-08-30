// npm install koa koa-router koa-static koa-cors koa-body @koa/multer
//
// path structure
// class/members
// class/team_roster
// presentation/projectX/teamY/
// gitstatus/projectX/teamY
// survey/projectX/teamY
// easywork/projectX/teamY
// grades/projectX/teamY
// each of these should return a json, when calling a get to /data

// api endpoint GET /data/path/to/data - takes a path and returns data
// api endpoint POST /data/path/to/data - takes a path and data and stores it

// ours
const { load, save } = require('./store');
// native
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
// KOA
const Koa = require('koa');
const Router = require('koa-router');
const serve = require('koa-static');
const cors = require('koa-cors');
const { koaBody } = require('koa-body');
const multer = require('@koa/multer');
const unzipper = require('unzipper');
// MQTT
const mqtt = require('mqtt');

// Talking to the mqtt broker
// Connect to MQTT broker

const options = {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS
}

const client = mqtt.connect('mqtt://mqtt.uvucs.org', options);

client.on('connect', () => {
  console.log('Connected to MQTT broker');
  client.subscribe('load/#');
  client.subscribe('save/#');
});

client.on('message', async (topic, message) => {
  const path = topic.substring(topic.indexOf('/') + 1);  
  console.log('Processing: '+ path);
    if (topic.startsWith('save/')) {
    const data = JSON.parse(message.toString());
    await save(path, data);
  } else if (topic.startsWith('load/')) {
    const result = await load(path);
    client.publish(`data/${path}`, JSON.stringify(result.rows[0].data));
  }
});

//-------------------------------------------------------------------
// KOA Server Setup
//-------------------------------------------------------------------

const app = new Koa();
const router = new Router();
const port = 8080;
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 512 * 1024 * 1024 // 512MB
  }
 });

// Middleware
app.use(cors());
app.use(koaBody());
app.use(serve("html"));

// Routes
router.get('/data/:path*', async (ctx) => {
  let path = ctx.params.path;
  console.log("GET path: "+ path);
  const result = await load(path);
  ctx.body = result.rows[0].data;
});

router.post('/data/:path*', async (ctx) => {
  let path = ctx.params.path;
  console.log("POST path: "+ path);
  const jsonStr = JSON.stringify(ctx.request.body);
  const result = await save(path, jsonStr);
  ctx.body = result.rows;
  ctx.body[0]['data'] = ctx.request.body;
});

// New endpoint for file upload
router.post('/upload', upload.single('file'), async (ctx) => {
  const file = ctx.file;
  const uploadname = file.originalname.split(".")[0];
  const extractPath = path.join(__dirname, 'html/'+ uploadname);

  // Unzip the file
  await fs.createReadStream(file.path)
    .pipe(unzipper.Extract({ path: extractPath }))
    .promise();

  // Delete the uploaded zip file
  fs.unlinkSync(file.path);

  ctx.body = { message: 'File uploaded and extracted successfully' };
});

app.use(router.routes()).use(router.allowedMethods());

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
