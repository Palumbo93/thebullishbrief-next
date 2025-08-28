"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import { useIsMobile } from '../hooks/useIsMobile';
import { useAuth } from '../contexts/AuthContext';
import { useEmailSubmission } from '../hooks/useEmailSubmission';
import { Brief } from '../lib/database.aliases';
import { BullLogo } from './ui/BullLogo';
import { FormField } from './ui/FormField';
import { Button } from './ui/Button';
import { getTickers } from '../utils/tickerUtils';
import { BRAND_COPY } from '../data/copy';
import { BrandingSection } from './AuthModal/components/BrandingSection';

interface BriefLeadGenPopupProps {
  brief: Brief;
  triggerScrollPercentage?: number;
  triggerScrollPixels?: number; // Alternative trigger by pixel distance (useful for mobile)
  showDelay?: number;
  onEmailSubmitted?: (email: string, isAuthenticated: boolean) => void;
  onSignupClick?: () => void; // Triggers full auth modal (unauthenticated users only)
  showOnDesktop?: boolean; // Enable desktop display (default: true)
  showOnMobile?: boolean; // Enable mobile display (default: true)
  onPopupViewed?: () => void;
}

interface PopupCopy {
  headline: string;
  subheadline: string;
  submitButton: string;
  thankYouMessage: string;
}

type PopupState = 'hidden' | 'email-form' | 'one-click-signup' | 'thank-you';

/**
 * BriefLeadGenPopup - Brief-specific lead generation popup for mobile and desktop
 * 
 * Features:
 * - Responsive design (mobile bottom slide-up, desktop centered modal)
 * - Brief-specific copy and Mailchimp integration
 * - Authenticated vs unauthenticated user flows
 * - Two-state flow: email collection → thank you + signup encouragement
 * - Scroll-based triggering with auto-hide
 */
export const BriefLeadGenPopup: React.FC<BriefLeadGenPopupProps> = ({
  brief,
  triggerScrollPercentage = 30,
  triggerScrollPixels, // Optional pixel-based trigger
  showDelay = 2000,
  onEmailSubmitted,
  onSignupClick,
  showOnDesktop = true,
  showOnMobile = true,
  onPopupViewed
}) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { submitEmail, submitAuthenticatedUser, isSubmitting, error } = useEmailSubmission();
  
  const [currentState, setCurrentState] = useState<PopupState>('hidden');
  const [isAnimatingVisible, setIsAnimatingVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);
  const isVisibleRef = useRef(false);

  // Get popup copy from brief or use defaults
  const defaultCopy: PopupCopy = {
    headline: `Get exclusive updates on ${brief.company_name || 'this company'}`,
    subheadline: 'Be the first to know about major developments',
    submitButton: 'Get Updates',
    thankYouMessage: `You'll receive updates about ${brief.company_name || 'this company'} directly in your inbox.`
  };

  const popupCopy = (brief.popup_copy && typeof brief.popup_copy === 'object' && !Array.isArray(brief.popup_copy) ? brief.popup_copy as unknown as PopupCopy : null) || defaultCopy;

  // Update refs when state changes
  useEffect(() => {
    hasTriggeredRef.current = hasTriggered;
  }, [hasTriggered]);

  useEffect(() => {
    isVisibleRef.current = currentState !== 'hidden';
  }, [currentState]);



  // Device visibility check
  const shouldShowOnDevice = (isMobile && showOnMobile) || (!isMobile && showOnDesktop);

  // Scroll event handler
  useEffect(() => {
    if (!shouldShowOnDevice || isDismissed) {
      return;
    }

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // More reliable scroll calculation for mobile
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
          const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
          const documentHeight = Math.max(
            document.body.scrollHeight || 0,
            document.documentElement.scrollHeight || 0,
            document.body.offsetHeight || 0,
            document.documentElement.offsetHeight || 0,
            document.body.clientHeight || 0,
            document.documentElement.clientHeight || 0
          );
          
          const scrollableHeight = documentHeight - windowHeight;
          const scrollPercentage = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;



          // Check if popup should trigger (percentage OR pixel-based)
          const shouldTriggerByPercentage = scrollPercentage >= triggerScrollPercentage;
          const shouldTriggerByPixels = triggerScrollPixels ? scrollTop >= triggerScrollPixels : false;
          const shouldTrigger = shouldTriggerByPercentage || shouldTriggerByPixels;

          // Show popup after trigger condition is met
          if (shouldTrigger && !hasTriggeredRef.current && !isDismissed) {
            setHasTriggered(true);
            hasTriggeredRef.current = true;
            
            if (showTimeoutRef.current) {
              clearTimeout(showTimeoutRef.current);
            }
            
            const showPopup = () => {
              // Determine initial state based on authentication
              const initialState = user ? 'one-click-signup' : 'email-form';
              setCurrentState(initialState);
              
              // Lock body scroll when popup appears
              document.body.style.overflow = 'hidden';
              
              // Then: Trigger animation after a tiny delay to ensure DOM is ready
              animationTimeoutRef.current = setTimeout(() => {
                setIsAnimatingVisible(true);
                // Track popup view when it becomes visible to user
                onPopupViewed?.();
              }, 10);
            };
            
            if (showDelay === 0) {
              showPopup();
            } else {
              showTimeoutRef.current = setTimeout(showPopup, showDelay);
            }
          }

          // Note: Removed auto-hide on scroll - popup now only closes with close button or ESC

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
        animationTimeoutRef.current = null;
      }
    };
  }, [shouldShowOnDevice, isDismissed, triggerScrollPercentage, showDelay, user]);

  // Handle email submission for unauthenticated users
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!emailInput.trim()) {
      setSubmitError('Please enter your email address');
      return;
    }

    const result = await submitEmail(emailInput, brief.id);
    
    if (result.success) {
      setCurrentState('thank-you');
      onEmailSubmitted?.(emailInput, false);
    } else {
      setSubmitError(result.error || 'Failed to submit email');
    }
  };

  // Handle one-click signup for authenticated users
  const handleAuthenticatedSignup = async () => {
    setSubmitError(null);

    const result = await submitAuthenticatedUser(brief.id);
    
    if (result.success) {
      setCurrentState('thank-you');
      onEmailSubmitted?.(user?.email || '', true);
    } else {
      setSubmitError(result.error || 'Failed to subscribe');
    }
  };

  // Handle manual dismissal
  const handleDismiss = () => {
    setIsAnimatingVisible(false);
    // Restore body scroll
    document.body.style.overflow = '';
    // Hide from DOM after animation completes
    setTimeout(() => {
      setCurrentState('hidden');
      setIsDismissed(true);
    }, 400); // Match animation duration
  };

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && currentState !== 'hidden') {
        handleDismiss();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentState]);

  // Don't render if not visible or device not supported
  if (currentState === 'hidden' || !shouldShowOnDevice) {
    return null;
  }

  // Render content based on current state
  const renderContent = () => {
    switch (currentState) {
      case 'email-form':
        return (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile 
              ? '1fr' 
              : (brief.popup_featured_image || brief.featured_image_url)
                ? '0.85fr 1fr' 
                : '1fr',
            gridTemplateRows: isMobile 
              ? (brief.popup_featured_image || brief.featured_image_url) ? 'auto 1fr' : '1fr'
              : '1fr',
            height: '100%'
          }}>
            {/* Featured image - left side on desktop, top on mobile */}
            {(brief.popup_featured_image || brief.featured_image_url) && (
              <div style={{
                width: '100%',
                height: isMobile ? '200px' : '100%',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: isMobile 
                  ? 'var(--radius-sm) var(--radius-sm) 0 0'
                  : 'var(--radius-sm) 0 0 var(--radius-sm)'
              }}>
                <img
                  src={brief.popup_featured_image || brief.featured_image_url}
                  alt={`${brief.company_name || 'Company'} featured image`}
                  loading="eager"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
              </div>
            )}

            {/* Content section - right side on desktop, bottom on mobile */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              padding: 'var(--space-12) var(--space-8)',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              {/* Company branding section */}
              <div style={{
                flex: '0 0 auto',
                marginBottom: 'var(--space-4)'
              }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)'
              }}>
                <div>
                  {brief.tickers && (() => {
                    const tickers = getTickers(brief.tickers);
                    return tickers && tickers.length > 0 ? (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--space-2)',
                        justifyContent: 'center'
                      }}>
                        {tickers.map((ticker, index) => (
                          <span
                            key={`${ticker.exchange}-${ticker.symbol}`}
                            style={{
                              fontSize: 'var(--text-xs)',
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
              </div>

              <h2 style={{
                fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)',
                lineHeight: 1.3
              }}>
                {popupCopy.headline}
              </h2>

              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-4)',
                lineHeight: 1.5
              }}>
                {popupCopy.subheadline}
              </p>
              </div>

              {/* Form section */}
              <form onSubmit={handleEmailSubmit} style={{ 
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
              }}>
                <FormField
                  type="email"
                  label="Email Address"
                  value={emailInput}
                  onChange={setEmailInput}
                  required
                  disabled={isSubmitting}
                  error={submitError || error || undefined}
                />

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  variant="primary"
                  fullWidth={true}
                >
                  {popupCopy.submitButton}
                </Button>

                {/* Bullish Brief branding */}
                <div style={{
                  marginTop: 'var(--space-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  opacity: 0.7
                }}>
                  <BullLogo width={16} height={16} />
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-tertiary)',
                    fontWeight: 'var(--font-medium)'
                  }}>
                    Delivered by The Bullish Brief
                  </span>
                </div>
              </form>
            </div>
          </div>
        );

      case 'one-click-signup':
        return (
          <div style={{
         display: 'grid',
            gridTemplateColumns: isMobile 
              ? '1fr' 
              : (brief.popup_featured_image || brief.featured_image_url)
                ? '0.85fr 1fr' 
                : '1fr',
            gridTemplateRows: isMobile 
              ? (brief.popup_featured_image || brief.featured_image_url) ? 'auto 1fr' : '1fr'
              : '1fr',
            height: '100%'
          }}>
            {/* Featured image - left side on desktop, top on mobile */}
            {(brief.popup_featured_image || brief.featured_image_url) && (
              <div style={{
                width: '100%',
                height: isMobile ? '200px' : '100%',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: isMobile 
                  ? 'var(--radius-sm) var(--radius-sm) 0 0'
                  : 'var(--radius-sm) 0 0 var(--radius-sm)'
              }}>
                <img
                  src={brief.popup_featured_image || brief.featured_image_url}
                  alt={`${brief.company_name || 'Company'} featured image`}
                  loading="eager"
                  decoding="async"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'center'
                  }}
                />
              </div>
            )}

            {/* Content section - right side on desktop, bottom on mobile */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              padding: 'var(--space-12) var(--space-8)',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}>
              {/* Company branding section */}
              <div style={{
                flex: '0 0 auto',
                marginBottom: 'var(--space-4)'
              }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-4)'
              }}>
                <div>
                  {brief.tickers && (() => {
                    const tickers = getTickers(brief.tickers);
                    return tickers && tickers.length > 0 ? (
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 'var(--space-2)',
                        justifyContent: 'center'
                      }}>
                        {tickers.map((ticker, index) => (
                          <span
                            key={`${ticker.exchange}-${ticker.symbol}`}
                            style={{
                              fontSize: 'var(--text-xs)',
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
              </div>

              <h2 style={{
                fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)',
                lineHeight: 1.3
              }}>
                {popupCopy.headline}
              </h2>

              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--space-4)',
                lineHeight: 1.5
              }}>
                {popupCopy.subheadline}
              </p>

              <div style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius-full)',
                border: '0.5px solid var(--color-border-primary)',
                marginBottom: 'var(--space-4)',
                textAlign: 'center'
              }}>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Updates will be sent to:
                </p>
                <p style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 'var(--font-bold)',
                  margin: 0
                }}>
                  {user?.email}
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
              </div>

              {/* Button section */}
              <div style={{ 
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)'
              }}>
                <Button
                  onClick={handleAuthenticatedSignup}
                  disabled={isSubmitting}
                  loading={isSubmitting}
                  variant="primary"
                  fullWidth={true}
                >
                  Sign Me Up
                </Button>

                {/* Bullish Brief branding */}
                <div style={{
                  marginTop: 'var(--space-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 'var(--space-2)',
                  opacity: 0.7
                }}>
                  <BullLogo width={16} height={16} />
                  <span style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-tertiary)',
                    fontWeight: 'var(--font-medium)'
                  }}>
                    Delivered by Bullish Brief
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'thank-you':
        const isAuthenticatedThankYou = user !== null;
        return (
          <div style={{
            maxWidth: isMobile ? 'none' : '500px',
            margin: '0 auto',
            height: '100%'
          }}>
           
            {/* Content section - right side on desktop, bottom on mobile */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              padding: 'var(--space-12) var(--space-8)',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              height: '100%'
            }}>
              {/* Company branding section */}
              <div style={{
                flex: '0 0 auto',
                marginBottom: 'var(--space-4)',
              }}>
                     <div style={{
            width:'50px',
            height: '50px',
            backgroundColor: 'var(--color-success)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: `0 auto`,
            color: 'white',
            marginBottom: 'var(--space-3)'
          }}>
            <Check size={20} />
          </div>
                <h2 style={{
                  fontSize: isMobile ? 'var(--text-xl)' : 'var(--text-2xl)',
                  fontWeight: 'var(--font-bold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-3)',
                  lineHeight: 1.3
                }}>
                  {isAuthenticatedThankYou ? "You're all signed up!" : "Thank you for subscribing!"}
                </h2>

                <p style={{
                  fontSize: 'var(--text-base)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-4)',
                  lineHeight: 1.5
                }}>
                  {isAuthenticatedThankYou 
                    ? `You'll receive updates about this company at your registered email address.`
                    : popupCopy.thankYouMessage
                  }
                </p>
              </div>

              {/* Action section */}
              <div style={{ 
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
                paddingTop: 'var(--space-8)',
                borderTop: '0.5px solid var(--color-border-primary)'
              }}>
                {!isAuthenticatedThankYou && (
                  <>
                    <div style={{
                      textAlign: 'center'
                    }}>
                      
                      <p style={{
                        fontSize: 'var(--text-md)',
                        color: 'var(--color-text-primary)',
                        fontWeight: 'var(--font-bold)',
                        marginBottom: 'var(--space-3)',
                        lineHeight: 1.5
                      }}>
                        Next, consider signing up for The Bullish Brief:
                      </p>



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
                  fontSize: 'var(--text-sm)',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)'
                }}>
                  <span style={{ color: 'var(--color-success)', fontSize: '12px', fontWeight: 'bold' }}>✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

                      <Button
                        onClick={() => {
                          onSignupClick?.();
                          handleDismiss();
                        }}
                        variant="primary"
                        fullWidth={true}
                      >
                        Join the Bullish Brief
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      default:
    return null;
  }
  };

  return (
    <>
      {/* Backdrop with fade-in */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(4px)',
          zIndex: 9998,
          opacity: isAnimatingVisible ? 1 : 0,
          transition: 'opacity 0.3s ease-out'
        }}
      />
      
      {/* Popup - Responsive design */}
      <div
        style={{
          position: 'fixed',
          zIndex: 9999,
          transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          backgroundColor: 'var(--color-bg-secondary)',
          border: '0.5px solid var(--color-border-primary)',
          boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.4), 0 -2px 8px rgba(0, 0, 0, 0.1)',
          // Mobile: bottom slide-up
          ...(isMobile ? {
            bottom: 0,
            left: 0,
            right: 0,
            borderTopLeftRadius: 'var(--radius-sm)',
            borderTopRightRadius: 'var(--radius-sm)',
          maxHeight: '80vh',
          overflowY: 'auto',
          paddingBottom: 'env(safe-area-inset-bottom)',
            transform: isAnimatingVisible ? 'translateY(0)' : 'translateY(100%)',
          } : {
            // Desktop: centered modal - side-by-side layout
            top: '50%',
            left: '50%',
            transform: isAnimatingVisible 
              ? 'translate(-50%, -50%) translateY(0) scale(1)' 
              : 'translate(-50%, -50%) translateY(20px) scale(0.95)',
            borderRadius: 'var(--radius-sm)',
            width: '70vw',
            height: '70vh',
            maxWidth: '900px',
            maxHeight: '600px',
            overflowY: 'auto'
          }),
          opacity: isAnimatingVisible ? 1 : 0
        }}
      >
        {/* Relative wrapper for absolute positioning */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '100%'
        }}>
          {/* Close Button - Absolute relative to wrapper */}
          <div style={{
            position: 'absolute',
            top: 'var(--space-3)',
            right: 'var(--space-3)',
            zIndex: 10
          }}>
            <button
              onClick={handleDismiss}
              style={{
                background: 'rgba(0, 0, 0, 0.6)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(4px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
              }}
              aria-label="Close popup"
            >
              <X size={16} />
            </button>
          </div>

          {renderContent()}
        </div>
        
      </div>


    </>
  );
};

export default BriefLeadGenPopup;
