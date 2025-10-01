require('dotenv').config({ path: __dirname + '/.env.production' });
const express = require('express');
const Razorpay = require('razorpay');
const cors = require('cors');

const app = express();
app.use(express.json());

// CORS configuration: allow production origins and local dev origin
const allowedOrigins = ['https://ssplt10.co.in', 'https://ssplt10.cloud', 'http://localhost:5175'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      // Allow no-origin requests during development (e.g. file:// or curl)
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('Not allowed by CORS'), false);
      }
      return callback(null, true);
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  }
}));

// Initialize Razorpay client if credentials are present
let rzp = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('Razorpay credentials not found in environment. Order creation will fail until RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are provided.');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create Razorpay order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    // Log for debugging
    console.log(`[${new Date().toISOString()}] Creating Razorpay order: ${amount} paise`);

    if (!rzp) {
      console.error('Attempted to create order but Razorpay client is not configured.');
      return res.status(500).json({ success: false, error: 'Razorpay credentials not configured on the server.' });
    }

    const options = {
      amount: Number(amount), // amount in paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await rzp.orders.create(options);

    res.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`🚀 API server running on port ${PORT}`);
});
