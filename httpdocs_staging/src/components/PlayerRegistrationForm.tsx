import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import PaymentConfirmationModal from './PaymentConfirmationModal';
import PaymentSuccessCelebration from './PaymentSuccessCelebration';
import { DatePicker } from '@/components/ui/date-picker';
import TermsAndConditions from './TermsAndConditions';

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  date_of_birth?: Date;
  state: string;
  city: string;
  position: string;
  pincode?: string;
}

interface AdminSettings {
  registration_fee: number;
  gst_percentage: number;
}

const PlayerRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: undefined,
    state: '',
    city: '',
    position: '',
    pincode: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [createdRegistration, setCreatedRegistration] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // NEW: Track whether payment modal is active
  const [isPaymentActive, setPaymentActive] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date?: Date) => {
    setFormData(prev => ({ ...prev, date_of_birth: date }));
  };

  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        setLoadingSettings(true);
        const { data, error } = await supabase
          .from('admin_settings')
          .select('registration_fee, gst_percentage')
          .eq('config_key', 'payment_config')
          .single();

        if (error || !data) {
          console.error('Error fetching admin settings:', error);
          setAdminSettings({ registration_fee: 699, gst_percentage: 18 });
        } else {
          setAdminSettings({
            registration_fee: Math.max(data.registration_fee || 699, 699),
            gst_percentage: data.gst_percentage || 18
          });
        }
      } catch (err) {
        console.error('Admin settings fetch error:', err);
        setAdminSettings({ registration_fee: 699, gst_percentage: 18 });
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchAdminSettings();
  }, []);

  const validateForm = () => {
    const requiredFields: (keyof FormData)[] = ['full_name', 'email', 'phone', 'state', 'city'];

    for (const field of requiredFields) {
      const value = formData[field];
      if (!value || (typeof value === 'string' && !value.trim())) {
        setMessage({ type: 'error', text: `${field.replace('_', ' ')} is required.` });
        return false;
      }
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return false;
    }

    if (!/^\d{10}$/.test(formData.phone.trim())) {
      setMessage({ type: 'error', text: 'Please enter a valid 10-digit phone number.' });
      return false;
    }

    if (!acceptTerms) {
      setMessage({ type: 'error', text: 'Please accept the Terms & Conditions.' });
      return false;
    }

    return true;
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
        phone: `+91${formData.phone.trim()}`,
        date_of_birth: formData.date_of_birth ? formData.date_of_birth.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        state: formData.state,
        city: formData.city,
        position: formData.position || 'Batting',
        pincode: formData.pincode || null,
        status: 'pending',
        payment_status: 'pending'
      };

      const { data, error } = await supabase
        .from('player_registrations')
        .insert([registrationData])
        .select();

      if (error) throw error;

      setCreatedRegistration(data[0]);

      // NEW: Set payment active before opening Razorpay modal
      setPaymentActive(true);
      setShowPaymentModal(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      let errorMsg = 'Registration failed. Please try again.';
      if (err.message.includes('duplicate key')) errorMsg = 'This email is already registered.';
      else if (err.message.includes('permission denied')) errorMsg = 'Database permission error. Contact support.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = async (paymentDataParam: any) => {
    setPaymentActive(false);
    setShowPaymentModal(false);

    if (!createdRegistration) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('player_registrations')
        .update({
          payment_status: 'completed',
          payment_amount: paymentDataParam.amount,
          razorpay_payment_id: paymentDataParam.razorpay_payment_id,
          razorpay_order_id: paymentDataParam.razorpay_order_id,
          status: 'completed'
        })
        .eq('id', createdRegistration.id);

      if (error) throw error;

      setPaymentData(paymentDataParam);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Payment update error:', err);
      setMessage({ type: 'error', text: 'Payment successful but registration update failed. Contact support.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentFailure = async (paymentError: any) => {
    console.error('Payment failed:', paymentError);
    setPaymentActive(false);
    setShowPaymentModal(false);

    if (!createdRegistration) return;

    try {
      const { error } = await supabase
        .from('player_registrations')
        .update({ payment_status: 'failed', status: 'pending' })
        .eq('id', createdRegistration.id);

      if (error) throw error;
      setMessage({ type: 'error', text: 'Payment failed. You can retry later.' });
    } catch (err) {
      console.error('Payment failure update error:', err);
      setMessage({ type: 'error', text: 'Payment failed and update failed. Contact support.' });
    }
  };

  if (loadingSettings) return <div className="registration-container"><p>Loading registration details...</p></div>;

  return (
    <div className="registration-container">
      {/* NEW: Hide registration form when payment is active */}
      {!isPaymentActive && (
        <div className="registration-card">
          <div className="registration-title">
            <img src="/ssplt10-logo.png" alt="SSPL Logo" className="logo-image" />
            <h2>Player Registration</h2>
          </div>

          {message && <div className={`message ${message.type}`}>{message.text}</div>}

          <form onSubmit={handleSubmit} className="registration-form">
            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="full_name" className="form-label">Full Name *</label>
              <input type="text" id="full_name" name="full_name" value={formData.full_name} onChange={handleInputChange} className="form-input" required />
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email *</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="form-input" required />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="phone" className="form-label">Phone *</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="form-input" maxLength={10} required />
            </div>

            {/* Date of Birth */}
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <DatePicker date={formData.date_of_birth} onDateChange={handleDateChange} placeholder="DD-MM-YYYY" allowManualInput className="form-input" />
            </div>

            {/* State and City */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="state" className="form-label">State *</label>
                <select id="state" name="state" value={formData.state} onChange={handleInputChange} className="form-select" required>
                  <option value="">Select State</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="city" className="form-label">City *</label>
                <select id="city" name="city" value={formData.city} onChange={handleInputChange} className="form-select" required>
                  <option value="">Select City</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>
            </div>

            {/* Style and Pincode */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="position" className="form-label">Style</label>
                <select id="position" name="position" value={formData.position} onChange={handleInputChange} className="form-select">
                  <option value="">Select Style</option>
                  <option value="Batting">Batting</option>
                  <option value="Bowling">Bowling</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="pincode" className="form-label">PIN Code</label>
                <input type="text" id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} className="form-input" maxLength={6} />
              </div>
            </div>

            {/* Terms */}
            <div className="form-group">
              <div className="flex items-start space-x-3">
                <input type="checkbox" id="acceptTerms" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 w-4 h-4" required />
                <label htmlFor="acceptTerms" className="text-sm">
                  I agree to <TermsAndConditions trigger={<span className="text-blue-600 cursor-pointer underline">Terms & Conditions</span>} asLink /> and Privacy Policy
                </label>
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? 'Registering...' : 'Register Player'}
            </button>
          </form>
        </div>
      )}

      {/* Payment Modal */}
      {createdRegistration && (
        <PaymentConfirmationModal
          isOpen={showPaymentModal}
          onClose={() => { setShowPaymentModal(false); setPaymentActive(false); }}
          onBack={() => { setShowPaymentModal(false); setPaymentActive(false); }}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
          playerDetails={createdRegistration}
          registrationFee={adminSettings?.registration_fee || 699}
          gstPercentage={adminSettings?.gst_percentage || 18}
          registrationId={createdRegistration.id}
        />
      )}

      {/* Success Modal */}
      {paymentData && (
        <PaymentSuccessCelebration
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            setCreatedRegistration(null);
            setPaymentData(null);
            setFormData({ full_name:'', email:'', phone:'', date_of_birth:undefined, state:'', city:'', position:'', pincode:'' });
            setAcceptTerms(false);
          }}
          playerDetails={createdRegistration}
          paymentData={paymentData}
        />
      )}
    </div>
  );
};

export default PlayerRegistrationForm;
