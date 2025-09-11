import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface TradingViewWidgetProps {
  symbol?: string;
}

/**
 * TradingViewWidget renders a TradingView Symbol Overview widget for the given symbol.
 * It loads the TradingView embed script dynamically and ensures the widget is responsive.
 *
 * @param symbol - TradingView symbol (e.g., "CSE:SONC", "OTC:SONCF")
 * @returns {JSX.Element} The TradingView symbol overview widget section.
 */
const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({ symbol = "CSE:SPTZ" }) => {
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
    
    // Clear any existing content completely
    container.current.innerHTML = '';
    
    // Create the widget container div that TradingView expects
    const widgetDiv = document.createElement('div');
    widgetDiv.className = 'tradingview-widget-container__widget';
    container.current.appendChild(widgetDiv);
    
    // Add a small delay to ensure DOM is ready before TradingView script execution
    timeoutRef.current = setTimeout(() => {
      if (!container.current) return;
      
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
      script.type = 'text/javascript';
      script.async = true;
      
      // Add CORS attributes to prevent crossorigin warnings
      script.crossOrigin = 'anonymous';
      script.setAttribute('referrerpolicy', 'origin');
      
      // Store script reference for cleanup
      scriptRef.current = script;
      
      // Use JSON.stringify to ensure proper JSON formatting
      // Add loading optimization to reduce preload warnings
      const widgetConfig = {
        "lineWidth": 2,
        "lineType": 0,
        "chartType": "area",
        "fontColor": theme === 'dark' ? 'rgb(219, 219, 219)' : 'rgb(106, 109, 120)',
        "gridLineColor": theme === 'dark' ? 'rgba(242, 242, 242, 0.06)' : 'rgba(106, 109, 120, 0.1)',
        "volumeUpColor": "rgba(34, 171, 148, 0.5)",
        "volumeDownColor": "rgba(247, 82, 95, 0.5)",
        "backgroundColor": theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
        "widgetFontColor": theme === 'dark' ? '#DBDBDB' : '#131722',
        "upColor": "#22ab94",
        "downColor": "#f7525f",
        "borderUpColor": "#22ab94",
        "borderDownColor": "#f7525f",
        "wickUpColor": "#22ab94",
        "wickDownColor": "#f7525f",
        "colorTheme": theme === 'dark' ? 'dark' : 'light',
        "isTransparent": true,
        "locale": "en",
        "chartOnly": false,
        "scalePosition": "right",
        "scaleMode": "Normal",
        "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
        "valuesTracking": "1",
        "changeMode": "price-and-percent",
        "symbols": [
          [
            symbol,
            `${symbol}|1D`
          ]
        ],
        "dateRanges": [
          "1d|1",
          "1m|30",
          "3m|60",
          "12m|1D",
          "60m|1W",
          "all|1M"
        ],
        "fontSize": "10",
        "headerFontSize": "medium",
        "autosize": false,
        "width": "100%",
        "height": 400,
        "noTimeScale": false,
        "hideDateRanges": false,
        "hideMarketStatus": false,
        "hideSymbolLogo": false,
        // Optimize loading to reduce preload warnings
        "load_timeout": 2000,
        "loading_screen": {"backgroundColor": theme === 'dark' ? '#0F0F0F' : '#FFFFFF'}
      };
      
      script.innerHTML = JSON.stringify(widgetConfig);
      
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
  }, [symbol, theme, isVisible]);

  return (
    <div className="tradingview-widget-container" ref={container} style={{ width: '100%', height: '400px'}}>
      {/* Show loading placeholder until widget is visible and loaded */}
      {!isVisible && (
        <div style={{
          width: '100%',
          height: '350px',
          backgroundColor: theme === 'dark' ? '#0F0F0F' : '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme === 'dark' ? '#DBDBDB' : '#131722',
          fontSize: 'var(--text-sm)',
          border: `1px solid ${theme === 'dark' ? 'rgba(242, 242, 242, 0.06)' : 'rgba(106, 109, 120, 0.1)'}`
        }}>
          Loading {symbol} chart...
        </div>
      )}
      {/* Widget div will be created dynamically by useEffect */}
      <div className="tradingview-widget-copyright" style={{ textAlign: 'right', fontSize: '0.85rem', marginTop: 4 }}>
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span style={{ color: '#4A90E2' }}>{symbol} quotes by TradingView</span>
        </a>
      </div>
    </div>
  );
};

export default memo(TradingViewWidget); 