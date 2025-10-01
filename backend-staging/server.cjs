require('dotenv').config({ path: ".env.staging" });; // Load environment variables
const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

// Initialize Express
const app = express();

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' })); // Allow your frontend URL
app.use(bodyParser.json()); // Parse JSON requests

// Serve static frontend build
const frontendDist = path.join(__dirname, '/var/www/vhosts/ssplt10.cloud/httpdocs_live/httpdocs/httpdocs_staging/'); // Adjust if your build folder is different
app.use(express.static(frontendDist));

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Create Razorpay order
app.post('/api/create-order', async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Serve index.html for all other routes (for frontend routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log("RAZORPAY_KEY_ID:", process.env.RAZORPAY_KEY_ID);
  console.log("RAZORPAY_KEY_SECRET:", process.env.RAZORPAY_KEY_SECRET);
  console.log(`Server running on port ${PORT}`);
  console.log('Razorpay initialized:', process.env.RAZORPAY_KEY_ID ? '✅' : '❌ Missing Key');
});
