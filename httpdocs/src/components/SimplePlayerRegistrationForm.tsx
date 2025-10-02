import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { razorpayService, type RazorpayPaymentSuccessResponse, type RazorpayPaymentFailedError } from "@/integrations/razorpayService";

interface PlayerData {
  name: string;
  email: string;
  contact: string;
  age: number;
  team: string;
}

const SimplePlayerRegistrationForm: React.FC = () => {
  const navigate = useNavigate();
  const [playerData, setPlayerData] = useState<PlayerData>({
    name: "",
    email: "",
    contact: "",
    age: 0,
    team: "",
  });
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState<boolean>(!!(typeof window !== "undefined" && (window as any).Razorpay));
  const [scriptLoadError, setScriptLoadError] = useState<string | null>(null);

  const AMOUNT_RUPEES = Number(import.meta.env.VITE_REGISTRATION_FEE ?? 699) || 699; // fallback to 699 if not set

  // Load Razorpay script if not already present
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ((window as any).Razorpay) {
      setRazorpayLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
      setScriptLoadError(null);
    };
    script.onerror = () => {
      setRazorpayLoaded(false);
      setScriptLoadError("Failed to load payment system. Please check your internet connection and retry.");
    };
    document.head.appendChild(script);
    return () => {
      try {
        // do not remove the script tag to allow reuse across pages
      } catch {}
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayerData((prev) => ({
      ...prev,
      [name]: name === "age" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!razorpayLoaded) {
      alert(scriptLoadError || "Payment system is not ready yet. Please wait a moment and try again.");
      return;
    }

    setIsPaymentProcessing(true);

    try {
      // 1) Create Razorpay order via backend (uses resolved API base in razorpayService)
      const order = await razorpayService.createOrder(AMOUNT_RUPEES, {
        // Optional payload to aid server logs/trace
        full_name: playerData.name,
        email: playerData.email,
        phone: playerData.contact,
      });

      if (!order?.id) {
        alert("Failed to create order");
        setIsPaymentProcessing(false);
        return;
      }

      // 2) Load Razorpay checkout using our service (it resolves the public key from /api/config or env)
      await razorpayService.initiatePayment({
        amount: AMOUNT_RUPEES,
        orderId: order.id,
        customerName: playerData.name,
        customerEmail: playerData.email,
        customerPhone: playerData.contact,
        onDismiss: () => {
          setIsPaymentProcessing(false);
        },
        onSuccess: async (response: RazorpayPaymentSuccessResponse) => {
          try {
            // 3) Verify signature via backend
            const verify = await razorpayService.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );

            if (!verify?.verified) {
              alert("Payment verification failed!");
              setIsPaymentProcessing(false);
              return;
            }

            // 4) Save player registration to Supabase
            // Map the simple form to our table fields. Fields not collected remain null/empty.
            const { error: insertError } = await supabase
              .from("player_registrations")
              .insert([
                {
                  full_name: playerData.name,
                  email: playerData.email,
                  phone: playerData.contact,
                  // Optional/defaults to satisfy schema
                  date_of_birth: null,
                  state: null,
                  city: null,
                  position: "Batting",
                  pincode: null,
                  team_name: playerData.team || null, // if a custom column exists; ignored if not present by PostgREST
                  age: Number.isFinite(playerData.age) && playerData.age > 0 ? playerData.age : null, // idem
                  status: "completed",
                  payment_status: "completed",
                  payment_amount: AMOUNT_RUPEES,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                } as any,
              ]);

            if (insertError) {
              console.error("❌ Failed to save player data:", insertError);
              alert("Payment verified but failed to save player data!");
              setIsPaymentProcessing(false);
              return;
            }

            alert("✅ Payment Verified and Player Registered Successfully!");
            // Reset form then redirect
            setPlayerData({
              name: "",
              email: "",
              contact: "",
              age: 0,
              team: "",
            });
            setIsPaymentProcessing(false);
            navigate("/registration/success");
          } catch (err) {
            console.error("Payment verification/save error:", err);
            alert("Something went wrong after payment. Please contact support.");
            setIsPaymentProcessing(false);
          }
        },
        onFailure: (error: RazorpayPaymentFailedError) => {
          console.error("Payment failed:", error);
          const msg = error?.description || error?.reason || "Payment failed. Please try again.";
          alert(`❌ ${msg}`);
          setIsPaymentProcessing(false);
        },
      });
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong!");
      setIsPaymentProcessing(false);
    }
  };
  
  const isDisabled = isPaymentProcessing || !razorpayLoaded || !!scriptLoadError;
  
  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-sport-electric-blue mb-1">Player Registration</h2>
        <p className="text-sm text-gray-600">Quick registration with payment</p>
      </div>

      {/* Loading/Error States - Compact */}
      {!razorpayLoaded && !scriptLoadError && (
        <div className="text-center py-2">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500">
            <div className="w-3 h-3 border border-gray-300 border-t-sport-electric-blue rounded-full animate-spin"></div>
            Preparing secure payment...
          </div>
        </div>
      )}
      {scriptLoadError && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-md text-xs text-red-800 text-center">
          {scriptLoadError}
        </div>
      )}

      {/* Compact Form Grid */}
      <div className="grid grid-cols-1 gap-3">
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={playerData.name}
            onChange={handleInputChange}
            placeholder="Enter full name"
            autoComplete="name"
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sport-electric-blue focus:border-sport-electric-blue text-sm transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={playerData.email}
            onChange={handleInputChange}
            placeholder="Enter email"
            autoComplete="email"
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="contact"
            type="tel"
            name="contact"
            value={playerData.contact}
            onChange={handleInputChange}
            placeholder="10-digit number"
            pattern="[0-9]{10}"
            inputMode="numeric"
            maxLength={10}
            autoComplete="tel"
            title="Enter 10-digit mobile number"
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="age" className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              id="age"
              type="number"
              name="age"
              value={playerData.age || ''}
              onChange={handleInputChange}
              placeholder="Age"
              inputMode="numeric"
              min={0}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="team" className="block text-sm font-medium text-gray-700">
              Team
            </label>
            <input
              id="team"
              type="text"
              name="team"
              value={playerData.team}
              onChange={handleInputChange}
              placeholder="Team (optional)"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Compact Payment Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isDisabled}
          className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 text-sm ${
            isDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-sport-electric-blue to-sport-vibrant-green hover:from-sport-vibrant-green hover:to-sport-electric-blue text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]'
          }`}
        >
          {isPaymentProcessing ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            `Register & Pay Now (₹${AMOUNT_RUPEES})`
          )}
        </button>
      </div>
    </form>
  );
};

export default SimplePlayerRegistrationForm;