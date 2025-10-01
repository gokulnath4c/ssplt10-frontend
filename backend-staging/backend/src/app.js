import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment-specific .env file from the backend directory
const envFile = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '..', '.env.production')
  : process.env.NODE_ENV === 'preview'
  ? path.join(__dirname, '..', '.env.preview')
  : path.join(__dirname, '..', '.env');

config({ path: envFile });

const app = express();
const PORT = process.env.PORT || 3001;

// Validate server-side environment variables early
function validateServerEnvironmentVariables() {
  const requiredVars = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET'
  ];

  const missingVars = [];

  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    const errorMessage = `❌ Missing required server environment variables: ${missingVars.join(', ')}\n\nPlease set these environment variables before starting the server.`;
    console.error(errorMessage);
    // Exit the process to prevent server from starting
    process.exit(1);
  }

  console.log('✅ All required server environment variables are present');
}

// Validate environment variables before setting up the server
validateServerEnvironmentVariables();

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:8080',      // Vite dev server
      'http://localhost:3000',      // Alternative dev port
      'http://127.0.0.1:8080',     // Localhost IP
      'http://127.0.0.1:3000',     // Alternative local IP
      'https://www.ssplt10.cloud',  // Production domain
      'https://ssplt10.cloud',      // Production domain without www
      'https://ssplt10.co.in',      // Frontend domain
      'https://preview.ssplt10.cloud', // Preview domain
      'http://localhost:4173',     // Vite preview server (HTTP)
      'https://localhost:4173',     // Vite preview server (HTTPS)
      'http://localhost:4174',     // Vite preview server (HTTP)
      'https://localhost:4174',    // Vite preview server (HTTPS)
      'http://localhost:4173',     // Vite preview server (HTTP)
      'https://localhost:4173',    // Vite preview server (HTTPS)
      'http://localhost:4174',     // Vite preview server (HTTP)
      'https://localhost:4174',    // Vite preview server (HTTPS)
      'http://localhost:4173',     // Vite preview server (HTTP)
      'https://localhost:4173',    // Vite preview server (HTTPS)
      'http://localhost:4174',     // Vite preview server (HTTP)
      'https://localhost:4174',    // Vite preview server (HTTPS)
      'http://localhost:4175',     // Vite preview server (HTTP)
      'https://localhost:4175',    // Vite preview server (HTTPS)
      'http://127.0.0.1:4173',     // Preview server IP
      'http://127.0.0.1:4174',     // Preview server IP
      'http://127.0.0.1:4175',     // Preview server IP
      'http://localhost:4176',     // Additional fallback port
      'http://127.0.0.1:4176'      // Additional fallback port IP
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚨 CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Validate required environment variables
const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

if (!razorpayKeyId) {
  console.error('❌ RAZORPAY_KEY_ID environment variable is required');
  process.exit(1);
}

if (!razorpayKeySecret) {
  console.error('❌ RAZORPAY_KEY_SECRET environment variable is required');
  process.exit(1);
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret
});

// Create order endpoint
app.post('/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    console.log('📡 Creating order for amount:', amount);

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount provided' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `sspl_local_${Date.now()}`,
    });

    console.log('✅ Order created successfully:', order.id);
    res.json(order);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// Verify payment endpoint
app.post('/verify-payment', async (req, res) => {
  try {
    const { paymentId, orderId, signature } = req.body;

    console.log('🔍 Verifying payment:', { paymentId, orderId });

    // Create the signature verification string
    const text = orderId + '|' + paymentId;
    const generatedSignature = crypto
      .createHmac('sha256', razorpay.key_secret)
      .update(text)
      .digest('hex');

    // Verify the signature
    const isValid = generatedSignature === signature;

    if (!isValid) {
      console.log('❌ Invalid signature');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('✅ Payment verification successful');
    res.json({ verified: true });
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({ error: error.message || 'Payment verification failed' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Razorpay server is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.version
  });
});

// Enhanced health check with detailed metrics
app.get('/health/detailed', async (req, res) => {
  const startTime = Date.now();
  const healthData = {
    status: 'ok',
    message: 'Backend server health check',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.version,
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024),
      rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
    },
    services: {}
  };

  try {
    // Check Razorpay connectivity
    const testOrder = await razorpay.orders.create({
      amount: 100, // 1 INR
      currency: 'INR',
      receipt: `health_check_${Date.now()}`,
    });

    healthData.services.razorpay = {
      status: 'ok',
      message: 'Razorpay API is accessible',
      testOrderId: testOrder.id
    };
  } catch (error) {
    healthData.services.razorpay = {
      status: 'error',
      message: `Razorpay API error: ${error.message}`,
      error: error.message
    };
    healthData.status = 'degraded';
  }

  // Check database connectivity (if PostgreSQL is configured)
  if (process.env.DATABASE_URL) {
    try {
      const { Client } = await import('pg');
      const client = new Client({ connectionString: process.env.DATABASE_URL });
      await client.connect();
      await client.query('SELECT 1');
      await client.end();

      healthData.services.database = {
        status: 'ok',
        message: 'Database connection successful'
      };
    } catch (error) {
      healthData.services.database = {
        status: 'error',
        message: `Database connection failed: ${error.message}`,
        error: error.message
      };
      healthData.status = 'degraded';
    }
  }

  // Check Supabase connectivity (if configured)
  if (process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(
        process.env.VITE_SUPABASE_URL,
        process.env.VITE_SUPABASE_ANON_KEY
      );

      const { data, error } = await supabase.from('health_check').select('*').limit(1);

      if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist" which is expected
        throw error;
      }

      healthData.services.supabase = {
        status: 'ok',
        message: 'Supabase connection successful'
      };
    } catch (error) {
      healthData.services.supabase = {
        status: 'error',
        message: `Supabase connection failed: ${error.message}`,
        error: error.message
      };
      healthData.status = 'degraded';
    }
  }

  // Calculate response time
  healthData.responseTime = Date.now() - startTime;

  // Set HTTP status based on overall health
  const httpStatus = healthData.status === 'ok' ? 200 : healthData.status === 'degraded' ? 206 : 503;
  res.status(httpStatus).json(healthData);
});

app.listen(PORT, () => {
  console.log(`🚀 Razorpay local server running on http://localhost:${PORT}`);
  console.log(`📡 Create order endpoint: http://localhost:${PORT}/create-order`);
  console.log(`🔍 Verify payment endpoint: http://localhost:${PORT}/verify-payment`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});