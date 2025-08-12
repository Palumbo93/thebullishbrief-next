"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, hasSupabaseCredentials } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  is_admin: boolean;
  email_verified: boolean;
  subscription_tier: string;
  newsletter_subscribed: boolean;
  preferences: any;
  created_at: string;
}

interface AuthUser extends User {
  isAdmin?: boolean;
  profile?: UserProfile;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  hasRole: (roleName: string) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  signUp: (email: string, username?: string) => Promise<{ error: any }>;
  signIn: (email: string) => Promise<{ error: any }>;
  sendOTP: (email: string, isSignUp?: boolean, username?: string) => Promise<{ error?: any; success?: boolean }>;
  verifyOTP: (email: string, token: string) => Promise<{ error?: any; data?: any; success?: boolean }>;
  signOut: () => Promise<void>;
  grantRole: (userId: string, roleName: string) => Promise<{ error?: any; success?: boolean }>;
  revokeRole: (userId: string, roleName: string) => Promise<{ error?: any; success?: boolean }>;
  refreshToken: () => Promise<{ error?: any; data?: any; success?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return a safe default for SSR
    return {
      user: null,
      loading: true,
      signIn: async () => ({ error: null, success: false }),
      signUp: async () => ({ error: null, success: false }),
      signOut: async () => ({ error: null, success: false }),
      resetPassword: async () => ({ error: null, success: false }),
      updateProfile: async () => ({ error: null, success: false }),
      sendOTP: async () => ({ error: null, success: false }),
      verifyOTP: async () => ({ error: null, success: false }),
      refreshToken: async () => ({ error: null, success: false }),
      hasRole: () => false,
      isAdmin: false,
      isPremium: false,
    };
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(false);
  
  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = React.useMemo(() => ({
    user,
    loading,
    hasRole: (roleName: string): boolean => {
      if (roleName === 'admin') {
        return user?.isAdmin || false;
      }
      return false;
    },
    hasPermission: (resource: string, action: string): boolean => {
      return user?.isAdmin || false;
    },
    signUp: async (email: string, username?: string) => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          data: {
            username: username || email.split('@')[0],
          }
        }
      });
      return { error };
    },
    signIn: async (email: string) => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
      });
      return { error };
    },
    sendOTP: async (email: string, isSignUp: boolean = false, username?: string) => {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: isSignUp,
            data: isSignUp ? {
              username: username || email.split('@')[0],
            } : undefined,
          }
        });

        if (error) {
          console.error('OTP send error:', error);
          return { error };
        }

        return { success: true };
      } catch (error) {
        console.error('OTP send catch error:', error);
        return { error };
      }
    },
    verifyOTP: async (email: string, token: string) => {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email'
        });

        if (error) {
          console.error('OTP verification error:', error);
          return { error };
        }

        // Manually update auth state since auth state listener is disabled
        if (data?.user) {
          console.log('OTP verification successful, manually updating auth state');
          setUser({ ...data.user, isAdmin: false });
          setLoading(false);
          
          // Fetch user profile separately (slower)
          fetchUserProfile(data.user.id);
        }

        return { data, success: true };
      } catch (error) {
        console.error('OTP verification catch error:', error);
        return { error };
      }
    },
    signOut: async () => {
      await supabase.auth.signOut();
      // Manually clear auth state since auth state listener is disabled
      setUser(null);
      setLoading(false);
    },
    grantRole: async (userId: string, roleName: string) => {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ is_admin: roleName === 'admin' })
          .eq('id', userId);

        if (error) {
          console.error('Error granting role:', error);
          return { error };
        }

        return { success: true };
      } catch (error) {
        console.error('Error granting role:', error);
        return { error };
      }
    },
    revokeRole: async (userId: string, roleName: string) => {
      try {
        const { error } = await supabase
          .from('user_profiles')
          .update({ is_admin: false })
          .eq('id', userId);

        if (error) {
          console.error('Error revoking role:', error);
          return { error };
        }

        return { success: true };
      } catch (error) {
        console.error('Error revoking role:', error);
        return { error };
      }
    },
    // Manual token refresh for when we need a fresh token
    refreshToken: async () => {
      try {
        const { data, error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Error refreshing token:', error);
          return { error };
        }
        return { data, success: true };
      } catch (error) {
        console.error('Error refreshing token:', error);
        return { error };
      }
    },
  }), [user, loading]);

  // Fetch user profile and admin status
  const fetchUserProfile = async (userId: string) => {
    setAdminLoading(true);
    try {
      // Fetch full user profile
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.log('Could not fetch user profile:', error);
        return;
      }
      
      // Check JWT metadata for admin status as fallback
      const { data: { session } } = await supabase.auth.getSession();
      const jwtIsAdmin = session?.user?.app_metadata?.is_admin || false;
      const isAdmin = profile?.is_admin || jwtIsAdmin;
      
      // Update user with profile and admin status
      setUser(prev => prev ? { 
        ...prev, 
        isAdmin,
        profile: profile || undefined
      } : null);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    if (!hasSupabaseCredentials) {
      setLoading(false);
      return;
    }

    // Get initial session (fast)
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Set user immediately without admin check
          setUser({ ...session.user, isAdmin: false });
          setLoading(false);
          
          // Fetch user profile and admin status separately (slower)
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setUser(null);
        setLoading(false);
      }
    };

    getInitialSession();

    // Disable auth state listener completely to prevent window focus refresh issues
    // We'll rely on manual session checks and explicit auth actions
    console.log('Auth state listener disabled to prevent window focus refresh issues');
    
    // const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    //   // Disabled to prevent window focus refresh issues
    // });
    


    // No cleanup needed since auth state listener is disabled
  }, []);



  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};