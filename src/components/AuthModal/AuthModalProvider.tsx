import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AuthModalContextValue } from './types/auth.types';

const AuthModalContext = createContext<AuthModalContextValue | undefined>(undefined);

interface AuthModalProviderProps {
  children: ReactNode;
}

export const AuthModalProvider: React.FC<AuthModalProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState(1);

  const setErrorState = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setSuccess('');
  }, []);

  const setSuccessState = useCallback((successMessage: string) => {
    setSuccess(successMessage);
    setError('');
  }, []);

  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const switchToSignIn = useCallback(() => {
    setIsSignUp(false);
    setSignUpStep(1);
    setError('');
    setSuccess('');
  }, []);

  const switchToSignUp = useCallback(() => {
    setIsSignUp(true);
    setSignUpStep(1);
    setError('');
    setSuccess('');
  }, []);

  const setSignUpStepState = useCallback((step: number) => {
    setSignUpStep(step);
  }, []);

  const value: AuthModalContextValue = {
    isLoading,
    error,
    success,
    isSignUp,
    signUpStep,
    setError: setErrorState,
    setSuccess: setSuccessState,
    setLoading: setLoadingState,
    switchToSignIn,
    switchToSignUp,
    setSignUpStep: setSignUpStepState,
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
};

export const useAuthModalContext = (): AuthModalContextValue => {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModalContext must be used within an AuthModalProvider');
  }
  return context;
}; 