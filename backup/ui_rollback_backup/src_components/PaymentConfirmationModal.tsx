import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CreditCard, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlayerDetails {
  full_name: string;
  email: string;
  phone: string;
  position: string;
}

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onSuccess: (paymentData: any) => void;
  onFailure: (paymentError: any) => void;
  playerDetails: PlayerDetails;
  registrationFee: number;
  gstPercentage: number;
  registrationId: string;
}

const PaymentConfirmationModal: React.FC<PaymentConfirmationModalProps> = ({
  isOpen,
  onClose,
  onBack,
  onSuccess,
  onFailure,
  playerDetails,
  registrationFee,
  gstPercentage,
  registrationId
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { toast } = useToast();

  const totalAmount = Math.round(registrationFee * (1 + gstPercentage / 100));

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentError(null);

      // 1️⃣ Call backend to create Razorpay order
      const response = await fetch(`/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalAmount, registrationId })
      });
      const order = await response.json();

      if (!order?.id) {
        throw new Error("Failed to create order. Please try again.");
      }

      // 2️⃣ Initiate Razorpay payment
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // public key only
        amount: totalAmount * 100, // Razorpay expects paise
        currency: "INR",
        name: "Your Platform Name",
        order_id: order.id,
        prefill: {
          name: playerDetails.full_name,
          email: playerDetails.email,
          contact: playerDetails.phone
        },
        handler: async (response: any) => {
          // Verify payment with backend
          try {
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            const result = await verifyRes.json();
            if (result.success) {
              onSuccess(result);
            } else {
              throw new Error("Payment verification failed");
            }
          } catch (verifyError) {
            setPaymentError("Payment verification failed. Contact support.");
            onFailure(verifyError);
          }
        },
        modal: {
          ondismiss: () => {
            console.log("Payment modal closed by user");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error("Payment initiation failed:", error);
      setPaymentError(error.message || "Payment failed. Please try again.");
      toast({
        title: "Payment Error",
        description: error.message || "Payment failed. Please try again.",
        variant: "destructive"
      });
      onFailure(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-4 h-4 text-blue-600" />
            Complete Your Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          {/* Payment Summary */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-3">
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Total Amount (incl. GST)</span>
                <span className="text-blue-600">₹{totalAmount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Player Details */}
          <Card>
            <CardContent className="p-2 text-xs text-gray-600">
              <p><strong>Name:</strong> {playerDetails.full_name}</p>
              <p><strong>Email:</strong> {playerDetails.email}</p>
              <p><strong>Position:</strong> <Badge variant="outline">{playerDetails.position}</Badge></p>
            </CardContent>
          </Card>

          {/* Payment Security Notice */}
          <div className="bg-green-50 p-2 rounded-lg border border-green-200 text-xs text-green-700 flex items-start gap-2">
            <Shield className="w-3 h-3 text-green-600 mt-0.5" />
            <span>Your payment is processed securely through Razorpay. We do not store your payment information.</span>
          </div>

          {/* Error Display */}
          {paymentError && (
            <div className="bg-red-50 p-2 rounded-lg border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-3 h-3 text-red-600 mt-0.5" />
              <span>{paymentError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <Button variant="outline" onClick={onBack} disabled={isProcessing} className="flex items-center gap-2 text-sm">
              <ArrowLeft className="w-3 h-3" /> Back
            </Button>
            <Button onClick={handlePayment} disabled={isProcessing} className="flex-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-sm">
              {isProcessing ? <><Loader2 className="w-3 h-3 animate-spin" /> Processing...</> : <>Pay ₹{totalAmount}</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentConfirmationModal;
