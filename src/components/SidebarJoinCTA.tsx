import React from 'react';
import { Button } from './ui/Button';
import { BRAND_COPY } from '../data/copy';
import { BullLogoImg } from './ui/BullLogo';

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
            <BullLogoImg 
              width={40}
              height={40}
              alt="The Bullish Brief"
              className="briefs-logo-img"
            />
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
          object-fit: contain;
        }
        
        .briefs-signup-title {
          font-family: var(--font-editorial);
          font-weight: var(--font-normal);
          font-size: var(--text-xl);
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
          font-size: var(--text-sm);
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
