/// <reference types="vite/client" />

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../httpdocs/src/integrations/supabase/client';
import PaymentSuccessCelebration from './PaymentSuccessCelebration';
import TermsAndConditions from './TermsAndConditions';
import { razorpayService, type RazorpayPaymentFailedError, type RazorpayPaymentSuccessResponse } from '../../../httpdocs/src/integrations/razorpayService';
import { useToast } from "../../../httpdocs/src/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../httpdocs/src/hooks/useAuth';

// Extend Window interface for Razorpay
declare global {
  interface Window {
    Razorpay: {
      new (options: any): {
        open(): void;
        on(event: string, handler: (response: any) => void): void;
      };
    };
  }
}
import {
  CheckCircle,
  CreditCard,
  Shield,
  Loader2,
  AlertCircle,
  ArrowRight,
  User,
  FileText,
  Home,
  Calendar,
  MapPin,
  Zap
} from "lucide-react";
import { Card, CardContent } from "../../../httpdocs/src/components/ui/card";
import { Badge } from "../../../httpdocs/src/components/ui/badge";

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

const PlayerRegistrationStepper = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    state: '',
    city: '',
    position: '',
    pincode: ''
  });
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [createdRegistration, setCreatedRegistration] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [adminSettings, setAdminSettings] = useState<{registration_fee: number; gst_percentage: number} | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Payment states
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [scriptLoadError, setScriptLoadError] = useState<string | null>(null);

  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  const envFee = Number(import.meta.env.VITE_REGISTRATION_FEE ?? (import.meta.env.MODE === 'production' ? 699 : 699));
  const baseAmount = (Number.isFinite(envFee) && envFee > 0 ? Math.round(envFee) : (adminSettings?.registration_fee ?? 699));
  const gstPercentage = adminSettings?.gst_percentage || 18;
  const gstAmount = Math.round(baseAmount * gstPercentage / 100);
  const totalAmount = baseAmount + gstAmount;

  // Keep dates as pure calendar strings (YYYY-MM-DD) to avoid timezone drift
  const todayYMD = () => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  };

  // Fetch admin settings on component mount
  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        setLoadingSettings(true);
        const { data, error } = await supabase
          .from('admin_settings')
          .select('registration_fee, gst_percentage')
          .eq('config_key', 'payment_config')
          .single();

        if (error) {
          console.error('Error fetching admin settings:', error);
          setAdminSettings({ registration_fee: 699, gst_percentage: 18 });
        } else {
          setAdminSettings({
            registration_fee: (data && typeof data.registration_fee === 'number') ? data.registration_fee : 699,
            gst_percentage: (data && typeof data.gst_percentage === 'number') ? data.gst_percentage : 18
          });
        }
      } catch (error) {
        console.error('Error fetching admin settings:', error);
        setAdminSettings({ registration_fee: 699, gst_percentage: 18 });
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchAdminSettings();
  }, []);

  // Pre-populate form with user data if logged in
  useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }));
    }
  }, [user, formData.email]);

  // Load Razorpay script when reaching confirmation step (step 2)
  useEffect(() => {
    if (currentStep === 2) {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
      } else {
        loadRazorpayScript();
      }
    }
  }, [currentStep]);

  // Lock body scroll when Razorpay modal is open
  useEffect(() => {
    if (razorpayModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [razorpayModalOpen]);

  const loadRazorpayScript = () => {
    if (window.Razorpay) {
      setRazorpayLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      setRazorpayLoaded(true);
    };
    script.onerror = () => {
      setScriptLoadError('Failed to load payment system');
    };

    document.head.appendChild(script);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = ['full_name', 'email', 'phone', 'state', 'city', 'pincode'];

    for (const field of requiredFields) {
      const value = formData[field as keyof typeof formData];
      if (!value || (typeof value === 'string' && !value.trim())) {
        const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        setMessage({ type: 'error', text: `${fieldName} is required.` });
        return false;
      }
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return false;
    }

    if (formData.phone && !/^\d{10}$/.test(formData.phone.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number.' });
      return false;
    }

    // Validate date if provided and ensure not in the future
    if (formData.date_of_birth) {
      const selectedDate = new Date(formData.date_of_birth + 'T00:00:00');
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      if (selectedDate > today) {
        setMessage({ type: 'error', text: 'Date of birth cannot be in the future.' });
        return false;
      }
    }

    if (!acceptTerms) {
      setMessage({ type: 'error', text: 'Please accept the Terms & Conditions to continue.' });
      return false;
    }

    return true;
  };

  const handleNext = () => {
    setMessage(null);
    if (currentStep === 1) {
      if (!validateForm()) return;
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Immediately launch payment on confirmation
      if (!razorpayLoaded) {
        loadRazorpayScript();
      }
      handlePayment();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const registrationData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone ? `+91${formData.phone.trim()}` : '',
        date_of_birth: formData.date_of_birth || todayYMD(),
        state: formData.state,
        city: formData.city || null,
        position: formData.position || 'Batting',
        pincode: formData.pincode || null,
        status: 'pending',
        payment_status: 'pending'
      };

      console.log('Submitting registration data:', registrationData);

      const { data, error } = await supabase
        .from('player_registrations')
        .insert([registrationData])
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Registration successful:', data);
      setCreatedRegistration(data[0]);
      setCurrentStep(2); // Move to confirmation step
    } catch (error: any) {
      console.error('Registration error:', error);

      let errorMessage = 'Registration failed. Please try again.';

      if (error?.message) {
        if (error.message.includes('duplicate key')) {
          errorMessage = 'This email is already registered. Please use a different email.';
        } else if (error.message.includes('permission denied')) {
          errorMessage = 'Database permission error. Please contact support.';
        } else if (error.message.includes('connection')) {
          errorMessage = 'Network connection error. Please check your internet.';
        } else {
          errorMessage = `Registration failed: ${error.message}`;
        }
      }

      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!createdRegistration) return;

    try {
      setIsProcessing(true);
      setPaymentError(null);

      console.log('🎯 Payment button clicked for registration:', createdRegistration.id);
      console.log('💰 Total amount to charge:', totalAmount);

      const order = await razorpayService.createOrder(totalAmount, {
        registrationId: createdRegistration.id,
        full_name: createdRegistration.full_name,
        email: createdRegistration.email,
        phone: createdRegistration.phone
      });
      console.log('✅ Order created successfully:', order);

      console.log('🚀 Opening Razorpay modal...');
      setRazorpayModalOpen(true);

      await razorpayService.initiatePayment({
        amount: totalAmount,
        orderId: order.id,
        customerName: createdRegistration.full_name,
        customerEmail: createdRegistration.email,
        customerPhone: createdRegistration.phone,
        onDismiss: () => {
          console.log('🔄 Razorpay modal dismissed, unlocking interactions');
          setRazorpayModalOpen(false);
          setCurrentStep(2);
          toast({
            title: "Payment Cancelled",
            description: "You cancelled the payment. You can review your details and try again.",
            variant: "destructive"
          });
        },
        onSuccess: async (response: RazorpayPaymentSuccessResponse) => {
          console.log('🎉 Payment success callback triggered:', response);
          console.log('Payment successful:', response);
          setRazorpayModalOpen(false);

          try {
            // Verify payment with backend and update database
            const verificationResult = await razorpayService.verifyPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature,
              createdRegistration.id,
              totalAmount
            );

            console.log('Payment verification and database update successful:', verificationResult);

            // Set payment data for success modal
            setPaymentData({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              amount: totalAmount,
              registrationId: createdRegistration.id
            });

            setShowSuccessModal(true);
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
          setCurrentStep(2);
          toast({
            title: "Payment Failed",
            description: error?.description || error?.reason || "Your payment was not completed. Please review your details and try again.",
            variant: "destructive"
          });

          try {
            await supabase
              .from('player_registrations')
              .update({
                payment_status: 'failed',
                status: 'pending'
              })
              .eq('id', createdRegistration.id);
          } catch (failureHandlerError) {
            console.error('Error updating registration after payment failure:', failureHandlerError);
          }
        }
      });

    } catch (error: any) {
      console.error('💥 Payment initiation error:', error);
      setIsProcessing(false);
      setPaymentError(error.message || 'Failed to initiate payment. Please try again.');
    }
  };

  const steps = [
    { id: 1, title: 'Player Details', icon: User, description: 'Enter your information', color: 'from-sport-electric-blue to-sport-vibrant-green' },
    { id: 2, title: 'Confirmation', icon: FileText, description: 'Review and confirm', color: 'from-sport-energy-orange to-sport-bright-yellow' }
  ];

  if (loadingSettings) {
    return (
      <div className="text-center py-8">
        <div className="spinner mx-auto"></div>
        <p className="text-sm text-gray-600 mt-2">Loading registration details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Compact Step Indicator */}
      <div className="flex items-center justify-center mb-4" role="tablist" aria-label="Registration Steps">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                currentStep >= step.id
                  ? `bg-gradient-to-r ${step.color} border-transparent text-white shadow-md`
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}
              role="tab"
              aria-selected="false"
              aria-controls={`step-panel-${step.id}`}
              id={`step-${step.id}`}
            >
              {currentStep > step.id ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <step.icon className="w-4 h-4" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded transition-all duration-200 ${
                  currentStep > step.id ? 'bg-gradient-to-r ' + step.color : 'bg-gray-200'
                }`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Compact Step Labels */}
      <div className="flex justify-center mb-4">
        <div className="text-center">
          <div className={`text-sm font-medium transition-all duration-200 ${
            currentStep === 1 ? 'text-sport-electric-blue' : 'text-sport-vibrant-green'
          }`}>
            {steps[currentStep - 1].title}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">{steps[currentStep - 1].description}</div>
        </div>
      </div>

      {/* Enhanced Home Button */}
      <div className="flex justify-end">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gradient-to-r from-sport-electric-blue/10 to-sport-vibrant-green/10 text-sport-electric-blue hover:from-sport-electric-blue hover:to-sport-vibrant-green hover:text-white rounded-lg transition-all duration-300 font-medium border border-sport-electric-blue/20 hover:border-sport-electric-blue"
          type="button"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>

      {/* Compact Trial Announcement Banner */}
      <div className="bg-gradient-to-r from-sport-electric-blue to-sport-vibrant-green text-white rounded-lg p-3 mb-4 shadow-lg border border-sport-bright-yellow/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sport-electric-blue/10 to-sport-vibrant-green/10"></div>
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-sport-bright-yellow" />
            <span className="text-sm font-bold">TRIALS UPDATE</span>
          </div>
          <p className="text-sm mb-2 text-white/90">
            Next Schedule for Trials will be announced soon!
          </p>
          <p className="text-xs text-sport-bright-yellow font-medium">
            Spot Registrations Available • Follow Instagram for Updates
          </p>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <form onSubmit={handleSubmit} className="space-y-4" id="step-panel-1" role="tabpanel" aria-labelledby="step-1">
          {/* Compact Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                <User className="w-3 h-3 text-sport-electric-blue" />
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sport-electric-blue focus:border-sport-electric-blue text-sm transition-colors"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                required
              />
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="10-digit number"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                maxLength={10}
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1">
              <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                max={todayYMD()}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
              />
            </div>

            {/* State */}
            <div className="space-y-1">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                required
              >
                <option value="">Select State</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Delhi">Delhi</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>

            {/* City */}
            <div className="space-y-1">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City <span className="text-red-500">*</span>
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                required
              >
                <option value="">Select City</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Delhi">Delhi</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
              </select>
            </div>

            {/* PIN Code */}
            <div className="space-y-1">
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="6-digit PIN"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                maxLength={6}
              />
            </div>

            {/* Player Position */}
            <div className="space-y-1">
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Player Type
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
              >
                <option value="">Select Position</option>
                <option value="Batting">Batting</option>
                <option value="Bowling">Bowling</option>
                <option value="All-Rounder">All-Rounder</option>
              </select>
            </div>
          </div>

          {/* Terms and Conditions - Compact */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 w-3.5 h-3.5 text-sport-electric-blue bg-white border-gray-300 rounded focus:ring-sport-electric-blue focus:ring-1"
                required
              />
              <label htmlFor="acceptTerms" className="text-xs text-gray-600 leading-relaxed">
                I agree to the{' '}
                <TermsAndConditions
                  trigger={
                    <span className="text-sport-electric-blue hover:text-sport-vibrant-green cursor-pointer underline font-medium">
                      Terms & Conditions
                    </span>
                  }
                  asLink={true}
                />
                {' '}and Privacy Policy <span className="text-red-500">*</span>
              </label>
            </div>
          </div>

          {/* Compact Error/Success Messages */}
          {message && (
            <div className={`p-2.5 rounded-md text-xs font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Compact Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-sport-electric-blue to-sport-vibrant-green hover:from-sport-vibrant-green hover:to-sport-electric-blue disabled:from-gray-400 disabled:to-gray-500 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:transform-none text-sm"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Continue to Confirmation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {currentStep === 2 && createdRegistration && (
        <div className="space-y-4" id="step-panel-2" role="tabpanel" aria-labelledby="step-2">
          {/* Compact Registration Summary */}
          <Card className="border border-sport-electric-blue/30 bg-gradient-to-br from-sport-electric-blue/5 to-sport-vibrant-green/5">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-sport-electric-blue">
                <FileText className="w-5 h-5" />
                Registration Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div><strong>Name:</strong> {createdRegistration.full_name}</div>
                <div><strong>Email:</strong> {createdRegistration.email}</div>
                <div><strong>Phone:</strong> {createdRegistration.phone}</div>
                <div><strong>State:</strong> {createdRegistration.state}</div>
                <div><strong>City:</strong> {createdRegistration.city}</div>
                <div><strong>Position:</strong> <Badge variant="outline" className="text-xs">{createdRegistration.position}</Badge></div>
              </div>
            </CardContent>
          </Card>

          {/* Compact Payment Summary */}
          <Card className="border border-sport-vibrant-green/30 bg-gradient-to-br from-sport-vibrant-green/5 to-sport-electric-blue/5">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-sport-vibrant-green">
                <Shield className="w-5 h-5" />
                Payment Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xl font-bold p-3 bg-gradient-to-r from-sport-vibrant-green/10 to-sport-electric-blue/10 rounded-lg border border-sport-vibrant-green/20">
                  <span>Total Amount</span>
                  <span className="text-sport-vibrant-green">₹{totalAmount}</span>
                </div>
                <div className="text-xs space-y-1.5 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between">
                    <span>Registration Fee:</span>
                    <span className="font-medium">₹{baseAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST ({gstPercentage}%):</span>
                    <span className="font-medium">₹{gstAmount}</span>
                  </div>
                  <div className="border-t pt-1.5 flex justify-between font-bold text-sport-electric-blue">
                    <span>Total:</span>
                    <span>₹{totalAmount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compact Payment Button */}
          <div className="pt-2">
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-sport-energy-orange to-sport-bright-yellow hover:from-sport-bright-yellow hover:to-sport-energy-orange disabled:from-gray-400 disabled:to-gray-500 text-black py-3 px-4 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg disabled:transform-none text-sm"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing Payment...</span>
                </>
              ) : (
                <>
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    
    {showSuccessModal && createdRegistration && paymentData && (
      <PaymentSuccessCelebration
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/registration/success');
        }}
        playerDetails={{
          full_name: createdRegistration.full_name,
          email: createdRegistration.email,
          phone: createdRegistration.phone,
          date_of_birth: createdRegistration.date_of_birth,
          state: createdRegistration.state,
          city: createdRegistration.city,
          position: createdRegistration.position,
          pincode: createdRegistration.pincode
        }}
        paymentData={paymentData}
      />
    )}
 
 </div>
 );
 
 };
 
 export default PlayerRegistrationStepper;