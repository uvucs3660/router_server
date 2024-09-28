// npm install koa koa-router koa-static koa-cors koa-body @koa/multer
//
// path structure
// cs3660/fall/team_projects.json
// presentation/projectX/teamY/
// gitstatus/projectX/teamY
// survey/projectX/teamY
// easywork/projectX/teamY
// grades/projectX/teamY
// each of these should return a json, when calling a get to /data

// api endpoint GET /data/path/to/data - takes a path and returns data
// api endpoint POST /data/path/to/data - takes a path and data and stores it

// ours
const { allrows, load, save, combine, loadUrl, saveUrl } = require('./store');
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

var mqttBroker = process.env.MQTT_SERVER;
const client = mqtt.connect(mqttBroker , options);

client.on('connect', () => {
  console.log(`Connected to MQTT broker ${mqttBroker}`);
  client.subscribe('load/#');
  client.subscribe('save/#');
});

client.on('message', async (topic, message) => {
  const path = topic.substring(topic.indexOf('/') + 1);  
  console.log('Processing: '+ path);
    if (topic.startsWith('save/')) {
    const data = JSON.parse(message.toString());
      // this should be able to json schema validate here.
    const result = await save(path, data);
    client.publish(`data/${path}`, JSON.stringify(data));
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
const baseUrl = process.env.BASE_URL;

const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 512 * 1024 * 1024 // 512MB
  }
 });

// Middleware
app.use(cors());
app.use(koaBody());

app.use(async (ctx, next) => {
  const host = ctx.request.header.host;
  
  // Extract subdomain (assuming format: subdomain.domain.com or domain.com)
  const parts = host.split('.');
  let subdomain = 'html';
  if (parts.length === 3) {
      subdomain = parts[0];  // Use the first part as the subdomain
  }

  // Set up static file serving dynamically based on the subdomain or fallback to "html"
  const staticPath = path.join(__dirname, subdomain);
  return serve(staticPath)(ctx, next);
});

// Routes

// https://chatgpt.com/share/ba8d4a11-7a6a-4c9d-8d2b-7a5daf856082
// Define the attendance route
router.get('/attent', (ctx) => {
  // Extract query parameters
  const { student, username, password } = ctx.query;

  // Check if all required parameters are provided
  if (!student || !username || !password) {
    ctx.status = 400;
    ctx.body = { error: 'Missing required query parameters' };
    return;
  }

  // Generate a JSON response for attendance
  const attendance = {
    student: parseInt(student, 10), // Convert the student parameter to an integer
    class_date: new Date().toISOString().split('T')[0] // Current date in YYYY-MM-DD format
  };

  combine("cs3660/fall2024/attendance.json", attendance);

  // Set the response body
  ctx.body = attendance;
});

// -----------------------------------------------
// Database
// -----------------------------------------------

router.get('/data/:path*', async (ctx) => {
  const path = ctx.params.path;
  const { json_path } = ctx.query;
  
  console.log("GET path: "+ path);
  
  const result = await load(path, json_path);
  ctx.body = result.rows[0].data;
});

router.post('/data/:path*', async (ctx) => {
  let path = ctx.params.path;
  console.log("POST path: "+ path);
  const jsonStr = JSON.stringify(ctx.request.body);
  // this should be able to json schema validate here.
  const result = await save(path, jsonStr);
  ctx.body = result.rows;
  ctx.body[0]['data'] = ctx.request.body;
});

router.put('/data/:path*', async (ctx) => {
  let path = ctx.params.path;
  console.log("PUT path: "+ path);
  const jsonStr = JSON.stringify(ctx.request.body);
  const result = await combine(path, jsonStr);
  ctx.body = result.rows;
  ctx.body[0]['data'] = ctx.request.body;
});

// -----------------------------------------------
// Document Store
// -----------------------------------------------
router.get('/docs/export', async (ctx) => {

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

// Helper function to create directory if it doesn't exist
function ensureDirectoryExistence(filePath) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

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
router.get('/shortdom/:shortUrl/:domain*',  async (ctx) => {
  const { shortUrl, domain } = ctx.params;
  const originalUrl = await loadUrl(decode(shortUrl));
  if (originalUrl.rowCount==0) {
    ctx.status = 404;
    ctx.body = 'URL not found';
  } else {
    ctx.redirect(domain + originalUrl.rows[0].url);
  }
});

// Route for redirecting to the original URL
router.get('/s/:shortUrl',  async (ctx) => {
  const { shortUrl  } = ctx.params;
  const { student, username, password} = ctx.query;

  const result = await loadUrl(decode(shortUrl));
  if (result.rowCount==0) {
    ctx.status = 404;
    ctx.body = 'URL not found';
  } else {
    if (username === undefined) {
      ctx.redirect(result.rows[0].url);
    } else {
      const redirectUrl = `${result.rows[0].url}?student=${encodeURIComponent(student)}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
      ctx.redirect(redirectUrl);
    }
  }
});

// Function to execute shell commands
function runCommand(command, cwd) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error}`);
        reject(error);
      } else {
        console.log(stdout);
        resolve(stdout);
      }
    });
  });
}

// Route to handle file upload and subsequent operations
router.post('/appload', koaBody({ multipart: true }), async (ctx) => {
  const file = ctx.request.files.file; // Expecting form field named 'file'

  if (!file) {
    ctx.status = 400;
    ctx.body = 'No file uploaded';
    return;
  }

  const filePath = file.path;
  const uploadDir = path.join(__dirname, 'uploads');

  // Ensure the uploads directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const extractedDir = path.join(uploadDir, path.basename(file.name, path.extname(file.name)));

  // Unzip the file
  try {
    await fs.createReadStream(filePath)
      .pipe(unzipper.Extract({ path: extractedDir }))
      .promise();
  } catch (err) {
    console.error('Error extracting zip file:', err);
    ctx.status = 500;
    ctx.body = 'Failed to extract zip file';
    return;
  }

  // Run npm install in server and html directories
  try {
    await runCommand('npm install', path.join(extractedDir, 'server'));
    await runCommand('npm install', path.join(extractedDir, 'html'));

    // Run node server.js from the server directory
    runCommand('node server.js', path.join(extractedDir, 'server'));

    ctx.status = 200;
    ctx.body = 'File uploaded and processed successfully';
  } catch (err) {
    console.error('Error running commands:', err);
    ctx.status = 500;
    ctx.body = 'Failed to run commands';
  }
});

// Route for redirecting to the original URL
// https://uvucs.org/auth?s=1&f=first&l=last&g=github&u=username&p=password
router.get('/auth', async (ctx) => {
  // Extract query parameters
  const { s, f, l, g, u, p } = ctx.query;

  // Create JSON object from URL parameters
  const studentData = {
    student: s,
    first: f,
    last: l,
    github: g,
    username: u,
    password: p,
  };

  // Pass data to HTML template
  ctx.body = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Student Actions</title>
        <script type="module" src="javascript/student-actions.js"></script>
      </head>
      <body>
        <user-actions data='${JSON.stringify(studentData).replace(/'/g, "&apos;")}'></student-actions>
      </body>
    </html>
  `;
});


// Route for shortening a new URL
let currentId = 1; // Initialize a counter to generate unique IDs for URLs
router.post('/shorten', async (ctx) => {
  const { shortId, originalUrl } = ctx.request.body;
  if (!originalUrl) {
    ctx.status = 400;
    ctx.body = 'Invalid request: originalUrl is required';
    return;
  }
  const result = await saveUrl(decode(shortId), originalUrl);
  const shortUrl = encode(result.rows[0].short_id); // Encode the current ID to generate the short URL

  ctx.body = {
    originalUrl,
    shortUrl: `${baseUrl}$/s/{shortUrl}`
  };
});

// New endpoint for file upload
router.post('/upload', upload.single('file'), async (ctx) => {
  const file = ctx.file;
  const uploadname = file.originalname.split(".")[0];
  const extractPath = path.join(__dirname, '/'+ uploadname);

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
  console.log(`Server running on ${baseUrl}`);
});
