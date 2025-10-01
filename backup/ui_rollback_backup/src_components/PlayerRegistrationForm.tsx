import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import PaymentSuccessCelebration from './PaymentSuccessCelebration';
import TermsAndConditions from './TermsAndConditions';
import { useNavigate } from 'react-router-dom';
import { Home, Calendar, MapPin, Zap, User, Mail, Phone, MapPin as MapPinIcon, Shield } from 'lucide-react';
import { EnhancedInput } from '@/components/ui/enhanced-input';
import { EnhancedSelect } from '@/components/ui/enhanced-select';
import { EnhancedFormButton } from '@/components/ui/enhanced-form-button';
import { useScrollAnimation, scrollAnimationPresets } from '@/hooks/useScrollAnimation';
import { PremiumFloatingElements } from '@/components/PremiumFloatingElements';

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

const PlayerRegistrationForm = () => {
  const navigate = useNavigate();
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdRegistration, setCreatedRegistration] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [adminSettings, setAdminSettings] = useState<{registration_fee: number; gst_percentage: number} | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Scroll animations
  const formRef = useScrollAnimation({
    ...scrollAnimationPresets.fadeInUp,
    delay: 200
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


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
          // Fallback to default values
          setAdminSettings({ registration_fee: 10, gst_percentage: 18 });
        } else {
          // Use database values with sane fallbacks (no enforced minimum)
          setAdminSettings({
            registration_fee: (data && typeof data.registration_fee === 'number') ? data.registration_fee : 10,
            gst_percentage: (data && typeof data.gst_percentage === 'number') ? data.gst_percentage : 18
          });
        }
      } catch (error) {
        console.error('Error fetching admin settings:', error);
        // Fallback to default values
        setAdminSettings({ registration_fee: 10, gst_percentage: 18 });
      } finally {
        setLoadingSettings(false);
      }
    };

    fetchAdminSettings();
  }, []);


  // Payment modal handlers
  const handlePaymentSuccess = async (paymentDataParam: any) => {
    console.log('Payment successful:', paymentDataParam);
    setShowPaymentModal(false);

    // Update registration with payment details
    if (createdRegistration) {
      setIsSubmitting(true); // Show loading state
      try {
        const updatePromise = supabase
          .from('player_registrations')
          .update({
            payment_status: 'completed',
            payment_amount: paymentDataParam.amount,
            razorpay_payment_id: paymentDataParam.razorpay_payment_id,
            razorpay_order_id: paymentDataParam.razorpay_order_id,
            status: 'completed'
          })
          .eq('id', createdRegistration.id);

        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database update timeout')), 10000)
        );

        const { error } = await Promise.race([updatePromise, timeoutPromise]) as any;

        if (error) throw error;

        // Store payment data for the success modal
        setPaymentData({
          razorpay_payment_id: paymentDataParam.razorpay_payment_id,
          razorpay_order_id: paymentDataParam.razorpay_order_id,
          amount: paymentDataParam.amount,
          registrationId: createdRegistration.id
        });

        // Show success modal
        setShowSuccessModal(true);
      } catch (error) {
        console.error('Error updating registration after payment:', error);
        setMessage({ type: 'error', text: 'Payment was successful but there was an issue updating your registration. Please contact support.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handlePaymentFailure = async (paymentError: any) => {
    console.log('Payment failed:', paymentError);
    setShowPaymentModal(false);

    // Update registration with failed payment details
    if (createdRegistration) {
      try {
        const { error } = await supabase
          .from('player_registrations')
          .update({
            payment_status: 'failed',
            status: 'pending'
          })
          .eq('id', createdRegistration.id);

        if (error) throw error;

        setMessage({ type: 'error', text: 'Payment failed. Your registration details have been saved. You can try payment again later.' });
      } catch (error) {
        console.error('Error updating registration after payment failure:', error);
        setMessage({ type: 'error', text: 'Payment failed and there was an issue saving your details.' });
      }
    }
  };

  // Function to update registration record if user makes edits
  const updateRegistrationRecord = async (updatedData: any) => {
    if (!createdRegistration?.id) return;

    try {
      const { error } = await supabase
        .from('player_registrations')
        .update({
          full_name: updatedData.full_name,
          email: updatedData.email,
          phone: updatedData.phone,
          date_of_birth: updatedData.date_of_birth,
          state: updatedData.state,
          city: updatedData.city,
          position: updatedData.position,
          pincode: updatedData.pincode
        })
        .eq('id', createdRegistration.id);

      if (error) throw error;

      console.log('Registration record updated successfully');
      setMessage({ type: 'success', text: 'Registration details updated successfully!' });
    } catch (error) {
      console.error('Error updating registration:', error);
      setMessage({ type: 'error', text: 'Failed to update registration details.' });
    }
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

    // Additional validation for email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return false;
    }

    // Additional validation for phone number
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

    // Terms and conditions validation
    if (!acceptTerms) {
      setMessage({ type: 'error', text: 'Please accept the Terms & Conditions to continue.' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    console.log('Form submission started');
    console.log('Current form data:', formData);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed');

    setIsSubmitting(true);

    try {
      // Prepare data according to database schema
      const registrationData = {
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone ? `+91${formData.phone.trim()}` : '',
        date_of_birth: formData.date_of_birth || todayYMD(), // Default to today if not provided
        state: formData.state,
        city: formData.city || null,
        position: formData.position || 'Batting', // Default position
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

      // Go directly to payment modal
      setShowPaymentModal(true);
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

  // Show loading state while fetching admin settings
  if (loadingSettings) {
    return (
      <div id="registration" className="registration-container">
        <div className="registration-card">
          <div className="registration-title">
            <img src="/ssplt10-logo.png" alt="SSPL Logo" className="logo-image" />
            <h2>Player Registration</h2>
          </div>
          <div className="text-center py-8">
            <div className="spinner"></div>
            <p className="text-sm text-gray-600 mt-2">Loading registration details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="registration" className="relative registration-container min-h-screen flex items-center justify-center p-4">
      {/* Premium Floating Elements */}
      <PremiumFloatingElements variant="minimal" className="opacity-20" />

      <div ref={formRef.ref as any} className="registration-card relative z-10 w-full max-w-md">
        <div className="registration-title">
          <img src="/ssplt10-logo.png" alt="SSPL Logo" className="logo-image" />
          <h2>Player Registration</h2>
        </div>

        {/* Home Button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            type="button"
          >
            <Home className="w-4 h-4" />
            Home
          </button>
        </div>

        {/* Trial Announcement Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white rounded-lg p-4 mb-6 shadow-lg border border-blue-500">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold">ANNOUNCEMENT</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-300" />
              <span className="text-lg font-bold">Trials Start in Chennai</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-yellow-300" />
              <span className="text-lg font-bold">20-21 September 2025</span>
            </div>
          </div>
          <div className="text-center mt-3">
            <span className="text-2xl font-black bg-yellow-400 text-black px-6 py-3 rounded-lg animate-pulse shadow-lg border-2 border-yellow-300">
              Register Now!
            </span>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="registration-form space-y-6">
          <EnhancedInput
            label="Full Name"
            id="full_name"
            name="full_name"
            type="text"
            value={formData.full_name}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
            icon={<User className="w-4 h-4" />}
            variant="premium"
            floating={true}
            error={message?.type === 'error' && message.text.includes('name') ? message.text : undefined}
          />

          <EnhancedInput
            label="Email Address"
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email address"
            required
            icon={<Mail className="w-4 h-4" />}
            variant="premium"
            floating={true}
            error={message?.type === 'error' && message.text.includes('email') ? message.text : undefined}
          />

          <EnhancedInput
            label="Phone Number"
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter 10-digit mobile number"
            required
            icon={<Phone className="w-4 h-4" />}
            variant="premium"
            floating={true}
            maxLength={10}
            error={message?.type === 'error' && message.text.includes('phone') ? message.text : undefined}
          />

          <EnhancedInput
            label="Date of Birth"
            id="date_of_birth"
            name="date_of_birth"
            type="date"
            value={formData.date_of_birth}
            onChange={handleInputChange}
            max={todayYMD()}
            variant="premium"
            floating={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedSelect
              label="State"
              placeholder="Select State"
              value={formData.state}
              onValueChange={(value) => handleInputChange({ target: { name: 'state', value } } as any)}
              options={[
                { value: "Andhra Pradesh", label: "Andhra Pradesh" },
                { value: "Delhi", label: "Delhi" },
                { value: "Gujarat", label: "Gujarat" },
                { value: "Karnataka", label: "Karnataka" },
                { value: "Maharashtra", label: "Maharashtra" },
                { value: "Punjab", label: "Punjab" },
                { value: "Rajasthan", label: "Rajasthan" },
                { value: "Tamil Nadu", label: "Tamil Nadu" },
                { value: "Telangana", label: "Telangana" },
                { value: "Uttar Pradesh", label: "Uttar Pradesh" },
                { value: "West Bengal", label: "West Bengal" }
              ]}
              required
              variant="premium"
              floating={true}
            />

            <EnhancedSelect
              label="City"
              placeholder="Select City"
              value={formData.city}
              onValueChange={(value) => handleInputChange({ target: { name: 'city', value } } as any)}
              options={[
                { value: "Ahmedabad", label: "Ahmedabad" },
                { value: "Anantapur", label: "Anantapur" },
                { value: "Bangalore", label: "Bangalore" },
                { value: "Chennai", label: "Chennai" },
                { value: "Delhi", label: "Delhi" },
                { value: "Guntur", label: "Guntur" },
                { value: "Hyderabad", label: "Hyderabad" },
                { value: "Jaipur", label: "Jaipur" },
                { value: "Kakinada", label: "Kakinada" },
                { value: "Karimnagar", label: "Karimnagar" },
                { value: "Khammam", label: "Khammam" },
                { value: "Kolkata", label: "Kolkata" },
                { value: "Kurnool", label: "Kurnool" },
                { value: "Lucknow", label: "Lucknow" },
                { value: "Mahbubnagar", label: "Mahbubnagar" },
                { value: "Mumbai", label: "Mumbai" },
                { value: "Nellore", label: "Nellore" },
                { value: "Nizamabad", label: "Nizamabad" },
                { value: "Pune", label: "Pune" },
                { value: "Rajahmundry", label: "Rajahmundry" },
                { value: "Secunderabad", label: "Secunderabad" },
                { value: "Tirupati", label: "Tirupati" },
                { value: "Visakhapatnam", label: "Visakhapatnam" },
                { value: "Vijayawada", label: "Vijayawada" },
                { value: "Warangal", label: "Warangal" }
              ]}
              required
              variant="premium"
              floating={true}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EnhancedInput
              label="PIN Code"
              id="pincode"
              name="pincode"
              type="text"
              value={formData.pincode}
              onChange={handleInputChange}
              placeholder="Enter PIN code"
              maxLength={6}
              icon={<MapPinIcon className="w-4 h-4" />}
              variant="premium"
              floating={true}
              required
            />

            <EnhancedSelect
              label="Player Type"
              placeholder="Select Position"
              value={formData.position}
              onValueChange={(value) => handleInputChange({ target: { name: 'position', value } } as any)}
              options={[
                { value: "Batting", label: "Batting" },
                { value: "Bowling", label: "Bowling" },
                { value: "All-Rounder", label: "All-Rounder" }
              ]}
              variant="premium"
              floating={true}
            />
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gradient-to-r from-cricket-blue/5 to-cricket-purple/5 p-4 rounded-lg border border-cricket-blue/20">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="acceptTerms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-cricket-blue bg-white border-gray-300 rounded focus:ring-cricket-blue focus:ring-2 hover:scale-110 transition-transform duration-200"
                required
              />
              <div className="text-sm">
                <label htmlFor="acceptTerms" className="text-gray-700 font-medium flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cricket-blue" />
                  I agree to the{' '}
                  <TermsAndConditions
                    trigger={
                      <span className="text-cricket-blue hover:text-cricket-yellow cursor-pointer underline transition-colors duration-200">
                        Terms & Conditions
                      </span>
                    }
                    asLink={true}
                  />
                  {' '}and Privacy Policy
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  By checking this box, you agree to our terms of service and privacy policy.
                </p>
              </div>
            </div>
          </div>

          <EnhancedFormButton
            type="submit"
            variant="gradient"
            size="lg"
            loading={isSubmitting}
            loadingText="Registering..."
            floating={true}
            className="w-full"
          >
            {isSubmitting ? 'Registering...' : 'Register Player'}
          </EnhancedFormButton>
        </form>
      </div>


      {/* Payment Confirmation Modal */}
      {createdRegistration && (
        <PaymentConfirmationModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onBack={() => {
            setShowPaymentModal(false);
            // Allow user to edit form data
            setMessage({ type: 'success', text: 'You can now edit your registration details.' });
          }}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          playerDetails={{
            full_name: createdRegistration.full_name,
            email: createdRegistration.email,
            phone: createdRegistration.phone,
            position: createdRegistration.position
          }}
          registrationFee={adminSettings?.registration_fee || 10}
          gstPercentage={adminSettings?.gst_percentage || 18}
          registrationId={createdRegistration.id}
        />
      )}

      {/* Payment Success Celebration Modal */}
      {createdRegistration && paymentData && (
        <PaymentSuccessCelebration
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            // Reset form after closing success modal
            setFormData({
              full_name: '',
              email: '',
              phone: '',
              date_of_birth: '',
              state: '',
              city: '',
              position: '',
              pincode: ''
            });
            setAcceptTerms(false);
            setCreatedRegistration(null);
            setPaymentData(null);
          }}
          playerDetails={{
            full_name: createdRegistration.full_name,
            email: createdRegistration.email,
            phone: createdRegistration.phone,
            date_of_birth: createdRegistration.date_of_birth || '',
            state: createdRegistration.state,
            city: createdRegistration.city,
            position: createdRegistration.position,
            pincode: createdRegistration.pincode
          }}
          paymentData={paymentData}
        />
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          .registration-container {
            max-width: 400px;
            margin: 0 auto;
            padding: 8px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            scroll-margin-top: 20px;
          }

          .registration-container:focus {
            outline: none;
          }

          /* Scroll highlight effect */
          .registration-container.scroll-highlight {
            animation: scrollHighlight 2s ease-out;
          }

          @keyframes scrollHighlight {
            0% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
            }
            50% {
              box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.1), 0 8px 32px rgba(59, 130, 246, 0.2);
            }
            100% {
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.1);
            }
          }

          /* Mobile scroll highlight effect */
          @media (max-width: 768px) {
            .registration-container {
              transition: all 0.3s ease;
            }

            .registration-container:focus {
              box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1), 0 4px 20px rgba(0, 0, 0, 0.1);
              transform: scale(1.01);
            }

            .registration-container.scroll-highlight {
              animation: mobileScrollHighlight 2s ease-out;
            }
          }

          @keyframes mobileScrollHighlight {
            0% {
              box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
              transform: scale(1);
            }
            50% {
              box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.15), 0 6px 24px rgba(59, 130, 246, 0.25);
              transform: scale(1.02);
            }
            100% {
              box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.08);
              transform: scale(1);
            }
          }

          .registration-card {
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 8px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.08);
            padding: 16px;
            border: 1px solid rgba(148, 163, 184, 0.1);
            position: relative;
            overflow: hidden;
          }

          .registration-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #3b82f6, #1d4ed8, #7c3aed);
          }

          .registration-title {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid rgba(148, 163, 184, 0.2);
          }

          .registration-title h2 {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b;
            margin: 0;
            background: linear-gradient(135deg, #1e293b, #334155);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .logo-image {
            width: 32px;
            height: 32px;
            border-radius: 6px;
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
          }

          .message {
            padding: 8px 12px;
            border-radius: 6px;
            margin-bottom: 12px;
            font-weight: 500;
            font-size: 13px;
            border-left: 3px solid;
            animation: slideIn 0.2s ease-out;
          }

          .message.success {
            background: #f0fdf4;
            color: #166534;
            border-left-color: #16a34a;
          }

          .message.error {
            background: #fef2f2;
            color: #dc2626;
            border-left-color: #dc2626;
          }

          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .registration-form {
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .form-group {
            display: flex;
            flex-direction: column;
            position: relative;
          }

          .form-label {
            font-size: 13px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 4px;
          }

          .required {
            color: #ef4444;
            font-weight: 600;
          }

          .form-input,
          .form-select {
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            transition: all 0.2s ease;
            background: white;
            font-weight: 400;
            height: 36px;
          }

          .form-input:focus,
          .form-select:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            transform: translateY(-1px);
          }

          .form-input::placeholder {
            color: #94a3b8;
            font-weight: 400;
          }

          .submit-btn {
            padding: 10px 16px;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            margin-top: 6px;
            box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
            position: relative;
            overflow: hidden;
            height: 40px;
          }

          .submit-btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
          }

          .submit-btn:hover:not(.submitting)::before {
            left: 100%;
          }

          .submit-btn:hover:not(.submitting) {
            background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }

          .submit-btn.submitting {
            background: #64748b;
            cursor: not-allowed;
            transform: none;
            box-shadow: 0 2px 8px rgba(100, 116, 139, 0.3);
          }

          .spinner {
            width: 14px;
            height: 14px;
            border: 2px solid #ffffff;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 640px) {
            .registration-container {
              padding: 6px;
              max-width: 100%;
            }

            .registration-card {
              padding: 14px;
              border-radius: 6px;
            }

            .form-row {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .registration-title {
              gap: 6px;
              margin-bottom: 10px;
              padding-bottom: 8px;
            }

            .registration-title h2 {
              font-size: 16px;
            }

            .logo-image {
              width: 28px;
              height: 28px;
            }

            .registration-form {
              gap: 12px;
            }

            .form-input,
            .form-select {
              padding: 10px 12px;
              font-size: 16px; /* Prevents zoom on iOS */
              height: 38px;
            }

            .submit-btn {
              padding: 12px 16px;
              font-size: 14px;
              margin-top: 8px;
              height: 42px;
            }
          }

          @media (max-width: 480px) {
            .registration-card {
              padding: 12px;
            }

            .registration-title h2 {
              font-size: 15px;
            }

            .form-label {
              font-size: 13px;
            }

            .form-input,
            .form-select {
              padding: 8px 10px;
              height: 36px;
            }

            .submit-btn {
              padding: 10px 14px;
              height: 40px;
            }
          }
        `
      }} />
    </div>
  );
};

export default PlayerRegistrationForm;