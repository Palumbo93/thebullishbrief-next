import { useState, useCallback } from 'react';
import { AuthCredentials, UseAuthSubmitReturn, OTPVerificationData } from '../types/auth.types';
import { useAuth } from '../../../contexts/AuthContext';
import { hasSupabaseCredentials } from '../../../lib/supabase';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants';
import { mapContextualAuthError, isRecoverableError } from '../utils/errorMapping';
import { useToast } from '../../../hooks/useToast';

export const useAuthSubmit = (): UseAuthSubmitReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signUp, signIn, sendOTP, verifyOTP } = useAuth();
  const toast = useToast();

  const handleSignIn = useCallback(async (credentials: AuthCredentials): Promise<void> => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Check if Supabase is connected
    if (!hasSupabaseCredentials) {
      setError(ERROR_MESSAGES.SUPABASE_NOT_CONNECTED);
      setIsLoading(false);
      return;
    }

    try {
      const { error: signInError } = await sendOTP(credentials.email, false);
      
      if (signInError) {
        const userFriendlyError = mapContextualAuthError(signInError, 'signin');
        setError(userFriendlyError);
        toast.error(userFriendlyError);
      } else {
        toast.success('Check your email for the verification code!');
      }
    } catch (err) {
      const userFriendlyError = mapContextualAuthError(err, 'signin');
      setError(userFriendlyError);
      toast.error(userFriendlyError);
    } finally {
      setIsLoading(false);
    }
  }, [sendOTP, toast]);

  const handleSignUp = useCallback(async (credentials: AuthCredentials): Promise<void> => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Check if Supabase is connected
    if (!hasSupabaseCredentials) {
      setError(ERROR_MESSAGES.SUPABASE_NOT_CONNECTED);
      toast.error(ERROR_MESSAGES.SUPABASE_NOT_CONNECTED);
      setIsLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await sendOTP(credentials.email, true);
      
      if (signUpError) {
        const userFriendlyError = mapContextualAuthError(signUpError, 'signup');
        setError(userFriendlyError);
        toast.error(userFriendlyError);
      } else {
        toast.success('Check your email for the verification code!');
      }
    } catch (err) {
      const userFriendlyError = mapContextualAuthError(err, 'signup');
      setError(userFriendlyError);
      toast.error(userFriendlyError);
    } finally {
      setIsLoading(false);
    }
  }, [sendOTP, toast]);

  const handleSendOTP = useCallback(async (email: string, isSignUp: boolean = false, username?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Check if Supabase is connected
    if (!hasSupabaseCredentials) {
      const errorMsg = ERROR_MESSAGES.SUPABASE_NOT_CONNECTED;
      setError(errorMsg);
      toast.error(errorMsg);
      setIsLoading(false);
      return { success: false, error: errorMsg };
    }

    try {
      const { error: otpError } = await sendOTP(email, isSignUp, username);
      
      if (otpError) {
        // Use context-specific error mapping based on whether this is sign-in or sign-up
        const context = isSignUp ? 'signup' : 'signin';
        const userFriendlyError = mapContextualAuthError(otpError, context);
        setError(userFriendlyError);
        toast.error(userFriendlyError);
        setIsLoading(false);
        return { success: false, error: userFriendlyError };
      } else {
        setSuccess('Check your email for the verification code!');
        toast.success('Check your email for the verification code!');
        setIsLoading(false);
        return { success: true };
      }
    } catch (err) {
      // Use context-specific error mapping based on whether this is sign-in or sign-up
      const context = isSignUp ? 'signup' : 'signin';
      const userFriendlyError = mapContextualAuthError(err, context);
      setError(userFriendlyError);
      toast.error(userFriendlyError);
      setIsLoading(false);
      return { success: false, error: userFriendlyError };
    }
  }, [sendOTP, toast]);

  const handleVerifyOTP = useCallback(async (data: OTPVerificationData): Promise<void> => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    // Check if Supabase is connected
    if (!hasSupabaseCredentials) {
      setError(ERROR_MESSAGES.SUPABASE_NOT_CONNECTED);
      toast.error(ERROR_MESSAGES.SUPABASE_NOT_CONNECTED);
      setIsLoading(false);
      return;
    }

    try {
      const { error: verifyError } = await verifyOTP(data.email, data.token);
      
      if (verifyError) {
        const userFriendlyError = mapContextualAuthError(verifyError, 'otp_verify');
        setError(userFriendlyError);
        toast.error(userFriendlyError);
      } else {
        toast.success('Successfully logged in');
      }
    } catch (err) {
      const userFriendlyError = mapContextualAuthError(err, 'otp_verify');
      setError(userFriendlyError);
      toast.error(userFriendlyError);
    } finally {
      setIsLoading(false);
    }
  }, [verifyOTP, toast]);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  const clearSuccess = useCallback(() => {
    setSuccess('');
  }, []);

  return {
    handleSignIn,
    handleSignUp,
    handleSendOTP,
    handleVerifyOTP,
    isLoading,
    error,
    success,
    clearError,
    clearSuccess,
  };
}; 