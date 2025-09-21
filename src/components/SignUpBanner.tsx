"use client";

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmailSubmission } from '../hooks/useEmailSubmission';
import { submitToMailchimp } from '../services/mailchimp';
import { FormField } from './ui/FormField';
import { Button } from './ui/Button';
import { BullLogo } from './ui/BullLogo';
import { useIsMobile } from '../hooks/useIsMobile';
import { SocialIcon } from 'react-social-icons';

interface SignUpBannerProps {
  variant?: 'home' | 'category';
  className?: string;
  onEmailSubmitted?: (email: string, isAuthenticated: boolean) => void;
}

type SignupState = 'form' | 'thank-you';

/**
 * SignUpBanner - General newsletter signup banner for home and category pages
 * 
 * Features:
 * - General newsletter signup (no audience tags)
 * - Email collection for unauthenticated users
 * - One-click signup for authenticated users
 * - Direct Mailchimp integration
 * - Inspired by The Rundown AI design
 */
export const SignUpBanner: React.FC<SignUpBannerProps> = ({
  variant = 'home',
  className = '',
  onEmailSubmitted
}) => {
  const { user } = useAuth();
  const { submitEmail, isSubmitting, error } = useEmailSubmission();
  const isMobile = useIsMobile();
  const [currentState, setCurrentState] = useState<SignupState>('form');
  const [emailInput, setEmailInput] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handle email submission for unauthenticated users
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!emailInput.trim()) {
      setSubmitError('Please enter your email address');
      return;
    }

    // Submit to our internal system (no briefId/authorId for general newsletter)
    const source = variant === 'home' ? 'newsletter_home' : 'newsletter_category';
    const result = await submitEmail(emailInput, '', source, false);
    
    if (result.success) {
      // Submit directly to Mailchimp for general list (no audience tag)
      try {
        await submitToMailchimp({
          email: emailInput
          // No audienceTag for general newsletter
        });
      } catch (mailchimpError) {
        // Silent fail for Mailchimp - don't interrupt user experience
        console.warn('Mailchimp submission failed:', mailchimpError);
      }
      
      setCurrentState('thank-you');
      onEmailSubmitted?.(emailInput, false);
    } else {
      setSubmitError(result.error || 'Failed to submit email');
    }
  };


  // Get content based on variant
  const getContent = () => {
    if (variant === 'home') {
      return {
        headline: "The Bullish Brief",
        subtitle: "Get the latest financial news and analysis delivered directly to your inbox. Gain actionable insights and stay ahead of the market.",
        ctaText: "Join Free"
      };
    } else {
      return {
        headline: "Stay Updated",
        subtitle: "Get the latest financial news and analysis delivered directly to your inbox.",
        ctaText: "Subscribe"
      };
    }
  };

  const content = getContent();

  // Don't show banner at all if user is authenticated
  if (user) {
    return null;
  }

  // Thank you state
  if (currentState === 'thank-you') {
    return (
      <div 
        className={className}
        style={{
          background: 'var(--color-bg-secondary)',
          borderBottom: '0.5px solid var(--color-border-primary)',
          padding: 'var(--space-8) var(--content-padding)',
        }}
      >
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'var(--color-success)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto var(--space-4)',
            color: 'white'
          }}>
            <Check size={24} />
          </div>

          <h2 style={{
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            Thank you for subscribing!
          </h2>
          
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.5,
            margin: 0
          }}>
            You'll receive The Bullish Brief directly in your inbox.
          </p>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div 
      className={className}
      style={{
        background: "var(--color-primary-dim-background)",
        borderBottom: '0.5px solid var(--color-border-primary)',
        padding: 'var(--space-8) var(--content-padding)',
      }}
    >
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        {/* Logo/Brand */}
        <div style={{
          width: '64px',
          height: '64px',
          backgroundColor: '#000000',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4)',
          padding: '8px'
        }}>
          <BullLogo 
            width={48} 
            height={48} 
            variant="light"
            priority={true}
          />
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-3)',
          fontFamily: 'var(--font-editorial)'
        }}>
          {content.headline}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: isMobile ? 'var(--text-sm)' : 'var(--text-base)',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.6,
          marginBottom: 'var(--space-6)',
          maxWidth: '500px',
          margin: '0 auto var(--space-6)'
        }}>
          {content.subtitle}
        </p>

        {/* Email form for unauthenticated users only */}
        <form onSubmit={handleEmailSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex',
            marginBottom: submitError || error ? 'var(--space-3)' : '0'
          }}>
            <div style={{ flex: 1 }}>
              <FormField
                type="email"
                label="Enter your email"
                value={emailInput}
                onChange={setEmailInput}
                required
                disabled={isSubmitting}
                placeholder="Enter your email"
                style={{
                  margin: 0,
                  borderRadius: '8px 0 0 8px'
                }}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              variant="primary"
              size="base"
              fullWidth={false}
              style={{
                borderRadius: '0 8px 8px 0',
                minWidth: '120px',
                whiteSpace: 'nowrap'
              }}
            >
              {content.ctaText}
            </Button>
          </div>

          {(submitError || error) && (
            <p style={{
              color: 'var(--color-danger)',
              fontSize: 'var(--text-sm)',
              textAlign: 'left',
              margin: 'var(--space-2) 0 0 0'
            }}>
              {submitError || error}
            </p>
          )}
        </form>

        {/* Social media links */}
        <div style={{
          marginTop: 'var(--space-6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-4)'
        }}>
          <span style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)'
          }}>
            Connect
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              opacity: 0.7,
              transition: 'opacity var(--transition-base)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}>
              <SocialIcon 
                url="https://x.com/thebullishbrief"
                network="x" 
                style={{ width: 32, height: 32 }} 
                fgColor="var(--color-text-muted)" 
                bgColor="transparent"
                target="_blank"
              />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              opacity: 0.7,
              transition: 'opacity var(--transition-base)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}>
              <SocialIcon 
                url="https://www.linkedin.com/company/the-bullish-brief/about/"
                network="linkedin" 
                style={{ width: 32, height: 32 }} 
                fgColor="var(--color-text-muted)" 
                bgColor="transparent"
                target="_blank"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpBanner;
