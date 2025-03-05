const fs = require('fs');
const path = require('path');

// Error handling middleware
function errorHandler() {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      ctx.status = err.status || 500;
      ctx.body = {
        error: true,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
      };
      ctx.app.emit('error', err, ctx);
    }
  };
}

// Logging middleware
function logger(options = {}) {
  const logDir = options.logDir || path.join(__dirname, '../logs');
  
  // Ensure log directory exists
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Create log stream for request logs
  const requestLogStream = fs.createWriteStream(
    path.join(logDir, 'requests.log'),
    { flags: 'a' }
  );
  
  return async (ctx, next) => {
    const start = Date.now();
    
    // Log request details
    const requestLog = {
      timestamp: new Date().toISOString(),
      method: ctx.method,
      url: ctx.url,
      ip: ctx.ip,
      userAgent: ctx.headers['user-agent'],
    };
    
    try {
      await next();
      
      // Calculate response time
      const responseTime = Date.now() - start;
      
      // Log response details
      const responseLog = {
        ...requestLog,
        status: ctx.status,
        responseTime: `${responseTime}ms`,
      };
      
      requestLogStream.write(JSON.stringify(responseLog) + '\n');
      
      // Add response time header
      ctx.set('X-Response-Time', `${responseTime}ms`);
      
    } catch (err) {
      // Log error details
      const errorLog = {
        ...requestLog,
        error: err.message,
        stack: err.stack,
      };
      
      requestLogStream.write(JSON.stringify(errorLog) + '\n');
      throw err;
    }
  };
}

// Authentication middleware
function authenticate(options = {}) {
  return async (ctx, next) => {
    // Skip authentication for public routes
    const publicPaths = options.publicPaths || [];
    if (publicPaths.some(path => ctx.path.startsWith(path))) {
      return await next();
    }
    
    // Get token from header
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = { error: 'Authentication required' };
      return;
    }
    
    const token = authHeader.substring(7);
    
    try {
      // Verify token logic would go here
      // This is a placeholder - replace with actual token verification
      const user = { id: '123', username: 'user' }; // Placeholder
      
      // Attach user to context
      ctx.state.user = user;
      
      await next();
    } catch (err) {
      ctx.status = 401;
      ctx.body = { error: 'Invalid or expired token' };
    }
  };
}

// Rate limiting middleware
function rateLimit(options = {}) {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 100, // limit each IP to 100 requests per windowMs
    message = 'Too many requests, please try again later',
  } = options;
  
  // Store for tracking requests
  const requestCounts = new Map();
  
  // Clean up old entries periodically
  setInterval(() => {
    const now = Date.now();
    
    requestCounts.forEach((data, key) => {
      if (now - data.timestamp > windowMs) {
        requestCounts.delete(key);
      }
    });
  }, windowMs);
  
  return async (ctx, next) => {
    const ip = ctx.ip;
    const now = Date.now();
    
    // Get or initialize request count for this IP
    const requestData = requestCounts.get(ip) || {
      count: 0,
      timestamp: now,
    };
    
    // Reset if outside window
    if (now - requestData.timestamp > windowMs) {
      requestData.count = 0;
      requestData.timestamp = now;
    }
    
    // Increment request count
    requestData.count++;
    requestCounts.set(ip, requestData);
    
    // Set rate limit headers
    ctx.set('X-RateLimit-Limit', max.toString());
    ctx.set('X-RateLimit-Remaining', Math.max(0, max - requestData.count).toString());
    ctx.set('X-RateLimit-Reset', (Math.ceil((requestData.timestamp + windowMs) / 1000)).toString());
    
    // Check if rate limit exceeded
    if (requestData.count > max) {
      ctx.status = 429;
      ctx.body = { error: message };
      return;
    }
    
    await next();
  };
}

module.exports = {
  errorHandler,
  logger,
  authenticate,
  rateLimit
};