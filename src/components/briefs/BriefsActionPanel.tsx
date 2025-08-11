import React, { useEffect, useState, useRef } from 'react';
import { getTickers } from '../../utils/tickerUtils';
import { ExternalLink } from 'lucide-react';

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
  onSignUpClick?: () => void;
  signUpForm?: React.ReactNode;
  tickerWidget?: React.ReactNode;
  sections?: TOCItem[];
  onSectionClick?: (sectionId: string) => void;
  tickers?: any; // Brief tickers data
  companyName?: string; // Company name for ticker display
  investorDeckUrl?: string; // Investor deck URL
  isMobileOverlay?: boolean; // Whether this panel is being used in mobile overlay
}

const BriefsActionPanel: React.FC<BriefsActionPanelProps> = ({ 
  onSignUpClick,
  signUpForm,
  tickerWidget,
  sections = [],
  onSectionClick,
  tickers,
  companyName = 'Company',
  investorDeckUrl,
  isMobileOverlay = false
}) => {
  const [activeSection, setActiveSection] = useState<string>('');
  const tocRef = useRef<HTMLDivElement>(null);

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
      {/* Quick Links */}
      <div className="briefs-quick-links" style={{ padding: '2rem 1.5rem' }}>
        <h3 className="briefs-section-title">Quick Links</h3>
        <div className="briefs-links-list">
          {/* Investor Brief Link */}
          {investorDeckUrl && (
            <a 
              href={investorDeckUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="briefs-link-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-3)',
                background: 'var(--color-bg-card)',
                border: '0.5px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--color-text-primary)',
                textDecoration: 'none',
                transition: 'all var(--transition-base)',
                marginBottom: 'var(--space-2)'
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
              <ExternalLink style={{ width: '14px', height: '14px' }} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                Investor Brief
              </span>
            </a>
          )}
          
          {/* Ticker Chart Links */}
          {dynamicTickers && dynamicTickers.map((ticker) => {
            const chartUrl = `https://www.tradingview.com/symbols/${ticker.exchange}-${ticker.symbol}/`;
            return (
              <a 
                key={`${ticker.exchange}-${ticker.symbol}`}
                href={chartUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="briefs-link-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg-card)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  textDecoration: 'none',
                  transition: 'all var(--transition-base)',
                  marginBottom: 'var(--space-2)'
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
                <ExternalLink style={{ width: '14px', height: '14px' }} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)' }}>
                  {ticker.exchange}:{ticker.symbol} Chart
                </span>
              </a>
            );
          })}
        </div>
      </div>

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

      <style>{`
        .briefs-action-panel {
          position: sticky;
          top: 0px;
          height: calc(100vh - 0px);
          background: var(--color-bg-primary);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          overflow-y: auto;
          padding: 0;
          display: flex;
          flex-direction: column;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* Internet Explorer 10+ */
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
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .briefs-tickers-section {
          padding: 2rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
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
          background: rgba(0, 0, 0, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          text-decoration: none;
          display: block;
          cursor: pointer;
        }
        
        .briefs-ticker-item:hover {
          background: rgba(0, 0, 0, 0.5);
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
          border-top: 1px solid rgba(255, 255, 255, 0.1);
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
          background: rgba(0, 0, 0, 0.4);
          color: var(--color-text-secondary);
          transform: translateX(4px);
        }
        
        .briefs-toc-link.active {
          background: var(--color-bg-card-hover);
          color: var(--color-brand-primary);
          font-weight: 600;
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
          }
        }
        
        /* Desktop styles */
        @media (min-width: 1024px) {
          .briefs-action-panel {
            top: 0px;
            height: calc(100vh - 0px);
          }
        }
      `}</style>
    </div>
  );
};

export default BriefsActionPanel; 