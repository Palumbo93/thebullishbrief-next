import { ERROR_MESSAGES } from './constants';

/**
 * Maps Supabase error messages and codes to user-friendly messages
 * This helps provide consistent, professional error messages in production
 */
export const mapAuthError = (error: any): string => {
  if (!error) return ERROR_MESSAGES.UNEXPECTED_ERROR;

  // Handle different error types
  const errorMessage = error.message || error.error || error.error_description || '';
  const errorCode = error.code || error.error_code || '';
  
  // Normalize error message to lowercase for better matching
  const normalizedMessage = errorMessage.toLowerCase();
  
  // Map specific Supabase error patterns to user-friendly messages
  
  // Rate limiting errors with dynamic seconds
  if (normalizedMessage.includes('rate limit') || 
      normalizedMessage.includes('too many requests') ||
      errorCode === 'too_many_requests' ||
      errorCode === 'over_email_send_rate_limit') {
    
    // Extract seconds from error message if available
    // Example: "For security purposes, you can only request this after 53 seconds."
    const secondsMatch = errorMessage.match(/(\d+)\s*seconds?/i);
    if (secondsMatch) {
      const seconds = parseInt(secondsMatch[1]);
      return `Too many attempts. Please wait ${seconds} seconds before trying again.`;
    }
    
    return ERROR_MESSAGES.TOO_MANY_REQUESTS;
  }
  
  // Email/User existence errors - enhanced for sign-in context
  if (normalizedMessage.includes('user not found') ||
      normalizedMessage.includes('invalid login credentials') ||
      normalizedMessage.includes('no user found') ||
      normalizedMessage.includes('user does not exist') ||
      normalizedMessage.includes('email not found') ||
      normalizedMessage.includes('signup is disabled') ||
      normalizedMessage.includes('signups not allowed for otp') ||
      normalizedMessage.includes('unable to validate email address') ||
      normalizedMessage.includes('email is not registered') ||
      errorCode === 'invalid_credentials' ||
      errorCode === 'user_not_found' ||
      errorCode === 'signup_disabled') {
    return ERROR_MESSAGES.USER_NOT_FOUND;
  }
  
  if (normalizedMessage.includes('user already registered') ||
      normalizedMessage.includes('user already exists') ||
      normalizedMessage.includes('email address already in use') ||
      normalizedMessage.includes('already registered') ||
      normalizedMessage.includes('email already exists') ||
      normalizedMessage.includes('email address is already registered') ||
      errorCode === 'user_already_exists') {
    return ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED;
  }
  
  // OTP related errors
  if (normalizedMessage.includes('invalid otp') ||
      normalizedMessage.includes('invalid token') ||
      normalizedMessage.includes('token has expired') ||
      normalizedMessage.includes('otp expired') ||
      errorCode === 'otp_expired') {
    return ERROR_MESSAGES.EXPIRED_OTP;
  }
  
  if (normalizedMessage.includes('invalid otp') ||
      normalizedMessage.includes('invalid verification code') ||
      errorCode === 'invalid_otp') {
    return ERROR_MESSAGES.INVALID_OTP;
  }
  
  // Email confirmation errors
  if (normalizedMessage.includes('email not confirmed') ||
      normalizedMessage.includes('confirm your email') ||
      errorCode === 'email_not_confirmed') {
    return ERROR_MESSAGES.EMAIL_NOT_CONFIRMED;
  }
  
  // Network and connectivity errors
  if (normalizedMessage.includes('network error') ||
      normalizedMessage.includes('fetch') ||
      normalizedMessage.includes('connection') ||
      errorCode === 'network_error') {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  
  // Service availability errors
  if (normalizedMessage.includes('service unavailable') ||
      normalizedMessage.includes('internal server error') ||
      normalizedMessage.includes('temporarily unavailable') ||
      errorCode === 'service_unavailable' ||
      error.status >= 500) {
    return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
  }
  
  // Authentication service errors
  if (normalizedMessage.includes('database error') ||
      normalizedMessage.includes('supabase') ||
      normalizedMessage.includes('auth error') ||
      normalizedMessage.includes('duplicate key value violates unique constraint') ||
      normalizedMessage.includes('user_profiles_pkey')) {
    return ERROR_MESSAGES.SIGNUP_FAILED;
  }
  
  // Invalid email format (though this should be caught by client validation)
  if (normalizedMessage.includes('invalid email') ||
      normalizedMessage.includes('email format') ||
      errorCode === 'invalid_email') {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  
  // Signup specific errors
  if (normalizedMessage.includes('signup') && 
      (normalizedMessage.includes('failed') || normalizedMessage.includes('error'))) {
    return ERROR_MESSAGES.SIGNUP_FAILED;
  }
  
  // Signin specific errors
  if (normalizedMessage.includes('signin') && 
      (normalizedMessage.includes('failed') || normalizedMessage.includes('error'))) {
    return ERROR_MESSAGES.SIGNIN_FAILED;
  }
  
  // OTP sending errors - but check for user existence issues first
  if (normalizedMessage.includes('failed to send otp') ||
      normalizedMessage.includes('email sending failed') ||
      normalizedMessage.includes('unable to send otp') ||
      normalizedMessage.includes('failed to send email') ||
      normalizedMessage.includes('otp delivery failed')) {
    return ERROR_MESSAGES.OTP_SEND_FAILED;
  }
  
  // Generic "failed to send" could be user not found in sign-in context
  // This will be handled by contextual mapping
  
  // Default fallback for unhandled errors
  console.warn('Unhandled auth error:', { 
    error, 
    errorMessage, 
    errorCode,
    fullError: JSON.stringify(error, null, 2)
  });
  return ERROR_MESSAGES.UNEXPECTED_ERROR;
};

/**
 * Enhanced error mapping that includes context-specific error handling
 */
export const mapContextualAuthError = (error: any, context: 'signin' | 'signup' | 'otp_send' | 'otp_verify'): string => {
  if (!error) return ERROR_MESSAGES.UNEXPECTED_ERROR;
  
  // Handle rate limiting with dynamic seconds first
  const errorMessage = error.message || error.error || error.error_description || '';
  const errorCode = error.code || error.error_code || '';
  const normalizedMessage = errorMessage.toLowerCase();
  
  if (normalizedMessage.includes('rate limit') || 
      normalizedMessage.includes('too many requests') ||
      errorCode === 'too_many_requests' ||
      errorCode === 'over_email_send_rate_limit') {
    
    // Extract seconds from error message if available
    const secondsMatch = errorMessage.match(/(\d+)\s*seconds?/i);
    if (secondsMatch) {
      const seconds = parseInt(secondsMatch[1]);
      return `Too many attempts. Please wait ${seconds} seconds before trying again.`;
    }
    
    return ERROR_MESSAGES.TOO_MANY_REQUESTS;
  }
  
  const baseError = mapAuthError(error);
  
  // If we got a specific mapped error, return it
  if (baseError !== ERROR_MESSAGES.UNEXPECTED_ERROR) {
    return baseError;
  }
  
  // Enhanced context-specific handling for common scenarios
  
  // Handle context-specific fallbacks with enhanced logic
  switch (context) {
    case 'signin':
      // For sign-in context, when shouldCreateUser: false is used,
      // certain generic errors typically indicate user doesn't exist
      if (normalizedMessage.includes('failed to send') ||
          normalizedMessage.includes('unable to send') ||
          normalizedMessage.includes('email not') ||
          normalizedMessage.includes('no user') ||
          normalizedMessage.includes('user not') ||
          normalizedMessage.includes('invalid email') ||
          normalizedMessage.includes('otp failed') ||
          normalizedMessage.includes('send failed') ||
          normalizedMessage.includes('email failed') ||
          normalizedMessage.includes('signups not allowed for otp') ||
          normalizedMessage === 'failed to send verification code' ||
          normalizedMessage === '' || // Empty error message
          errorMessage === 'Failed to send verification code. Please try again') {
        return ERROR_MESSAGES.USER_NOT_FOUND;
      }
      return ERROR_MESSAGES.SIGNIN_FAILED;
      
    case 'signup':
      // For sign-up context, when shouldCreateUser: true is used,
      // certain generic errors typically indicate user already exists
      if (normalizedMessage.includes('failed to send') ||
          normalizedMessage.includes('unable to send') ||
          normalizedMessage.includes('email already') ||
          normalizedMessage.includes('user already') ||
          normalizedMessage.includes('already registered') ||
          normalizedMessage.includes('already exists') ||
          normalizedMessage.includes('duplicate') ||
          normalizedMessage.includes('otp failed') ||
          normalizedMessage.includes('send failed') ||
          normalizedMessage.includes('email failed') ||
          normalizedMessage === 'failed to send verification code' ||
          normalizedMessage === '' || // Empty error message
          errorMessage === 'Failed to send verification code. Please try again') {
        return ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED;
      }
      return ERROR_MESSAGES.SIGNUP_FAILED;
      
    case 'otp_send':
      return ERROR_MESSAGES.OTP_SEND_FAILED;
    case 'otp_verify':
      return ERROR_MESSAGES.OTP_VERIFY_FAILED;
    default:
      return ERROR_MESSAGES.UNEXPECTED_ERROR;
  }
};

/**
 * Determines if an error is recoverable (user can retry) or needs different action
 */
export const isRecoverableError = (error: any): boolean => {
  const errorMessage = mapAuthError(error);
  
  // These errors suggest the user should try a different action rather than retry
  const nonRecoverableErrors = [
    ERROR_MESSAGES.EMAIL_ALREADY_REGISTERED,
    ERROR_MESSAGES.USER_NOT_FOUND,
    ERROR_MESSAGES.INVALID_EMAIL,
    ERROR_MESSAGES.EMAIL_NOT_CONFIRMED,
    ERROR_MESSAGES.TOO_MANY_REQUESTS,
  ] as const;
  
  // Also check for dynamic rate limiting messages
  if (errorMessage.includes('Please wait') && errorMessage.includes('seconds')) {
    return false;
  }
  
  return !nonRecoverableErrors.includes(errorMessage as any);
}; 