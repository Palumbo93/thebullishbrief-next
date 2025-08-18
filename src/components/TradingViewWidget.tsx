import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface TradingViewWidgetProps {
  symbol?: string;
}

/**
 * TradingViewWidget renders a TradingView Symbol Info widget for the given symbol.
 * It loads the TradingView embed script dynamically and ensures the widget is responsive.
 *
 * @param symbol - TradingView symbol (e.g., "CSE:SONC", "OTC:SONCF")
 * @returns {JSX.Element} The TradingView symbol info widget section.
 */
const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol = "CSE:SPTZ" }) => {
  const container = useRef<HTMLDivElement | null>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (!container.current) return;
    
    // Clear any existing content completely
    container.current.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-info.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `{
      "symbol": "${symbol}",
      "colorTheme": "${theme === 'dark' ? 'dark' : 'light'}",
      "isTransparent": true,
      "locale": "en",
      "width": "100%"
    }`;
    container.current.appendChild(script);

    // Cleanup function
    return () => {
      if (container.current) {
        container.current.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
      }
    };
  }, [symbol, theme]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ width: '100%' }}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright" style={{ textAlign: 'right', fontSize: '0.85rem', marginTop: 4 }}>
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span style={{ color: '#4A90E2' }}>Track all markets on TradingView</span>
        </a>
      </div>
    </div>
  );
};

export default memo(TradingViewWidget); 