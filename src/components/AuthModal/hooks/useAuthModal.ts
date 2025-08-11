import { useState, useCallback } from 'react';
import { UseAuthModalReturn } from '../types/auth.types';

export const useAuthModal = (): UseAuthModalReturn => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const switchToSignIn = useCallback(() => {
    setIsSignUp(false);
    setSignUpStep(1);
    setShowPassword(false);
  }, []);

  const switchToSignUp = useCallback(() => {
    setIsSignUp(true);
    setSignUpStep(1);
    setShowPassword(false);
  }, []);

  const setSignUpStepState = useCallback((step: number) => {
    setSignUpStep(step);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
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
    showPassword,
    showOnboarding,
    switchToSignIn,
    switchToSignUp,
    setSignUpStep: setSignUpStepState,
    togglePasswordVisibility,
    showOnboardingModal,
    hideOnboardingModal,
  };
}; 