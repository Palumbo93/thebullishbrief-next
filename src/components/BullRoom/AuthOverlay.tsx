import React from 'react';
import { Lock, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';

interface AuthOverlayProps {
  onCreateAccountClick?: () => void;
}

export const AuthOverlay: React.FC<AuthOverlayProps> = ({ onCreateAccountClick }) => {
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.25)',
      backdropFilter: 'blur(1px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }}>
      <div style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-8)',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center',
        border: '0.5px solid var(--color-border-primary)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transform: 'translateX(-40px) translateY(-40px)'
      }}>
        {/* Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-6)',
          border: '0.5px solid var(--color-border-secondary)'
        }}>
          <Lock style={{ width: '24px', height: '24px', color: 'var(--color-brand-primary)' }} />
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-3)'
        }}>
          Join the Conversation
        </h2>

        {/* Description */}
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
          lineHeight: 'var(--leading-relaxed)',
          marginBottom: 'var(--space-6)'
        }}>
          Sign up to participate in real-time discussions with other traders and investors.
        </p>

        {/* CTA Button */}
        <Button
          onClick={onCreateAccountClick}
          variant="primary"
          size="lg"
          icon={MessageSquare}
          fullWidth
        >
          Create Account
        </Button>

        {/* Footer */}
        <p style={{
          color: 'var(--color-text-muted)',
          fontSize: 'var(--text-xs)',
          marginTop: 'var(--space-4)',
          marginBottom: 0
        }}>
          Free to join • No credit card required
        </p>
      </div>
    </div>
  );
}; 