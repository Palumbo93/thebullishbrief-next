/**
 * Cookie Consent Banner Component
 * Displays initial consent request to users from EEA/UK/CH
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useConsent } from '../../contexts/ConsentContext';
import { Button } from '../ui/Button';

export const ConsentBanner: React.FC = () => {
  const { 
    shouldShowBanner, 
    acceptAll, 
    rejectAll, 
    showConsentModal,
    consentRequired 
  } = useConsent();

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Don't show banner if consent not required or already hidden
  if (!consentRequired || !shouldShowBanner) {
    return null;
  }

  return (
    <div 
      className="animate-slide-in"
      style={{
        position: 'fixed',
        bottom: 'var(--space-6)',
        right: 'var(--space-6)',
        zIndex: 'var(--z-modal)',
        width: '600px',
        maxWidth: 'calc(100vw - var(--space-8))',
      }}
    >
      <div 
        className="backdrop-blur-sm"
        style={{
          background: 'var(--color-bg-card)',
          borderRadius: 'var(--radius-2xl)',
          border: '0.5px solid var(--color-border-primary)',
          padding: 'var(--space-6)',
          boxShadow: 'var(--shadow-xl)',
          transition: 'all var(--transition-base)'
        }}
      >
        {/* Header */}
        <p 
          style={{
            fontFamily: 'var(--font-editorial)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-normal)',
            lineHeight: 'var(--leading-tight)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-6)',
          }}
        >
          Cookie Preferences
        </p>

        {/* Message */}
        <p 
          style={{
            fontSize: 'var(--text-sm)',
            lineHeight: 'var(--leading-normal)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-2)'
          }}
        >
          We use cookies to enhance your experience, analyze site usage, and deliver personalized content. Your privacy matters to us.
        </p>

        {/* Learn More Link */}
        <a
          href="/cookies"
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            textDecoration: 'underline',
            textUnderlineOffset: '1px',
            transition: 'color var(--transition-base)',
            marginBottom: 'var(--space-5)',
            display: 'block'
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

        {/* Actions */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? 'var(--space-2)' : 'var(--space-3)',
          justifyContent: isMobile ? 'stretch' : 'space-between'
        }}>
          {/* Mobile: Accept button first, Desktop: Accept button on left */}
          <Button
            onClick={acceptAll}
            variant="primary"
            size="sm"
            fullWidth={isMobile ? true : false}
            style={{
              minWidth: isMobile ? 'auto' : '100px',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              order: isMobile ? 1 : 1
            }}
          >
            Accept
          </Button>

          {/* Button group for Customize and Decline */}
          <div style={{ 
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 'var(--space-2)',
            order: isMobile ? 2 : 2
          }}>
            <Button
              onClick={showConsentModal}
              variant="secondary"
              size="sm"
              fullWidth={isMobile ? true : false}
              style={{
                minWidth: isMobile ? 'auto' : '100px',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)'
              }}
            >
              Customize
            </Button>

            <Button
              onClick={rejectAll}
              variant="secondary"
              size="sm"
              fullWidth={isMobile ? true : false}
              style={{
                minWidth: isMobile ? 'auto' : '80px',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)'
              }}
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 640px) {
          div[style*="width: 400px"] {
            width: calc(100vw - var(--space-4)) !important;
            bottom: var(--space-4) !important;
            right: var(--space-2) !important;
            left: var(--space-2) !important;
          }
        }
      `}</style>
    </div>
  );
};
