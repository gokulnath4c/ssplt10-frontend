import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { razorpayService, type RazorpayPaymentSuccessResponse, type RazorpayPaymentFailedError } from "@/integrations/razorpayService";
import { EnhancedInput } from "@/components/ui/enhanced-input";
import { EnhancedSelect } from "@/components/ui/enhanced-select";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { EnhancedCard, EnhancedCardContent, EnhancedCardHeader, EnhancedCardTitle } from "@/components/ui/enhanced-card";
import { User, Mail, Phone, Calendar, Users, CreditCard, Shield, CheckCircle, XCircle } from "lucide-react";

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
    <div className="max-w-2xl mx-auto p-4">
      <EnhancedCard hover="lift" glass className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl">
        <EnhancedCardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-primary rounded-full">
              <User className="w-8 h-8 text-white" />
            </div>
          </div>
          <EnhancedCardTitle className="text-2xl font-bold bg-gradient-to-r from-cricket-blue to-cricket-electric-blue bg-clip-text text-transparent">
            Player Registration
          </EnhancedCardTitle>
          <p className="text-gray-600 mt-2">
            Join the Southern Street Premier League 2025
          </p>
        </EnhancedCardHeader>

        <EnhancedCardContent className="space-y-6">
          {/* Payment Status Messages */}
          {!razorpayLoaded && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg" role="status" aria-live="polite">
              <Shield className="w-4 h-4 text-blue-600" />
              <p className="text-blue-700 text-sm">Preparing secure payment system...</p>
            </div>
          )}

          {scriptLoadError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
              <XCircle className="w-4 h-4 text-red-600" />
              <p className="text-red-700 text-sm">{scriptLoadError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <EnhancedInput
              id="name"
              name="name"
              type="text"
              label="Full Name"
              value={playerData.name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
              leftIcon={<User className="w-4 h-4" />}
              floatingLabel
              animated
              helperText="Enter your legal name as it appears on your ID"
            />

            {/* Email Field */}
            <EnhancedInput
              id="email"
              name="email"
              type="email"
              label="Email Address"
              value={playerData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              floatingLabel
              animated
              helperText="We'll send confirmation and updates to this email"
            />

            {/* Contact Field */}
            <EnhancedInput
              id="contact"
              name="contact"
              type="tel"
              label="Mobile Number"
              value={playerData.contact}
              onChange={handleInputChange}
              placeholder="Enter 10-digit mobile number"
              pattern="[0-9]{10}"
              maxLength="10"
              required
              leftIcon={<Phone className="w-4 h-4" />}
              floatingLabel
              animated
              helperText="Enter your WhatsApp number for updates"
            />

            {/* Age Field */}
            <EnhancedInput
              id="age"
              name="age"
              type="number"
              label="Age"
              value={playerData.age.toString()}
              onChange={handleInputChange}
              placeholder="Enter your age"
              min="12"
              max="99"
              leftIcon={<Calendar className="w-4 h-4" />}
              floatingLabel
              animated
              helperText="Minimum age requirement: 12 years"
            />

            {/* Team Field */}
            <EnhancedSelect
              id="team"
              name="team"
              label="Preferred Team"
              value={playerData.team}
              onValueChange={(value) => setPlayerData(prev => ({ ...prev, team: value }))}
              placeholder="Select your preferred team (optional)"
              options={[
                { value: "", label: "No preference" },
                { value: "chennai-super-kings", label: "Chennai Super Kings" },
                { value: "mumbai-indians", label: "Mumbai Indians" },
                { value: "royal-challengers-bangalore", label: "Royal Challengers Bangalore" },
                { value: "kolkata-knight-riders", label: "Kolkata Knight Riders" },
                { value: "delhi-capitals", label: "Delhi Capitals" },
                { value: "punjab-kings", label: "Punjab Kings" },
                { value: "rajasthan-royals", label: "Rajasthan Royals" },
                { value: "sunrisers-hyderabad", label: "Sunrisers Hyderabad" },
                { value: "lucknow-super-giants", label: "Lucknow Super Giants" },
                { value: "gujarat-titans", label: "Gujarat Titans" },
                { value: "other", label: "Other / Local Team" }
              ]}
              floatingLabel
              animated
              helperText="Optional: Select your favorite IPL team"
            />

            {/* Registration Fee Display */}
            <div className="bg-gradient-to-r from-cricket-light-blue/30 to-cricket-electric-blue/10 p-4 rounded-lg border border-cricket-blue/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-cricket-blue" />
                  <span className="font-medium text-cricket-blue">Registration Fee</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-cricket-blue">₹{AMOUNT_RUPEES}</div>
                  <div className="text-sm text-gray-600">One-time payment</div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions Notice */}
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-amber-800 font-medium">Secure Payment</p>
                <p className="text-amber-700">Your payment information is encrypted and secure. By proceeding, you agree to our terms and conditions.</p>
              </div>
            </div>

            {/* Submit Button */}
            <EnhancedButton
              type="submit"
              variant="cricket"
              size="lg"
              disabled={isDisabled}
              className="w-full text-lg py-4"
              magnetic
              ripple
            >
              <div className="flex items-center justify-center gap-2">
                {isPaymentProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    <span>Register & Pay ₹{AMOUNT_RUPEES}</span>
                  </>
                )}
              </div>
            </EnhancedButton>

            {/* Success State */}
            {!isDisabled && !isPaymentProcessing && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Ready to register - Click above to proceed</span>
              </div>
            )}
          </form>
        </EnhancedCardContent>
      </EnhancedCard>
    </div>
  );
};

export default SimplePlayerRegistrationForm;