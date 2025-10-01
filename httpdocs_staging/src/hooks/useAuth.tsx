import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthError {
  message: string;
  status?: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roleLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  userRole: string | null;
  checkUserRoleInDB: (email: string) => Promise<string | null>;
  setUserAsAdmin: (email: string) => Promise<boolean>;
  forceAdminRole: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    console.log('Auth: Setting up auth state listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth: Auth state changed', { event, hasSession: !!session, userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);

        // Fetch user role when session changes
        if (session?.user) {
          setRoleLoading(true);
          await fetchUserRole(session.user.id);
          setRoleLoading(false);
          setLoading(false); // Only set loading to false after role is fetched
        } else {
          setUserRole(null);
          setRoleLoading(false);
        setLoading(false);
        }
      }
    );


    // Check for existing session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setRoleLoading(true);
        await fetchUserRole(session.user.id);
        setRoleLoading(false);
        setLoading(false); // Only set loading to false after role is fetched
      } else {
        setRoleLoading(false);
        setLoading(false);
      }
    };
    
    checkSession();

    return () => {
      try {
        subscription.unsubscribe();
      } catch (error) {
        console.error('Auth: Error unsubscribing from auth state:', error);
      }
    };
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      // Fetch user role from database
      
      // Query user role from database
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (!error && data) {
        setUserRole(data.role);
      } else {
        // If no role found, create default user role
        if (error?.code === 'PGRST116') {
          try {
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({ user_id: userId, role: 'user' });

            if (!insertError) {
              setUserRole('user');
            } else {
              setUserRole('user'); // Set default role anyway
            }
          } catch (createError) {
            setUserRole('user'); // Set default role anyway
          }
        } else {
          setUserRole(null);
        }
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
    }
  };

  // Function to manually check user role in database
  const checkUserRoleInDB = async (email: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email !== email) {
        return null;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleError) {
        return null;
      }

      return roleData.role;
    } catch (error) {
      console.error('Error checking user role in DB:', error);
      return null;
    }
  };

  // Function to manually set user as admin
  const setUserAsAdmin = async (email: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user || user.email !== email) {
        return false;
      }

      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'admin' });

        if (!insertError) {
          setUserRole('admin');
          return true;
        }
      } else if (existingRole) {
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: 'admin' })
          .eq('user_id', user.id);

        if (!updateError) {
          setUserRole('admin');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error setting user as admin:', error);
      return false;
    }
  };


  // Force update role to admin for current user
  const forceAdminRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return false;
      }

      const { data: existingRole, error: checkError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'admin' });

        if (!insertError) {
          setUserRole('admin');
          return true;
        }
      } else if (existingRole) {
        const { error: updateError } = await supabase
          .from('user_roles')
          .update({ role: 'admin' })
          .eq('user_id', user.id);

        if (!updateError) {
          setUserRole('admin');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error force updating to admin role:', error);
      return false;
    }
  };


  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error: { message: error.message, status: error.status } };
      } else {
        toast({
          title: "Success",
          description: "Signed in successfully"
        });
        return { error: null };
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      return { error: { message: 'An unexpected error occurred', status: 500 } };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error: { message: error.message, status: error.status } };
      } else {
        toast({
          title: "Success",
          description: "Please check your email to confirm your account"
        });
        return { error: null };
      }
    } catch (error) {
      console.error('Error during sign-up:', error);
      return { error: { message: 'An unexpected error occurred', status: 500 } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserRole(null);
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully"
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    roleLoading,
    signIn,
    signUp,
    signOut,
    userRole,
    checkUserRoleInDB,
    setUserAsAdmin,
    forceAdminRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
