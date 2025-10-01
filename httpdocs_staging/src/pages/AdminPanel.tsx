import { useState, useEffect } from 'react';
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Users, BarChart3, Settings, LogOut, Home, Download, FileText, CheckCircle, XCircle, CreditCard, Key, TestTube, Save, Database, Grid3X3, List, QrCode, Filter, RefreshCw } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { supabase } from '@/integrations/supabase/client';
import AdminUserManagement from '@/components/AdminUserManagement';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import ContentManagement from '@/components/ContentManagement';
import SSPLDataManager from '@/components/SSPLDataManager';
import QRCodeManagement from '@/pages/admin/QRCodeManagement';
import RegistrationsTab from '@/components/admin/RegistrationsTab';
import SettingsTab from '@/components/admin/SettingsTab';

// Success Animation Component
const PaymentSuccessAnimation = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
          <p className="text-gray-600">Your registration has been confirmed.</p>
        </div>

      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { user, userRole, signOut, loading } = useAuth();
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [retryCount, setRetryCount] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Function to fetch registered players
  const fetchRegisteredPlayers = async () => {
    try {
      setLoadingUsers(true);
      setFetchError(null);
      setRetryCount(prev => prev + 1);

      const { data, error } = await supabase
        .from('player_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching registered players:', error);
        setFetchError(error.message);
        return;
      }

      setRegisteredUsers(data || []);
      setRetryCount(0); // Reset retry count on success
    } catch (error: any) {
      console.error('Error fetching registered players:', error);
      setFetchError(error.message || 'Failed to fetch registered players');
    } finally {
      setLoadingUsers(false);
    }
  };

  // Payment Configuration State
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
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [selectedPlayerForError, setSelectedPlayerForError] = useState<any>(null);


  useEffect(() => {
    // Debug logging
    console.log('Current auth state:', {
      user,
      userRole,
      loading,
      userId: user?.id
    });

    // Admin access check
    if (userRole !== 'admin') {
      console.log('User does not have admin privileges');
    }
  }, [user, userRole, loading]);
  const location = useLocation();

  // Function to generate Player ID in format: sspl-MM-YYYY-0000001
  const generatePlayerId = (registrationDate: string, index: number) => {
    const date = new Date(registrationDate);
    const month = String(date.getMonth() + 1).padStart(2, '0'); // MM format
    const year = date.getFullYear(); // YYYY format

    // Create a key for localStorage to track sequential numbers per month-year
    const storageKey = `sspl_player_counter_${year}_${month}`;

    // Get current counter for this month-year
    let currentCounter = parseInt(localStorage.getItem(storageKey) || '0');

    // If this is a new month-year or counter is 0, start from 1
    if (currentCounter === 0) {
      currentCounter = 1;
    }

    // Generate the Player ID
    const playerId = `sspl-${month}-${year}-${String(currentCounter).padStart(7, '0')}`;

    // Update the counter for next use
    localStorage.setItem(storageKey, String(currentCounter + 1));

    return playerId;
  };



  // Set up real-time subscription for new registrations
  useEffect(() => {
    if (!user || userRole !== 'admin') return;

    console.log('🔄 Setting up real-time subscription for player_registrations...');

    const subscription = supabase
      .channel('player_registrations_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'player_registrations'
        },
        (payload) => {
          console.log('📡 Real-time update received:', {
            eventType: payload.eventType,
            table: payload.table,
            recordId: (payload.new as any)?.id || (payload.old as any)?.id,
            timestamp: new Date().toISOString()
          });

          // Debounce multiple rapid updates
          if (payload.eventType === 'INSERT') {
            console.log('🆕 New registration detected, refreshing data...');
            // Small delay to ensure database consistency
            setTimeout(() => fetchRegisteredPlayers(), 500);
          } else if (payload.eventType === 'UPDATE') {
            console.log('🔄 Registration updated, refreshing data...');
            setTimeout(() => fetchRegisteredPlayers(), 500);
          } else if (payload.eventType === 'DELETE') {
            console.log('🗑️ Registration deleted, refreshing data...');
            setTimeout(() => fetchRegisteredPlayers(), 500);
          }
        }
      )
      .subscribe((status, err) => {
        console.log('📊 Real-time subscription status:', status);
        if (err) {
          console.error('❌ Real-time subscription error:', err);
          setRealtimeStatus('disconnected');
        }
        if (status === 'SUBSCRIBED') {
          console.log('✅ Real-time subscription active - Admin Panel will update automatically');
          setRealtimeStatus('connected');
        } else if (status === 'CLOSED') {
          console.log('⚠️ Real-time subscription closed - Manual refresh may be needed');
          setRealtimeStatus('disconnected');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time channel error');
          setRealtimeStatus('disconnected');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('🧹 Cleaning up real-time subscription...');
      subscription.unsubscribe();
    };
  }, [user?.id, userRole]); // Use user.id for more stable dependency

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
            paymentEnabled: true // We'll add this field to the database
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
          config_key: 'payment_config', // Use config_key for the payment config
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
      // Show success message
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

      // Here we would typically make a test API call to Razorpay
      // For now, we'll simulate the test
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate success/error based on whether credentials are provided
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

  // Function to generate and download receipt for individual player
  const downloadReceipt = (player: any) => {
    const receiptData = {
      playerName: player.full_name,
      playerId: player.player_id,
      email: player.email,
      phone: player.phone,
      dateOfBirth: player.date_of_birth,
      position: player.position,
      state: player.state,
      city: player.city,
      town: player.town,
      pincode: player.pincode,
      paymentAmount: player.payment_amount,
      paymentStatus: player.payment_status,
      registrationDate: new Date(player.created_at).toLocaleDateString(),
      registrationId: player.id
    };

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>SSPL T10 Registration Receipt</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #0066CC;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              width: 100px;
              height: auto;
              margin-bottom: 10px;
            }
            .logo-text {
              color: #0066CC;
              font-size: 24px;
              font-weight: bold;
            }
            .receipt-title {
              color: #FFD700;
              font-size: 18px;
              margin-top: 10px;
            }
            .details {
              margin: 20px 0;
            }
            .detail-row {
              display: flex;
              margin: 10px 0;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .label {
              font-weight: bold;
              width: 200px;
              color: #555;
            }
            .value {
              flex: 1;
              color: #333;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #eee;
              padding-top: 20px;
            }
            .status {
              padding: 5px 10px;
              border-radius: 4px;
              display: inline-block;
              font-weight: bold;
            }
            .status.completed {
              background: #d4edda;
              color: #155724;
            }
            .status.pending {
              background: #fff3cd;
              color: #856404;
            }
            .status.failed {
              background: #f8d7da;
              color: #721c24;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="/ssplt10-logo.png" alt="SSPL Logo" class="logo" />
            <div class="logo-text">SSPL T10</div>
            <div class="receipt-title">Player Registration Receipt</div>
          </div>

          <div class="details">
            <div class="detail-row">
              <span class="label">Player ID:</span>
              <span class="value" style="font-weight: bold; color: #0066CC; font-family: monospace;">${receiptData.playerId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Registration ID:</span>
              <span class="value">${receiptData.registrationId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Player Name:</span>
              <span class="value">${receiptData.playerName || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Email:</span>
              <span class="value">${receiptData.email || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Phone:</span>
              <span class="value">${receiptData.phone || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date of Birth:</span>
              <span class="value">${receiptData.dateOfBirth || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Playing Position:</span>
              <span class="value">${receiptData.position || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">State:</span>
              <span class="value">${receiptData.state || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">City:</span>
              <span class="value">${receiptData.city || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Town/Area:</span>
              <span class="value">${receiptData.town || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">PIN Code:</span>
              <span class="value">${receiptData.pincode || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Amount:</span>
              <span class="value">₹${receiptData.paymentAmount || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Payment Status:</span>
              <span class="value">
                <span class="status ${receiptData.paymentStatus === 'completed' ? 'completed' : receiptData.paymentStatus === 'failed' ? 'failed' : 'pending'}">
                  ${receiptData.paymentStatus || 'pending'}
                </span>
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Registration Date:</span>
              <span class="value">${receiptData.registrationDate}</span>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for registering with SSPL T10!</p>
            <p>This receipt confirms your player registration details.</p>
          </div>
        </body>
      </html>
    `;

    // Create a temporary element to hold the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = receiptHTML;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    // Configure html2pdf options
    const options = {
      margin: [0.5, 0.5, 0.5, 0.5],
      filename: `SSPL_Receipt_${player.full_name || 'Player'}_${player.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: 1100
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait',
        compress: true
      }
    };

    // Generate and download PDF
    html2pdf()
      .set(options)
      .from(tempDiv)
      .save()
      .then(() => {
        console.log('PDF generated successfully');
        // Clean up temporary element
        document.body.removeChild(tempDiv);
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
        // Try with different options if first attempt fails
        const fallbackOptions = {
          ...options,
          html2canvas: {
            ...options.html2canvas,
            scale: 1,
            useCORS: false,
            allowTaint: false
          }
        };

        html2pdf()
          .set(fallbackOptions)
          .from(tempDiv)
          .save()
          .then(() => {
            console.log('PDF generated with fallback options');
            document.body.removeChild(tempDiv);
          })
          .catch((fallbackError) => {
            console.error('Fallback PDF generation also failed:', fallbackError);
            // Final fallback to HTML download
            const blob = new Blob([receiptHTML], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `SSPL_Receipt_${player.full_name || 'Player'}_${player.id}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            document.body.removeChild(tempDiv);
          });
      });
  };


  // Redirect to auth if not logged in
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show admin access message if logged in but not admin
  if (!loading && user && userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-cricket-light-blue flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4 text-center">Admin Access Required</h2>
          <p className="text-gray-600 mb-6 text-center">
            You are logged in as {user.email} but need admin privileges to access this panel.
          </p>
          <p className="text-sm text-gray-500 mb-4 text-center">
            Please contact the system administrator to grant you admin access.
          </p>
          <Button
            onClick={() => window.location.href = '/'}
            className="w-full bg-cricket-blue hover:bg-cricket-dark-blue"
          >
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cricket-light-blue flex items-center justify-center">
        <div className="rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cricket-light-blue">
      {/* Header */}
      <div className="bg-gradient-primary shadow-elegant">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cricket-yellow rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-cricket-blue" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">SSPL T10 Admin</h1>
                <p className="text-cricket-yellow text-sm">Management Panel</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white text-sm">
                Welcome, {user?.email}
              </span>

              {/* Real-time Connection Status */}
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1">
                <div className={`w-2 h-2 rounded-full ${
                  realtimeStatus === 'connected' ? 'bg-green-400' :
                  realtimeStatus === 'connecting' ? 'bg-yellow-400 animate-pulse' :
                  'bg-red-400'
                }`} />
                <span className="text-white text-xs">
                  {realtimeStatus === 'connected' ? 'Live' :
                   realtimeStatus === 'connecting' ? 'Connecting...' :
                   'Offline'}
                </span>
              </div>

              <Button
                onClick={signOut}
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-cricket-blue"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="registrations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="registrations" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Player Registrations
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="ga-config" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              GA Config
            </TabsTrigger>
            <TabsTrigger value="qr-codes" className="flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              QR Codes
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="sspl-data" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              SSPL Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="registrations" className="space-y-6">
            <RegistrationsTab
              registeredUsers={registeredUsers}
              loadingUsers={loadingUsers}
              fetchRegisteredPlayers={fetchRegisteredPlayers}
              retryCount={retryCount}
              fetchError={fetchError}
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <AdminUserManagement />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="ga-config" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <p>Google Analytics has been removed from this application.</p>
            </div>
          </TabsContent>

          <TabsContent value="qr-codes" className="space-y-4">
            <QRCodeManagement />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsTab user={user} userRole={userRole} />
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="sspl-data" className="space-y-4">
            <SSPLDataManager />
          </TabsContent>
        </Tabs>
      </div>

      {/* Success Animation Overlay */}
      {showSuccessAnimation && (
        <PaymentSuccessAnimation onComplete={() => setShowSuccessAnimation(false)} />
      )}

      {/* Payment Error Details Dialog */}
      <Dialog open={!!selectedPlayerForError} onOpenChange={() => setSelectedPlayerForError(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Payment Failure Details
            </DialogTitle>
          </DialogHeader>
          {selectedPlayerForError && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Player Information</h4>
                  <div className="mt-2 space-y-1">
                    <p><strong>Name:</strong> {selectedPlayerForError.full_name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedPlayerForError.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedPlayerForError.phone || 'N/A'}</p>
                    <p><strong>Player ID:</strong> {selectedPlayerForError.player_id || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-gray-600">Payment Information</h4>
                  <div className="mt-2 space-y-1">
                    <p><strong>Amount:</strong> ₹{selectedPlayerForError.payment_amount || 'N/A'}</p>
                    <p><strong>Status:</strong> <span className="text-red-600 font-medium">{selectedPlayerForError.payment_status}</span></p>
                    <p><strong>Order ID:</strong> {selectedPlayerForError.razorpay_order_id || 'N/A'}</p>
                    <p><strong>Payment ID:</strong> {selectedPlayerForError.razorpay_payment_id || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedPlayerForError.payment_error_details && (
                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">Error Details</h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <pre className="text-xs text-red-800 whitespace-pre-wrap">
                      {(() => {
                        try {
                          const errorData = JSON.parse(selectedPlayerForError.payment_error_details);
                          return JSON.stringify(errorData, null, 2);
                        } catch {
                          return selectedPlayerForError.payment_error_details;
                        }
                      })()}
                    </pre>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedPlayerForError(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    // TODO: Implement retry payment functionality
                    setSelectedPlayerForError(null);
                  }}
                  className="bg-cricket-blue hover:bg-cricket-dark-blue"
                >
                  Retry Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;