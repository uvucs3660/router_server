const Koa = require('koa');
const cors = require('koa-cors');
const { koaBody } = require('koa-body');
const serve = require('koa-static');
const path = require('path');
const https = require('https');
const fs = require('fs');
const websockify = require('koa-websocket');
const Router = require('koa-router');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import configurations
const { httpPort = 8080, httpsPort = 8443, baseUrl } = require('./config/server');
const httpsOptions = require('./config/ssl');
const { mqttBroker, options } = require('./config/mqtt');

// Import modules
const mqttClient = require('./modules/mqtt');

// Import routes
const dataRoutes = require('./routes/data');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/uploads');
const xstateRoutes = require('./routes/xstate');
const urlRoutes = require('./routes/shortUrl');

// Create app instances
const app = new Koa();
const wsapp = websockify(new Koa());
const wsRouter = new Router();

// Configure middleware
app.use(cors());
app.use(koaBody({
  jsonLimit: '128mb',
  formidable: {
    uploadDir: path.join(__dirname, '/upload'),
    keepExtensions: true,
    maxFileSize: 1024 * 1024 * 1024, // 1GB limit
  },
  multipart: true,
  urlencoded: true,
}));

// Dynamic subdomain handling
app.use(async (ctx, next) => {
  const host = ctx.request.header.host;
  const parts = host.split('.');
  let subdomain = 'html';
  if (parts.length === 3) {
    subdomain = parts[0];
  }
  const staticPath = path.join(__dirname, subdomain);
  return serve(staticPath)(ctx, next);
});

// Register routes
app.use(dataRoutes.routes()).use(dataRoutes.allowedMethods());
app.use(authRoutes.routes()).use(authRoutes.allowedMethods());
app.use(uploadRoutes.routes()).use(uploadRoutes.allowedMethods());
app.use(xstateRoutes.routes()).use(xstateRoutes.allowedMethods());
app.use(urlRoutes.routes()).use(urlRoutes.allowedMethods());

// WebSocket routes
wsapp.ws.use(wsRouter.routes()).use(wsRouter.allowedMethods());

// Start HTTP server
app.listen(httpPort, () => {
  console.log(`HTTP Server running on ${baseUrl}:${httpPort}`);
});

// Start HTTPS server
https.createServer(httpsOptions, app.callback()).listen(httpsPort, () => {
  console.log(`HTTPS Server running on ${baseUrl}:${httpsPort}`);
});
