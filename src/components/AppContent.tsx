"use client";

import React from 'react';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal/index';
import { ToastContainer } from './ToastContainer';
import { ConfirmModal } from './ConfirmModal';
import { LoadingScreen } from './LoadingScreen';
import { ConsentBanner } from './consent/ConsentBanner';
import { ConsentModal } from './consent/ConsentModal';

interface AppContentProps {
  // No children prop - this component only renders global modals and UI
}

export const AppContent: React.FC<AppContentProps> = () => {
  const { user, loading: authLoading } = useAuth();
  const {
    showAuthModal,
    authModalMode,
    handleAuthModalClose,
  } = useAuthModal();
  

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
      {/* Global Modals and UI Components */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleAuthModalClose}
        initialMode={authModalMode}
      />
      
      
      {/* Global UI Components */}
      <ToastContainer />
      <ConfirmModal />
      
      {/* Cookie Consent UI */}
      {/* <ConsentBanner /> */}
      {/* <ConsentModal /> */}
    </>
  );
};
