import React from 'react';
import { Button } from './ui/Button';
import { BullLogoImg } from './ui/BullLogo';
import { useTrackCTAInteractions } from '../hooks/useClarityAnalytics';
import { TypeLogo } from './ui/TypeLogo';

interface CTABannerProps {
  onCreateAccountClick?: () => void;
  variant?: 'primary' | 'secondary';
  position?: 'top' | 'bottom';
}

export const CTABanner: React.FC<CTABannerProps> = ({ 
  onCreateAccountClick, 
  variant = 'primary', 
  position = 'top' 
}) => {
  const isPrimary = variant === 'primary';
  const { trackCTAButtonClick } = useTrackCTAInteractions();
  
  const features = [
    {
      title: "Actionable Market Briefings",
      subtitle: "Each briefing delivers the signal early, with enough context to understand why it matters and how it could play out."
    },
    {
      title: "Early Ticker Calls",
      subtitle: "Clear, direct coverage that gives you a first look at opportunities others will only notice later."
    }
  ];
  
  
  
  
  
  return (
    <section style={{ 
      padding: 'clamp(2rem, 6vw, 3rem) 0', 
      background: 'var(--color-bg-secondary)',
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.02) 1px, transparent 1px),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.02) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px, 20px 20px',
      backgroundPosition: '0 0, 10px 10px',
      borderBottom: '0.5px solid var(--color-border-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      
      <div style={{
        padding: '0 var(--content-padding)',
        maxWidth: '1200px',
        margin: '0 auto',
        textAlign: 'center',
      }}>

        {/* Brand Title */}
        <div style={{
          marginBottom: 'var(--space-3)',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-4)', 
        }}>
          <BullLogoImg 
              width={48}
              height={48}
              alt="The Bullish Brief"
            />
         <TypeLogo
          height={32} 
          width={160}
          alt="The Bullish Brief"
         />
        </div>

        <div style={{
          color: 'var(--color-text-primary)',
          fontSize: 'clamp(1.5rem, 4vw, 2rem)',
          fontWeight: 800,
          marginBottom: '1rem',
          letterSpacing: '0.01em',
          textTransform: 'uppercase',
        }}>
          {isPrimary 
            ? 'Stay Ahead of the Market'
            : 'Stay Ahead of the Market'
          }
        </div>
        
        <div style={{
          color: 'var(--color-text-secondary)',
          fontSize: 'clamp(1rem, 2.5vw, 1.1rem)',
          fontWeight: 500,
          lineHeight: 1.6,
          marginBottom: '2rem',
          maxWidth: '600px',
          margin: '0 auto 2rem auto',
        }}>
          {isPrimary 
            ? 'Get access to the same intelligence that institutional investors use to make billion-dollar decisions.'
            : 'Get exclusive access to market analysis, early investment opportunities, and expert insights delivered daily.'
          }
        </div>

        {/* Features Grid */}
        {isPrimary && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            marginBottom: 'var(--space-6)',
            maxWidth: '500px',
            margin: '0 auto var(--space-6) auto',
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: 'var(--space-3)',
                background: 'var(--color-bg-card)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-lg)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-card-hover)';
                e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-card)';
                e.currentTarget.style.borderColor = 'var(--color-border-primary)';
              }}
              >
                {/* Checkbox */}
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <svg 
                    width="12" 
                    height="12" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    style={{ color: 'var(--color-bg-primary)' }}
                  >
                    <polyline points="20,6 9,17 4,12"></polyline>
                  </svg>
                </div>
                
                {/* Feature Text */}
                <div style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-1)',
                }}>
                  <span style={{
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    lineHeight: 1.4,
                    textAlign: 'left',
                  }}>
                    {feature.title}
                  </span>
                  <span style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-normal)',
                    lineHeight: 1.4,
                    textAlign: 'left',
                    opacity: 0.8,
                  }}>
                    {feature.subtitle}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Sign Up Button */}
        <Button
          onClick={async () => {
            const buttonText = isPrimary ? 'Subscribe Free' : 'Subscribe';
            
            // Track the CTA button click
            await trackCTAButtonClick('cta_banner', buttonText, {
              variant,
              position
            });
            
            // Call the original click handler
            onCreateAccountClick?.();
          }}
          variant="primary"
          size="lg"
          fullWidth={false}
        >
          {isPrimary ? 'Subscribe Free' : 'Subscribe'}
        </Button>
        
        
      </div>
    </section>
  );
}; 