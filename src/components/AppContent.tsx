"use client";

import React from 'react';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useAuth } from '../contexts/AuthContext';
import { useUserRestrictions } from '../hooks/useUserRestrictions';
import { AuthModal } from './AuthModal/index';
import { OnboardingModal } from './OnboardingModal';
import { ToastContainer } from './ToastContainer';
import { ConfirmModal } from './ConfirmModal';
import { LoadingScreen } from './LoadingScreen';
import { ConsentBanner } from './consent/ConsentBanner';
import { ConsentModal } from './consent/ConsentModal';

interface AppContentProps {
  children: React.ReactNode;
}

export const AppContent: React.FC<AppContentProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const {
    showAuthModal,
    authModalMode,
    showOnboarding,
    handleAuthModalClose,
    handleOnboardingComplete,
    handleOnboardingClose,
  } = useAuthModal();
  
  // Initialize user restrictions monitoring for real-time updates
  useUserRestrictions();

  // Show LoadingScreen while auth state is being determined
  if (authLoading) {
    return (
      <LoadingScreen 
        onComplete={() => {
          // This will be called after 800ms, but we'll ignore it
          // since we're controlling the loading state via authLoading
        }} 
      />
    );
  }

  return (
    <>
      {/* Page content */}
      {children}
      
      {/* Global Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthModalClose}
        initialMode={authModalMode}
      />
      
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={handleOnboardingComplete}
      />
      
      {/* Global UI Components */}
      <ToastContainer />
      <ConfirmModal />
      
      {/* Cookie Consent UI */}
      <ConsentBanner />
      <ConsentModal />
    </>
  );
};
