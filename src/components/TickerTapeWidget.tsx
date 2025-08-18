import React, { useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface TickerTapeWidgetProps {
  className?: string;
}

export const TickerTapeWidget: React.FC<TickerTapeWidgetProps> = ({ className = '' }) => {
  const { theme } = useTheme();

  useEffect(() => {
    // Find the widget container
    const widgetContainer = document.querySelector('.tradingview-widget-container__widget');
    if (!widgetContainer) return;

    // Clear any existing content
    widgetContainer.innerHTML = '';

    // Create the script element
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        {
          "proName": "FOREXCOM:SPXUSD",
          "title": "S&P 500 Index"
        },
        {
          "proName": "FOREXCOM:NSXUSD",
          "title": "US 100 Cash CFD"
        },
        {
          "proName": "FX_IDC:EURUSD",
          "title": "EUR to USD"
        },
        {
          "proName": "BITSTAMP:BTCUSD",
          "title": "Bitcoin"
        },
        {
          "proName": "BITSTAMP:ETHUSD",
          "title": "Ethereum"
        }
      ],
      "colorTheme": theme === 'dark' ? 'dark' : 'light',
      "locale": "en",
      "largeChartUrl": "",
      "isTransparent": true,
      "showSymbolLogo": true,
      "displayMode": "regular"
    });

    // Append the new script
    widgetContainer.appendChild(script);

    // Cleanup function - clear the container completely
    return () => {
      if (widgetContainer) {
        widgetContainer.innerHTML = '';
      }
    };
  }, [theme]);

  return (
    <div className={`tradingview-widget-container ${className}`}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Ticker tape by TradingView</span>
        </a>
      </div>
    </div>
  );
}; 