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
  const { theme } = useTheme();

  useEffect(() => {
    if (!container.current) return;
    
    // Clear any existing content completely
    container.current.innerHTML = '<div class="tradingview-widget-container__widget"></div>';
    
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = `{
      "lineWidth": 2,
      "lineType": 0,
      "chartType": "area",
      "fontColor": "${theme === 'dark' ? 'rgb(219, 219, 219)' : 'rgb(106, 109, 120)'}",
      "gridLineColor": "${theme === 'dark' ? 'rgba(242, 242, 242, 0.06)' : 'rgba(106, 109, 120, 0.1)'}",
      "volumeUpColor": "rgba(34, 171, 148, 0.5)",
      "volumeDownColor": "rgba(247, 82, 95, 0.5)",
      "backgroundColor": "${theme === 'dark' ? '#0F0F0F' : '#FFFFFF'}",
      "widgetFontColor": "${theme === 'dark' ? '#DBDBDB' : '#131722'}",
      "upColor": "#22ab94",
      "downColor": "#f7525f",
      "borderUpColor": "#22ab94",
      "borderDownColor": "#f7525f",
      "wickUpColor": "#22ab94",
      "wickDownColor": "#f7525f",
      "colorTheme": "${theme === 'dark' ? 'dark' : 'light'}",
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
          "${symbol}",
          "${symbol}|1D"
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
      "height": "400",
      "noTimeScale": false,
      "hideDateRanges": false,
      "hideMarketStatus": false,
      "hideSymbolLogo": false
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
    <div className="tradingview-widget-container" ref={container} style={{ width: '100%', height: '400px'}}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright" style={{ textAlign: 'right', fontSize: '0.85rem', marginTop: 4 }}>
        <a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank">
          <span style={{ color: '#4A90E2' }}>{symbol} quotes by TradingView</span>
        </a>
      </div>
    </div>
  );
};

export default memo(TradingViewWidget); 