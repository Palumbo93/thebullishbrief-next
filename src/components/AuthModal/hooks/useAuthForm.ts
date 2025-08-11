import { useState, useCallback } from 'react';
import { AuthFormData, UseAuthFormReturn } from '../types/auth.types';
import { validateSignInForm, validateSignUpForm, validateSignUpStep1, isFormValid } from '../utils/validation';

export const useAuthForm = (isSignUp: boolean = false): UseAuthFormReturn => {
  const [formData, setFormData] = useState<AuthFormData>({
    username: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const validateField = useCallback((field: string): string => {
    let error = '';

    switch (field) {
      case 'username':
        if (isSignUp && !formData.username.trim()) {
          error = 'Username is required';
        } else if (isSignUp && formData.username.length < 3) {
          error = 'Username must be at least 3 characters';
        }
        break;
      case 'email':
        if (!formData.email.trim()) {
          error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          error = 'Please enter a valid email address';
        }
        break;
    }

    return error;
  }, [formData, isSignUp]);

  const validateForm = useCallback((): boolean => {
    let newErrors: Record<string, string> = {};

    if (isSignUp) {
      newErrors = validateSignUpForm(formData);
    } else {
      newErrors = validateSignInForm({
        email: formData.email,
      });
    }

    setErrors(newErrors);
    return isFormValid(newErrors);
  }, [formData, isSignUp]);

  const validateSignUpStep1Form = useCallback((): boolean => {
    const newErrors = validateSignUpStep1({
      username: formData.username,
      email: formData.email,
    });
    
    setErrors(newErrors);
    return isFormValid(newErrors);
  }, [formData]);

  const resetForm = useCallback(() => {
    setFormData({
      username: '',
      email: '',
    });
    setErrors({});
  }, []);

  const isValid = Object.keys(errors).length === 0;

  return {
    formData,
    errors,
    isValid,
    handleChange,
    validateField,
    validateForm,
    validateSignUpStep1Form,
    resetForm,
  };
}; 