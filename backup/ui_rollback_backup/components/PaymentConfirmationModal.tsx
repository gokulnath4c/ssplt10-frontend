import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  CreditCard,
  Shield,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { razorpayService, type RazorpayPaymentFailedError, type RazorpayPaymentSuccessResponse } from "@/integrations/razorpayService";
import { findHighestZIndex } from "@/utils/debugZIndex";
import { paymentOverlay } from "@/utils/paymentOverlay";

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
  paymentProcessing?: boolean;
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
  paymentProcessing = false
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [scriptLoadError, setScriptLoadError] = useState<string | null>(null);
  const [scriptLoadAttempts, setScriptLoadAttempts] = useState(0);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  const { toast } = useToast();

  const gstAmount = Math.round(registrationFee * gstPercentage / 100);
  const totalAmount = registrationFee + gstAmount;

  // Function to load Razorpay script with retry logic
  const loadRazorpayScript = () => {
    if (window.Razorpay) {
      console.log('✅ Razorpay already loaded');
      setRazorpayLoaded(true);
      setScriptLoadError(null);
      return;
    }

    console.log('🔄 Loading Razorpay script...');
    setRazorpayLoaded(false);
    setScriptLoadError(null);

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      console.log('✅ Razorpay script loaded successfully');
      setRazorpayLoaded(true);
      setScriptLoadError(null);
      setScriptLoadAttempts(0);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay script');
      const errorMsg = 'Failed to load payment system. Please check your internet connection.';
      setScriptLoadError(errorMsg);
      setPaymentError(errorMsg);
      setScriptLoadAttempts(prev => prev + 1);
    };

    document.head.appendChild(script);
  };

  // Preload Razorpay script when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
    }
  }, [isOpen]);

  // Retry function for script loading
  const retryScriptLoad = () => {
    console.log('🔄 Retrying Razorpay script load...');
    loadRazorpayScript();
  };

  // Lock body scroll when Razorpay modal is open
  useEffect(() => {
    if (razorpayModalOpen) {
      console.log('🔒 Locking body scroll for Razorpay modal');
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Prevent layout shift
    } else {
      console.log('🔓 Unlocking body scroll');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      // Cleanup on unmount
      console.log('🧹 Cleaning up body scroll and Razorpay modal');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      setRazorpayModalOpen(false);
      razorpayService.closeModal();
    };
  }, [razorpayModalOpen]);

  // Reset states when modal closes
  useEffect(() => {
    if (!isOpen) {
      console.log('🔄 Payment modal closing, cleaning up...');
      setRazorpayModalOpen(false);
      setIsProcessing(false);
      setPaymentError(null);
      setScriptLoadError(null);
      setScriptLoadAttempts(0);
      setPaymentCancelled(false);
      // Close any existing Razorpay instance
      razorpayService.closeModal();
    }
  }, [isOpen]);


  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      setPaymentError(null);
      setPaymentCancelled(false);

      // Close any open select dropdowns to prevent overlapping
      const openSelects = document.querySelectorAll('select:focus');
      openSelects.forEach(select => {
        (select as HTMLSelectElement).blur();
      });

      console.log('🎯 Payment button clicked for registration:', registrationId);
      console.log('💰 Total amount to charge:', totalAmount);

      // Check z-index before Razorpay opens
      console.log('🔍 Checking z-index before Razorpay opens...');
      findHighestZIndex();

      // Create Razorpay order
      console.log('📡 Creating Razorpay order...');
      const order = await razorpayService.createOrder(totalAmount);
      console.log('✅ Order created successfully:', order);

      // Initiate payment
      console.log('🚀 Initiating Razorpay payment with details:', {
        amount: totalAmount,
        orderId: order.id,
        customerName: playerDetails.full_name,
        customerEmail: playerDetails.email,
        customerPhone: playerDetails.phone ? '***' + playerDetails.phone.slice(-4) : 'N/A'
      });

      console.log('🚀 Opening Razorpay modal...');
      setRazorpayModalOpen(true);

      await razorpayService.initiatePayment({
        amount: totalAmount,
        orderId: order.id,
        customerName: playerDetails.full_name,
        customerEmail: playerDetails.email,
        customerPhone: playerDetails.phone,
        onDismiss: () => {
          console.log('🔄 Razorpay modal dismissed, unlocking interactions');
          setRazorpayModalOpen(false);
          setPaymentCancelled(true);
        },
        onSuccess: async (response: RazorpayPaymentSuccessResponse) => {
          console.log('🎉 Payment success callback triggered:', response);
          console.log('Payment successful:', response);
          setRazorpayModalOpen(false);

          try {
            // Verify payment
            const verificationResult = await razorpayService.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            );

            console.log('Payment verification successful:', verificationResult);

            // Call success callback with payment data
            onSuccess({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              amount: totalAmount,
              registrationId
            });

          } catch (verificationError) {
            console.error('Payment verification failed:', verificationError);
            setPaymentError('Payment verification failed. Please contact support.');
            toast({
              title: "Verification Failed",
              description: "Payment was successful but verification failed. Please contact support with your payment ID.",
              variant: "destructive"
            });
          }
        },
        onFailure: async (error: RazorpayPaymentFailedError) => {
          console.error('❌ Payment failed callback triggered (raw error):', error);
          console.error('Parsed error details:', {
            code: error?.code,
            description: error?.description,
            reason: error?.reason,
            source: error?.source,
            step: error?.step,
            http_status: error?.http_status,
            metadata: {
              order_id: error?.metadata?.order_id,
              payment_id: error?.metadata?.payment_id
            }
          });
          setRazorpayModalOpen(false);
          setPaymentError(error?.description || error?.reason || 'Payment failed. Please try again.');

          // If a payment was actually created/authorized, attempt a server-side cancel (void)
          // This calls our backend: POST /api/razorpay/cancel which uses Basic auth to Razorpay
          try {
            const pid = error?.metadata?.payment_id;
            if (pid && typeof pid === 'string' && pid.startsWith('pay_')) {
              console.log('🛑 Attempting to cancel authorized payment on backend:', pid);
              await razorpayService.cancelPayment(pid);
              console.log('✅ Cancel request completed for', pid);
            } else {
              console.log('ℹ️ No payment_id present to cancel (likely user closed before authorization).');
            }
          } catch (cancelErr) {
            console.warn('⚠️ Cancel attempt failed or was not applicable:', cancelErr);
          }

          // Call the failure callback to handle saving player data as pending
          try {
            await onFailure({
              razorpay_payment_id: error?.metadata?.payment_id ?? null,
              razorpay_order_id: error?.metadata?.order_id ?? null,
              description: error?.description || error?.reason || 'Payment failed',
              error
            });
          } catch (failureHandlerError) {
            console.error('Error in payment failure handler:', failureHandlerError);
            toast({
              title: "Registration Error",
              description: "Payment failed and there was an issue saving your details. Please contact support.",
              variant: "destructive"
            });
          }
        }
      });

      // Check z-index after Razorpay opens
      setTimeout(() => {
        console.log('🔍 Checking z-index after Razorpay opens...');
        findHighestZIndex();
      }, 1000);

    } catch (error: any) {
      console.error('💥 Payment initiation error:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        code: error?.code,
        description: error?.description,
        http_status: (error as RazorpayPaymentFailedError | any)?.http_status,
        reason: (error as RazorpayPaymentFailedError | any)?.reason,
        fullError: JSON.stringify(error, null, 2)
      });

      // Extract meaningful error message
      let errorMessage = 'Failed to initiate payment. Please try again.';
      if (error?.description) {
        errorMessage = error.description;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      setPaymentError(errorMessage);
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      console.log('🔄 Payment processing finished, setting isProcessing to false');
      setIsProcessing(false);
    }
  };


  return (
    <Dialog open={isOpen && !razorpayModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm max-h-[85vh] overflow-y-auto z-[10001]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <CreditCard className="w-4 h-4 text-cricket-blue" />
            Complete Your Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 relative">
          {/* Backdrop overlay when Razorpay is active */}
          {razorpayModalOpen && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-10 pointer-events-none rounded-lg" />
          )}

          {/* Razorpay Loading/Error Indicator */}
          {!razorpayLoaded && !scriptLoadError && (
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <div>
                  <h4 className="font-medium text-blue-800 text-sm">Preparing Payment</h4>
                  <p className="text-xs text-blue-700">Loading secure payment system...</p>
                </div>
              </div>
            </div>
          )}

          {/* Script Load Error */}
          {scriptLoadError && (
            <div className="bg-red-50 p-3 rounded-lg border border-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-800 text-sm">Payment System Error</h4>
                  <p className="text-xs text-red-700 mb-2">{scriptLoadError}</p>
                  <Button
                    onClick={retryScriptLoad}
                    size="sm"
                    variant="outline"
                    className="text-xs h-7"
                    disabled={scriptLoadAttempts >= 3}
                  >
                    {scriptLoadAttempts >= 3 ? 'Max retries reached' : 'Retry Loading'}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Summary Card */}
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-3">
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-3 h-3 text-blue-600" />
                Payment Summary
              </h3>

              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm font-bold">
                  <span>Total Amount to be Paid</span>
                  <span className="text-blue-600">₹{totalAmount}</span>
                </div>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>Registration Fee: ₹{registrationFee}</p>
                  <p>GST ({gstPercentage}%): ₹{gstAmount}</p>
                  <p className="border-t pt-0.5 font-medium">Total: ₹{totalAmount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Player Details Summary */}
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

          {/* Payment Security Notice */}
          <div className="bg-green-50 p-2 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <Shield className="w-3 h-3 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800 text-xs mb-0.5">Secure Payment</h4>
                <p className="text-xs text-green-700">
                  Your payment is processed securely through Razorpay with industry-standard encryption.
                  We do not store your payment information.
                </p>
              </div>
            </div>
          </div>

          {/* Error Display */}
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

          {/* Payment Cancelled Message */}
          {paymentCancelled && !paymentError && (
            <div className="bg-yellow-50 p-2 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-3 h-3 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800 text-xs mb-0.5">Payment Cancelled</h4>
                  <p className="text-xs text-yellow-700">You cancelled the payment. You can try again or go back to edit your details.</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-3">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isProcessing}
              className="flex items-center gap-2 text-sm"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Review
            </Button>

            <Button
              onClick={handlePayment}
              disabled={isProcessing || !razorpayLoaded || !!scriptLoadError}
              className="flex-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-sm"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing...
                </>
              ) : scriptLoadError ? (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Payment Unavailable
                </>
              ) : !razorpayLoaded ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Loading Payment...
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