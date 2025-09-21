import React, { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface TickerTapeWidgetProps {
  className?: string;
}

export const TickerTapeWidget: React.FC<TickerTapeWidgetProps> = ({ className = '' }) => {
  const container = useRef<HTMLDivElement | null>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const { theme } = useTheme();

  // Intersection Observer to delay loading until widget is visible
  useEffect(() => {
    if (!container.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(container.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [isVisible]);

  useEffect(() => {
    if (!container.current || !isVisible) return;

    // Clear any existing content
    container.current.innerHTML = '';
    
    // Create the widget container div that TradingView expects
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    container.current.appendChild(widgetDiv);

    // Add a small delay to ensure DOM is ready
    timeoutRef.current = setTimeout(() => {
      if (!container.current) return;
      
      // Create the script element
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
      script.async = true;
      
      // Add CORS attributes to prevent crossorigin warnings
      script.crossOrigin = 'anonymous';
      script.setAttribute('referrerpolicy', 'origin');
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
        "colorTheme": 'dark',
        "locale": "en",
        "largeChartUrl": "",
        "isTransparent": true,
        "showSymbolLogo": true,
        "displayMode": "regular"
      });

      // Store script reference for cleanup
      scriptRef.current = script;

      // Append the new script
      container.current?.appendChild(script);
    }, 100);

    // Enhanced cleanup function
    return () => {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Remove script element if it exists
      if (scriptRef.current && scriptRef.current.parentNode) {
        scriptRef.current.parentNode.removeChild(scriptRef.current);
        scriptRef.current = null;
      }
      
      // Clear container content
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [theme, isVisible]);

  return (
    <div className={`tradingview-widget-container ${className}`} ref={container}>
      {/* Show loading placeholder until widget is visible and loaded */}
      {!isVisible && (
        <div style={{
          width: '100%',
          height: '60px',
          backgroundColor: theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme === 'dark' ? '#DBDBDB' : '#131722',
          fontSize: 'var(--text-sm)',
          border: `1px solid ${theme === 'dark' ? 'rgba(242, 242, 242, 0.06)' : 'rgba(106, 109, 120, 0.1)'}`
        }}>
          Loading market ticker...
        </div>
      )}
      {/* Widget div will be created dynamically by useEffect */}
      <div className="tradingview-widget-copyright">
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span className="blue-text">Ticker tape by TradingView</span>
        </a>
      </div>
    </div>
  );
}; 