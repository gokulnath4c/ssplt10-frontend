import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Shield, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { razorpayService } from "@/integrations/razorpayService";

interface PlayerDetails {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  state: string;
  city: string;
  position: string;
  pincode: string;
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
  setPaymentActive?: (active: boolean) => void; // NEW: hide parent form while Razorpay is open
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
  registrationId,
  setPaymentActive
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const { toast } = useToast();

  const totalAmount = Math.round(registrationFee * (1 + gstPercentage / 100));

  useEffect(() => {
    if (!isOpen) return;

    // Hide registration form
    if (setPaymentActive) setPaymentActive(true);

    const startPayment = async () => {
      try {
        setIsProcessing(true);
        const order = await razorpayService.createOrder(totalAmount);

        const options: any = {
          key: process.env.RAZORPAY_KEY_ID,
          amount: totalAmount * 100,
          currency: 'INR',
          name: 'SSPL Player Registration',
          description: `Registration fee for ${playerDetails.full_name}`,
          order_id: order.id,
          handler: async (response: any) => {
            try {
              setIsVerifying(true);
              await razorpayService.verifyPayment(
                response.razorpay_payment_id,
                response.razorpay_order_id,
                response.razorpay_signature
              );

              onSuccess({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: totalAmount,
                registrationId
              });
            } catch (verifyErr) {
              console.error('Payment verification failed:', verifyErr);
              setPaymentError('Payment successful but verification failed. Contact support.');
              toast({
                title: "Verification Failed",
                description: "Payment was successful but verification failed. Provide your payment ID to support.",
                variant: "destructive"
              });
            } finally {
              setIsVerifying(false);
              if (setPaymentActive) setPaymentActive(false); // restore form
            }
          },
          modal: {
            ondismiss: () => {
              if (setPaymentActive) setPaymentActive(false);
              onClose();
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      } catch (err: any) {
        console.error('Payment initiation error:', err);
        const msg = err?.description || err?.message || 'Failed to initiate payment. Try again.';
        setPaymentError(msg);
        toast({ title: "Payment Error", description: msg, variant: "destructive" });
        if (setPaymentActive) setPaymentActive(false);
      } finally {
        setIsProcessing(false);
      }
    };

    startPayment();

    // Cleanup: restore form if modal unmounted
    return () => {
      if (setPaymentActive) setPaymentActive(false);
    };
  }, [isOpen, totalAmount, playerDetails, onSuccess, onClose, registrationId, toast, setPaymentActive]);

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
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-3">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-3 h-3 text-blue-600" />
                Payment Summary
              </h3>
              <div className="flex justify-between items-center text-sm font-bold">
                <span>Total Amount (incl. GST)</span>
                <span className="text-blue-600">₹{totalAmount}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-2">
              <h4 className="font-medium text-xs mb-1">Player Details</h4>
              <div className="text-xs text-gray-600 space-y-0.5">
                <p><strong>Name:</strong> {playerDetails.full_name}</p>
                <p><strong>Email:</strong> {playerDetails.email}</p>
                <p><strong>Position:</strong> <Badge variant="outline" className="text-xs">{playerDetails.position}</Badge></p>
              </div>
            </CardContent>
          </Card>

          {paymentError && (
            <div className="bg-red-50 p-2 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3 h-3 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 text-xs mb-0.5">Payment Error</h4>
                  <p className="text-xs text-red-700">{paymentError}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-3">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isProcessing || isVerifying}
              className="flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Review
            </Button>

            <Button
              disabled={true} // Disabled because Razorpay modal auto-opens
              className="flex-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-sm"
            >
              {isProcessing || isVerifying ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  {isVerifying ? 'Verifying...' : 'Processing...'}
                </>
              ) : (
                <>
                  <CreditCard className="w-3 h-3" />
                  Pay ₹{totalAmount}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentConfirmationModal;
