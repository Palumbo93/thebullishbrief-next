/**
 * Cookie Consent Modal Component
 * Provides detailed consent management interface
 */

'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useConsent } from '../../contexts/ConsentContext';
import { CONSENT_CATEGORIES } from '../../types/consent';
import { Button } from '../ui/Button';
import { ModalCloseButton } from '../ModalCloseButton';
import { useViewportHeightOnly } from '../../hooks/useViewportHeight';
import { FULL_HEIGHT_BACKDROP_CSS, FULL_HEIGHT_DRAWER_CSS } from '../../utils/viewportUtils';

export const ConsentModal: React.FC = () => {
  const { 
    isModalVisible, 
    hideConsentModal, 
    consent, 
    updateConsent, 
    acceptAll, 
    rejectAll 
  } = useConsent();
  
  const viewportHeight = useViewportHeightOnly();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isModalVisible) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isModalVisible]);

  if (!isModalVisible) {
    return null;
  }

  return (
    <>
      <style>{`
        .consent-modal-backdrop {
          ${FULL_HEIGHT_BACKDROP_CSS}
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-12) var(--space-4);
          z-index: var(--z-modal);
        }
        .consent-modal-container {
          background: var(--color-bg-secondary);
          border: 0.5px solid var(--color-border-primary);
          border-radius: var(--radius-2xl);
          width: 100%;
          max-width: 580px;
          max-height: 85vh;
          position: relative;
          overflow: hidden;
          box-shadow: var(--shadow-xl);
          display: flex;
          flex-direction: column;
        }
        .consent-modal-content {
          position: relative;
          padding: var(--space-8);
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto;
        }
        
        /* Mobile styles */
        @media (max-width: 767px) {
          .consent-modal-backdrop {
            padding: 0;
            align-items: stretch;
            justify-content: stretch;
          }
          .consent-modal-container {
            ${FULL_HEIGHT_DRAWER_CSS}
            width: 100vw;
            max-width: none;
            max-height: none;
            border-radius: 0;
            border: none;
            box-shadow: none;
          }
          .consent-modal-content {
            padding: var(--space-6) var(--space-4);
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .consent-modal-content::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>
      
      <div 
        className="consent-modal-backdrop"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // Use JavaScript-calculated height as fallback for Safari
          height: `${viewportHeight}px`
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            hideConsentModal();
          }
        }}
      >
        <div className="consent-modal-container">
          <div className="consent-modal-content">
            {/* Close Button */}
            <ModalCloseButton onClose={hideConsentModal} />

            {/* Header */}
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <h2 
                style={{
                  fontFamily: 'var(--font-editorial)',
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 'var(--font-normal)',
                  lineHeight: 'var(--leading-tight)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-6)',
                }}
              >
                Privacy Preferences
              </h2>
              <p 
                style={{
                  fontSize: 'var(--text-sm)',
                  lineHeight: 'var(--leading-normal)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                Control how we use cookies to improve your experience and analyze site usage.
              </p>

              {/* Cookie Policy Link */}
              <a 
                href="/cookies" 
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '1px',
                  transition: 'color var(--transition-base)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--color-text-tertiary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                }}
              >
                Learn more about our cookie policy
              </a>
            </div>

            {/* Content */}
            <div style={{ 
              flex: 1,
              marginBottom: 'var(--space-6)'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-5)'
              }}>
                {CONSENT_CATEGORIES.map((category) => (
                  <div 
                    key={category.id} 
                    style={{
                      background: 'var(--color-bg-tertiary)',
                      border: '0.5px solid var(--color-border-primary)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-4)',
                      transition: 'all var(--transition-base)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 'var(--space-3)'
                    }}>
                      <div style={{ flex: 1 }}>
                        <h3 
                          style={{
                            fontSize: 'var(--text-base)',
                            fontWeight: 'var(--font-semibold)',
                            color: 'var(--color-text-primary)',
                            margin: 0,
                            marginBottom: 'var(--space-1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--space-2)'
                          }}
                        >
                          {category.name}
                          {category.required && (
                            <span 
                              style={{
                                fontSize: 'var(--text-xs)',
                                color: 'var(--color-text-muted)',
                                background: 'var(--color-bg-secondary)',
                                padding: 'var(--space-1) var(--space-2)',
                                borderRadius: 'var(--radius-sm)',
                                border: '0.5px solid var(--color-border-secondary)'
                              }}
                            >
                              Required
                            </span>
                          )}
                        </h3>
                        <p 
                          style={{
                            fontSize: 'var(--text-sm)',
                            color: 'var(--color-text-secondary)',
                            lineHeight: 'var(--leading-normal)',
                            margin: 0
                          }}
                        >
                          {category.description}
                        </p>
                      </div>
                      
                      <div style={{ marginTop: 'var(--space-1)' }}>
                        <label style={{
                          position: 'relative',
                          display: 'inline-flex',
                          alignItems: 'center',
                          cursor: category.required ? 'not-allowed' : 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={consent[category.id]}
                            disabled={category.required}
                            onChange={(e) => updateConsent(category.id, e.target.checked)}
                            style={{ display: 'none' }}
                          />
                          <div 
                            style={{
                              position: 'relative',
                              width: '44px',
                              height: '24px',
                              borderRadius: 'var(--radius-full)',
                              transition: 'all var(--transition-base)',
                              background: category.required 
                                ? 'var(--color-border-secondary)' 
                                : consent[category.id] 
                                  ? 'var(--color-text-primary)' 
                                  : 'var(--color-border-secondary)'
                            }}
                          >
                            <div 
                              style={{
                                position: 'absolute',
                                top: '2px',
                                left: '2px',
                                background: 'var(--color-bg-primary)',
                                border: category.required ? 'none' : '0.5px solid var(--color-border-primary)',
                                borderRadius: 'var(--radius-full)',
                                height: '20px',
                                width: '20px',
                                transition: 'transform var(--transition-base)',
                                transform: consent[category.id] ? 'translateX(20px)' : 'translateX(0)'
                              }}
                            />
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Privacy note */}
              <div 
                style={{
                  marginTop: 'var(--space-6)',
                  padding: 'var(--space-4)',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '0.5px solid var(--color-border-primary)'
                }}
              >
                <h4 
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    marginBottom: 'var(--space-2)'
                  }}
                >
                  Your Privacy Matters
                </h4>
                <p 
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: 'var(--leading-normal)',
                    margin: 0
                  }}
                >
                  We use privacy-first analytics and never sell your personal data. You can change these preferences at any time from our privacy settings.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              borderTop: '0.5px solid var(--color-border-primary)',
              paddingTop: 'var(--space-5)',
              marginTop: 'auto'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)'
              }}>
                {/* Buttons Row */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 'var(--space-2)',
                  justifyContent: 'flex-end'
                }}>
                  <Button
                    onClick={rejectAll}
                    variant="secondary"
                    size="sm"
                    fullWidth={false}
                    style={{
                      minWidth: '100px',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)'
                    }}
                  >
                    Decline
                  </Button>
                  
                  <Button
                    onClick={acceptAll}
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    style={{
                      minWidth: '100px',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)'
                    }}
                  >
                    Accept All
                  </Button>
                  
                  <Button
                    onClick={hideConsentModal}
                    variant="primary"
                    size="sm"
                    fullWidth={false}
                    style={{
                      minWidth: '100px',
                      fontSize: 'var(--text-sm)',
                      fontWeight: 'var(--font-medium)'
                    }}
                  >
                    Use These Preferences
                  </Button>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
    </>
  );
};
