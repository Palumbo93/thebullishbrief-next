import { useState, useCallback } from 'react';
import { UseAuthModalReturn } from '../types/auth.types';

export const useAuthModal = (): UseAuthModalReturn => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState(1);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);

  const switchToSignIn = useCallback(() => {
    setIsSignUp(false);
    setSignUpStep(1);
  }, []);

  const switchToSignUp = useCallback(() => {
    setIsSignUp(true);
    setSignUpStep(1);
  }, []);

  const setSignUpStepState = useCallback((step: number) => {
    setSignUpStep(step);
  }, []);

  const showOnboardingModal = useCallback(() => {
    setShowOnboarding(true);
  }, []);

  const hideOnboardingModal = useCallback(() => {
    setShowOnboarding(false);
  }, []);

  return {
    isSignUp,
    signUpStep,
    showOnboarding,
    showOTPVerification,
    switchToSignIn,
    switchToSignUp,
    setSignUpStep: setSignUpStepState,
    showOnboardingModal,
    hideOnboardingModal,
    showOTPVerificationModal,
    hideOTPVerificationModal,
  };
}; 