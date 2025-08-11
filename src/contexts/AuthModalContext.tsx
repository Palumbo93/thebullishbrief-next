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
      console.log('User authenticated, closing auth modal');
      setShowAuthModal(false);
    }
  }, [user, showAuthModal]);

  // Check onboarding status for new users
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user || authLoading) return;
      
      console.log('Checking onboarding status for user:', user.email);
      
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
        
        console.log('Onboarding status:', { 
          preferences, 
          onboardingCompleted, 
          showOnboarding 
        });
        
        if (!onboardingCompleted) {
          console.log('Setting onboarding modal to show with delay');
          // Add a small delay before showing the onboarding modal
          setTimeout(() => {
            setShowOnboarding(true);
          }, 500); // 500ms delay
        } else {
          console.log('Onboarding already completed');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };
    
    checkOnboardingStatus();
  }, [user, authLoading]);

  // Auth modal handlers
  const handleSignUpClick = () => {
    console.log('handleSignUpClick called');
    setAuthModalMode('signup');
    setShowAuthModal(true);
  };

  const handleSignInClick = () => {
    console.log('handleSignInClick called');
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
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
};
