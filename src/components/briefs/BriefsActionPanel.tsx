import React, { useEffect, useState, useRef } from 'react';
import { getTickers } from '../../utils/tickerUtils';
import { ExternalLink, User, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { BRAND_COPY } from '../../data/copy';
import { useAuth } from '../../contexts/AuthContext';
import SidebarJoinCTA from '../SidebarJoinCTA';
import JoinButton from '../JoinButton';
import BriefLeadGenWidget from '../BriefLeadGenWidget';
import BrokerageWidget from '../BrokerageWidget';
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
  investorDeckUrl?: string; // Investor deck URL
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
  investorDeckUrl,
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
  
  // Analytics tracking
  const { trackActionLinkClick } = useTrackBriefEngagement();

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
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
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

     
      
        {/* Bullish Brief Sign Up CTA - Only show if user is not logged in and no brief widget */}
        {/* {!user && <SidebarJoinCTA onSignUpClick={onSignUpClick} showButton={false} />} */}

        {/* Sticky Join Button - Only show if user is not logged in */}
        {/* {!user && <JoinButton onSignUpClick={onSignUpClick} />} */}

        {/* Featured Video - Only show when feature_featured_video is false */}
        {videoUrl && videoThumbnail && onVideoClick && (
          <div className="briefs-video-section">
            <h3 className="briefs-section-title">Featured Video</h3>
            <div 
              className="briefs-video-thumbnail"
              onClick={onVideoClick}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-bg-secondary)',
                cursor: 'pointer',
                aspectRatio: '16/9',
              }}
            >
              {/* Video Thumbnail */}
              <img
                src={videoThumbnail}
                alt={videoTitle || 'Video thumbnail'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  borderRadius: 'var(--radius-md)'
                }}
              />
              
              {/* Play Button Overlay */}
              <button
                onClick={onVideoClick}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '60px',
                  height: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(0, 0, 0, 0.7)';
                  e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
          </div>
        )}

      {/* Brief Lead Generation Widget - Show for brief-specific email collection */}
      {brief && (
          
          <BriefLeadGenWidget
            brief={brief}
            onEmailSubmitted={(email, isAuthenticated) => {
              // Track email submission for analytics
              if (onWidgetEmailSubmitted) {
                onWidgetEmailSubmitted(email, isAuthenticated);
              }
            }}
            onSignupClick={onSignUpClick}
            compact={false}
          />
        
      )}



      {/* Brokerage Widget */}
      {brief?.brokerage_links && (
        <BrokerageWidget 
          brokerageLinks={brief.brokerage_links as { [key: string]: string } | null}
          briefId={brief?.slug}
          briefTitle={brief?.title}
          location="action_panel"
          country={country}
          countryLoading={countryLoading}
          geolocationError={geolocationError}
        />
      )}

        {/* Table of Contents */}
      {sections.length > 0 && (
        <div className="briefs-toc-section">
          <h3 className="briefs-section-title">Contents</h3>
          <nav className="briefs-toc-nav" role="navigation" aria-label="Table of contents">
            <ul className="briefs-toc-list">
              {sections.map((section) => (
                <li key={section.id} className="briefs-toc-item">
                  <button
                    className={`briefs-toc-link ${activeSection === section.id ? 'active' : ''}`}
                    onClick={() => handleSectionClick(section.id)}
                    style={{ paddingLeft: '16px' }}
                  >
                    {section.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}



      {/* Ticker Widget */}
      {tickerWidget && (
        <div className="briefs-ticker-section">
          {tickerWidget}
        </div>
      )}



      {/* Company Tickers */}
      <div className="briefs-tickers-section">
        <h3 className="briefs-section-title">Related Tickers</h3>
        <div className="briefs-tickers-list">
          {Object.entries(marketGroups).map(([market, tickers]) => (
            <div key={market} className="briefs-market-group">
              <h4 className="briefs-market-title">{market}</h4>
              <div className="briefs-tickers-grid">
                {tickers.map((ticker) => (
                  <a 
                    key={ticker.symbol} 
                    href={`https://www.google.com/search?q=${ticker.symbol}+stock`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="briefs-ticker-item"
                  >
                    <div className="briefs-ticker-symbol">{ticker.symbol}</div>
                    <div className="briefs-ticker-name">{ticker.name}</div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
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
          overflow-y: auto;
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
        
        /* Video Section Styles */
        .briefs-video-section {
          padding: 2rem 1.5rem;
          border-top: 0.5px solid var(--color-border-primary);
          border-bottom: 0.5px solid var(--color-border-primary);
        }
        
        .briefs-video-thumbnail {
          transition: all 0.3s ease;
        }
        
        .briefs-video-thumbnail:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
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
          padding: 2rem 1.5rem;
          border-top: 0.5px solid var(--color-border-primary);
        }
        
        .briefs-tickers-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .briefs-market-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .briefs-market-title {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--sonic-primary);
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .briefs-tickers-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.5rem;
        }
        
        .briefs-ticker-item {
          padding: 0.75rem 1rem;
          background: var(--color-bg-tertiary);
          border: 0.5px solid var(--color-border-primary);
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          text-decoration: none;
          display: block;
          cursor: pointer;
        }
        
        .briefs-ticker-item:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-border-secondary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .briefs-ticker-symbol {
          font-weight: 800;
          color: var(--color-brand-primary);
          font-size: 1rem;
          margin-bottom: 0.25rem;
          letter-spacing: -0.02em;
        }
        
        .briefs-ticker-name {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          line-height: 1.4;
          font-weight: 500;
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
          gap: 0.25rem;
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
          padding: 0.75rem 1rem;
          color: var(--color-text-tertiary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          line-height: 1.4;
        }
        
        .briefs-toc-link:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
          transform: translateX(4px);
        }
        
        .briefs-toc-link.active {
          background: var(--color-bg-card-hover);
          color: var(--color-brand-primary);
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
            overflow-y: auto;
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
            overflow-y: auto;
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