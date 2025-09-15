"use client";

import React from 'react';
import Link from 'next/link';
import { SocialIcon } from 'react-social-icons';
import { BullLogo } from './ui/BullLogo';
import { useAuthModal } from '../contexts/AuthModalContext';
import { useAuth } from '../contexts/AuthContext';

interface LegalFooterProps {
  className?: string;
  style?: React.CSSProperties;
  onSubscribeClick?: () => void;
}

export const LegalFooter: React.FC<LegalFooterProps> = ({ 
  className = '',
  style = {},
  onSubscribeClick
}) => {
  const { handleSignUpClick } = useAuthModal();
  const { user } = useAuth();

  const handleSubscribeClick = () => {
    if (onSubscribeClick) {
      onSubscribeClick();
    } else {
      handleSignUpClick();
    }
  };
  return (
    <>
      <style>{`
        .legal-footer {
          border-top: 1px solid var(--color-border-primary);
          margin-top: var(--space-16);
        }
        
        .footer-main {
          padding: var(--space-12) var(--content-padding) var(--space-8);
        }
        
        .footer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-8);
          padding-bottom: var(--space-6);
          border-bottom: 1px solid var(--color-border-primary);
        }
        
        .footer-brand {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        
        .footer-brand-text {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }
        
        .footer-title {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--color-text-primary);
          margin: 0;
        }
        
        .footer-tagline {
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
          margin: 0;
        }
        
        .footer-subscribe {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }
        
        .footer-subscribe-text {
          font-size: var(--text-sm);
          color: var(--color-text-secondary);
          margin: 0;
        }
        
        .footer-subscribe-button {
          padding: var(--space-3) var(--space-6);
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: var(--radius-sm);
          font-size: var(--text-sm);
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-base);
          white-space: nowrap;
        }
        
        .footer-subscribe-button:hover {
          background: var(--color-text-primary);
          color: var(--color-bg-primary);
          transform: translateY(-1px);
        }
        
        .footer-content {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: var(--space-8);
          align-items: center;
        }
        
        .footer-nav {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex-wrap: wrap;
        }
        
        .footer-link {
          font-size: var(--text-sm);
          color: var(--color-text-tertiary);
          text-decoration: none;
          padding: var(--space-2);
          border-radius: var(--radius-sm);
          transition: all var(--transition-base);
          white-space: nowrap;
        }
        
        .footer-link:hover {
          color: var(--color-text-primary);
          background: var(--color-bg-tertiary);
        }
        
        .footer-social {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }
        
        .footer-social-item {
          display: flex;
          align-items: center;
          opacity: 0.7;
          transition: opacity var(--transition-base);
        }
        
        .footer-social-item:hover {
          opacity: 1;
        }
        
        .footer-copyright {
          font-size: var(--text-sm);
          color: var(--color-text-muted);
          margin: 0;
        }
        
        /* Mobile adaptation */
        @media (max-width: 768px) {
          .footer-main {
            padding: var(--space-8) var(--content-padding) var(--space-6);
          }
          
          .footer-header {
            flex-direction: column;
            gap: var(--space-6);
            text-align: center;
          }
          
          .footer-subscribe {
            flex-direction: column;
            gap: var(--space-3);
            text-align: center;
          }
          
          .footer-content {
            grid-template-columns: 1fr;
            gap: var(--space-6);
            text-align: center;
          }
          
          .footer-nav {
            justify-content: center;
            gap: var(--space-2);
          }
          
          .footer-link {
            font-size: var(--text-sm);
            padding: var(--space-2) var(--space-3);
          }
          
          .footer-social {
            justify-content: center;
          }
          
          .footer-subscribe-button {
            padding: var(--space-3) var(--space-8);
          }
        }
        
        /* Smaller mobile screens */
        @media (max-width: 480px) {
          .footer-main {
            padding: var(--space-6) var(--content-padding) var(--space-4);
          }
          
          .footer-header {
            margin-bottom: var(--space-6);
          }
          
          .footer-nav {
            gap: var(--space-1);
          }
          
          .footer-link {
            font-size: var(--text-xs);
            padding: var(--space-1) var(--space-2);
          }
          
          .footer-subscribe-button {
            padding: var(--space-2) var(--space-6);
            font-size: var(--text-sm);
          }
        }
      `}</style>
      <footer 
        className={`legal-footer ${className}`}
        style={style}
      >
        <div className="footer-main">
          {/* Footer Header with Logo and Subscribe */}
          <div className="footer-header">
            <div className="footer-brand">
              <BullLogo 
                width={48}
                height={48}
                variant="auto"
              />
              <div className="footer-brand-text">
                <h3 className="footer-title">The Bullish Brief</h3>
                <p className="footer-tagline">Your daily dose of market insights</p>
              </div>
            </div>
            
            {!user && (
              <div className="footer-subscribe">
                <p className="footer-subscribe-text">Stay updated with our latest insights</p>
                <button
                  className="footer-subscribe-button"
                  onClick={handleSubscribeClick}
                >
                  Subscribe
                </button>
              </div>
            )}
          </div>
          
          {/* Footer Content */}
          <div className="footer-content">
            <p className="footer-copyright">
              © 2025 Bullish Brief. All rights reserved.
            </p>
            
            <nav className="footer-nav">
              <Link href="/contact" className="footer-link">
                Contact
              </Link>
              <Link href="/about" className="footer-link">
                About
              </Link>
              <Link href="/terms" className="footer-link">
                Terms
              </Link>
              <Link href="/privacy" className="footer-link">
                Privacy
              </Link>
              <Link href="/cookies" className="footer-link">
                Cookies
              </Link>
              <Link href="/disclaimer" className="footer-link">
                Disclaimer
              </Link>
            </nav>
            
            <div className="footer-social">
              <div className="footer-social-item">
                <SocialIcon 
                  url="https://x.com/thebullishbrief"
                  network="x" 
                  style={{ width: 32, height: 32 }} 
                  fgColor="var(--color-text-muted)" 
                  bgColor="transparent"
                  target="_blank"
                />
              </div>
              <div className="footer-social-item">
                <SocialIcon 
                  url="https://www.linkedin.com/company/the-bullish-brief/about/"
                  network="linkedin" 
                  style={{ width: 32, height: 32 }} 
                  fgColor="var(--color-text-muted)" 
                  bgColor="transparent"
                  target="_blank"
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}; 