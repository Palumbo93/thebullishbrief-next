import React from 'react';
import { Brief } from '../lib/database.aliases';
import { BriefLeadGenWidget } from '../components/BriefLeadGenWidget';
import BrokerageWidget from '../components/BrokerageWidget';
import { FeaturedVideoWidget } from '../components/FeaturedVideoWidget';
import TradingViewWidget from '../components/TradingViewWidget';

interface ContentProcessorOptions {
  brief: Brief;
  onEmailSubmitted?: (email: string, isAuthenticated: boolean) => void;
  onSignupClick?: () => void;
  onVideoClick?: () => void;
  country?: string;
  countryLoading?: boolean;
  geolocationError?: string | null;
}

/**
 * Processes HTML content and injects React components at specified points
 * 
 * Currently supports:
 * - {INLINE_CTA} - Injects BriefLeadGenWidget (mobile-only)
 * - {BROKERAGE_LINKS} - Injects BrokerageWidget (mobile-only)
 * - {FEATURED_VIDEO} - Injects FeaturedVideoWidget (mobile-only)
 * - {TRADING_VIEW} - Injects TradingViewWidget (mobile-only)
 * 
 * @param content - The raw HTML content
 * @param options - Configuration options including brief data and callbacks
 * @returns Array of content segments and React components
 */
export const processContentWithWidgets = (
  content: string,
  options: ContentProcessorOptions
): Array<{ type: 'html' | 'component'; content: string | React.ReactElement; key: string }> => {
  const { brief, onEmailSubmitted, onSignupClick, onVideoClick, country, countryLoading, geolocationError } = options;
  
  // Process content by splitting on all widget markers
  const widgetMarkers = [
    'INLINE_CTA',
    'BROKERAGE_LINKS', 
    'FEATURED_VIDEO',
    'TRADING_VIEW'
  ];
  
  // Create regex pattern to match any of the widget markers
  const markerPattern = new RegExp(`\\{(${widgetMarkers.join('|')})\\}`, 'g');
  
  // Split content while keeping the markers
  const parts = content.split(markerPattern);
  const result: Array<{ type: 'html' | 'component'; content: string | React.ReactElement; key: string }> = [];
  
  let htmlSegmentCount = 0;
  let widgetCounts = {
    INLINE_CTA: 0,
    BROKERAGE_LINKS: 0,
    FEATURED_VIDEO: 0,
    TRADING_VIEW: 0
  };
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    // Check if this part is a widget marker
    if (widgetMarkers.includes(part)) {
      const widgetType = part as keyof typeof widgetCounts;
      const widgetIndex = widgetCounts[widgetType]++;
      
      // Create the appropriate widget component
      let widgetComponent: React.ReactElement | null = null;
      
      switch (widgetType) {
        case 'INLINE_CTA':
          widgetComponent = (
            <div 
              key={`cta-widget-${widgetIndex}`}
              className="mobile-only"
              style={{
                margin: 'var(--space-8) 0',
                padding: '0'
              }}
            >
              <BriefLeadGenWidget
                brief={brief}
                onEmailSubmitted={onEmailSubmitted}
                onSignupClick={onSignupClick}
                compact={true}
              />
            </div>
          );
          break;
          
        case 'BROKERAGE_LINKS':
          widgetComponent = (
            <div 
              key={`brokerage-widget-${widgetIndex}`}
              className="mobile-only"
              style={{
                margin: 'var(--space-8) 0',
                padding: '0'
              }}
            >
              <BrokerageWidget 
                brokerageLinks={brief.brokerage_links as { [key: string]: string } | null}
                briefId={brief.slug}
                briefTitle={brief.title}
                location="inline"
                country={country}
                countryLoading={countryLoading}
                geolocationError={geolocationError}
              />
            </div>
          );
          break;
          
        case 'FEATURED_VIDEO':
          if (brief.video_url && (brief as any).featured_video_thumbnail && onVideoClick) {
            widgetComponent = (
              <div 
                key={`featured-video-${widgetIndex}`}
                className="mobile-only"
                style={{
                  margin: 'var(--space-8) 0',
                  padding: '0'
                }}
              >
                <FeaturedVideoWidget
                  videoUrl={brief.video_url}
                  videoThumbnail={(brief as any).featured_video_thumbnail}
                  videoTitle={(brief.additional_copy as any)?.featuredVideoTitle || 'Featured Video'}
                  onVideoClick={onVideoClick}
                />
              </div>
            );
          }
          break;
          
        case 'TRADING_VIEW':
          // Get the first ticker symbol for TradingView
          const tickers = brief.tickers as any;
          let symbol = 'CSE:SPTZ'; // Default symbol
          
          if (tickers && Array.isArray(tickers) && tickers.length > 0) {
            const firstTicker = tickers[0];
            if (typeof firstTicker === 'object') {
              // Handle format like [{"CSE":"SONC"}]
              const exchange = Object.keys(firstTicker)[0];
              const tickerSymbol = firstTicker[exchange];
              symbol = `${exchange}:${tickerSymbol}`;
            }
          } else if (tickers && typeof tickers === 'object' && !Array.isArray(tickers)) {
            // Handle format like {"CSE":"SONC","OTC":"SONCF"}
            const exchange = Object.keys(tickers)[0];
            const tickerSymbol = tickers[exchange];
            symbol = `${exchange}:${tickerSymbol}`;
          }
          
          widgetComponent = (
            <div 
              key={`trading-view-${widgetIndex}`}
              className="mobile-only"
              style={{
                margin: 'var(--space-8) 0',
                padding: '0'
              }}
            >
              <TradingViewWidget symbol={symbol} />
            </div>
          );
          break;
      }
      
      if (widgetComponent) {
        result.push({
          type: 'component',
          content: widgetComponent,
          key: `${widgetType.toLowerCase()}-${widgetIndex}`
        });
      }
    } else if (part.trim()) {
      // This is HTML content
      result.push({
        type: 'html',
        content: part,
        key: `html-segment-${htmlSegmentCount++}`
      });
    }
  }
  
  return result;
};

/**
 * Checks if content contains any widget insertion markers
 * 
 * @param content - The HTML content to check
 * @returns True if content contains widget markers
 */
export const contentHasWidgets = (content: string): boolean => {
  return content.includes('{INLINE_CTA}') || 
         content.includes('{BROKERAGE_LINKS}') || 
         content.includes('{FEATURED_VIDEO}') || 
         content.includes('{TRADING_VIEW}');
};

/**
 * Removes all widget markers from content without injecting components
 * Used for desktop or when we want clean content without markers
 * 
 * @param content - The HTML content with markers
 * @returns Clean HTML content with markers removed
 */
export const removeWidgetMarkers = (content: string): string => {
  return content
    // Remove markers with surrounding newlines/whitespace
    .replace(/\s*\{INLINE_CTA\}\s*/g, '')
    .replace(/\s*\{BROKERAGE_LINKS\}\s*/g, '')
    .replace(/\s*\{FEATURED_VIDEO\}\s*/g, '')
    .replace(/\s*\{TRADING_VIEW\}\s*/g, '')
    // Remove empty paragraph tags that might be left behind
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p><\/p>/g, '')
    // Clean up any remaining double newlines that might be left
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .replace(/^\s+|\s+$/g, ''); // Trim leading/trailing whitespace
};

/**
 * Component that renders processed content with injected widgets
 */
interface ProcessedContentProps {
  content: string;
  brief: Brief;
  onEmailSubmitted?: (email: string, isAuthenticated: boolean) => void;
  onSignupClick?: () => void;
  onVideoClick?: () => void;
  onContentReady?: (element: HTMLElement) => void;
  className?: string;
  injectWidgets?: boolean; // Whether to inject widgets or just remove markers
  country?: string;
  countryLoading?: boolean;
  geolocationError?: string | null;
}

export const ProcessedContent: React.FC<ProcessedContentProps> = ({
  content,
  brief,
  onEmailSubmitted,
  onSignupClick,
  onVideoClick,
  onContentReady,
  className,
  injectWidgets = true,
  country,
  countryLoading,
  geolocationError
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  // Check if content has widgets to inject
  const hasWidgets = contentHasWidgets(content);
  
  // Always process content to remove markers
  // If widgets should be injected, process with widgets; otherwise just clean
  const processedSegments = hasWidgets
    ? (injectWidgets 
       ? processContentWithWidgets(content, { brief, onEmailSubmitted, onSignupClick, onVideoClick, country, countryLoading, geolocationError })
       : [{
           type: 'html' as const,
           content: removeWidgetMarkers(content),
           key: 'cleaned-content'
         }]
      )
    : [{
        type: 'html' as const,
        content: content,
        key: 'original-content'
      }];
  
  // Call onContentReady when content is mounted (for existing optimizations)
  React.useEffect(() => {
    if (contentRef.current && onContentReady) {
      onContentReady(contentRef.current);
    }
  }, [onContentReady, content]);
  
  // Always render processed segments (this ensures markers are always removed)
  return (
    <div ref={contentRef} className={className}>
      {processedSegments.map((segment) => {
        if (segment.type === 'html') {
          return (
            <div
              key={segment.key}
              dangerouslySetInnerHTML={{ __html: segment.content as string }}
            />
          );
        } else {
          return segment.content as React.ReactElement;
        }
      })}
    </div>
  );
};
