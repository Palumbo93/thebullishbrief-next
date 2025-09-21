import React, { useEffect, useState, useRef } from 'react';
import { getTickers } from '../../utils/tickerUtils';
import { X, Copy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import BriefLeadGenWidget from '../BriefLeadGenWidget';
import BrokerageWidget from '../BrokerageWidget';
import { FeaturedVideoWidget } from '../FeaturedVideoWidget';
import { useTrackBriefEngagement } from '../../hooks/useClarityAnalytics';

interface CompanyTicker {
  symbol: string;
  name: string;
  market: string;
  price?: string;
  change?: string;
}

interface TOCItem {
  id: string;
  label: string;
  level: number;
}

interface BriefsActionPanelProps {
  briefId?: string; // Brief ID for analytics tracking
  brief?: any; // Full brief object for lead generation widget
  onSignUpClick?: () => void;
  signUpForm?: React.ReactNode;
  tickerWidget?: React.ReactNode;
  sections?: TOCItem[];
  onSectionClick?: (sectionId: string) => void;
  tickers?: any; // Brief tickers data
  companyName?: string; // Company name for ticker display

  isMobileOverlay?: boolean; // Whether this panel is being used in mobile overlay
  onClose?: () => void; // Close handler for mobile overlay
  videoUrl?: string; // Video URL when video should appear in action panel
  videoThumbnail?: string | null; // Video thumbnail URL
  videoTitle?: string; // Video title for accessibility
  onVideoClick?: () => void; // Video click handler
  onWidgetEmailSubmitted?: (email: string, isAuthenticated: boolean) => void; // Widget email submission tracking
  // Country context for geolocation-based features
  country?: string; // User's country code
  countryLoading?: boolean; // Whether country is still being fetched
  geolocationError?: string | null; // Geolocation error message
}

const BriefsActionPanel: React.FC<BriefsActionPanelProps> = ({ 
  briefId,
  brief,
  onSignUpClick,
  signUpForm,
  tickerWidget,
  sections = [],
  onSectionClick,
  tickers,
  companyName = 'Company',
  isMobileOverlay = false,
  onClose,
  videoUrl,
  videoThumbnail,
  videoTitle,
  onVideoClick,
  onWidgetEmailSubmitted,
  country = 'CA',
  countryLoading = false,
  geolocationError
}) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const tocRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { showToast } = useToastContext();
  
  // Set first section as active by default when sections are available
  useEffect(() => {
    if (sections.length > 0 && !activeSection) {
      setActiveSection(sections[0].id);
    }
  }, [sections, activeSection]);
  
  // Analytics tracking
  const { trackActionLinkClick } = useTrackBriefEngagement();

  // Copy ticker to clipboard
  const handleTickerCopy = async (ticker: string) => {
    try {
      await navigator.clipboard.writeText(ticker);
      showToast(`Copied ${ticker} to clipboard`, 'success');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = ticker;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast(`Copied ${ticker} to clipboard`, 'success');
    }
  };

  // Intersection Observer to track which section is currently visible
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    let timeoutId: NodeJS.Timeout;
    
    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (!element) return;
      
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // Debounce the active section change to prevent flickering
              clearTimeout(timeoutId);
              timeoutId = setTimeout(() => {
                setActiveSection(section.id);
              }, 50);
            }
          });
        },
        { 
          threshold: [0.1, 0.5, 0.9],
          rootMargin: '-10% 0px -10% 0px'
        }
      );
      
      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      clearTimeout(timeoutId);
      observers.forEach(observer => observer.disconnect());
    };
  }, [sections]);

  const handleSectionClick = (sectionId: string) => {
    const scrollToElement = () => {
      const element = document.getElementById(sectionId);
      if (element) {
        // Add a small offset to account for any fixed headers
        const offset = 80; // Adjust this value based on your header height
        const elementTop = element.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        });
        return true;
      }
      return false;
    };

    // Try to scroll immediately, with retry if element not found
    if (!scrollToElement()) {
      // If element not found, wait a bit and try again (content might still be processing)
      setTimeout(() => {
        scrollToElement();
      }, 100);
    }
    
    // Close mobile panel after clicking TOC item (with slight delay to allow scroll to start)
    if (isMobileOverlay && onClose) {
      setTimeout(() => {
        onClose();
      }, 300); // Small delay to let the scroll animation start
    }
    
    onSectionClick?.(sectionId);
  };

  // Generate dynamic tickers from brief data
  const dynamicTickers = getTickers(tickers);
  const companyTickers: CompanyTicker[] = dynamicTickers ? dynamicTickers.map(ticker => ({
    symbol: ticker.symbol,
    name: companyName,
    market: ticker.exchange
  })) : [];

  const marketGroups = companyTickers.reduce((groups, ticker) => {
    if (!groups[ticker.market]) {
      groups[ticker.market] = [];
    }
    groups[ticker.market].push(ticker);
    return groups;
  }, {} as Record<string, CompanyTicker[]>);

  return (
    <div className={`briefs-action-panel ${isMobileOverlay ? 'mobile-overlay' : ''}`} ref={tocRef}>
      {/* Mobile Header with Close Button - Only show when used as mobile overlay */}
      {isMobileOverlay && onClose && (
        <div className="briefs-mobile-header">
          <div className="briefs-mobile-header-content">
            <h3 className="briefs-mobile-header-title">More Info</h3>
            <button
              onClick={onClose}
              className="briefs-mobile-close-btn"
              aria-label="Close panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-tertiary)';
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-brand-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      )}
      
      {/* Content Container */}
      <div className="briefs-content-container">



        {/* Featured Video Widget */}
        {videoUrl && videoThumbnail && onVideoClick && (
          <FeaturedVideoWidget
            videoUrl={videoUrl}
            videoThumbnail={videoThumbnail}
            videoTitle={videoTitle || 'Featured Video'}
            onVideoClick={onVideoClick}
            className="briefs-video-section"
          />
        )}

     



      {/* Ticker Widget */}
      {tickerWidget && (
        <div className="briefs-ticker-section">
          {tickerWidget}
        </div>
      )}


      {/* Brokerage Widget */}
      {/* {brief?.brokerage_links && (
        <div className="briefs-brokerage-section">
        <BrokerageWidget 
          brokerageLinks={brief.brokerage_links as { [key: string]: string } | null}
          briefId={brief?.slug}
          briefTitle={brief?.title}
          location="action_panel"
          country={country}
          countryLoading={countryLoading}
          geolocationError={geolocationError}
        />
        </div>
      )} */}


<div className="briefs-sticky-section">


        {/* Table of Contents */}
        {sections.length > 0 && (
        <div className="briefs-toc-section">
          <h3 className="briefs-section-title">Contents</h3>
          <nav className="briefs-toc-nav" role="navigation" aria-label="Table of contents">
            <ul className="briefs-toc-list">
              {sections.map((section) => (
                <li key={section.id} className="briefs-toc-item">
                  <button
                    className={`briefs-toc-link ${
                      activeSection === section.id || 
                      (!activeSection && section.id === sections[0]?.id) 
                        ? 'active' 
                        : ''
                    }`}
                    onClick={() => handleSectionClick(section.id)}
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}




        {/* Brief Lead Generation Widget - Show for brief-specific email collection */}
        {brief && (
          
          <div className="briefs-leadgen">
            <BriefLeadGenWidget
              brief={brief}
              showTickers={false}
              showPadding={true}
              onEmailSubmitted={(email, isAuthenticated) => {
              // Track email submission for analytics
              if (onWidgetEmailSubmitted) {
                onWidgetEmailSubmitted(email, isAuthenticated);
              }
            }}
            onSignupClick={onSignUpClick}
              compact={false}
            />
          </div>
        
      )}


      {/* Company Tickers */}
      {companyTickers.length > 0 && (
        <div className="briefs-tickers-section">
          <h3 className="briefs-section-title centered">Related Tickers</h3>
          <div className="briefs-tickers-flex">
            {companyTickers.map((ticker) => (
              <button 
                key={`${ticker.market}-${ticker.symbol}`} 
                onClick={() => handleTickerCopy(ticker.symbol)}
                className="briefs-ticker-chip"
                title={`Copy ${ticker.symbol} to clipboard`}
              >
                <span className="briefs-ticker-market">{ticker.market}:</span>
                <span className="briefs-ticker-symbol">{ticker.symbol}</span>
                <Copy className="briefs-ticker-copy-icon" size={12} />
              </button>
            ))}
          </div>
        </div>
      )}


      

      </div>

      </div>



      <style>{`
        .briefs-action-panel {
          position: relative;
          height: 100%;
          background: var(--color-bg-primary);
          
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        .briefs-content-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        /* Hide scrollbars */
        .briefs-content-container::-webkit-scrollbar {
          display: none;
        }
        
        /* Firefox scrollbar */
        .briefs-content-container {
          scrollbar-width: none;
        }

        .briefs-leadgen {
          border-top: 0.5px solid var(--color-border-primary);
        }
        
        /* Sign Up CTA Styles */
        .briefs-signup-cta {
          padding: 1.5rem;
          background: var(--color-bg-primary);
          background-image: radial-gradient(circle at 25% 25%, rgba(255,255,255,0.02) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 20px 20px, 20px 20px;
          background-position: 0 0, 10px 10px;
          border-bottom: 0.5px solid var(--color-border-primary);
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
          border: 0.5px solid var(--color-border-primary);
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }

        .briefs-brokerage-section {
          padding: 2rem 1.5rem;
          border-top: 0.5px solid var(--color-border-primary);
        }
        
        .briefs-sticky-section {
          position: sticky;
          top: 0;
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

        .briefs-section-title.centered {
          text-align: center;
        }
        
        .briefs-feature-check {
          color: var(--color-success);
          font-size: 10px;
          font-weight: bold;
        }
        
        /* Video Section Styles */
        .briefs-video-section {
          padding: 2rem 1.5rem;
          border-top: 0.5px solid var(--color-border-primary);
          border-bottom: 0.5px solid var(--color-border-primary);
        }
        
        .briefs-action-panel::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
        
        .briefs-action-title,
        .briefs-section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 1rem 0;
          letter-spacing: 0.02em;
        }
        
        .briefs-action-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 2rem 1.5rem;
        }
        
        .briefs-action-btn {
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        }
        
        .briefs-action-btn.primary {
          background: linear-gradient(259deg, #214E81 0%, #506179 22.22%, #ED5409 65.15%, #FFCB67 100%);
          color: #F5F5F5;
          border: none;
          box-shadow: 0 4px 16px rgba(237,84,9,0.3), 0 0 0 1px rgba(237,84,9,0.2);
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        
        .briefs-action-btn.primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(237,84,9,0.4), 0 0 0 1px rgba(237,84,9,0.3);
        }
        
        .briefs-action-btn.secondary {
          background: rgba(255, 255, 255, 0.04);
          color: var(--color-text-secondary);
          border: 0.5px solid var(--color-border-secondary);
        }
        
        .briefs-action-btn.secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--color-text-primary);
        }
        
        .briefs-ticker-section {
          border-top: 0.5px solid var(--color-border-primary);
        }
        
        .briefs-tickers-section {
          padding: var(--space-6) var(--space-6);
          border-top: 0.5px solid var(--color-border-primary);
          border-bottom: 0.5px solid var(--color-border-primary);
        }
        
        .briefs-tickers-flex {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          align-items: center;   
          justify-content: center;
        }
        
        .briefs-ticker-chip {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-full);
          padding: var(--space-1) var(--space-3);
          cursor: pointer;
          transition: all var(--transition-base);
          font-family: var(--font-primary);
          outline: none;
          white-space: nowrap;
        }
        
        .briefs-ticker-chip:hover {
          background: var(--color-bg-tertiary);
          border-color: var(--color-border-secondary);
          transform: translateY(-1px);
        }
        
        .briefs-ticker-chip:active {
          transform: translateY(0);
        }
        
        .briefs-ticker-chip:focus {
          box-shadow: 0 0 0 2px var(--color-primary);
        }
        
        .briefs-ticker-market {
          font-size: var(--text-xs);
          font-weight: var(--font-medium);
          color: var(--color-text-muted);
          text-transform: uppercase;
        }
        
        .briefs-ticker-symbol {
          font-weight: var(--font-bold);
          color: var(--color-text-primary);
          font-size: var(--text-sm);
          font-family: var(--font-mono);
          letter-spacing: 0.02em;
        }
        
        .briefs-ticker-copy-icon {
          color: var(--color-text-tertiary);
          transition: color var(--transition-base);
          flex-shrink: 0;
        }
        
        .briefs-ticker-chip:hover .briefs-ticker-copy-icon {
          color: var(--color-text-secondary);
        }
        
        /* Table of Contents Styles */
        .briefs-toc-section {
          padding: 2rem 1.5rem;
          border-top: 0.5px solid var(--color-border-primary);
        }
        
        .briefs-toc-nav {
          flex: 1;
        }
        
        .briefs-toc-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          
        }
        
        .briefs-toc-item {
          margin: 0;
        }
        
        .briefs-toc-link {
          display: block;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 0.75rem 0.75rem;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          line-height: 1.4;
          outline: none;
          position: relative;
        }
        
        .briefs-toc-link:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
          transform: translateY(-1px);
        }
        
        .briefs-toc-link:focus {
          box-shadow: 0 0 0 2px var(--color-primary);
        }
        
        .briefs-toc-link.active {
          background: var(--color-primary-dim-background);
          color: var(--color-primary);
          font-weight: 600;
        }
        
        /* Mobile Header Styles */
        .briefs-mobile-header {
          position: sticky;
          top: 0;
          z-index: 10;
          background: var(--color-bg-primary);
          border-bottom: 0.5px solid var(--color-border-primary);
          backdropFilter: 'blur(10px)';
          padding-top: 56px; /* Account for mobile header height */
        }
        
        .briefs-mobile-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2) var(--content-padding);
        }
        
        .briefs-mobile-header-title {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--color-text-primary);
          margin: 0;
        }
        
        /* Mobile styles */
        @media (max-width: 1023px) {
          .briefs-action-panel {
            display: ${isMobileOverlay ? 'flex' : 'none'}; /* Show when used as mobile overlay */
          }
          
          /* Mobile overlay specific styles */
          .briefs-action-panel.mobile-overlay {
            position: relative;
            top: 0;
            height: 100%;
            border-left: none;
            border-radius: 0;
            padding: 0;
            background: var(--color-bg-primary);
          }
          
          /* Prevent background scrolling when panel is open */
          .briefs-action-panel.mobile-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            
            -webkit-overflow-scrolling: touch;
          }

        }
        
        /* Desktop styles */
        @media (min-width: 1024px) {
          .briefs-action-panel {
            position: relative; /* Keep relative positioning */
            height: 100%; /* Use 100% height */
          }
        }
      `}</style>
    </div>
  );
};

export default BriefsActionPanel; 