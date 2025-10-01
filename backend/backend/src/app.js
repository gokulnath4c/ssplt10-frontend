import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

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
    // Allow all origins in development and preview
    if (process.env.NODE_ENV !== 'production') {
      console.debug(`[CORS] Dev/Preview mode: allowing origin ${origin || 'null'}`);
      return callback(null, true);
    }

    // Normalize file:// origins to 'null' for controlled testing
    const normalizedOrigin = origin && origin.startsWith('file://') ? 'null' : origin;

    // Production origins (add env overrides)
    const defaultAllowed = [
      'https://www.ssplt10.cloud',
      'https://ssplt10.cloud',
      'https://ssplt10.co.in',
      'https://preview.ssplt10.cloud',
      // Allow "null" origin for file:// usage in controlled testing
      'null',
      // Allow local dev UI to hit production backend for testing
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost',
      'http://localhost:3000'
    ];

    const envAllowed = (process.env.ALLOWED_ORIGINS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const allowedOrigins = Array.from(new Set([...defaultAllowed, ...envAllowed]));

    if (!normalizedOrigin || allowedOrigins.indexOf(normalizedOrigin) !== -1) {
      console.debug(`[CORS] Allowed origin: ${normalizedOrigin || 'null'}`);
      callback(null, true);
    } else {
      console.warn(`🚨 CORS blocked request from origin: ${normalizedOrigin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Middleware
app.use(cors(corsOptions));
// Express v5 uses path-to-regexp v6 which doesn't accept '*' path strings.
// Use a RegExp to enable preflight across the board to avoid "Missing parameter name at index 1: *"
app.options(/.*/, cors(corsOptions)); // enable preflight across-the-board (v5-safe)
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

// Initialize Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
console.log('✅ Supabase client initialized');

// Create order endpoint
app.post('/api/create-order', async (req, res) => {
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
      payment_capture: 1,
    });

    console.log('✅ Order created successfully:', order.id);
    res.json(order);
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

// Verify payment endpoint
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { paymentId, orderId, signature, registrationId, amount } = req.body;

    console.log('🔍 Verifying payment:', { paymentId, orderId, registrationId });

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

    // Update the database with payment details
    if (registrationId) {
      try {
        console.log('📝 Updating registration with payment details for ID:', registrationId);

        // Update the registration with payment details
        const { data, error } = await supabase
          .from('player_registrations')
          .update({
            payment_status: 'completed',
            payment_amount: amount,
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', registrationId)
          .select();

        if (error) {
          console.error('❌ Database update failed:', error);
          // Try with 'verified' status as fallback
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('player_registrations')
            .update({
              payment_status: 'verified',
              payment_amount: amount,
              razorpay_payment_id: paymentId,
              razorpay_order_id: orderId,
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', registrationId)
            .select();

          if (fallbackError) {
            console.error('❌ Fallback database update also failed:', fallbackError);
            throw fallbackError;
          } else {
            console.log('✅ Database update completed with fallback status for registration:', registrationId);
          }
        } else {
          console.log('✅ Database update completed for registration:', registrationId, data);
        }

      } catch (dbError) {
        console.error('❌ Database update failed:', dbError);
        // Don't fail the entire verification if DB update fails
        // The payment was verified successfully
      }
    }
res.json({
  verified: true,
  registrationId: registrationId,
  paymentId: paymentId,
  orderId: orderId
});
} catch (error) {
console.error('❌ Error verifying payment:', error);
res.status(500).json({ error: error.message || 'Payment verification failed' });
}
});

// Cancel payment (void authorized payment)
app.post('/api/razorpay/cancel', async (req, res) => {
try {
const { paymentId } = req.body || {};
if (!paymentId || typeof paymentId !== 'string' || !paymentId.startsWith('pay_')) {
  return res.status(400).json({ success: false, error: 'Invalid or missing paymentId' });
}

const url = `https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}/cancel`;
const auth = Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
const idempotencyKey = `cancel-${paymentId}-v1`;

const rpResp = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json',
    'X-Razorpay-Idempotency-Key': idempotencyKey
  },
  body: JSON.stringify({})
});

let data = null;
try {
  data = await rpResp.json();
} catch {
  data = null;
}

if (!rpResp.ok) {
  console.error('❌ Razorpay cancel error', {
    status: rpResp.status,
    code: data?.error?.code,
    description: data?.error?.description,
    reason: data?.error?.reason,
    field: data?.error?.field,
    metadata: data?.error?.metadata
  });
  return res.status(rpResp.status).json({
    success: false,
    error: data?.error?.description || 'Cancel failed',
    razorpay: data?.error
  });
}

// Successful cancel returns the Payment object (status "voided")
return res.status(200).json({
  success: true,
  payment: data
});
} catch (err) {
console.error('❌ Error cancelling payment:', err);
return res.status(500).json({ success: false, error: 'Internal server error' });
}
});

// Mirror endpoints under /api/razorpay/* for unified FE paths
app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    console.log('📡 [razorpay/create-order] Creating order for amount:', amount);

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount provided' });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // amount in paise
      currency: 'INR',
      receipt: `sspl_local_${Date.now()}`,
      payment_capture: 1,
    });

    console.log('✅ [razorpay/create-order] Order created:', order.id);
    res.json(order);
  } catch (error) {
    console.error('❌ [razorpay/create-order] Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { paymentId, orderId, signature, registrationId, amount } = req.body;

    console.log('🔍 [razorpay/verify-payment] Verifying payment:', { paymentId, orderId, registrationId });

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

    // Update the database with payment details
    if (registrationId) {
      try {
        console.log('📝 Updating registration with payment details for ID:', registrationId);

        const { data, error } = await supabase
          .from('player_registrations')
          .update({
            payment_status: 'completed',
            payment_amount: amount,
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            status: 'completed',
            updated_at: new Date().toISOString()
          })
          .eq('id', registrationId)
          .select();

        if (error) {
          console.error('❌ Database update failed:', error);
          // Try with 'verified' status as fallback
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('player_registrations')
            .update({
              payment_status: 'verified',
              payment_amount: amount,
              razorpay_payment_id: paymentId,
              razorpay_order_id: orderId,
              status: 'completed',
              updated_at: new Date().toISOString()
            })
            .eq('id', registrationId)
            .select();

          if (fallbackError) {
            console.error('❌ Fallback database update also failed:', fallbackError);
            throw fallbackError;
          } else {
            console.log('✅ Database update completed with fallback status for registration:', registrationId);
          }
        } else {
          console.log('✅ Database update completed for registration:', registrationId, data);
        }

      } catch (dbError) {
        console.error('❌ Database update failed:', dbError);
        // Don't fail the entire verification if DB update fails
      }
    }

    res.json({
      verified: true,
      registrationId: registrationId,
      paymentId: paymentId,
      orderId: orderId
    });
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

/**
 * Expose non-sensitive runtime config for the frontend.
 * Only returns the PUBLIC key id and the current mode to keep FE/BE in sync.
 */
app.get('/api/config', (req, res) => {
  // Return multiple aliases to be compatible with older frontends
  // Preferred key: razorpayKeyId
  res.json({
    razorpayKeyId: razorpayKeyId,
    key: razorpayKeyId, // legacy alias used by some deployments
    mode: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Razorpay server running on http://localhost:${PORT} (env=${process.env.NODE_ENV || 'development'})`);
  console.log(`📡 Create order endpoint: http://localhost:${PORT}/api/create-order`);
  console.log(`🔍 Verify payment endpoint: http://localhost:${PORT}/api/verify-payment`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});