# Local Razorpay Payment Gateway Setup

This guide explains how to set up and test the Razorpay payment gateway integration locally for the SSPL T10 Player Registration Form.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Local Razorpay Server
```bash
npm run server
```
This starts the Express server on `http://localhost:3001` that handles Razorpay order creation and payment verification.

### 3. Start the Frontend Development Server
```bash
npm run dev
```
This starts the Vite development server on `http://localhost:8080`.

### 4. Alternative: Run Both Servers Simultaneously
```bash
npm run dev:full
```
This runs both the Razorpay server and the frontend development server concurrently.

## 🔧 Configuration

### Environment Variables
The following environment variables are used for Razorpay integration:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_RCobT224QzsDLv
VITE_RAZORPAY_KEY_SECRET=mjdR0QLdHFMuI4tKITFfLhiy
VITE_SUPABASE_URL=https://fazpykekypcktcmniwbj.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Local Server Endpoints

The local Express server provides these endpoints:

- `POST /create-order` - Creates Razorpay orders
- `POST /verify-payment` - Verifies payment signatures
- `GET /health` - Health check endpoint

## 📋 Testing the Payment Flow

### 1. Access the Registration Form
Navigate to `http://localhost:8080` and find the Player Registration Form.

### 2. Fill Out the Form
Complete all required fields:
- Full Name (required)
- Email Address (required)
- Phone Number (required)
- Date of Birth (optional)
- State (required)
- City (required)
- Playing Position (optional)
- PIN Code (optional)

### 3. Submit the Form
Click "Register Player" to submit the form. This will:
- Validate the form data
- Create a record in the Supabase database
- Open the Review Modal

### 4. Review Modal
The review modal displays:
- All entered player information
- Payment summary with GST calculation
- Terms and conditions notice

### 5. Confirm and Proceed to Payment
Click "Proceed to Payment" to open the Payment Confirmation Modal.

### 6. Complete Payment
In the Payment Confirmation Modal:
- Review payment details
- Click "Pay ₹X" to initiate Razorpay payment
- Complete the payment using test credentials

## 🧪 Test Payment Credentials

Use these test credentials for Razorpay sandbox:

### Test Card Details:
- **Card Number**: `4111 1111 1111 1111`
- **Expiry**: `12/25`
- **CVV**: `123`
- **Name**: `Test User`

### Test UPI ID:
- **UPI ID**: `success@razorpay`

### Test Net Banking:
- **Bank**: Any bank from the list
- **Username**: Any value
- **Password**: Any value

## 🔍 Debugging

### Check Server Logs
Monitor both servers for debugging information:

**Frontend Server** (`http://localhost:8080`):
- Form validation errors
- API call responses
- Payment flow events

**Razorpay Server** (`http://localhost:3001`):
- Order creation logs
- Payment verification logs
- Error handling

### Common Issues

1. **Razorpay script not loading**:
   - Ensure the script tag is present in `index.html`
   - Check browser console for network errors

2. **Payment modal not opening**:
   - Verify Razorpay key is correct
   - Check browser console for JavaScript errors

3. **Database connection issues**:
   - Verify Supabase credentials in `.env`
   - Check network connectivity

4. **Server not starting**:
   - Ensure port 3001 is available
   - Check for conflicting processes

## 📊 Payment Flow Architecture

```
1. Form Submission
   ↓
2. Database Record Creation
   ↓
3. Review Modal Display
   ↓
4. Payment Confirmation Modal
   ↓
5. Razorpay Order Creation (Local Server)
   ↓
6. Razorpay Payment Modal
   ↓
7. Payment Completion
   ↓
8. Payment Verification (Local Server)
   ↓
9. Database Update
   ↓
10. Success/Error Handling
```

## 🔒 Security Notes

- All payment data is handled securely through Razorpay
- No sensitive payment information is stored locally
- Payment verification uses cryptographic signatures
- Environment variables contain test credentials only

## 📞 Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Verify both servers are running on correct ports
3. Ensure all environment variables are set correctly
4. Test the `/health` endpoint to verify server connectivity

## 🎯 Next Steps

After successful local testing:

1. Update environment variables with production Razorpay credentials
2. Configure production domain settings
3. Set up webhook endpoints for production
4. Test with real payment methods (if needed)
5. Deploy to production environment

---

**Note**: This setup is configured for local development and testing only. Production deployment requires additional security configurations and production Razorpay credentials.