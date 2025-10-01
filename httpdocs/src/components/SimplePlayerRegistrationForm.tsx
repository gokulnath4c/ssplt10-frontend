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

  const AMOUNT_RUPEES = Number(import.meta.env.VITE_REGISTRATION_FEE ?? 10) || 10; // fallback to 10 if not set

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
    <form onSubmit={handleSubmit} className="max-w-[400px] mx-auto">
      <h2>Player Registration</h2>

      {!razorpayLoaded && (
        <p className="mb-2.5 text-[#555] text-xs" aria-live="polite">
          Preparing secure payment...
        </p>
      )}
      {scriptLoadError && (
        <p className="mb-2.5 text-[crimson] text-xs" role="alert" aria-live="assertive">
          {scriptLoadError}
        </p>
      )}

      <div className="mb-2.5">
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          name="name"
          value={playerData.name}
          onChange={handleInputChange}
          placeholder="Enter your full name"
          autoComplete="name"
          required
          className="w-full p-2"
        />
      </div>

      <div className="mb-2.5">
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="email"
          name="email"
          value={playerData.email}
          onChange={handleInputChange}
          placeholder="Enter your email address"
          autoComplete="email"
          required
          className="w-full p-2"
        />
      </div>

      <div className="mb-2.5">
        <label htmlFor="contact">Contact:</label>
        <input
          id="contact"
          type="tel"
          name="contact"
          value={playerData.contact}
          onChange={handleInputChange}
          placeholder="Enter 10-digit mobile number"
          pattern="[0-9]{10}"
          inputMode="numeric"
          maxLength={10}
          autoComplete="tel"
          title="Enter 10-digit mobile number"
          required
          className="w-full p-2"
        />
      </div>

      <div className="mb-2.5">
        <label htmlFor="age">Age:</label>
        <input
          id="age"
          type="number"
          name="age"
          value={playerData.age}
          onChange={handleInputChange}
          placeholder="Enter your age"
          inputMode="numeric"
          min={0}
          className="w-full p-2"
        />
      </div>

      <div className="mb-2.5">
        <label htmlFor="team">Team:</label>
        <input
          id="team"
          type="text"
          name="team"
          value={playerData.team}
          onChange={handleInputChange}
          placeholder="Enter team name (optional)"
          className="w-full p-2"
        />
      </div>

      <button
        type="submit"
        disabled={isDisabled}
        className={`px-5 py-2.5 w-full text-white rounded-[5px] ${isDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#3399cc] hover:bg-[#2d89b8] cursor-pointer'}`}
      >
        {isPaymentProcessing ? "Processing..." : `Register & Pay Now (₹${AMOUNT_RUPEES})`}
      </button>
    </form>
  );
};

export default SimplePlayerRegistrationForm;