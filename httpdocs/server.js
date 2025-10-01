import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse JSON bodies for API proxy
app.use(express.json());

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Serve static files with cache headers
app.use(express.static(path.join(__dirname, 'dist'), {
  maxAge: '1d',
  etag: true
}));

// Add logging middleware for favicon requests
app.use((req, res, next) => {
  if (req.path.includes('favicon') || req.path === '/favicon.ico') {
    console.log(`🔍 Favicon request: ${req.method} ${req.path} - User-Agent: ${req.get('User-Agent')}`);
  }
  next();
});

// Health check - MUST come before SPA fallback
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Frontend server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Enhanced health check with detailed metrics
app.get('/health/detailed', async (req, res) => {
  const startTime = Date.now();
  const healthData = {
    status: 'ok',
    message: 'Frontend server health check',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    },
    services: {}
  };

  // Check if static files directory exists and is accessible
  const fs = await import('fs');
  const staticDir = path.join(__dirname, 'dist');

  try {
    await fs.promises.access(staticDir, fs.constants.R_OK);
    const stats = await fs.promises.stat(staticDir);
    healthData.services.staticFiles = {
      status: 'ok',
      message: 'Static files directory is accessible',
      lastModified: stats.mtime.toISOString()
    };
  } catch (error) {
    healthData.services.staticFiles = {
      status: 'error',
      message: `Static files directory error: ${error.message}`,
      error: error.message
    };
    healthData.status = 'degraded';
  }

  // Check backend connectivity if backend URL is configured
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';
  if (backendUrl) {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${backendUrl}/health`, {
        timeout: 5000 // 5 second timeout
      });

      if (response.ok) {
        const backendHealth = await response.json();
        healthData.services.backend = {
          status: 'ok',
          message: 'Backend is reachable',
          backendStatus: backendHealth.status,
          backendUptime: backendHealth.uptime
        };
      } else {
        throw new Error(`Backend returned status ${response.status}`);
      }
    } catch (error) {
      healthData.services.backend = {
        status: 'error',
        message: `Backend connectivity failed: ${error.message}`,
        error: error.message
      };
      healthData.status = 'degraded';
    }
  }

  // Check if index.html exists
  try {
    const indexPath = path.join(__dirname, 'dist', 'index.html');
    await fs.promises.access(indexPath, fs.constants.R_OK);
    healthData.services.indexFile = {
      status: 'ok',
      message: 'Index file is accessible'
    };
  } catch (error) {
    healthData.services.indexFile = {
      status: 'error',
      message: `Index file error: ${error.message}`,
      error: error.message
    };
    healthData.status = 'error';
  }

  // Calculate response time
  healthData.responseTime = Date.now() - startTime;

  // Set HTTP status based on overall health
  const httpStatus = healthData.status === 'ok' ? 200 : healthData.status === 'degraded' ? 206 : 503;
  res.status(httpStatus).json(healthData);
});

// CORS preflight for API routes
app.options('/api*', (req, res) => {
 const origin = req.get('Origin') || 'http://localhost:5173';
 // Vary ensures caches differentiate by Origin/Access-Control-Request-* headers
 res.setHeader('Vary', 'Origin, Access-Control-Request-Headers, Access-Control-Request-Method');
 res.setHeader('Access-Control-Allow-Origin', origin);
 res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
 // Echo requested headers if provided, else allow common headers
 const reqHeaders = req.get('Access-Control-Request-Headers') || 'Content-Type, Authorization, X-Requested-With';
 res.setHeader('Access-Control-Allow-Headers', reqHeaders);
 // Allow credentials if you plan to send cookies/authorization
 res.setHeader('Access-Control-Allow-Credentials', 'true');
 // Cache preflight response for 1 day to reduce OPTIONS traffic
 res.setHeader('Access-Control-Max-Age', '86400');
 return res.status(200).end();
});

// Proxy API routes to backend server (for dev/preview)
app.use('/api', async (req, res) => {
 try {
   const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:3001';
   // Preserve original path so backend receives /api/...
   const targetUrl = `${backendUrl}${req.originalUrl}`;

   // Build headers, avoid hop-by-hop headers
   const headers = {
     'x-forwarded-for': req.ip,
     'x-forwarded-proto': req.protocol,
     'x-forwarded-host': req.get('host') || '',
     'x-real-ip': req.ip
   };
   // Forward incoming headers except host/content-length (and content-type handled below)
   for (const [k, v] of Object.entries(req.headers)) {
     const key = k.toLowerCase();
     if (key === 'host' || key === 'content-length') continue;
     if (key === 'content-type') continue;
     headers[key] = v;
   }
   // Ensure content-type header is present for JSON bodies
   if (req.headers['content-type']) {
     headers['content-type'] = req.headers['content-type'];
   } else {
     headers['content-type'] = 'application/json';
   }

   const method = req.method.toUpperCase();
   const hasBody = !['GET', 'HEAD'].includes(method);
   const body = hasBody
     ? (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}))
     : undefined;

   const globalFetch = (global.fetch ? global.fetch.bind(global) : (await import('node-fetch')).default);
   const backendRes = await globalFetch(targetUrl, {
     method,
     headers,
     body
   });

   res.status(backendRes.status);
   backendRes.headers.forEach((value, key) => res.setHeader(key, value));
   const respText = await backendRes.text();
   res.send(respText);
 } catch (error) {
   console.error('Backend proxy error:', error);
   res.status(500).json({
     error: 'Backend Service Unavailable',
     message: 'The payment service is currently unavailable. Please try again later.',
     timestamp: new Date().toISOString()
   });
 }
});

// Serve service worker
app.get('/custom-sw.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'custom-sw.js'));
});

// SPA fallback - MUST come LAST
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV !== 'production';

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong',
    ...(isDevelopment && { stack: err.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`🚀 Frontend server running on port ${port}`);
  console.log(`📁 Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`❤️  Health check available at: http://localhost:${port}/health`);
});
