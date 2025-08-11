import { VALIDATION_RULES, ERROR_MESSAGES } from './constants';

export const validateEmail = (email: string): string => {
  if (!email.trim()) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  
  if (email.length > VALIDATION_RULES.MAX_EMAIL_LENGTH) {
    return ERROR_MESSAGES.EMAIL_TOO_LONG;
  }
  
  if (!VALIDATION_RULES.EMAIL_REGEX.test(email)) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  
  return '';
};

export const validatePassword = (password: string): string => {
  if (!password.trim()) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  
  if (password.length < VALIDATION_RULES.MIN_PASSWORD_LENGTH) {
    return ERROR_MESSAGES.PASSWORD_TOO_SHORT;
  }
  
  return '';
};

export const validateUsername = (username: string): string => {
  if (!username.trim()) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  
  if (username.length < 3 || !/^[a-zA-Z0-9_]+$/.test(username)) {
    return ERROR_MESSAGES.INVALID_USERNAME;
  }
  
  if (username.length > VALIDATION_RULES.MAX_NAME_LENGTH) {
    return ERROR_MESSAGES.NAME_TOO_LONG;
  }
  
  return '';
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string => {
  if (!confirmPassword.trim()) {
    return ERROR_MESSAGES.REQUIRED_FIELD;
  }
  
  if (password !== confirmPassword) {
    return ERROR_MESSAGES.PASSWORDS_DONT_MATCH;
  }
  
  return '';
};

export const validateSignUpForm = (formData: {
  username: string;
  email: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  const usernameError = validateUsername(formData.username);
  if (usernameError) errors.username = usernameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  return errors;
};

export const validateSignInForm = (formData: {
  email: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  return errors;
};

export const validateSignUpStep1 = (formData: {
  username: string;
  email: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};
  
  const usernameError = validateUsername(formData.username);
  if (usernameError) errors.username = usernameError;
  
  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;
  
  return errors;
};

export const isFormValid = (errors: Record<string, string>): boolean => {
  return Object.keys(errors).length === 0;
}; 