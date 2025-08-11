"use client";

import React from 'react';
import { useAuthModal } from '../contexts/AuthModalContext';
import { AuthModal } from './AuthModal/index';
import { OnboardingModal } from './OnboardingModal';
import { ToastContainer } from './ToastContainer';
import { ConfirmModal } from './ConfirmModal';

interface AppContentProps {
  children: React.ReactNode;
}

export const AppContent: React.FC<AppContentProps> = ({ children }) => {
  const {
    showAuthModal,
    authModalMode,
    showOnboarding,
    handleAuthModalClose,
    handleOnboardingComplete,
    handleOnboardingClose,
  } = useAuthModal();

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
    </>
  );
};
