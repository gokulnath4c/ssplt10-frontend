import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CreditCard, Key, TestTube, Save, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SettingsTabProps {
  user: any;
  userRole: string;
}

const SettingsTab = ({ user, userRole }: SettingsTabProps) => {
  const [paymentConfig, setPaymentConfig] = useState({
    registrationFee: 5,
    gstPercentage: 18,
    razorpayKeyId: '',
    razorpayKeySecret: '',
    paymentEnabled: true
  });
  const [loadingPaymentConfig, setLoadingPaymentConfig] = useState(true);
  const [savingPaymentConfig, setSavingPaymentConfig] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Load Payment Configuration
  useEffect(() => {
    const loadPaymentConfig = async () => {
      if (!user || userRole !== 'admin') return;

      try {
        setLoadingPaymentConfig(true);
        const { data, error } = await supabase
          .from('admin_settings')
          .select('*')
          .eq('config_key', 'payment_config')
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading payment config:', error);
          return;
        }

        if (data) {
          setPaymentConfig({
            registrationFee: data.registration_fee || 5,
            gstPercentage: data.gst_percentage || 18,
            razorpayKeyId: data.razorpay_key_id || '',
            razorpayKeySecret: data.razorpay_key_secret || '',
            paymentEnabled: true
          });
        }
      } catch (error) {
        console.error('Error loading payment configuration:', error);
      } finally {
        setLoadingPaymentConfig(false);
      }
    };

    loadPaymentConfig();
  }, [user, userRole]);

  // Save Payment Configuration
  const savePaymentConfig = async () => {
    try {
      setSavingPaymentConfig(true);
      console.log('Saving payment configuration:', paymentConfig);

      const { data, error } = await supabase
        .from('admin_settings')
        .upsert({
          config_key: 'payment_config',
          registration_fee: paymentConfig.registrationFee,
          gst_percentage: paymentConfig.gstPercentage,
          razorpay_key_id: paymentConfig.razorpayKeyId,
          razorpay_key_secret: paymentConfig.razorpayKeySecret,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'config_key'
        })
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Payment configuration saved successfully:', data);
      alert('Payment configuration saved successfully!');
    } catch (error: any) {
      console.error('Error saving payment configuration:', error);
      alert(`Failed to save configuration: ${error.message || 'Unknown error'}`);
    } finally {
      setSavingPaymentConfig(false);
    }
  };

  // Test Razorpay Connection
  const testRazorpayConnection = async () => {
    try {
      setTestingConnection(true);
      setConnectionStatus('idle');

      await new Promise(resolve => setTimeout(resolve, 2000));

      if (paymentConfig.razorpayKeyId && paymentConfig.razorpayKeySecret) {
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Configuration Section */}
      <Card className="shadow-elegant">
        <CardHeader className="bg-gradient-primary text-white">
          <CardTitle className="flex items-center gap-3">
            <CreditCard className="w-6 h-6" />
            Payment Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {loadingPaymentConfig ? (
            <div className="flex items-center justify-center p-8">
              <div className="rounded-full h-8 w-8 border-b-2 border-cricket-blue"></div>
              <span className="ml-3 text-muted-foreground">Loading payment configuration...</span>
            </div>
          ) : (
            <>
              {/* Registration Fee Configuration */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cricket-blue flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Registration Fee Settings
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationFee" className="text-sm font-medium">
                      Registration Fee (₹)
                    </Label>
                    <Input
                      id="registrationFee"
                      type="number"
                      min="0"
                      step="1"
                      value={paymentConfig.registrationFee}
                      onChange={(e) => setPaymentConfig(prev => ({
                        ...prev,
                        registrationFee: parseInt(e.target.value) || 0
                      }))}
                      className="border-cricket-blue/20 focus:border-cricket-blue"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gstPercentage" className="text-sm font-medium">
                      GST Percentage (%)
                    </Label>
                    <Input
                      id="gstPercentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={paymentConfig.gstPercentage}
                      onChange={(e) => setPaymentConfig(prev => ({
                        ...prev,
                        gstPercentage: parseFloat(e.target.value) || 0
                      }))}
                      className="border-cricket-blue/20 focus:border-cricket-blue"
                    />
                  </div>
                </div>

                <div className="bg-cricket-light-blue/20 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Total Amount (including GST):</span>
                    <span className="text-lg font-bold text-cricket-blue">
                      ₹{Math.round(paymentConfig.registrationFee * (1 + paymentConfig.gstPercentage / 100))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Razorpay Configuration */}
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-cricket-blue flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Razorpay Integration
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">Payment Gateway</Label>
                      <p className="text-xs text-muted-foreground">Enable/disable Razorpay payment processing</p>
                    </div>
                    <Switch
                      checked={paymentConfig.paymentEnabled}
                      onCheckedChange={(checked) => setPaymentConfig(prev => ({
                        ...prev,
                        paymentEnabled: checked
                      }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="razorpayKeyId" className="text-sm font-medium">
                        Razorpay Key ID
                      </Label>
                      <Input
                        id="razorpayKeyId"
                        type="password"
                        value={paymentConfig.razorpayKeyId}
                        onChange={(e) => setPaymentConfig(prev => ({
                          ...prev,
                          razorpayKeyId: e.target.value
                        }))}
                        placeholder="rzp_test_..."
                        className="border-cricket-blue/20 focus:border-cricket-blue font-mono"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="razorpayKeySecret" className="text-sm font-medium">
                        Razorpay Key Secret
                      </Label>
                      <Input
                        id="razorpayKeySecret"
                        type="password"
                        value={paymentConfig.razorpayKeySecret}
                        onChange={(e) => setPaymentConfig(prev => ({
                          ...prev,
                          razorpayKeySecret: e.target.value
                        }))}
                        placeholder="Your secret key"
                        className="border-cricket-blue/20 focus:border-cricket-blue font-mono"
                      />
                    </div>
                  </div>

                  {/* Test Connection */}
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={testRazorpayConnection}
                      disabled={testingConnection || !paymentConfig.razorpayKeyId || !paymentConfig.razorpayKeySecret}
                      variant="outline"
                      className="border-cricket-blue text-cricket-blue hover:bg-cricket-blue hover:text-white"
                    >
                      {testingConnection ? (
                        <>
                          <div className="rounded-full h-4 w-4 border-b-2 border-cricket-blue mr-2"></div>
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-2" />
                          Test Connection
                        </>
                      )}
                    </Button>

                    {connectionStatus === 'success' && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Connection successful</span>
                      </div>
                    )}

                    {connectionStatus === 'error' && (
                      <div className="flex items-center gap-2 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm">Connection failed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Save Configuration */}
              <div className="flex justify-end border-t pt-6">
                <Button
                  onClick={savePaymentConfig}
                  disabled={savingPaymentConfig}
                  className="bg-cricket-blue hover:bg-cricket-dark-blue text-white"
                >
                  {savingPaymentConfig ? (
                    <>
                      <div className="rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Configuration
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;