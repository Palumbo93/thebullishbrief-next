import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { SignUpModalProps } from '../types/auth.types';
import { FormField } from '../../ui';
import { AuthButton } from './AuthButton';
import { BrandingSection } from './BrandingSection';
import { useAuthForm } from '../hooks/useAuthForm';
import { useAuthSubmit } from '../hooks/useAuthSubmit';
import { FONT_URLS } from '../utils/constants';
import { ModalCloseButton } from '../../ModalCloseButton';
import { OTPVerificationModal } from './OTPVerificationModal';
import { supabase } from '../../../lib/supabase';
import { BRAND_COPY } from '../../../data/copy';
import { useViewportHeightOnly } from '../../../hooks/useViewportHeight';
import { FULL_HEIGHT_BACKDROP_CSS, FULL_HEIGHT_DRAWER_CSS } from '../../../utils/viewportUtils';

export const SignUpModal: React.FC<SignUpModalProps> = ({
  onClose,
  onSwitchToSignIn,
  onSuccess,
}) => {
  const { formData, errors, handleChange, validateForm, resetForm } = useAuthForm(true);
  const { handleSendOTP, isLoading, error, success, clearError, clearSuccess } = useAuthSubmit();
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const viewportHeight = useViewportHeightOnly();

  // Import Google Fonts for brand consistency
  useEffect(() => {
    if (!document.querySelector('link[href*="Crimson+Text"]')) {
      const link = document.createElement('link');
      link.href = FONT_URLS.CRIMSON_TEXT;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    clearError();
    clearSuccess();
    
    const result = await handleSendOTP(formData.email, true, formData.username);
    
    // If OTP was sent successfully, show OTP verification
    if (result.success) {
      setShowOTPVerification(true);
    }
  };

  const handleOTPSuccess = () => {
    onSuccess();
  };

  const handleOTPBack = () => {
    setShowOTPVerification(false);
    clearError();
    clearSuccess();
  };

  const handleSwitchToSignIn = () => {
    clearError();
    resetForm();
    onSwitchToSignIn();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <>
      <style>{`
        .auth-modal-backdrop {
          ${FULL_HEIGHT_BACKDROP_CSS}
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-12) var(--space-4);
        }
        .auth-modal-container {
          background: var(--color-bg-secondary);
          border: 0.5px solid var(--color-border-primary);
          border-radius: var(--radius-2xl);
          width: 100%;
          max-width: 420px;
          max-height: 780px;
          height: 100%;
          position: relative;
          overflow: hidden;
          box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.9);
          display: flex;
          flex-direction: column;
        }
        .auth-modal-content {
          position: relative;
          padding: var(--space-12) var(--space-8);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }
        
        /* Mobile styles */
        @media (max-width: 767px) {
          .auth-modal-backdrop {
            padding: 0;
            align-items: stretch;
            justify-content: stretch;
          }
          .auth-modal-container {
            ${FULL_HEIGHT_DRAWER_CSS}
            width: 100vw;
            max-width: none;
            max-height: none;
            border-radius: 0;
            border: none;
            box-shadow: none;
          }
          .auth-modal-content {
            padding: var(--space-6) var(--space-4);
            justify-content: center;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .auth-modal-content::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
      
      <div 
        className="auth-modal-backdrop"
        style={{
          // Use JavaScript-calculated height as fallback for Safari
          height: `${viewportHeight}px`
        }}
      >
        <div className="auth-modal-container">
          {/* Sign Up Form Container */}
          <div className="auth-modal-content">
            {/* Close Button */}
            <ModalCloseButton onClose={handleClose} />

            {/* Branding Section */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <BrandingSection variant="signup" showFeatures={true} />
            </div>

            {/* Features List */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-6)',
              alignItems: 'center'
            }}>
              {BRAND_COPY.auth.signUp.features.map((feature, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-secondary)'
                }}>
                  <span style={{ color: 'var(--color-success)', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} id="signup-form" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-5)'
            }}>
              {/* Form Fields */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)',
              }}>
                {/* Username Field */}
                <FormField
                  type="text"
                  label="Username"
                  value={formData.username}
                  onChange={(value) => handleChange('username', value)}
                  icon={User}
                  placeholder="Your username"
                  required
                  error={errors.username}
                />

                {/* Email Field */}
                <FormField
                  type="email"
                  label="Email Address"
                  value={formData.email}
                  onChange={(value) => handleChange('email', value)}
                  icon={Mail}
                  placeholder="your@email.com"
                  required
                  error={errors.email}
                />
              </div>

              {/* Terms */}
              <div style={{
                textAlign: 'center',
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--text-xs)',
              }}>
                <p style={{ margin: 0 }}>
                  By creating an account, you agree to our{' '}
                  <span style={{ color: 'var(--color-brand-primary)', textDecoration: 'underline', cursor: 'pointer' }}>
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span style={{ color: 'var(--color-brand-primary)', textDecoration: 'underline', cursor: 'pointer' }}>
                    Privacy Policy
                  </span>
                </p>
              </div>
            </form>

            {/* Submit Button */}
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <AuthButton
                type="submit"
                form="signup-form"
                variant="primary"
                disabled={isLoading}
                loading={isLoading}
              >
                {isLoading ? 'Sending Code...' : 'Send Code'}
              </AuthButton>

              {/* Switch to Sign In */}
              <div style={{
                textAlign: 'center',
                marginTop: 'var(--space-4)',
                paddingTop: 'var(--space-4)',
                borderTop: '1px solid var(--color-border-secondary)',
              }}>
                <p style={{
                  color: 'var(--color-text-tertiary)',
                  fontSize: 'var(--text-sm)',
                  margin: 0,
                  marginBottom: '0',
                }}>
                  Already have an account?
                </p>
                <button
                  type="button"
                  onClick={handleSwitchToSignIn}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-brand-primary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    cursor: 'pointer',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition-base)',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(0, 211, 114, 0.1)';
                    e.currentTarget.style.color = 'var(--color-brand-primary)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--color-brand-primary)';
                  }}
                >
                  Sign In Instead
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPVerification && (
        <OTPVerificationModal
          onClose={onClose}
          onBack={handleOTPBack}
          onSuccess={handleOTPSuccess}
          email={formData.email}
          username={formData.username}
          isSignUp={true}
        />
      )}
    </>
  );
}; 