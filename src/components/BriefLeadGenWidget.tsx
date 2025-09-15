"use client";

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmailSubmission } from '../hooks/useEmailSubmission';
import { submitToMailchimp } from '../services/mailchimp';
import { Brief } from '../lib/database.aliases';
import { FormField } from './ui/FormField';
import { Button } from './ui/Button';
import { getTickers } from '../utils/tickerUtils';
import { BRAND_COPY } from '../data/copy';
import { useIsMobile } from '../hooks/useIsMobile';

interface BriefLeadGenWidgetProps {
  brief: Brief;
  onEmailSubmitted?: (email: string, isAuthenticated: boolean) => void;
  onSignupClick?: () => void; // Triggers full auth modal (unauthenticated users only)
  compact?: boolean; // More compact layout for sidebar
  showTickers?: boolean; // Whether to show ticker chips (default: true)
}

interface PopupCopy {
  headline: string;
  subheadline: string;
  submitButton: string;
  thankYouMessage: string;
}

type WidgetState = 'form' | 'thank-you';

/**
 * BriefLeadGenWidget - Compact lead generation widget for action panel
 * 
 * Features:
 * - Always visible in action panel (no scroll trigger)
 * - Same email collection flow as popup
 * - Authenticated vs unauthenticated user flows
 * - Compact layout optimized for sidebar
 */
export const BriefLeadGenWidget: React.FC<BriefLeadGenWidgetProps> = ({
  brief,
  onEmailSubmitted,
  onSignupClick,
  compact = true,
  showTickers = true
}) => {
  const { user } = useAuth();
  const { submitEmail, submitAuthenticatedUser, isSubmitting, error } = useEmailSubmission();
  const isMobile = useIsMobile(); 
  const [currentState, setCurrentState] = useState<WidgetState>('form');
  const [emailInput, setEmailInput] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Get popup copy from brief or use defaults
  const defaultCopy: PopupCopy = {
    headline: `Get exclusive updates on ${brief.company_name || 'this company'}`,
    subheadline: 'Be the first to know about major developments',
    submitButton: 'Get Updates',
    thankYouMessage: `You'll receive updates about ${brief.company_name || 'this company'} directly in your inbox.`
  };

  const popupCopy = (brief.popup_copy && typeof brief.popup_copy === 'object' && !Array.isArray(brief.popup_copy) ? brief.popup_copy as unknown as PopupCopy : null) || defaultCopy;

  // Handle email submission for unauthenticated users
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!emailInput.trim()) {
      setSubmitError('Please enter your email address');
      return;
    }

    const result = await submitEmail(emailInput, brief.id, isMobile ? 'mobile_widget' : 'desktop_widget', false);
    
    if (result.success) {
      // Submit directly to Mailchimp using the form data we already have
      if (brief.mailchimp_audience_tag) {
        submitToMailchimp({
          email: emailInput,
          audienceTag: brief.mailchimp_audience_tag
        }).catch(() => {
          // Silent fail - don't interrupt user experience
        });
      }
      
      setCurrentState('thank-you');
      onEmailSubmitted?.(emailInput, false);
    } else {
      setSubmitError(result.error || 'Failed to submit email');
    }
  };

  // Handle one-click signup for authenticated users
  const handleAuthenticatedSignup = async () => {
    setSubmitError(null);

    const result = await submitAuthenticatedUser(brief.id, isMobile ? 'mobile_widget' : 'desktop_widget', false);
    
    if (result.success) {
      // Submit directly to Mailchimp using the user's email
      if (brief.mailchimp_audience_tag && user?.email) {
        submitToMailchimp({
          email: user.email,
          audienceTag: brief.mailchimp_audience_tag
        }).catch(() => {
          // Silent fail - don't interrupt user experience
        });
      }
      
      setCurrentState('thank-you');
      onEmailSubmitted?.(user?.email || '', true);
    } else {
      setSubmitError(result.error || 'Failed to subscribe');
    }
  };

  const containerStyle = {
    padding: compact ? 'var(--space-8)' : 'var(--space-8)',
    // backgroundColor: 'var(--color-bg-secondary)',
    borderRadius: 'var(--radius-sm)',
  };

  // Render content based on current state
  const renderContent = () => {
    if (currentState === 'thank-you') {
      const isAuthenticatedThankYou = user !== null;
      return (
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: compact ? '32px' : '40px',
            height: compact ? '32px' : '40px',
            backgroundColor: 'var(--color-success)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: `0 auto ${compact ? 'var(--space-2)' : 'var(--space-3)'}`,
            color: 'white'
          }}>
            <Check size={compact ? 16 : 20} />
          </div>

          <h3 style={{
            fontSize: compact ? 'var(--text-base)' : 'var(--text-lg)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)'
          }}>
            {isAuthenticatedThankYou ? "You're all signed up!" : "Thank you for subscribing!"}
          </h3>
          
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            lineHeight: 1.4,
            marginBottom: isAuthenticatedThankYou ? 0 : 'var(--space-3)'
          }}>
            {isAuthenticatedThankYou 
              ? `You'll receive updates about ${brief.company_name || 'this company'} at your registered email.`
              : popupCopy.thankYouMessage
            }
          </p>

          {!isAuthenticatedThankYou && (
            <>
              <div style={{
                paddingTop: 'var(--space-3)',
                borderTop: '0.5px solid var(--color-border-primary)',
                marginTop: 'var(--space-3)'
              }}>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)',
                  fontWeight: 'var(--font-medium)'
                }}>
                  Next, consider signing up for The Bullish Brief:
                </p>

                {/* Features List */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-1)',
                  marginBottom: 'var(--space-3)',
                  alignItems: 'center'
                }}>
                  {BRAND_COPY.auth.signUp.features.map((feature, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-secondary)'
                    }}>
                      <span style={{ color: 'var(--color-success)', fontSize: '10px', fontWeight: 'bold' }}>✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => {
                    onSignupClick?.();
                  }}
                  variant="primary"
                  size="sm"
                  fullWidth={true}
                >
                  Subscribe to the Bullish Brief
                </Button>
              </div>
            </>
          )}
        </div>
      );
    }

    // Form state
    if (user) {
      // Authenticated user: one-click signup
      return (
        <div>
          {/* Company tickers */}
          {showTickers && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-3)'
            }}>
              {brief.tickers && (() => {
                const tickers = getTickers(brief.tickers);
                return tickers && tickers.length > 0 ? (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-1)',
                    justifyContent: 'center'
                  }}>
                    {tickers.map((ticker, index) => (
                      <span
                        key={`${ticker.exchange}-${ticker.symbol}`}
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-secondary)',
                          fontWeight: 'var(--font-bold)',
                          fontFamily: 'monospace',
                          letterSpacing: '0.05em',
                          padding: '2px 6px',
                          backgroundColor: 'var(--color-bg-tertiary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '0.5px solid var(--color-border-primary)'
                        }}
                      >
                        {ticker.exchange}:{ticker.symbol}
                      </span>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <h3 style={{
            fontSize: compact ? 'var(--text-sm)' : 'var(--text-base)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
            lineHeight: 1.3,
            textAlign: 'center'
          }}>
            {popupCopy.headline}
          </h3>
          
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-3)',
            lineHeight: 1.4,
            textAlign: 'center'
          }}>
            {popupCopy.subheadline}
          </p>

          <div style={{
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-full)',
            border: '0.5px solid var(--color-border-primary)',
            marginBottom: 'var(--space-3)',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-1)'
            }}>
              Updates will be sent to:
            </p>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              fontWeight: 'var(--font-medium)',
              margin: 0
            }}>
              {user.email}
            </p>
          </div>

          {(submitError || error) && (
            <p style={{
              color: 'var(--color-danger)',
              fontSize: 'var(--text-sm)',
              marginBottom: 'var(--space-3)',
              textAlign: 'center',
              padding: 'var(--space-2)',
              backgroundColor: 'rgba(var(--color-danger-rgb), 0.1)',
              borderRadius: 'var(--radius-md)',
              border: '0.5px solid rgba(var(--color-danger-rgb), 0.2)'
            }}>
              {submitError || error}
            </p>
          )}

          <Button
            onClick={handleAuthenticatedSignup}
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="primary"
            size={compact ? "sm" : "base"}
            fullWidth={true}
          >
            Sign Me Up
          </Button>
        </div>
      );
    } else {
      // Unauthenticated user: email form
      return (
        <form onSubmit={handleEmailSubmit}>
          {/* Company tickers */}
          {showTickers && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-3)'
            }}>
              {brief.tickers && (() => {
                const tickers = getTickers(brief.tickers);
                return tickers && tickers.length > 0 ? (
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--space-1)',
                    justifyContent: 'center'
                  }}>
                    {tickers.map((ticker, index) => (
                      <span
                        key={`${ticker.exchange}-${ticker.symbol}`}
                        style={{
                          fontSize: 'var(--text-sm)',
                          color: 'var(--color-text-secondary)',
                          fontWeight: 'var(--font-bold)',
                          fontFamily: 'monospace',
                          letterSpacing: '0.05em',
                          padding: '2px 6px',
                          backgroundColor: 'var(--color-bg-tertiary)',
                          borderRadius: 'var(--radius-sm)',
                          border: '0.5px solid var(--color-border-primary)'
                        }}
                      >
                        {ticker.exchange}:{ticker.symbol}
                      </span>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
          )}

          <h3 style={{
            fontSize: compact ? 'var(--text-sm)' : 'var(--text-base)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
            lineHeight: 1.3,
            textAlign: 'center'
          }}>
            {popupCopy.headline}
          </h3>
          
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-3)',
            lineHeight: 1.4,
            textAlign: 'center'
          }}>
            {popupCopy.subheadline}
          </p>

          <div style={{ marginBottom: 'var(--space-3)' }}>
            <FormField
              type="email"
              label="Email Address"
              value={emailInput}
              onChange={setEmailInput}
              required
              disabled={isSubmitting}
              error={submitError || error || undefined}
              style={{
                fontSize: compact ? 'var(--text-sm)' : 'var(--text-base)'
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="primary"
            size={compact ? "sm" : "base"}
            fullWidth={true}
          >
            {popupCopy.submitButton}
          </Button>
        </form>
      );
    }
  };

  return (
    <div style={containerStyle}>
      {renderContent()}
    </div>
  );
};

export default BriefLeadGenWidget;
