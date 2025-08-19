"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

interface AuthModalContextValue {
  // Modal state
  showAuthModal: boolean;
  authModalMode: 'signin' | 'signup';
  showOnboarding: boolean;
  
  // Modal handlers
  handleSignInClick: () => void;
  handleSignUpClick: () => void;
  handleAuthModalClose: () => void;
  handleOnboardingComplete: () => void;
  handleOnboardingClose: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | undefined>(undefined);

interface AuthModalProviderProps {
  children: ReactNode;
}

export const AuthModalProvider: React.FC<AuthModalProviderProps> = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user, loading: authLoading } = useAuth();

  // Auto-close auth modal when user successfully authenticates
  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [user, showAuthModal]);

  // Check onboarding status for new users
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || authLoading) return;
            
      try {
        const { data: userProfile, error } = await supabase
          .from('user_profiles')
          .select('preferences')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user preferences:', error);
          return;
        }
        
        const preferences = userProfile?.preferences || {};
        const onboardingCompleted = preferences.onboardingCompleted === true;
        
        
        if (!onboardingCompleted) {
          // Add a small delay before showing the onboarding modal
          setTimeout(() => {
            setShowOnboarding(true);
          }, 500); // 500ms delay
        } 
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };
    
    checkOnboardingStatus();
  }, [user, authLoading]);

  // Auth modal handlers
  const handleSignUpClick = () => {
    setAuthModalMode('signup');
    setShowAuthModal(true);
  };

  const handleSignInClick = () => {
    setAuthModalMode('signin');
    setShowAuthModal(true);
  };

  const handleAuthModalClose = () => {
    setShowAuthModal(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  const value: AuthModalContextValue = {
    showAuthModal,
    authModalMode,
    showOnboarding,
    handleSignInClick,
    handleSignUpClick,
    handleAuthModalClose,
    handleOnboardingComplete,
    handleOnboardingClose,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModal = (): AuthModalContextValue => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    // Return a safe default for SSR
    return {
      showAuthModal: false,
      authModalMode: 'signin',
      showOnboarding: false,
      handleSignInClick: () => {},
      handleSignUpClick: () => {},
      handleAuthModalClose: () => {},
      handleOnboardingComplete: () => {},
      handleOnboardingClose: () => {},
    };
  }
  return context;
};
