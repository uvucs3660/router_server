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
const { readFile } = require( "node:fs/promises");
const { execSync } = require('child_process');
// KOA
const Koa = require('koa');
const Router = require('koa-router');
const websockify = require('koa-websocket');
const serve = require('koa-static');
const cors = require('koa-cors');
const { koaBody } = require('koa-body');
const multer = require('@koa/multer');
const unzipper = require('unzipper');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const dotenv = require('dotenv');
const https = require('https');

// MQTT
const mqtt = require('mqtt');

// Talking to the mqtt broker
// Connect to MQTT broker

const options = {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASS,
}

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};

// aws s3 configuration
// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

async function uploadToS3(file) {
  const params = {
      Bucket: 'project3-team5',
      Key: `${file.originalFilename}`,
      Body: await readFile(file.filepath),
      ContentType: file.mimetype,
      ACL: 'public-read'
  };

  try {
      await s3Client.send(new PutObjectCommand(params));
      // Construct the S3 URL
      return `https://project3-team5.s3.us-east-1.amazonaws.com/${params.Key}`;
  } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
  }
}

// Helper function to upload to S3
async function uploadToS3Parallel(file) {
  const params = {
      Bucket: 'project3-team5',
      Key: `${file.originalFilename}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
  };

  try {
      await s3Client.send(new PutObjectCommand(params));
      // Construct the S3 URL
      return `https://project3-team5.s3.amazonaws.com/${params.Key}`;
  } catch (error) {
      console.error('Error uploading to S3:', error);
      throw error;
  }
}

var mqttBroker =  "mqtt://mqtt.uvucs.org" || process.env.MQTT_SERVER;
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
    const result = await save(path, JSON.stringify(data));
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
const wsapp = websockify(new Koa());
const wsRouter = new Router();
const router = new Router();
const httpPort = 8080 || process.env.HTTP_PORT;
const httpsPort = 8443 || process.env.HTTPS_PORT;
const baseUrl = process.env.BASE_URL;

// SSL/TLS configuration
const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH || 'path/to/key.pem'),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH || 'path/to/cert.pem')
};

// Configure multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024 // 5MB limit
    }
});

// Middleware
app.use(cors());
// Middleware for handling JSON payloads up to 128MB
app.use(
  koaBody({
    jsonLimit: '128mb',
  })
);


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

// Define a WebSocket route
wsRouter.get('/ws', (ctx) => {
  // Send a message when the client connects
  ctx.websocket.send('Welcome to the WebSocket server!');

  // Handle incoming messages from the client
  ctx.websocket.on('message', (message) => {
    console.log(`Received message: ${message}`);

    // Echo the message back to the client
    ctx.websocket.send(`Server says: ${message}`);
  });

  // Handle the close event
  ctx.websocket.on('close', () => {
    console.log('WebSocket connection closed');
  });
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

// Middleware for handling ZIP file uploads up to 1024mb
app.use(
  koaBody({
    formidable: {
      uploadDir: path.join(__dirname, '/upload'),
      keepExtensions: true,
      maxFileSize: 1024 * 1024 * 1024, // 500MB limit
    },
    multipart: true,
    urlencoded: true,
  }
));

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

// Route to handle file uploads
router.post('/upload', async (ctx) => {
  const files = ctx.request.files;

  if (!files || !files.file) {
    ctx.status = 400;
    ctx.body = { error: 'No file uploaded' };
    return;
  }

  const uploadedFile = files.file;
  const filePath = uploadedFile.filepath;
  const fileName = path.basename(filePath, path.extname(filePath));
  const extractDirName = uploadedFile.originalFilename.split(".")[0];
  const extractDir = path.join(__dirname, extractDirName);

  try {
    // Create directory for extracted files
    fs.mkdirSync(extractDir, { recursive: true });

    // Unzip the file into the directory
    await fs.createReadStream(filePath)
      .pipe(unzipper.Extract({ path: extractDir }))
      .promise();

    // Delete the uploaded zip file
    fs.unlinkSync(filepath);      

    ctx.status = 200;
    ctx.body = { message: 'File uploaded and extracted successfully', directory: fileName };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { error: 'Failed to extract the ZIP file', details: error.message };
  }
});

// File upload endpoint
router.post('/uploads3',  async (ctx) => {
  try {
      const file = ctx.request.files.file;
      
      if (!file) {
          ctx.status = 400;
          ctx.body = { error: 'No file uploaded' };
          return;
      }

      if (!file.originalFilename || !file.size > 0|| !file.mimetype) {
          ctx.status = 400;
          ctx.body = { error: 'Invalid file format' };
          return;
      }

      const fileUrl = await uploadToS3(file);

      ctx.body = {
          success: true,
          fileUrl: fileUrl
      };
  } catch (error) {
      console.error('Upload error:', error);
      ctx.status = 500;
      ctx.body = {
          success: false,
          error: error.message || 'Error uploading file'
      };
  }
});

app.use(router.routes()).use(router.allowedMethods());

// Start servers
app.listen(httpPort, () => {
  console.log(`HTTP Server running on ${baseUrl}:${httpPort}`);
});

https.createServer(httpsOptions, app.callback()).listen(httpsPort, () => {
  console.log(`HTTPS Server running on ${baseUrl}:${httpsPort}`);
});
