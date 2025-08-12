import React from 'react';
import { TrendingUp } from 'lucide-react';
import { BrandingSectionProps } from '../types/auth.types';
import { BRAND_COPY } from '../../../data/copy';

export const BrandingSection: React.FC<BrandingSectionProps> = ({
  variant,
  showFeatures = true,
}) => {
  const isSignUp = variant === 'signup';
  const logoSize = isSignUp ? 48 : 48;

  if (isSignUp) {
    // Signup branding - matching signin structure
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--space-3)',
      }}>
        {/* Brand Logo */}
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <img 
            src="/images/logo.png" 
            alt="The Bullish Brief" 
            style={{
              width: `${logoSize}px`,
              height: `${logoSize}px`,
              objectFit: 'contain',
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
              if (nextElement) {
                nextElement.style.display = 'flex';
              }
            }}
          />
          <div style={{
            display: 'none',
            width: `${logoSize}px`,
            height: `${logoSize}px`,
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <TrendingUp 
              style={{ 
                width: `${logoSize * 0.8}px`, 
                height: `${logoSize * 0.8}px`, 
                color: 'var(--color-brand-primary)' 
              }} 
            />
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              backgroundColor: 'var(--color-brand-primary)',
              borderRadius: 'var(--radius-full)',
              border: '2px solid var(--color-bg-secondary)',
            }} className="animate-pulse"></div>
          </div>
        </div>

        {/* Brand Title */}
        <h1 style={{
          fontFamily: 'var(--font-editorial)',
          fontSize: 'var(--text-xl)',
          fontWeight: 'var(--font-bold)',
          color: 'var(--color-text-primary)',
          margin: 0,
          lineHeight: 1.2,
        }}>
          The Bullish Brief
        </h1>

        {/* Subtitle */}
        <p style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--text-sm)',
          margin: 0,
          lineHeight: 1.4,
        }}>
          {BRAND_COPY.auth.signUp.title}
        </p>
      </div>
    );
  }

  // Minimal branding for signin
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      gap: 'var(--space-3)',
    }}>
      {/* Brand Logo */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <img 
          src="/images/logo.png" 
          alt="The Bullish Brief" 
          style={{
            width: `${logoSize}px`,
            height: `${logoSize}px`,
            objectFit: 'contain',
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
            if (nextElement) {
              nextElement.style.display = 'flex';
            }
          }}
        />
        <div style={{
          display: 'none',
          width: `${logoSize}px`,
          height: `${logoSize}px`,
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          <TrendingUp 
            style={{ 
              width: `${logoSize * 0.8}px`, 
              height: `${logoSize * 0.8}px`, 
              color: 'var(--color-brand-primary)' 
            }} 
          />
          <div style={{
            position: 'absolute',
            top: '-2px',
            right: '-2px',
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--color-brand-primary)',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--color-bg-secondary)',
          }} className="animate-pulse"></div>
        </div>
      </div>

      {/* Brand Title */}
      <h1 style={{
        fontFamily: 'var(--font-editorial)',
        fontSize: 'var(--text-xl)',
        fontWeight: 'var(--font-bold)',
        color: 'var(--color-text-primary)',
        margin: 0,
        lineHeight: 1.2,
      }}>
        The Bullish Brief
      </h1>

      {/* Subtitle */}
      <p style={{
        color: 'var(--color-text-secondary)',
        fontSize: 'var(--text-sm)',
        margin: 0,
        lineHeight: 1.4,
      }}>
        {BRAND_COPY.auth.signIn.welcome}
      </p>
    </div>
  );
}; 