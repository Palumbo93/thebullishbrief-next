import React from 'react';
import { Button } from './ui/Button';
import { BullLogoImg } from './ui/BullLogo';
import { useTrackCTAInteractions } from '../hooks/useClarityAnalytics';
import { TypeLogo } from './ui/TypeLogo';
import { TrendingUp, BarChart3, Users, Award } from 'lucide-react';
import { BRAND_COPY } from '../data/copy';

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
  
  const copy = isPrimary ? BRAND_COPY.ctaBanner.primary : BRAND_COPY.ctaBanner.secondary;
  
  const primaryFeatures = [
    {
      icon: TrendingUp,
      ...BRAND_COPY.ctaBanner.primary.features[0]
    },
    {
      icon: BarChart3,
      ...BRAND_COPY.ctaBanner.primary.features[1]
    }
  ];

  const secondaryFeatures = [
    {
      icon: Users,
      ...BRAND_COPY.ctaBanner.secondary.features[0]
    },
    {
      icon: Award,
      ...BRAND_COPY.ctaBanner.secondary.features[1]
    }
  ];
  
  const features = isPrimary ? primaryFeatures : secondaryFeatures;
  
  return (
    <section style={{ 
      padding: 'clamp(3rem, 6vw, 4rem) 0', 
      background: 'var(--color-bg-primary)',
      borderTop: '0.5px solid var(--color-border-primary)',
      borderBottom: '0.5px solid var(--color-border-primary)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      
      {/* Subtle background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          linear-gradient(90deg, var(--color-border-primary) 1px, transparent 1px),
          linear-gradient(var(--color-border-primary) 1px, transparent 1px)
        `,
        backgroundSize: '100px 100px, 100px 100px',
        opacity: 0.3,
        pointerEvents: 'none'
      }} />
      
      <div style={{
        padding: '0 var(--content-padding)',
        maxWidth: '1200px',
        margin: '0 auto',
        position: 'relative',
        zIndex: 1
      }}>

        {/* Editorial Header */}
        <div 
          className="header-section"
          style={{
            textAlign: 'center',
            marginBottom: 'var(--space-8)',
            paddingBottom: 'var(--space-6)'
          }}>
          
          {/* Publication Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)',
            padding: 'var(--space-2) var(--space-4)',
            border: '0.5px solid var(--color-border-secondary)',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--color-bg-secondary)'
          }}>
            <BullLogoImg 
              width={20}
              height={20}
              alt="The Bullish Brief"
            />
            <span style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
{BRAND_COPY.ctaBanner.badge}
            </span>
          </div>

          {/* Main Headline */}
          <h2 style={{
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontFamily: 'var(--font-editorial)',
            fontWeight: 'var(--font-normal)',
            lineHeight: 'var(--leading-tight)',
            marginBottom: 'var(--space-4)',
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)'
          }}>
{copy.headline}
          </h2>
          
          {/* Publication-style subtitle */}
          <p style={{
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            maxWidth: '700px',
            margin: '0 auto',
            fontStyle: 'italic'
          }}>
{copy.subtitle}
          </p>

        </div>

        {/* Features Grid */}
        <div 
          className="grid-responsive"
          style={{
            display: 'grid',
            gridTemplateColumns: isPrimary ? 'repeat(auto-fit, minmax(400px, 1fr))' : 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
            maxWidth: isPrimary ? '900px' : '800px',
            margin: '0 auto var(--space-8) auto',
          }}>
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div key={index} 
                className="feature-card"
                style={{
                  padding: 'var(--space-6)',
                  background: 'var(--color-bg-secondary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  transition: 'all 0.3s ease',
                  cursor: 'default',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                {/* Feature Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  marginBottom: 'var(--space-4)'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--color-text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <IconComponent 
                      size={18} 
                      style={{ color: 'var(--color-bg-primary)' }}
                    />
                  </div>
                  
                  <div style={{
                    padding: 'var(--space-1) var(--space-2)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-secondary)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {feature.title}
                  </div>
                </div>
                
                {/* Feature Content */}
                <div>
                  <p style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-sm)',
                    lineHeight: 'var(--leading-relaxed)',
                    margin: 0
                  }}>
                    {feature.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* CTA Section */}
        <div 
          className="cta-section"
          style={{
            textAlign: 'center',
            paddingTop: 'var(--space-6)'
          }}>
          
          {/* Call-to-Action */}
          <div style={{
            marginBottom: 'var(--space-6)'
          }}>
            <p style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-primary)',
              fontWeight: 'var(--font-medium)',
              marginBottom: 'var(--space-2)'
            }}>
{copy.ctaHeadline}
            </p>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              margin: 0
            }}>
{copy.ctaSubline}
            </p>
          </div>

          <Button
onClick={async () => {
            const buttonText = copy.button;
            
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
            style={{
              minWidth: '200px',
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              letterSpacing: '0.01em'
            }}
          >
{copy.button}
          </Button>

        </div>
        
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          section {
            padding: var(--space-6) 0 !important;
          }
          
          .grid-responsive {
            grid-template-columns: 1fr !important;
            gap: var(--space-4) !important;
            margin-bottom: var(--space-6) !important;
          }
          
          .feature-card {
            padding: var(--space-4) !important;
          }
          
          .social-proof {
            flex-direction: column !important;
            gap: var(--space-2) !important;
            text-align: center !important;
          }
          
          .social-proof span {
            font-size: 0.75rem !important;
          }
          
          .header-section {
            margin-bottom: var(--space-6) !important;
            padding-bottom: var(--space-4) !important;
          }
          
          .cta-section {
            padding-top: var(--space-4) !important;
          }
        }
      `}</style>
    </section>
  );
}; 