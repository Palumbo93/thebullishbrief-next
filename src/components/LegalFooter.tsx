"use client";

import React from 'react';
import Link from 'next/link';
import { SocialIcon } from 'react-social-icons';

interface LegalFooterProps {
  className?: string;
  style?: React.CSSProperties;
}

export const LegalFooter: React.FC<LegalFooterProps> = ({ 
  className = '',
  style = {}
}) => {
  return (
    <>
      <style>{`
        .legal-footer {
          padding: var(--space-4) 0;
          text-align: center;
        }
        .legal-footer-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 var(--content-padding);
          gap: var(--space-4);
        }
        .legal-footer-copyright {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          margin: 0;
          padding: 0;
          white-space: nowrap;
        }
        .legal-footer-nav {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-wrap: wrap;
          justify-content: center;
        }
        .legal-footer-social {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }
        .legal-footer-link {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          text-decoration: none;
          padding: var(--space-1);
          transition: color var(--transition-base);
          white-space: nowrap;
        }
        .legal-footer-link:hover {
          color: var(--color-text-secondary);
        }
        
        /* Mobile adaptation */
        @media (max-width: 768px) {
          .legal-footer {
            padding: var(--space-3) 0;
          }
          .legal-footer-content {
            flex-direction: column;
            gap: var(--space-2);
            padding: 0 var(--space-4);
          }
          .legal-footer-nav {
            gap: var(--space-2);
            justify-content: center;
          }
          .legal-footer-link {
            padding: var(--space-1) var(--space-2);
          }
          .legal-footer-copyright {
            order: 2;
          }
          .legal-footer-nav {
            order: 1;
          }
        }
        
        /* Smaller mobile screens */
        @media (max-width: 480px) {
          .legal-footer-nav {
            gap: var(--space-1);
          }
          .legal-footer-link {
            font-size: 11px;
            padding: var(--space-1);
          }
          .legal-footer-copyright {
            font-size: 11px;
          }
        }
      `}</style>
      <footer 
        className={`legal-footer ${className}`}
        style={style}
      >
                <div className="legal-footer-content">
          <p className="legal-footer-copyright">
            © 2025 Bullish Brief. All rights reserved.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', justifyContent: 'center' }}>
            <nav className="legal-footer-nav">
              <Link href="/contact" className="legal-footer-link">
                Contact
              </Link>
              <Link href="/about" className="legal-footer-link">
                About
              </Link>
              <Link href="/terms" className="legal-footer-link">
                Terms
              </Link>
              <Link href="/privacy" className="legal-footer-link">
                Privacy
              </Link>
              <Link href="/disclaimer" className="legal-footer-link">
                Disclaimer
              </Link>
            </nav>
            <div className="legal-footer-social">
              <Link
                href="https://x.com/thebullishbrief" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', opacity: 0.7, transition: 'opacity var(--transition-base)' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
              >
                <SocialIcon 
                  network="x" 
                  style={{ width: 30, height: 30 }} 
                  fgColor="var(--color-text-muted)" 
                  bgColor="transparent" 
                />
              </Link>
              <Link 
                href="https://www.linkedin.com/company/the-bullish-brief/about/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', opacity: 0.7, transition: 'opacity var(--transition-base)' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
              >
                <SocialIcon 
                  network="linkedin" 
                  style={{ width: 30, height: 30 }} 
                  fgColor="var(--color-text-muted)" 
                  bgColor="transparent" 
                />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}; 