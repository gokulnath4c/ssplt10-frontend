import { paymentOverlay } from "@/utils/paymentOverlay";

function resolveBaseUrl(): string {
  // 1) Prefer absolute URL from env (best for dev/prod)
  const abs = (import.meta.env.VITE_API_URL as string | undefined);

  // If we are developing locally, override remote ABS to local API to avoid CORS
  if (typeof window !== 'undefined') {
    const isLocalHost = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname || '');
    if (isLocalHost) {
      // Always use local backend while running vite dev server to avoid cross-origin preflights against prod
      return 'http://127.0.0.1:3001/api';
    }
  }

  if (abs && /^https?:/i.test(abs)) {
    // Normalize to always point to the API base. If path is missing '/api', append it.
    try {
      const u = new URL(abs);
      // If no path or just '/', force '/api'
      if (!u.pathname || u.pathname === '/' || u.pathname.trim() === '') {
        u.pathname = '/api';
      } else if (!u.pathname.startsWith('/api')) {
        // If a custom path exists but not '/api', append '/api'
        const trimmed = u.pathname.endsWith('/') ? u.pathname.slice(0, -1) : u.pathname;
        u.pathname = `${trimmed}/api`;
      }
      return u.toString().replace(/\/+$/, ''); // strip trailing slash
    } catch {
      // Fallback: ensure '/api' suffix
      const base = abs.replace(/\/+$/, '');
      return base.endsWith('/api') ? base : `${base}/api`;
    }
  }

  // 2) Dev fallback: if running Vite dev on 5173, default backend at 3001 (avoid hitting 5173 origin)
  if (typeof window !== 'undefined') {
    const { hostname, port } = window.location;
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && port === '5173') {
      return 'http://127.0.0.1:3001/api';
    }
  }

  // 3) Relative base if configured
  const rel = (import.meta.env.VITE_API_BASE_URL as string | undefined);
  if (rel && rel.startsWith('/')) return rel.replace(/\/+$/, '');

  // 4) Last resort
  return '/api';
}
const BASE_URL: string = resolveBaseUrl();
console.log('[Razorpay] Using API base URL:', BASE_URL);
export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface RazorpayPaymentFailedError {
  code?: string;
  description?: string;
  source?: string;
  step?: string;
  reason?: string;
  metadata?: {
    order_id?: string;
    payment_id?: string;
  };
  http_status?: number;
}

export interface RazorpayPaymentFailedEvent {
  error?: RazorpayPaymentFailedError;
}

export function isRazorpayFailedEvent(value: unknown): value is RazorpayPaymentFailedEvent {
  const v = value as any;
  return !!(v && typeof v === "object" && "error" in v && v.error && typeof v.error === "object");
}

interface PaymentOptions {
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: RazorpayPaymentSuccessResponse) => void;
  onFailure: (error: RazorpayPaymentFailedError) => void;
  onDismiss?: () => void;
}

// Module-scoped instance to prevent multiple Razorpay instances
let razorpayInstance: any = null;
// Cache the public key id resolved from backend to avoid env/key drift
let cachedPublicKeyId: string | null = null;

class RazorpayService {
  // Resolve Razorpay public key id (prefer backend /api/config, fallback to Vite env)
  private async getPublicKeyId(): Promise<string> {
    if (cachedPublicKeyId) return cachedPublicKeyId;

    // Try to fetch from backend so FE/BE stay in sync
    try {
      const resp = await fetch(`${BASE_URL}/config`, { method: "GET" });
      if (resp.ok) {
        const data = await resp.json();
        // Support multiple shapes from backend deployments:
        // { razorpayKeyId }, { key }, { publicKey }, { razorpay_key_id }
        const fromBackend =
          (data && (data.razorpayKeyId || data.key || data.publicKey || data.razorpay_key_id)) || null;

        if (fromBackend) {
          cachedPublicKeyId = String(fromBackend);
          const masked = `${cachedPublicKeyId.slice(0, 8)}...${cachedPublicKeyId.slice(-4)}`;
          console.log('[Razorpay] Using backend key id:', masked, 'mode:', import.meta.env.MODE);
          return cachedPublicKeyId;
        }
      } else {
        console.warn(`[Razorpay] GET ${BASE_URL}/config returned status ${resp.status}. Falling back to env key if available.`);
      }
    } catch (e) {
      console.warn("[Razorpay] Error fetching /config. Falling back to env key.", e);
    }

    const envKey = import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined;
    if (!envKey) {
      throw new Error(
        "Razorpay key not available: /api/config failed and VITE_RAZORPAY_KEY_ID is not set. Set VITE_RAZORPAY_KEY_ID in the environment or fix the /api/config endpoint."
      );
    }
    cachedPublicKeyId = envKey;
    const maskedEnv = `${envKey.slice(0, 8)}...${envKey.slice(-4)}`;
    console.log('[Razorpay] Using env key id:', maskedEnv, 'mode:', import.meta.env.MODE);
    return envKey;
  }
  // Create a new order from backend
  async createOrder(amount: number, payload?: Record<string, any>) {
    try {
      const response = await fetch(`${BASE_URL}/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          ...(payload || {})
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Order creation failed with status:', response.status, 'Response:', errorText);
        throw new Error(`Failed to create order: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ Order created successfully:', responseData);
      return responseData; // Should contain { id: string, ... }
    } catch (err) {
      console.error("💥 Order creation error:", err);
      throw err;
    }
  }

  // Initiate payment with Razorpay
  async initiatePayment(options: PaymentOptions) {
    if (!window.Razorpay) {
      throw new Error("Razorpay script not loaded");
    }

    const razorpayKey = await this.getPublicKeyId();
    const maskedKey = `${String(razorpayKey).slice(0, 8)}...${String(razorpayKey).slice(-4)}`;
    // Log which key and mode are being used at runtime to diagnose 401 from preferences API
    console.log('[Razorpay] Resolved key id:', maskedKey, 'mode:', import.meta.env.MODE);

    if (!razorpayKey || razorpayKey.length < 20) {
      throw new Error(`Invalid Razorpay key: ${razorpayKey}`);
    }

    // Validate key format
    if (!razorpayKey.startsWith('rzp_test_') && !razorpayKey.startsWith('rzp_live_')) {
      throw new Error(`Invalid Razorpay key format: ${razorpayKey}`);
    }

    // Close any previous instance to prevent double initialization
    if (razorpayInstance) {
      razorpayInstance.close();
      razorpayInstance = null;
    }

    const razorpayOptions: any = {
      key: razorpayKey, // Public key
      amount: options.amount * 100, // In paise
      currency: "INR",
      name: "SSPL T10",
      order_id: options.orderId,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      theme: { color: "#3399cc" },
      handler: (response: RazorpayPaymentSuccessResponse) => {
        console.log('💳 Payment success handler triggered. Raw payload:', response);
        try { paymentOverlay.close(); } catch {}
        options.onSuccess(response);
      },
      modal: {
        escape: false, // Prevent closing with ESC key
        animation: true,
        ondismiss: () => {
          console.log('💨 Razorpay modal dismissed by user');
          try { paymentOverlay.close(); } catch {}
          if (options.onDismiss) {
            options.onDismiss();
          }
          options.onFailure({
            code: "PAYMENT_CANCELLED",
            description: "Payment closed by user",
            reason: "payment_cancelled",
            source: "customer",
            step: "modal_dismiss",
            metadata: { order_id: options.orderId }
          });
        },
      },
    };

    try {
      console.log('🔧 Creating Razorpay instance with options:', {
        key: razorpayKey.substring(0, 10) + '...', // Mask key for security
        amount: options.amount,
        currency: 'INR',
        order_id: options.orderId
      });

      razorpayInstance = new window.Razorpay(razorpayOptions);
      console.log('✅ Razorpay instance created successfully');

      razorpayInstance.on("payment.failed", (payload: unknown) => {
        console.log('❌ Payment failed event payload (raw):', payload);
        try { paymentOverlay.close(); } catch {}
        let failureError: RazorpayPaymentFailedError;
        if (isRazorpayFailedEvent(payload) && payload.error) {
          failureError = payload.error;
        } else {
          failureError = {
            description: typeof payload === "string" ? payload : "Payment failed",
            metadata: { order_id: razorpayOptions?.order_id }
          };
        }
        console.log('❌ Parsed failure error:', failureError);
        options.onFailure(failureError);
      });

      console.log('🔓 Opening Razorpay modal...');
      try { paymentOverlay.open(); } catch {}
      razorpayInstance.open();
      console.log('🎯 Razorpay modal opened successfully');
    } catch (initError) {
      console.error('💥 Error initializing Razorpay:', initError);
      throw new Error(`Failed to initialize Razorpay: ${initError.message}`);
    }
  }

  // Close any existing Razorpay instance
  closeModal() {
    try {
      if (razorpayInstance) {
        console.log('🔒 Closing existing Razorpay instance');
        razorpayInstance.close();
        razorpayInstance = null;
      }
    } catch (error) {
      console.warn('Error closing Razorpay instance:', error);
      razorpayInstance = null;
    }
  }

  // Verify payment on backend
  async verifyPayment(payment_id: string, order_id: string, signature: string, registrationId?: string, amount?: number) {
    try {
      console.log('🔍 Verifying payment:', { payment_id, order_id, registrationId });

      const requestBody: any = {
        paymentId: payment_id,
        orderId: order_id,
        signature: signature,
      };

      // Include registration details if provided
      if (registrationId) {
        requestBody.registrationId = registrationId;
      }
      if (amount) {
        requestBody.amount = amount;
      }

      const response = await fetch(`${BASE_URL}/razorpay/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Payment verification failed with status:', response.status, 'Response:', errorText);
        throw new Error(`Payment verification failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const responseData = await response.json();
      console.log('✅ Payment verification successful:', responseData);
      return responseData;
    } catch (err) {
      console.error("💥 Payment verification error:", err);
      throw err;
    }
  }

  // Cancel a payment via backend endpoint (server performs Basic auth to Razorpay)
  async cancelPayment(paymentId: string) {
    try {
      if (!paymentId || typeof paymentId !== 'string' || !paymentId.startsWith('pay_')) {
        throw new Error('Invalid paymentId');
      }

      const resp = await fetch(`${BASE_URL}/razorpay/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId })
      });

      const text = await resp.text();
      let json: any;
      try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }

      if (!resp.ok) {
        const desc = json?.error || json?.razorpay?.description || text || 'Cancel failed';
        throw new Error(desc);
      }

      console.log('✅ Cancelled/voided payment response:', json);
      return json; // { success: true, payment: {...} } on success
    } catch (err) {
      console.error('❌ Cancel payment API error:', err);
      throw err;
    }
  }
}

export const razorpayService = new RazorpayService();
