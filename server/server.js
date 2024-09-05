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
const { load, save, combine, loadUrl, saveUrl } = require('./store');
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
const port = 8080 || process.env.SERVER_PORT;
const baseUrl = `https://data.uvucs.org/short/`;

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

router.put('/data/:path*', async (ctx) => {
  let path = ctx.params.path;
  console.log("POST path: "+ path);
  const jsonStr = JSON.stringify(ctx.request.body);
  const result = await combine(path, jsonStr);
  ctx.body = result.rows;
  ctx.body[0]['data'] = ctx.request.body;
});

// Characters used for encoding -- in ascii order
const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz~';
const base = characters.length; // Base 64

// Function to encode an integer to a base-64 string
function encode(num) {
  console.log("encode: " + num);
  let encoded = '';
  while (num > 0) {
    encoded = characters[num % base] + encoded;
    num = Math.floor(num / base);
  }
  return encoded;
}

// Function to decode a base-66 string to an integer
function decode(str) {
  console.log("decode: " + str);
  let decoded = 0;
  for (let i = 0; i < str.length; i++) {
    decoded = decoded * base + characters.indexOf(str[i]);
  }
  return decoded;
}

// Route for redirecting to the original URL
router.get('/short/:shortUrl/:domain*',  async (ctx) => {
  const { shortUrl, domain } = ctx.params;
  const originalUrl = await loadUrl(decode(shortUrl));
  if (originalUrl.rowCount==0) {
    ctx.status = 404;
    ctx.body = 'URL not found';
  } else {
    ctx.redirect(domain + originalUrl.rows[0].url);
  }
});

// Route for shortening a new URL
let currentId = 1; // Initialize a counter to generate unique IDs for URLs
router.post('/shorten', async (ctx) => {
  const { originalUrl } = ctx.request.body;
  if (!originalUrl) {
    ctx.status = 400;
    ctx.body = 'Invalid request: originalUrl is required';
    return;
  }
  const result = await saveUrl(originalUrl)
  const shortUrl = encode(result.rows[0].short_id); // Encode the current ID to generate the short URL

  ctx.body = {
    originalUrl,
    shortUrl: `${baseUrl}${shortUrl}`
  };
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
