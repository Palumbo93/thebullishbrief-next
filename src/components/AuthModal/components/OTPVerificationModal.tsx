import React, { useState, useEffect } from 'react';
import { ArrowLeft, Mail } from 'lucide-react';
import { OTPVerificationModalProps } from '../types/auth.types';
import { AuthButton } from './AuthButton';
import { BrandingSection } from './BrandingSection';
import { useAuthSubmit } from '../hooks/useAuthSubmit';
import { useAuth } from '../../../contexts/AuthContext';
import { useTrackUserActions } from '../../../hooks/useDatafastAnalytics';
import { FONT_URLS } from '../utils/constants';
import { ModalCloseButton } from '../../ModalCloseButton';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../ui/input-otp';
import { useViewportHeightOnly } from '../../../hooks/useViewportHeight';
import { FULL_HEIGHT_BACKDROP_CSS, FULL_HEIGHT_DRAWER_CSS } from '../../../utils/viewportUtils';

export const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  onClose,
  onBack,
  onSuccess,
  email,
  username: _username,
  isSignUp = false,
}) => {
  const [otpValue, setOtpValue] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const { handleVerifyOTP, handleSendOTP, isLoading, error, success, clearError, clearSuccess } = useAuthSubmit();
  const { user } = useAuth();
  const { trackSignup, trackLogin } = useTrackUserActions();
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

  // Watch for successful authentication - when user becomes available
  useEffect(() => {
    
    if (user && !isLoading && !isFinishing) {
      
      // Set finishing state to show loading
      setIsFinishing(true);
      
      // Track analytics event
      if (isSignUp) {
        trackSignup('email', { email, username: _username });
      } else {
        trackLogin('email', { email });
      }
      
      // Call onSuccess immediately since auth state listener will handle the modal close
      onSuccess();
    }
  }, [user, isLoading, onSuccess, isSignUp, trackSignup, trackLogin, isFinishing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otpValue.length !== 6) {
      return;
    }

    clearError();
    clearSuccess();
    await handleVerifyOTP({
      email,
      token: otpValue,
      type: 'email',
    });
  };

  const handleResendCode = async () => {
    clearError();
    clearSuccess();
    
    // Re-send OTP
    await handleSendOTP(email, isSignUp, _username);
  };

  const handleBack = () => {
    clearError();
    clearSuccess();
    onBack();
  };

  return (
    <>
      <style>{`
        .auth-modal-backdrop {
          ${FULL_HEIGHT_BACKDROP_CSS}
          background: rgba(0, 0, 0, 0.65);
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
          max-height: 650px;
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
          {/* OTP Verification Form Container */}
          <div className="auth-modal-content">
            {/* Close Button */}
            <ModalCloseButton onClose={onClose} />

            {/* Branding Section */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <BrandingSection variant="signin" showFeatures={false} />
            </div>

            {/* Email Display */}
            <div style={{
              textAlign: 'center',
              marginBottom: 'var(--space-6)',
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-bg-primary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border-secondary)',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-2)',
              }}>
                <Mail style={{ width: '16px', height: '16px', color: 'var(--color-text-secondary)' }} />
                <span style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}>
                  Code sent to
                </span>
              </div>
              <div style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-medium)',
                color: 'var(--color-text-primary)',
              }}>
                {email}
              </div>
            </div>

            {/* OTP Verification Form */}
            <form onSubmit={handleSubmit} id="otp-form" style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-6)'
            }}>
              {/* OTP Input */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}>
                <div style={{
                  textAlign: 'center',
                  marginBottom: 'var(--space-2)',
                }}>
                  <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    marginBottom: 'var(--space-1)',
                  }}>
                    Enter verification code
                  </h3>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                  }}>
                    We've sent a 6-digit code to your email
                  </p>
                </div>

                {/* Input OTP Component */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-4)',
                }}>
                  <InputOTP
                    maxLength={6}
                    value={otpValue}
                    onChange={(value) => setOtpValue(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {/* Resend Code */}
              <div style={{
                textAlign: 'center',
                marginTop: 'var(--space-2)',
              }}>
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isLoading || isFinishing}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-tertiary)',
                    fontSize: 'var(--text-sm)',
                    cursor: (isLoading || isFinishing) ? 'not-allowed' : 'pointer',
                    transition: 'all var(--transition-base)',
                    opacity: (isLoading || isFinishing) ? 0.5 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && !isFinishing) {
                      e.currentTarget.style.color = 'var(--color-text-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && !isFinishing) {
                      e.currentTarget.style.color = 'var(--color-text-tertiary)';
                    }
                  }}
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </form>

            {/* Submit Button */}
            <div style={{ marginTop: 'var(--space-4)' }}>
              <AuthButton
                type="submit"
                form="otp-form"
                variant="primary"
                disabled={isLoading || isFinishing || otpValue.length !== 6}
                loading={isLoading || isFinishing}
              >
                {isFinishing ? 'Signing you in...' : isLoading ? 'Verifying...' : 'Verify Code'}
              </AuthButton>

              {/* Back Button */}
              <div style={{
                textAlign: 'center',
                marginTop: 'var(--space-4)',
              }}>
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--color-text-tertiary)',
                    fontSize: 'var(--text-sm)',
                    cursor: 'pointer',
                    padding: 'var(--space-1) var(--space-2)',
                    borderRadius: 'var(--radius-md)',
                    transition: 'all var(--transition-base)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    margin: '0 auto',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-tertiary)';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <ArrowLeft style={{ width: '14px', height: '14px' }} />
                  Back to {isSignUp ? 'Sign Up' : 'Sign In'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}; 