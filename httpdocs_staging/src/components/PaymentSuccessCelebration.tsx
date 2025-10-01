import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Trophy,
  Star,
  Download,
  Share2,
  Home,
  FileText,
  Sparkles,
  PartyPopper
} from "lucide-react";

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

interface PaymentSuccessCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  playerDetails: PlayerDetails;
  paymentData: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    amount: number;
    registrationId: string;
  };
}

const PaymentSuccessCelebration: React.FC<PaymentSuccessCelebrationProps> = ({
  isOpen,
  onClose,
  playerDetails,
  paymentData
}) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Auto-advance through celebration steps
      const steps = [0, 1, 2, 3];
      let stepIndex = 0;

      const stepTimer = setInterval(() => {
        stepIndex = (stepIndex + 1) % steps.length;
        setCurrentStep(stepIndex);
      }, 2000);

      // Stop confetti after 5 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);

      return () => {
        clearInterval(stepTimer);
        clearTimeout(confettiTimer);
      };
    }
  }, [isOpen]);

  const downloadReceipt = () => {
    const receiptData = {
      playerName: playerDetails.full_name,
      playerId: paymentData.registrationId,
      email: playerDetails.email,
      phone: playerDetails.phone,
      dateOfBirth: playerDetails.date_of_birth,
      position: playerDetails.position,
      state: playerDetails.state,
      city: playerDetails.city,
      pincode: playerDetails.pincode,
      paymentAmount: paymentData.amount,
      paymentId: paymentData.razorpay_payment_id,
      orderId: paymentData.razorpay_order_id,
      registrationDate: new Date().toLocaleDateString()
    };

    // Sanitize user data to prevent XSS
    const sanitizeHTML = (str: string | undefined | null): string => {
      if (!str) return 'N/A';
      return str
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    };

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SSPL T10 Registration Receipt</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #0066CC; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-image { width: 100px; height: auto; margin-bottom: 10px; }
            .receipt-title { color: #FFD700; font-size: 18px; margin-top: 10px; }
            .details { margin: 20px 0; }
            .detail-row { display: flex; margin: 10px 0; }
            .label { font-weight: bold; width: 200px; }
            .value { flex: 1; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            .status { padding: 5px 10px; border-radius: 4px; display: inline-block; }
            .status.completed { background: #d4edda; color: #155724; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/ssplt10-logo.png" alt="SSPL Logo" class="logo-image" />
            <div class="receipt-title">Player Registration Receipt</div>
          </div>

          <div class="details">
            <div class="detail-row">
              <span class="label">Player ID:</span>
              <span class="value" style="font-weight: bold; color: #0066CC; font-family: monospace;">${sanitizeHTML(receiptData.playerId)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Registration ID:</span>
              <span class="value">${sanitizeHTML(receiptData.playerId)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Player Name:</span>
              <span class="value">${sanitizeHTML(receiptData.playerName)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${sanitizeHTML(receiptData.email)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">${sanitizeHTML(receiptData.phone)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date of Birth:</span>
              <span class="value">${sanitizeHTML(receiptData.dateOfBirth)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Playing Position:</span>
              <span class="value">${sanitizeHTML(receiptData.position)}</span>
            </div>
            <div class="detail-row">
              <span class="label">State:</span>
              <span class="value">${sanitizeHTML(receiptData.state)}</span>
            </div>
            <div class="detail-row">
              <span class="label">City:</span>
              <span class="value">${sanitizeHTML(receiptData.city)}</span>
            </div>
            <div class="detail-row">
              <span class="label">PIN Code:</span>
              <span class="value">${sanitizeHTML(receiptData.pincode)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Amount:</span>
              <span class="value">₹${sanitizeHTML(String(receiptData.paymentAmount))}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment ID:</span>
              <span class="value" style="font-family: monospace;">${sanitizeHTML(receiptData.paymentId)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Order ID:</span>
              <span class="value" style="font-family: monospace;">${sanitizeHTML(receiptData.orderId)}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Status:</span>
              <span class="value">
                <span class="status completed">Completed</span>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Registration Date:</span>
              <span class="value">${sanitizeHTML(receiptData.registrationDate)}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for registering with SSPL T10!</p>
            <p>This receipt confirms your player registration details.</p>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([receiptHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SSPL_Receipt_${playerDetails.full_name}_${paymentData.registrationId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareRegistration = () => {
    if (navigator.share) {
      navigator.share({
        title: 'SSPL T10 Player Registration',
        text: `I just registered as a player for SSPL T10! Player ID: ${paymentData.registrationId}`,
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `I just registered as a player for SSPL T10! Player ID: ${paymentData.registrationId}`
      );
    }
  };

  const handleClose = async () => {
    setIsClosing(true);
    try {
      await onClose();
    } catch (error) {
      console.error('Error closing success modal:', error);
    } finally {
      setIsClosing(false);
    }
  };

  const celebrationMessages = [
    "🎉 Welcome to SSPL T10!",
    "🏏 Your cricket journey begins now!",
    "⭐ You're officially a player!",
    "🎊 Registration complete!"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <div className="relative">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-lg opacity-10 animate-pulse"></div>

          {/* Confetti Animation */}
          {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
              {[...Array(50)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: ['#FFD700', '#0066CC', '#28a745', '#dc3545', '#6f42c1'][Math.floor(Math.random() * 5)]
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          <div className="relative z-10 p-6 text-center">
            {/* Success Icon */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">
                {celebrationMessages[currentStep]}
              </h2>
              <p className="text-gray-600 animate-pulse">
                Your registration has been confirmed successfully!
              </p>
            </div>

            {/* Player Details Card */}
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <h3 className="text-xl font-bold text-green-800">Player Details</h3>
                  <Trophy className="w-6 h-6 text-yellow-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="space-y-2">
                    <p><strong>Player ID:</strong> <span className="font-mono text-blue-600">{paymentData.registrationId}</span></p>
                    <p><strong>Name:</strong> {playerDetails.full_name}</p>
                    <p><strong>Email:</strong> {playerDetails.email}</p>
                    <p><strong>Phone:</strong> {playerDetails.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Position:</strong> <Badge variant="secondary">{playerDetails.position}</Badge></p>
                    <p><strong>Location:</strong> {playerDetails.city}, {playerDetails.state}</p>
                    <p><strong>Payment ID:</strong> <span className="font-mono text-sm">{paymentData.razorpay_payment_id}</span></p>
                    <p><strong>Amount Paid:</strong> <span className="font-bold text-green-600">₹{paymentData.amount}</span></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={downloadReceipt}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Download Receipt
              </Button>

              <Button
                onClick={shareRegistration}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </Button>

              <Button
                onClick={handleClose}
                disabled={isClosing}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                {isClosing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Closing...
                  </>
                ) : (
                  <>
                    <Home className="w-4 h-4" />
                    Go to Home
                  </>
                )}
              </Button>
            </div>

            {/* Additional Celebrations */}
            <div className="mt-6 flex justify-center gap-4">
              <div className="flex items-center gap-1 text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-4">
              Keep this receipt safe for your records. Welcome to the SSPL T10 family! 🏏
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessCelebration;