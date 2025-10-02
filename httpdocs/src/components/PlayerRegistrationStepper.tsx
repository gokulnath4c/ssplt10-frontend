import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PaymentSuccessCelebration from './PaymentSuccessCelebration';
import TermsAndConditions from './TermsAndConditions';
import { razorpayService, type RazorpayPaymentFailedError, type RazorpayPaymentSuccessResponse } from '@/integrations/razorpayService';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import {
  CheckCircle,
  CreditCard,
  Shield,
  Loader2,
  AlertCircle,
  ArrowRight,
  User,
  FileText
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PlayerDetails {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  state: string;
  city: string;
  position: string;
  pincode: string;
  preferred_trials?: string;
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
    pincode: '',
    preferred_trials: ''
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
  const [fieldErrors, setFieldErrors] = useState<{[key: string]: boolean}>({});

  const { toast } = useToast();
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
    const newFieldErrors: {[key: string]: boolean} = {};

    for (const field of requiredFields) {
      const value = formData[field as keyof typeof formData];
      if (!value || (typeof value === 'string' && !value.trim())) {
        const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
        newFieldErrors[field] = true;
        setMessage({ type: 'error', text: `${fieldName} is required.` });
        return false;
      }
    }

    setFieldErrors(newFieldErrors);

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
        preferred_trials: formData.preferred_trials || null,
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
    { id: 1, title: 'Player Details', icon: User, description: 'Enter your information' },
    { id: 2, title: 'Confirmation', icon: FileText, description: 'Review and confirm' }
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
    <div className="space-y-grid-3" role="main" aria-label="Player Registration Form">

      {/* Step indicator for screen readers */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Step {currentStep} of {steps.length}: {steps[currentStep - 1]?.title}
      </div>



      {/* Step Content */}
      {currentStep === 1 && (
        <div className="glass-card p-grid-3 relative">
          <img src="/assets/svg/ball-trail.svg" alt="" className="hidden md:block absolute inset-0 w-full h-full object-contain opacity-5 lg:opacity-10" aria-hidden="true" />
          <form onSubmit={handleSubmit} className="space-y-grid-2">
          {/* Form fields from PlayerRegistrationForm */}
          <div className="space-y-grid-1">
            <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
              Full Name <span className="text-red-500" aria-label="required">*</span>
            </label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              className="w-full px-3 py-grid-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              aria-describedby="full_name-error"
            />
            <div id="full_name-error" className="sr-only" aria-live="polite">
              {message?.type === 'error' && message.text.includes('Full Name') ? message.text : ''}
            </div>
          </div>

          <div className="space-y-grid-1">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              className="w-full px-3 py-grid-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="space-y-grid-1">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter 10-digit mobile number"
              className="w-full px-3 py-grid-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={10}
              required
            />
          </div>

          <div className="space-y-grid-1">
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700">Date of Birth</label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              max={todayYMD()}
              className="w-full px-3 py-grid-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-2">
            <div className="space-y-grid-1">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full px-3 py-grid-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select State</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Delhi">Delhi</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="West Bengal">West Bengal</option>
              </select>
            </div>

            <div className="space-y-grid-1">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City <span className="text-red-500">*</span>
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-3 py-grid-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select City</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Alappuzha">Alappuzha</option>
                <option value="Anantapur">Anantapur</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Delhi">Delhi</option>
                <option value="Ernakulam">Ernakulam</option>
                <option value="Guntur">Guntur</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Kakinada">Kakinada</option>
                <option value="Kannur">Kannur</option>
                <option value="Karimnagar">Karimnagar</option>
                <option value="Khammam">Khammam</option>
                <option value="Kollam">Kollam</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Kottayam">Kottayam</option>
                <option value="Kozhikode">Kozhikode</option>
                <option value="Kurnool">Kurnool</option>
                <option value="Lucknow">Lucknow</option>
                <option value="Mahbubnagar">Mahbubnagar</option>
                <option value="Malappuram">Malappuram</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Nellore">Nellore</option>
                <option value="Nizamabad">Nizamabad</option>
                <option value="Palakkad">Palakkad</option>
                <option value="Pathanamthitta">Pathanamthitta</option>
                <option value="Pune">Pune</option>
                <option value="Rajahmundry">Rajahmundry</option>
                <option value="Secunderabad">Secunderabad</option>
                <option value="Thiruvananthapuram">Thiruvananthapuram</option>
                <option value="Thrissur">Thrissur</option>
                <option value="Tirupati">Tirupati</option>
                <option value="Visakhapatnam">Visakhapatnam</option>
                <option value="Vijayawada">Vijayawada</option>
                <option value="Warangal">Warangal</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-grid-2">
            <div className="space-y-grid-1">
              <label htmlFor="pincode" className="block text-sm font-medium text-gray-700">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleInputChange}
                placeholder="Enter PIN code"
                className="w-full px-3 py-grid-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={6}
              />
            </div>

            <div className="space-y-grid-1">
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">Player Type</label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className="w-full px-3 py-grid-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Position</option>
                <option value="Batting">Batting</option>
                <option value="Bowling">Bowling</option>
                <option value="All-Rounder">All-Rounder</option>
              </select>
            </div>

            <div className="space-y-grid-1">
              <label htmlFor="preferred_trials" className="block text-sm font-medium text-gray-700">Preferred Trials</label>
              <select
                id="preferred_trials"
                name="preferred_trials"
                value={formData.preferred_trials}
                onChange={handleInputChange}
                className="w-full px-3 py-grid-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Preferred Trials</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Weekends">Weekends</option>
                <option value="Both">Both</option>
              </select>
            </div>
          </div>

          <div className="space-y-grid-1">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                required
              />
              <div className="text-sm">
                <label htmlFor="acceptTerms" className="text-gray-700 font-medium">
                  I agree to the{' '}
                  <TermsAndConditions
                    trigger={
                      <span className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                        Terms & Conditions
                      </span>
                    }
                    asLink={true}
                  />
                  {' '}and Privacy Policy
                </label>
              </div>
            </div>
          </div>

          {message && (
            <div
              id="form-message"
              className={`p-3 rounded-md text-sm font-medium ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
              role="alert"
              aria-live="polite"
              aria-atomic="true"
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-grid-1 pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-grid-2 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-grid-1"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Registering...
                </>
              ) : (
                'Continue to Confirmation'
              )}
            </button>
          </div>
        </form>
       </div>
      )}

      {currentStep === 2 && createdRegistration && (
      <div className="space-y-grid-2">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-grid-2">
            <h3 className="text-subheading font-montserrat font-semibold mb-grid-2 flex items-center gap-grid-1">
              <FileText className="w-5 h-5 text-blue-600" />
              Registration Summary
            </h3>

            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div><strong>Name:</strong> {createdRegistration.full_name}</div>
                <div><strong>Email:</strong> {createdRegistration.email}</div>
                <div><strong>Phone:</strong> {createdRegistration.phone}</div>
                <div><strong>Date of Birth:</strong> {createdRegistration.date_of_birth}</div>
                <div><strong>State:</strong> {createdRegistration.state}</div>
                <div><strong>City:</strong> {createdRegistration.city}</div>
                <div><strong>Position:</strong> <Badge variant="outline">{createdRegistration.position}</Badge></div>
                {createdRegistration.pincode && <div><strong>PIN Code:</strong> {createdRegistration.pincode}</div>}
                {createdRegistration.preferred_trials && <div><strong>Preferred Trials:</strong> <Badge variant="outline">{createdRegistration.preferred_trials}</Badge></div>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-grid-2">
            <h3 className="text-subheading font-montserrat font-semibold mb-grid-2 flex items-center gap-grid-1">
              <Shield className="w-5 h-5 text-green-600" />
              Payment Summary
            </h3>

            <div className="space-y-grid-1">
              <div className="flex justify-between items-center text-subheading font-montserrat font-bold">
                <span>Total Amount to be Paid</span>
                <span className="text-green-600 font-oswald">₹{totalAmount}</span>
              </div>
              <div className="text-body font-inter text-gray-600 space-y-1">
                <p>Registration Fee: ₹{baseAmount}</p>
                <p>GST ({gstPercentage}%): ₹{gstAmount}</p>
                <p className="border-t pt-1 font-medium">Total: ₹{totalAmount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-grid-1 pt-3">
          <button
            onClick={() => {
              handlePayment();
            }}
            className="w-full flex items-center justify-center gap-grid-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-grid-2 rounded-lg font-semibold transition-all duration-200"
          >
            Proceed to Payment
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )}
    
    {showSuccessModal && createdRegistration && paymentData && (
      <PaymentSuccessCelebration
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          window.location.href = '/registration/success';
        }}
        playerDetails={{
          full_name: createdRegistration.full_name,
          email: createdRegistration.email,
          phone: createdRegistration.phone,
          date_of_birth: createdRegistration.date_of_birth,
          state: createdRegistration.state,
          city: createdRegistration.city,
          position: createdRegistration.position,
          pincode: createdRegistration.pincode,
          preferred_trials: createdRegistration.preferred_trials
        }}
        paymentData={paymentData}
      />
    )}
 
 </div>
 );
 
 };
 
 export default PlayerRegistrationStepper;