import React from 'react';
import { getTickers } from '../../utils/tickerUtils';

interface MobileHeaderBrandingProps {
  companyName?: string;
  companyLogoUrl?: string;
  tickers?: any; // JSON ticker data from database
  fallback?: string;
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
  companyLogoUrl,
  tickers,
  fallback,
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
      padding: '4px 8px',
      borderRadius: 'var(--radius-full)',
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
      {/* Company Logo - Smaller size */}
      {(companyLogoUrl || fallback) && (
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          {companyLogoUrl ? (
            <img 
              src={companyLogoUrl} 
              alt={`${companyName} logo`}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'contain'
              }}
            />
          ) : (
            <span style={{
              fontSize: '0.6rem',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)'
            }}>
              {fallback}
            </span>
          )}
        </div>
      )}

      {/* Tickers Only - No Company Name */}
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
    </div>
  );
};
