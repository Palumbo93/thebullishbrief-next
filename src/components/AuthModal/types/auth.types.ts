import { ReactNode } from 'react';

// Core authentication types
export interface AuthCredentials {
  email: string;
  username?: string;
}

export interface OTPVerificationData {
  email: string;
  token: string;
  type: 'email';
}

export interface AuthFormData {
  username?: string;
  email: string;
}

export interface AuthError {
  message: string;
  field?: string;
}

// Component prop interfaces
export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export interface SignInModalProps {
  onClose: () => void;
  onSwitchToSignUp: () => void;
  onSuccess: () => void;
}

export interface SignUpModalProps {
  onClose: () => void;
  onSwitchToSignIn: () => void;
  onSuccess: () => void;
}

export interface AuthModalContextValue {
  isLoading: boolean;
  error: string;
  success: string;
  isSignUp: boolean;
  signUpStep: number;
  setError: (error: string) => void;
  setSuccess: (success: string) => void;
  setLoading: (loading: boolean) => void;
  switchToSignIn: () => void;
  switchToSignUp: () => void;
  setSignUpStep: (step: number) => void;
}

export interface AuthFormProps {
  onSubmit: (credentials: AuthCredentials) => Promise<void>;
  onSwitchMode: () => void;
}



export interface ValidationMessageProps {
  type: 'error' | 'success' | 'warning' | 'info';
  message: string;
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export interface AuthButtonProps {
  children: ReactNode;
  type?: 'submit' | 'button';
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  icon?: React.ComponentType<{ style?: React.CSSProperties }>;
  form?: string;
}

export interface BrandingSectionProps {
  variant: 'signup' | 'signin';
  showFeatures?: boolean;
}

export interface SignUpFormData {
  username?: string;
  email: string;
}

export interface SignInFormData {
  email: string;
}

export interface UseAuthFormReturn {
  formData: AuthFormData;
  errors: Record<string, string>;
  isValid: boolean;
  handleChange: (field: string, value: string) => void;
  validateField: (field: string) => string;
  validateForm: () => boolean;
  validateSignUpStep1Form: () => boolean;
  resetForm: () => void;
}

export interface UseAuthSubmitReturn {
  handleSignIn: (credentials: AuthCredentials) => Promise<void>;
  handleSignUp: (credentials: AuthCredentials) => Promise<void>;
  handleSendOTP: (email: string, isSignUp?: boolean, username?: string) => Promise<{ success: boolean; error?: string }>;
  handleVerifyOTP: (data: OTPVerificationData) => Promise<void>;
  isLoading: boolean;
  error: string;
  success: string;
  clearError: () => void;
  clearSuccess: () => void;
}

export interface UseAuthModalReturn {
  isSignUp: boolean;
  signUpStep: number;
  showOTPVerification: boolean;
  showOnboarding: boolean;
  switchToSignIn: () => void;
  switchToSignUp: () => void;
  setSignUpStep: (step: number) => void;
  showOTPVerificationModal: () => void;
  hideOTPVerificationModal: () => void;
  showOnboardingModal: () => void;
  hideOnboardingModal: () => void;
}

export interface OTPState {
  email: string;
  username?: string;
  isSignUp: boolean;
  isVerifying: boolean;
}

export interface OTPVerificationModalProps {
  onClose: () => void;
  onBack: () => void;
  onSuccess: () => void;
  email: string;
  username?: string;
  isSignUp?: boolean;
} 