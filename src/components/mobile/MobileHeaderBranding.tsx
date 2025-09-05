import React from 'react';
import { getTickers } from '../../utils/tickerUtils';
import { BullLogoImg } from '../ui/BullLogo';

interface MobileHeaderBrandingProps {
  companyName?: string;
  tickers?: any; // JSON ticker data from database
  onClick?: () => void;
}

/**
 * MobileHeaderBranding - Company branding component for mobile headers
 * 
 * Displays company logo, name, and tickers in a compact format.
 * Used primarily on brief pages and company-specific content.
 */
export const MobileHeaderBranding: React.FC<MobileHeaderBrandingProps> = ({
  companyName,
  tickers,
  onClick
}) => {
  const getContainerStyles = () => {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-2)', // Smaller gap for more compact layout
      cursor: onClick ? 'pointer' : 'default',
      transition: 'opacity var(--transition-base)',
      maxWidth: '200px', // Prevent overflow on small screens
    };
  };

  const getCompanyNameStyles = () => {
    return {
      fontSize: 'var(--text-sm)',
      fontWeight: 'var(--font-medium)',
      color: 'var(--color-text-primary)',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    };
  };



  const getTickersContainerStyles = () => {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-1)',
      flexWrap: 'wrap' as const,
      // No marginTop since we're not showing company name above
    };
  };

  const getTickerBadgeStyles = () => {
    return {
      background: 'var(--color-bg-tertiary)',
      color: 'var(--color-text-secondary)',
      padding: '10px 8px',
      borderRadius: 'var(--radius-md)',
      fontSize: '0.7rem',
      fontWeight: 'var(--font-medium)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      lineHeight: '1',
      whiteSpace: 'nowrap' as const,
    };
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.opacity = '0.8';
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClick) {
      e.currentTarget.style.opacity = '1';
    }
  };

  // Parse tickers using the proper utility function
  const parsedTickers = React.useMemo(() => {
    const tickerData = getTickers(tickers);
    // Limit to 2 tickers for mobile layout
    return tickerData ? tickerData.slice(0, 2) : [];
  }, [tickers]);

  // Special handling for "The Bullish Brief" - show logo + text
  const isMainBranding = companyName === 'The Bullish Brief';
  
  return (
    <div
      style={getContainerStyles()}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={companyName ? `${companyName} company info` : 'Company info'}
    >
      {isMainBranding ? (
        // Show logo + "The Bullish Brief" text
        <>
          <BullLogoImg
            height={24}
            width={120}
            alt="The Bullish Brief Logo"
            className="mobile-header-logo"
          />
          <span style={getCompanyNameStyles()}>
            {companyName}
          </span>
        </>
      ) : (
        // Original behavior: Show tickers for company briefs
        <>
          {/* Company Name (if provided and not main branding) */}
          {companyName && (
            <span style={getCompanyNameStyles()}>
              {companyName}
            </span>
          )}

          {/* Tickers */}
          {parsedTickers.length > 0 && (
            <div style={getTickersContainerStyles()}>
              {parsedTickers.map((ticker, index) => (
                <span
                  key={`${ticker?.exchange}-${ticker?.symbol}-${index}`}
                  style={getTickerBadgeStyles()}
                >
                  {ticker?.exchange}:{ticker?.symbol}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
