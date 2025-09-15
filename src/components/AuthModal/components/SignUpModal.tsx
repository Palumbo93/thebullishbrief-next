import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
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
import { generateUsernameFromEmail } from '../../../utils/usernameGeneration';
import { BullLogo } from '../../ui/BullLogo';
import { TypeLogo } from '../../ui/TypeLogo';
import Link from 'next/link';

export const SignUpModal: React.FC<SignUpModalProps> = ({
  onClose,
  onSwitchToSignIn,
  onSuccess,
}) => {
  const { formData, errors, handleChange, validateForm, resetForm } = useAuthForm(true);
  const { handleSendOTP, isLoading, error, success, clearError, clearSuccess } = useAuthSubmit();
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [generatedUsername, setGeneratedUsername] = useState<string>('');
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

  // Track user sign-up attempt (email submitted, OTP sent)
  const trackSignUpAttempt = async (email: string, username: string) => {
    try {
      await supabase
        .from('emails')
        .insert({ 
          email,
          // You could add additional fields here if needed
          // username: username,
          // signup_step: 'email_submitted'
        });
    } catch (error) {
      console.error('Error tracking sign-up attempt:', error);
      // Don't block the process if tracking fails
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    clearError();
    clearSuccess();
    
    try {
      // Generate username from email
      const username = await generateUsernameFromEmail(formData.email);
      setGeneratedUsername(username);
      
      const result = await handleSendOTP(formData.email, true, username);
      
      // If OTP was sent successfully, track the sign-up attempt and show OTP verification
      if (result.success) {
        // Track successful email submission (OTP sent)
        await trackSignUpAttempt(formData.email, username);
        setShowOTPVerification(true);
      }
    } catch (error) {
      console.error('Error generating username:', error);
      // Fallback to email prefix if username generation fails
      const fallbackUsername = formData.email.split('@')[0];
      setGeneratedUsername(fallbackUsername);
      
      const result = await handleSendOTP(formData.email, true, fallbackUsername);
      
      if (result.success) {
        // Track successful email submission with fallback username
        await trackSignUpAttempt(formData.email, fallbackUsername);
        setShowOTPVerification(true);
      }
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
    setGeneratedUsername('');
    onSwitchToSignIn();
  };

  const handleClose = () => {
    resetForm();
    setGeneratedUsername('');
    onClose();
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
          margin-bottom: var(--space-8);
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
        
        .features-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-8);
          padding: var(--space-6);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-sm);
        }
        
        .feature-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: var(--text-base);
          color: var(--color-text-secondary);
        }
        
        .feature-check {
          color: var(--color-success);
          font-size: var(--text-sm);
          font-weight: bold;
          flex-shrink: 0;
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
        
        .terms-section {
          text-align: center;
          color: var(--color-text-tertiary);
          font-size: var(--text-sm);
          margin-top: var(--space-6);
        }
        
        .terms-link {
          color: var(--color-primary);
          text-decoration: underline;
          cursor: pointer;
          transition: all var(--transition-base);
        }
        
        .terms-link:hover {
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
            margin-bottom: var(--space-6);
          }
          
          .features-list {
            padding: var(--space-4);
          }
          
          .feature-item {
            font-size: var(--text-sm);
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
            <ModalCloseButton onClose={handleClose} showText={true} />

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
              <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
                <h1 className="auth-title">Join The Bullish Brief</h1>
                <p className="auth-subtitle">Get exclusive market insights delivered to your inbox</p>
              </div>

              <div className="auth-form-container">
                {/* Features List */}
                <div className="features-list">
                  {BRAND_COPY.auth.signUp.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-check">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Sign Up Form */}
                <form onSubmit={handleSubmit} id="signup-form" style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-6)',
                  marginBottom: 'var(--space-6)'
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
                    {isLoading ? 'Sending Code...' : 'Subscribe'}
                  </AuthButton>
                </form>

                {/* Terms */}
                <div className="terms-section">
                  <p style={{ margin: 0 }}>
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" target="_blank" rel="noopener noreferrer" className="terms-link">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" target="_blank" rel="noopener noreferrer" className="terms-link">
                      Privacy Policy
                    </Link>
                  </p>
                </div>

                {/* Switch to Sign In */}
                <div className="switch-section">
                  <p className="switch-text">
                    Already have an account?
                  </p>
                  <button
                    type="button"
                    onClick={handleSwitchToSignIn}
                    className="switch-button"
                  >
                    Sign In Instead
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
          username={generatedUsername}
          isSignUp={true}
        />
      )}
    </>
  );
}; 