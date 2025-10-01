const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api"; // backend URL

interface PaymentOptions {
  amount: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  onSuccess: (response: any) => void;
  onFailure: (error: any) => void;
}

// Module-scoped instance to prevent multiple Razorpay instances
let razorpayInstance: any = null;

class RazorpayService {
  // Create a new order from backend
  async createOrder(amount: number) {
    try {
      const response = await fetch(`${BASE_URL}/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, registrationId: "demo" }), // Replace registrationId as needed
      });

      if (!response.ok) throw new Error("Failed to create order");
      return await response.json(); // Should contain { id: string, ... }
    } catch (err) {
      console.error("Order creation failed:", err);
      throw err;
    }
  }

  // Initiate payment with Razorpay
  async initiatePayment(options: PaymentOptions) {
    if (!window.Razorpay) {
      throw new Error("Razorpay script not loaded");
    }

    // Close any previous instance to prevent double initialization
    if (razorpayInstance) {
      razorpayInstance.close();
      razorpayInstance = null;
    }

    const razorpayOptions: any = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Public key
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
      handler: (response: any) => {
        options.onSuccess(response);
      },
      modal: {
        ondismiss: () => {
          options.onFailure({ description: "Payment closed by user" });
        },
      },
    };

    razorpayInstance = new window.Razorpay(razorpayOptions);
    razorpayInstance.on("payment.failed", options.onFailure);
    razorpayInstance.open();
  }

  // Verify payment on backend
  async verifyPayment(payment_id: string, order_id: string, signature: string) {
    try {
      const response = await fetch(`${BASE_URL}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_payment_id: payment_id,
          razorpay_order_id: order_id,
          razorpay_signature: signature,
        }),
      });

      if (!response.ok) throw new Error("Payment verification failed");
      return await response.json();
    } catch (err) {
      console.error("Payment verification error:", err);
      throw err;
    }
  }
}

export const razorpayService = new RazorpayService();
