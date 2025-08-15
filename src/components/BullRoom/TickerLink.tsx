import React from 'react';

/**
 * TickerLink component that converts ticker symbols ($TICKER) into clickable links
 */
export interface TickerLinkProps {
  text: string;
  className?: string;
}

export const TickerLink: React.FC<TickerLinkProps> = ({ text, className = '' }) => {
  // Regex to match $TICKER patterns (1-5 uppercase letters after $)
  const tickerRegex = /\$([A-Z]{1,5})\b/g;
  
  // Split text into parts and process tickers
  const parts = text.split(tickerRegex);
  const result: React.ReactNode[] = [];
  
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      // Regular text
      result.push(parts[i]);
    } else {
      // Ticker symbol
      const ticker = parts[i];
      const fullTicker = `$${ticker}`;
      const googleFinanceUrl = `https://www.google.com/search?q=${ticker}+stock`;
      
      result.push(
        <a
          key={`ticker-${i}`}
          href={googleFinanceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-brand font-bold hover:text-brand/80 transition-colors ${className}`}
          style={{
            color: 'var(--color-brand-primary)',
            fontWeight: 'var(--font-bold)',
            textDecoration: 'none',
            transition: 'color var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-brand-primary)';
            e.currentTarget.style.opacity = '0.8';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-brand-primary)';
            e.currentTarget.style.opacity = '1';
          }}
        >
          {fullTicker}
        </a>
      );
    }
  }
  
  return <>{result}</>;
};
