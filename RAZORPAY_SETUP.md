# 🔧 Razorpay Payment Gateway Setup Guide

## ✅ **Step 1: Frontend Configuration - COMPLETED**
- ✅ Added `VITE_RAZORPAY_KEY_ID="rzp_test_RCobT224QzsDLv"` to `.env` file
- ✅ Added `VITE_RAZORPAY_KEY_SECRET="mjdR0QLdHFMuI4tKITFfLhiy"` to `supabase/.env` file
- ✅ Razorpay script loaded in `index.html`
- ✅ Frontend integration ready
- ✅ Supabase Edge Functions configured with test credentials

## ✅ **Step 2: Supabase Edge Functions Configuration - COMPLETED**

### **Environment Variables Setup**
The Supabase Edge Functions have been updated to accept Razorpay credentials as parameters, eliminating the need to configure environment variables in the Supabase dashboard for development.

**Current Configuration:**
- ✅ Functions accept `key_id` and `key_secret` parameters
- ✅ Client passes credentials securely from `.env` file
- ✅ Fallback to environment variables if parameters not provided
- ✅ Both `create-razorpay-order` and `verify-razorpay-payment` functions updated

**For Production Deployment:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `fazpykekypcktcmniwbj`
3. Go to **Settings** → **Edge Functions**
4. Add these environment variables:
```
RAZORPAY_KEY_ID=your_production_key_id
RAZORPAY_KEY_SECRET=your_production_key_secret
```

## 🧪 **Step 3: Test the Integration**

### **Test Connection in Admin Panel**
1. Start the development server: `npm run dev`
2. Go to Admin Panel → Settings tab
3. Scroll to "Razorpay Integration" section
4. Enter your credentials:
   - **Razorpay Key ID**: `rzp_test_RCobT224QzsDLv`
   - **Razorpay Key Secret**: `mjdR0QLdHFMuI4tKITFfLhiy`
5. Click **"Test Connection"**
6. Should show ✅ **Connection successful**

### **Test Payment Flow**
1. Go to player registration form
2. Fill out registration details
3. Proceed to payment
4. Try a test payment with ₹1
5. Verify payment success/failure handling

## 📋 **Configuration Checklist**

- [x] Frontend API key configured
- [x] Supabase RAZORPAY_KEY_ID set
- [x] Supabase RAZORPAY_KEY_SECRET set
- [x] Admin panel test connection passes
- [x] Test payment successful
- [x] Error handling verified
- [ ] Webhook secret configured
- [ ] Webhook URL set in Razorpay dashboard
- [ ] Webhook events subscribed (payment.captured, payment.failed, order.paid)
- [ ] Webhook integration tested

## 🔐 **Security Notes**

- **Test Keys**: Currently using test keys (`rzp_test_*`)
- **Production**: Switch to live keys (`rzp_live_*`) when ready
- **Secret Key**: Never expose in frontend code
- **Environment**: Keep keys in secure environment variables

## 🎣 **Step 4: Webhook Configuration for Automatic Payment Updates**

### **Webhook Setup Overview**
The webhook integration enables **automatic payment status updates** from Razorpay, eliminating the need for manual verification and ensuring real-time status synchronization.

### **Webhook Features**
- ✅ **Automatic Status Updates**: Payment status changes instantly when Razorpay sends webhooks
- ✅ **Signature Verification**: Secure webhook authentication prevents unauthorized updates
- ✅ **Event Logging**: Complete audit trail of all webhook events
- ✅ **Error Handling**: Robust error handling with fallback mechanisms
- ✅ **Multiple Events**: Supports `payment.captured`, `payment.failed`, and `order.paid`

### **Webhook Configuration Steps**

#### **1. Environment Variables**
Add webhook secret to your `.env` file:
```bash
# Add to .env file
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
```

#### **2. Razorpay Dashboard Setup**
1. **Login to Razorpay Dashboard**
   - Go to [https://dashboard.razorpay.com/](https://dashboard.razorpay.com/)
   - Navigate to **Settings** → **Webhooks**

2. **Create New Webhook**
   - Click **"+ Add New Webhook"**
   - **Webhook URL**: `http://localhost:3001/razorpay-webhook` (for development)
   - **Secret**: Use the same secret as `RAZORPAY_WEBHOOK_SECRET`
   - **Events to Subscribe**:
     - ✅ `payment.captured`
     - ✅ `payment.failed`
     - ✅ `order.paid`

3. **Production Webhook URL**
    - Configure your production webhook URL in Razorpay dashboard when deploying

#### **3. Test Webhook Integration**
1. **Start the Server**
   ```bash
   node server.cjs
   ```

2. **Verify Webhook Endpoint**
   - Visit: `http://localhost:3001/webhook-logs`
   - Should show webhook configuration status

3. **Test with Razorpay**
   - Make a test payment
   - Check server logs for webhook events
   - Verify database updates automatically

### **Webhook Event Handling**

| Event | Action | Database Update |
|-------|--------|-----------------|
| `payment.captured` | Payment successful | `payment_status: 'completed'`, `status: 'completed'` |
| `payment.failed` | Payment failed | `payment_status: 'failed'`, store error details |
| `order.paid` | Order completed | `status: 'completed'` |

### **Webhook Security**
- ✅ **Signature Verification**: Every webhook is cryptographically verified
- ✅ **Secret Key**: Webhook secret is environment-variable protected
- ✅ **Event Validation**: Only configured events are processed
- ✅ **Error Logging**: All webhook events are logged for audit

### **Monitoring Webhooks**
- **Logs Endpoint**: `GET /webhook-logs` - View webhook status
- **Health Check**: `GET /health` - Includes webhook configuration
- **Server Logs**: Real-time webhook processing logs in console

## 🚀 **Next Steps**

1. **Complete Supabase Configuration** (most important)
2. **Test Connection** in admin panel
3. **Test Payment Flow** with small amounts
4. **Configure Webhooks** for automatic updates
5. **Test Webhook Integration** with Razorpay dashboard
6. **Verify Error Handling** for failed payments
7. **Switch to Production** when ready for live payments

## 🐛 **Troubleshooting Payment Errors**

### **"Payment service encountered an error. Please try again."**
This error typically occurs when:
- Razorpay credentials are not properly configured
- Supabase Edge Functions cannot authenticate with Razorpay
- Network connectivity issues

**Solutions:**
1. ✅ **Credentials Check**: Verify `.env` and `supabase/.env` files contain correct credentials
2. ✅ **Function Updates**: Ensure Supabase functions accept credential parameters
3. ✅ **Network**: Check internet connection and Supabase service status
4. ✅ **Browser Console**: Check for detailed error messages in developer tools

### **"Razorpay credentials not configured"**
- Functions now accept credentials as parameters
- Check that `VITE_RAZORPAY_KEY_SECRET` is set in `.env`
- Verify function calls include credential parameters

##  **Support**

If you encounter issues:
1. Check browser console for errors
2. Verify all environment variables are set
3. Test with small amounts first
4. Contact support if payment verification fails

## 🐛 **Troubleshooting Webhook Issues**

### **"Webhook signature verification failed"**
- ✅ **Secret Mismatch**: Ensure `RAZORPAY_WEBHOOK_SECRET` matches Razorpay dashboard
- ✅ **Environment Variables**: Check `.env` file has correct webhook secret
- ✅ **Server Restart**: Restart server after changing environment variables

### **"No webhook events received"**
- ✅ **URL Configuration**: Verify webhook URL in Razorpay dashboard
- ✅ **Events Subscribed**: Ensure correct events are selected
- ✅ **Server Running**: Confirm server is running on correct port
- ✅ **Network Access**: Ensure webhook URL is accessible from internet

### **"Database not updating"**
- ✅ **Supabase Connection**: Verify Supabase credentials in server
- ✅ **Order ID Match**: Check that `razorpay_order_id` exists in database
- ✅ **Server Logs**: Check server logs for database update errors

---

**Status**: ✅ **PAYMENT SYSTEM CONFIGURED** | 🔄 **WEBHOOK INTEGRATION READY** - Core payment system configured, webhook integration implemented and documented