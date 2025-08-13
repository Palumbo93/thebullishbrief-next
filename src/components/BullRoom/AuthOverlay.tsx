import React, { useEffect } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '../ui/Button';

interface AuthOverlayProps {
  onCreateAccountClick?: () => void;
}

export const AuthOverlay: React.FC<AuthOverlayProps> = ({ onCreateAccountClick }) => {
  // Prevent scrolling when overlay is active
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(3px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50, // Higher than auth modal (1050) and modal overlay (2000)
      padding: 'var(--space-4)',
      overflow: 'hidden' // Prevent overlay from scrolling
    }}>
      <div style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-5)',
        maxWidth: '400px',
        width: '100%',
        maxHeight: 'calc(100vh - 120px)', // Ensure it fits in viewport
        textAlign: 'center',
        border: '0.5px solid var(--color-border-primary)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        overflow: 'hidden' // Prevent content from scrolling
      }}>
        {/* Icon */}
        <div style={{
          width: '48px',
          height: '48px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-4)',
          border: '0.5px solid var(--color-border-secondary)'
        }}>
          <Lock style={{ width: '18px', height: '18px', color: 'var(--color-brand-primary)' }} />
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 'var(--text-lg)',
          fontFamily: 'var(--font-editorial)',
          fontWeight: 'var(--font-normal)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-2)'
        }}>
          Join the Conversation
        </h2>

        {/* Description */}
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
          lineHeight: 'var(--leading-relaxed)',
          marginBottom: 'var(--space-4)'
        }}>
          Sign up to participate in real-time discussions with other traders and investors.
        </p>

        {/* CTA Button */}
        <Button
          onClick={onCreateAccountClick}
          variant="primary"
          size="lg"
          fullWidth
        >
          Create Account
        </Button>

        {/* Footer */}
        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-xs)',
          marginTop: 'var(--space-3)',
          marginBottom: 0
        }}>
          Free to join • No credit card required
        </p>
      </div>
    </div>
  );
}; 