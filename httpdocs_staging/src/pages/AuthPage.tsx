import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom'; // Import useNavigate for programmatic navigation
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AuthPage = () => {
  const { user, signIn, loading, roleLoading, userRole, checkUserRoleInDB, setUserAsAdmin, makeGokulnathAdmin } = useAuth(); // Get userRole and roleLoading from context
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate for programmatic routing
  const { toast } = useToast();

  // Function to manually test role fetching
  const testRoleFetch = async () => {
    if (user?.id) {
      console.log('Manual role fetch test triggered for user:', user.id);
      // We'll need to access the fetchUserRole function from the auth context
      // For now, just log the current state
      console.log('Current auth state:', { user, loading, roleLoading, userRole });
    }
  };

  // Function to check role for specific user
  const checkSpecificUserRole = async () => {
    if (user?.email === 'gokulnath.4c@gmail.com') {
      console.log('🔍 Checking role for gokulnath.4c@gmail.com...');
      const role = await checkUserRoleInDB('gokulnath.4c@gmail.com');
      console.log('🔍 Role for gokulnath.4c@gmail.com:', role);
      
      if (role === 'admin') {
        console.log('✅ gokulnath.4c@gmail.com is confirmed as admin');
        // Force update the role
        window.location.reload();
      } else {
        console.log('❌ gokulnath.4c@gmail.com is not admin, attempting to set...');
        const success = await setUserAsAdmin('gokulnath.4c@gmail.com');
        if (success) {
          console.log('✅ Successfully set gokulnath.4c@gmail.com as admin');
          // Force update the role
          window.location.reload();
        }
      }
    } else {
      console.log('Current user is not gokulnath.4c@gmail.com');
    }
  };

  // Function to make gokulnath.4c@gmail.com admin
  const handleMakeGokulnathAdmin = async () => {
    if (user?.email === 'gokulnath.4c@gmail.com') {
      console.log('🔧 Making gokulnath.4c@gmail.com admin...');
      const success = await makeGokulnathAdmin();
      if (success) {
        console.log('✅ gokulnath.4c@gmail.com is now admin!');
      } else {
        console.log('❌ Failed to make gokulnath.4c@gmail.com admin');
      }
    } else {
      console.log('Current user is not gokulnath.4c@gmail.com');
    }
  };

  // Debug logging for all state changes
  useEffect(() => {
    console.log('AuthPage state changed:', {
      user: user?.id,
      loading,
      roleLoading,
      userRole,
      timestamp: new Date().toISOString()
    });
  }, [user, loading, roleLoading, userRole]);

  // Redirect if already authenticated
  useEffect(() => {
    console.log('AuthPage useEffect - user:', user, 'loading:', loading, 'roleLoading:', roleLoading, 'userRole:', userRole);
    
    if (user && !loading && !roleLoading && userRole !== null) {
      // Only redirect when we have user, not loading, role not loading, and userRole is determined
      console.log('Redirecting user with role:', userRole);
      if (userRole === 'admin') {
        console.log('Redirecting admin user to /admin');
        navigate('/admin'); // Redirect to admin panel if user is admin
      } else {
        console.log('Redirecting regular user to /');
        navigate('/'); // Redirect to homepage for regular users
      }
    }
    
    // Fallback: if user is authenticated but role is taking too long, show a message
    if (user && !loading && roleLoading) {
      console.log('User authenticated, waiting for role...');
    }
  }, [user, userRole, loading, roleLoading, navigate]); // Include roleLoading in dependencies

  // Timeout mechanism to prevent getting stuck
  useEffect(() => {
    if (user && !loading && roleLoading) {
      const timeout = setTimeout(() => {
        console.log('Role fetching timeout - forcing redirection with default role');
        if (userRole === null) {
          // If still no role after timeout, assume user role and redirect
          console.log('Assuming user role and redirecting to home');
          navigate('/');
        }
      }, 15000); // 15 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [user, loading, roleLoading, userRole, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log('Attempting sign in with:', { email: credentials.email, hasPassword: !!credentials.password });

    const { error } = await signIn(credentials.email, credentials.password);

    if (error) {
      console.error('Sign in error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status
      });

      // Provide specific error messages based on error type
      let errorTitle = "Sign In Failed";
      let errorDescription = "Please try again or contact support";

      if (error.message?.includes('Invalid login credentials')) {
        errorTitle = "Invalid Credentials";
        errorDescription = "The email or password you entered is incorrect. Please check and try again.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorTitle = "Email Not Verified";
        errorDescription = "Please check your email and click the verification link before signing in.";
      } else if (error.message?.includes('Too many requests')) {
        errorTitle = "Too Many Attempts";
        errorDescription = "Too many sign-in attempts. Please wait a few minutes before trying again.";
      } else if (error.status === 400) {
        errorTitle = "Authentication Error";
        errorDescription = "There was an issue with the authentication service. Please try again.";
      } else if (error.message?.includes('Network')) {
        errorTitle = "Connection Error";
        errorDescription = "Network connection issue. Please check your internet connection.";
      }

      // Show error toast
      console.log('Showing error toast:', { title: errorTitle, description: errorDescription });
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive"
      });
    } else {
      console.log('Sign in successful, waiting for role fetch and redirect');
      // The redirect will happen automatically via useEffect once userRole is fetched
      // No need to manually navigate here
    }

    setIsLoading(false);
  };


  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">
            {loading ? 'Authenticating...' : 'Loading user role...'}
          </p>
        </div>
      </div>
    );
  }

  // Debug section - remove this in production
  const debugInfo = (
    <div className="mt-4 p-3 bg-gray-100 rounded text-xs text-gray-600">
      <p><strong>Debug Info:</strong></p>
      <p>User: {user ? 'Yes' : 'No'}</p>
      <p>Loading: {loading ? 'Yes' : 'No'}</p>
      <p>Role Loading: {roleLoading ? 'Yes' : 'No'}</p>
      <p>User Role: {userRole || 'Not set'}</p>
      <p>User ID: {user?.id || 'N/A'}</p>
      
      {/* Manual redirection buttons for testing */}
      {user && userRole && (
        <div className="mt-2 space-y-1">
          <p><strong>Manual Redirection:</strong></p>
          <button 
            onClick={() => navigate('/admin')}
            className="px-2 py-1 bg-blue-500 text-white rounded text-xs mr-2"
          >
            Go to Admin Panel
          </button>
          <button 
            onClick={() => navigate('/')}
            className="px-2 py-1 bg-green-500 text-white rounded text-xs"
          >
            Go to Home
          </button>
        </div>
      )}
      
      {/* Test role fetching button */}
      {user && !userRole && (
        <div className="mt-2">
          <button 
            onClick={testRoleFetch}
            className="px-2 py-1 bg-yellow-500 text-white rounded text-xs"
          >
            Test Role Fetch
          </button>
        </div>
      )}
      
      {/* Special debugging for gokulnath.4c@gmail.com */}
      {user?.email === 'gokulnath.4c@gmail.com' && (
        <div className="mt-2 space-y-1">
          <p><strong>🔍 Special Debug for gokulnath.4c@gmail.com:</strong></p>
          <button 
            onClick={checkSpecificUserRole}
            className="px-2 py-1 bg-purple-500 text-white rounded text-xs mr-2"
          >
            Check Role
          </button>
          <button 
            onClick={handleMakeGokulnathAdmin}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
          >
            Set as Admin
          </button>
          
          {/* Prominent Admin Button */}
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm font-medium text-red-800 mb-2">
              🚨 Make gokulnath.4c@gmail.com Admin
            </p>
            <button 
              onClick={handleMakeGokulnathAdmin}
              className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium"
            >
              🔧 Make Me Admin Now!
            </button>
            <p className="text-xs text-red-600 mt-1">
              This will set your role to 'admin' in the database
            </p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-cricket-light-blue flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="bg-gradient-primary text-white rounded-t-lg text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <Shield className="w-6 h-6 text-cricket-yellow" />
            SSPL Authentication
          </CardTitle>
          <CardDescription className="text-cricket-yellow">
            Access your SSPL account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-cricket-blue hover:bg-cricket-dark-blue"
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </div>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>User accounts are created by administrators</p>
            <p className="mt-1">Contact an administrator for account access</p>

            {/* Development: Create test account */}
            {import.meta.env.DEV && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                <p className="text-xs text-yellow-800 mb-2">Development Mode: Create Test Account</p>
                <button
                  onClick={async () => {
                    try {
                      const testEmail = `test${Date.now()}@example.com`;
                      const testPassword = 'test123456';
                      console.log('Creating test account:', testEmail);
                      // Note: This would require signup functionality
                      alert(`Test account creation not implemented yet.\nUse existing account or contact admin.`);
                    } catch (error) {
                      console.error('Test account creation failed:', error);
                    }
                  }}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700"
                >
                  Create Test Account
                </button>
              </div>
            )}
          </div>
          
          {/* Status message */}
          {user && !loading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              {roleLoading ? (
                <p>✅ Signed in successfully! Loading your user role...</p>
              ) : userRole ? (
                <p>✅ Signed in successfully! Role: {userRole}</p>
              ) : (
                <p>✅ Signed in successfully! Determining your access level...</p>
              )}
            </div>
          )}
          
          {/* Debug info - remove in production */}
          {debugInfo}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
