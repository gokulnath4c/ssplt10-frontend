import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

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

// Proxy API routes to backend server
app.use('/api', (req, res) => {
  const backendUrl = 'http://127.0.0.1:3001';

  // Remove /api prefix for backend
  const backendPath = req.path.replace(/^\/api/, '');

  // Create proxy request
  const proxyReq = {
    method: req.method,
    headers: {
      ...req.headers,
      host: '127.0.0.1:3001',
      'x-forwarded-for': req.ip,
      'x-forwarded-proto': req.protocol,
      'x-forwarded-host': req.get('host'),
      'x-real-ip': req.ip
    },
    body: req.body
  };

  // Make request to backend
  fetch(`${backendUrl}${backendPath}`, proxyReq)
    .then(async (backendRes) => {
      // Copy status and headers
      res.status(backendRes.status);

      // Copy response headers
      backendRes.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });

      // Send response body
      const body = await backendRes.text();
      res.send(body);
    })
    .catch((error) => {
      console.error('Backend proxy error:', error);
      res.status(500).json({
        error: 'Backend Service Unavailable',
        message: 'The payment service is currently unavailable. Please try again later.',
        timestamp: new Date().toISOString()
      });
    });
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
