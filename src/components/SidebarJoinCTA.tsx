import React from 'react';
import { Button } from './ui/Button';
import { BRAND_COPY } from '../data/copy';

interface SidebarJoinCTAProps {
  onSignUpClick?: () => void;
  showButton?: boolean; // Control whether to show the sticky button
}

const SidebarJoinCTA: React.FC<SidebarJoinCTAProps> = ({ onSignUpClick, showButton = true }) => {
  return (
    <>
      <div className="briefs-signup-cta">
        <div className="briefs-signup-content">
          {/* Brand Logo */}
          <div className="briefs-signup-logo">
            <img 
              src="/images/logo.png" 
              alt="The Bullish Brief" 
              className="briefs-logo-img"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                if (nextElement) {
                  nextElement.style.display = 'flex';
                }
              }}
            />
            <div className="briefs-logo-fallback">
              <svg 
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
              </svg>
              <div className="briefs-logo-dot"></div>
            </div>
          </div>

          {/* Brand Title */}
          <h4 className="briefs-signup-title">{BRAND_COPY.briefsActionPanel.title}</h4>
          
          {/* Description */}
          <p className="briefs-signup-description">
            {BRAND_COPY.briefsActionPanel.description}
          </p>

          {/* Features List */}
          <div className="briefs-signup-features">
            {BRAND_COPY.briefsActionPanel.features.map((feature, index) => (
              <div key={index} className="briefs-feature-item">
                <span className="briefs-feature-check">✓</span>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Regular Button - Only show if showButton is true */}
          {showButton && (
            <Button
              onClick={onSignUpClick}
              variant="primary"
              fullWidth={true}
            >
              Join Free Now
            </Button>
          )}
        </div>
      </div>

      <style jsx>{`
        /* Sign Up CTA Styles */
        .briefs-signup-cta {
          padding: 1.5rem 1.5rem ${showButton ? '1.5rem' : '0'} 1.5rem;
          background: var(--color-bg-primary);
          background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.02) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 20px 20px, 20px 20px;
          background-position: 0 0, 10px 10px;
          border-bottom: ${showButton ? '1px solid rgba(255, 255, 255, 0.1)' : 'none'};
        }
        
        .briefs-signup-content {
          text-align: center;
        }
        
        /* Logo Styles */
        .briefs-signup-logo {
          display: flex;
          justify-content: center;
          margin-bottom: var(--space-3);
        }
        
        .briefs-logo-img {
          width: 32px;
          height: 32px;
          object-fit: contain;
        }
        
        .briefs-logo-fallback {
          display: none;
          width: 32px;
          height: 32px;
          align-items: center;
          justify-content: center;
          position: relative;
          color: var(--color-brand-primary);
        }
        
        .briefs-logo-fallback svg {
          width: 26px;
          height: 26px;
        }
        
        .briefs-logo-dot {
          position: absolute;
          top: '-1px';
          right: '-1px';
          width: 6px;
          height: 6px;
          background-color: var(--color-brand-primary);
          border-radius: var(--radius-full);
          border: 1px solid var(--color-bg-secondary);
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        
        .briefs-signup-title {
          font-family: var(--font-editorial);
          font-weight: var(--font-normal);
          font-size: var(--text-lg);
          color: var(--color-text-primary);
          margin: 0 0 var(--space-2) 0;
          line-height: 1.2;
        }
        
        .briefs-signup-description {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          margin: 0 0 var(--space-4) 0;
          line-height: 1.5;
          font-weight: 500;
        }
        
        /* Features List */
        .briefs-signup-features {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
          align-items: center;
        }
        
        .briefs-feature-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          color: var(--color-text-secondary);
        }
        
        .briefs-feature-check {
          color: var(--color-success);
          font-size: 10px;
          font-weight: bold;
        }
      `}</style>
    </>
  );
};

export default SidebarJoinCTA;
