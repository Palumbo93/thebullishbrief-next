import React from 'react';
import { Button } from './ui/Button';

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
  
  const features = [
    {
      title: 'Market Intelligence Articles & Briefings',
      subtitle: 'Daily insights and analysis from market experts'
    },
    {
      title: 'Bull Room Chats',
      subtitle: 'Real-time community discussions and insights'
    },
    {
      title: 'Prompt Vault',
      subtitle: 'Top notch AI prompts to get the most out of ChatGPT, Claude, and Perplexity'
    }
  ];
  
  return (
    <section style={{ 
      padding: 'clamp(2rem, 6vw, 3rem) 0', 
      background: 'var(--color-bg-primary)',
      backgroundImage: `
        radial-gradient(circle at 25% 25%, rgba(255,255,255,0.02) 1px, transparent 1px),
        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.02) 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px, 20px 20px',
      backgroundPosition: '0 0, 10px 10px',
      borderTop: '0.5px solid var(--color-border-primary)',
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
        
        {/* Brand Logo */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
        }}>
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
                width: '48px',
                height: '48px',
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
              width: '48px',
              height: '48px',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <svg 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  color: 'var(--color-brand-primary)' 
                }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
              </svg>
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
        </div>

        {/* Brand Title */}
        <div style={{
          marginBottom: 'var(--space-3)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-editorial)',
            fontSize: 'var(--text-xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            margin: 0,
            lineHeight: 1.2,
          }}>
            The Bullish Brief
          </h2>
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
                  background: 'var(--color-success)',
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
          onClick={onCreateAccountClick}
          variant="primary"
          size="lg"
          fullWidth={false}
        >
          {isPrimary ? 'Join Free Now' : 'Join Now'}
        </Button>
        
        {/* Divider and Continue Reading */}
        {isPrimary && (
          <div style={{
            marginTop: 'var(--space-6)',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
            }}>
              <div style={{
                width: '60px',
                height: '1px',
                background: 'var(--color-border-primary)',
              }} />
              <span style={{
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                opacity: 0.8,
              }}>
                or
              </span>
              <div style={{
                width: '60px',
                height: '1px',
                background: 'var(--color-border-primary)',
              }} />
            </div>
            <p style={{
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-medium)',
              margin: 0,
              opacity: 0.8,
            }}>
              Continue reading this Brief
            </p>
          </div>
        )}
      </div>
    </section>
  );
}; 