import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { SignInModalProps } from '../types/auth.types';
import { FormField } from '../../ui';
import { AuthButton } from './AuthButton';
import { BrandingSection } from './BrandingSection';
import { useAuthForm } from '../hooks/useAuthForm';
import { useAuthSubmit } from '../hooks/useAuthSubmit';
import { FONT_URLS } from '../utils/constants';
import { ModalCloseButton } from '../../ModalCloseButton';
import { OTPVerificationModal } from './OTPVerificationModal';
import { useViewportHeightOnly } from '../../../hooks/useViewportHeight';
import { FULL_HEIGHT_BACKDROP_CSS, FULL_HEIGHT_DRAWER_CSS } from '../../../utils/viewportUtils';
import { BullLogo } from '../../ui/BullLogo';
import { TypeLogo } from '../../ui/TypeLogo';

export const SignInModal: React.FC<SignInModalProps> = ({
  onClose,
  onSwitchToSignUp,
  onSuccess,
}) => {
  const { formData, errors, handleChange, validateForm } = useAuthForm(false);
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
    
    const result = await handleSendOTP(formData.email, false);

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

  const handleSwitchToSignUp = () => {
    clearError();
    onSwitchToSignUp();
  };

  return (
    <>
      <style>{`
        .auth-modal-backdrop {
          ${FULL_HEIGHT_BACKDROP_CSS}
          background: var(--color-bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }
        .auth-modal-container {
          background: var(--color-bg-primary);
          width: 100vw;
          height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideUpIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        @keyframes slideUpIn {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .auth-modal-content {
          position: relative;
          padding: var(--space-16) var(--content-padding);
          display: flex;
          flex-direction: column;
          justify-content: center;
          height: 100%;
          width: 100%;
          overflow-y: auto;
        }
        
        .auth-title {
          font-size: var(--text-4xl);
          font-weight: var(--font-bold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-3);
          line-height: 1.2;
        }
        
        .auth-subtitle {
          font-size: var(--text-xl);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-12);
          line-height: 1.4;
        }
        
        .auth-form-section {
          max-width: var(--max-width);
          margin: 0 auto;
          width: 100%;
        }
        
        .auth-form-container {
          max-width: 480px;
          margin: 0 auto;
          width: 100%;
        }
        
        .switch-section {
          text-align: center;
          margin-top: var(--space-8);
          padding-top: var(--space-6);
          border-top: 1px solid var(--color-border-primary);
        }
        
        .switch-text {
          color: var(--color-text-tertiary);
          fontSize: var(--text-base);
          margin: 0;
          marginBottom: var(--space-3);
        }
        
        .switch-button {
          background: transparent;
          border: none;
          color: var(--color-primary);
          fontSize: var(--text-base);
          fontWeight: var(--font-semibold);
          cursor: pointer;
          padding: var(--space-2) var(--space-4);
          borderRadius: var(--radius-sm);
          transition: all var(--transition-base);
        }
        
        .switch-button:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
        }
        
        /* Mobile styles */
        @media (max-width: 768px) {
          .auth-modal-content {
            padding: var(--space-8) var(--content-padding);
          }
          
          .auth-title {
            font-size: var(--text-3xl);
          }
          
          .auth-subtitle {
            font-size: var(--text-lg);
            margin-bottom: var(--space-8);
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
          {/* Sign In Form Container */}
          <div className="auth-modal-content">
            {/* Close Button */}
            <ModalCloseButton onClose={onClose} showText={true} />

            <div className="auth-form-section">
              {/* Branding */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: 'var(--space-4)', 
                marginBottom: 'var(--space-8)' 
              }}>
                <BullLogo 
                  width={48}
                  height={48}
                  variant="auto"
                />
                <TypeLogo 
                  height={32}
                  width={200}
                />
              </div>

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to access your personalized market insights</p>
              </div>

              <div className="auth-form-container">
                {/* Sign In Form */}
                <form onSubmit={handleSubmit} id="signin-form" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-6)',
                  marginBottom: 'var(--space-8)'
                }}>
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

                  {/* Submit Button */}
                  <AuthButton
                    type="submit"
                    variant="primary"
                    disabled={isLoading}
                    loading={isLoading}
                  >
                    {isLoading ? 'Sending Code...' : 'Sign In'}
                  </AuthButton>
                </form>

                {/* Switch to Sign Up */}
                <div className="switch-section">
                  <p className="switch-text">
                    Don't have an account?
                  </p>
                  <button
                    type="button"
                    onClick={handleSwitchToSignUp}
                    className="switch-button"
                  >
                    Create New Account
                  </button>
                </div>
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
          isSignUp={false}
        />
      )}
    </>
  );
}; 