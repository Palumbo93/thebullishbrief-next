"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface AuthModalContextValue {
  // Modal state
  showAuthModal: boolean;
  authModalMode: 'signin' | 'signup';
  
  // Modal handlers
  handleSignInClick: () => void;
  handleSignUpClick: () => void;
  handleAuthModalClose: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | undefined>(undefined);

interface AuthModalProviderProps {
  children: ReactNode;
}

export const AuthModalProvider: React.FC<AuthModalProviderProps> = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const { user } = useAuth();

  // Auto-close auth modal when user successfully authenticates
  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [user, showAuthModal]);


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


  const value: AuthModalContextValue = {
    showAuthModal,
    authModalMode,
    handleSignInClick,
    handleSignUpClick,
    handleAuthModalClose,
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
      handleSignInClick: () => {},
      handleSignUpClick: () => {},
      handleAuthModalClose: () => {},
    };
  }
  return context;
};
