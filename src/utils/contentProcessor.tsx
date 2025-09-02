import React from 'react';
import { Brief } from '../lib/database.aliases';
import { BriefLeadGenWidget } from '../components/BriefLeadGenWidget';
import BrokerageWidget from '../components/BrokerageWidget';

interface ContentProcessorOptions {
  brief: Brief;
  onEmailSubmitted?: (email: string, isAuthenticated: boolean) => void;
  onSignupClick?: () => void;
  country?: string;
  countryLoading?: boolean;
  geolocationError?: string | null;
}

/**
 * Processes HTML content and injects React components at specified points
 * 
 * Currently supports:
 * - {INSERT_CTA_BLOCK} - Injects BriefLeadGenWidget (mobile-only)
 * - {QUICK_LINKS} - Injects BrokerageWidget
 * 
 * @param content - The raw HTML content
 * @param options - Configuration options including brief data and callbacks
 * @returns Array of content segments and React components
 */
export const processContentWithWidgets = (
  content: string,
  options: ContentProcessorOptions
): Array<{ type: 'html' | 'component'; content: string | React.ReactElement; key: string }> => {
  const { brief, onEmailSubmitted, onSignupClick, country, countryLoading, geolocationError } = options;
  
  // Split content by widget markers and build result
  const result: Array<{ type: 'html' | 'component'; content: string | React.ReactElement; key: string }> = [];
  
  // Split content by INSERT_CTA_BLOCK markers
  const ctaParts = content.split(/\{INSERT_CTA_BLOCK\}/);
  let htmlSegmentCount = 0;
  
  ctaParts.forEach((part, index) => {
    // Add HTML content before the widget
    if (part.trim()) {
      result.push({
        type: 'html',
        content: part,
        key: `html-segment-${htmlSegmentCount++}`
      });
    }
    
    // Add CTA widget after each part (except the last one)
    if (index < ctaParts.length - 1) {
      result.push({
        type: 'component',
        content: (
          <div 
            key={`cta-widget-${index}`}
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
        ),
        key: `cta-widget-${index}`
      });
    }
  });
  
  // Now process QUICK_LINKS markers within each HTML segment
  const finalResult: Array<{ type: 'html' | 'component'; content: string | React.ReactElement; key: string }> = [];
  
  result.forEach((segment) => {
    if (segment.type === 'component') {
      // Keep component segments as-is
      finalResult.push(segment);
    } else {
      // Process HTML segments for QUICK_LINKS
      const quickLinksParts = (segment.content as string).split(/\{QUICK_LINKS\}/);
      
      quickLinksParts.forEach((part, index) => {
        // Add HTML content before the widget
        if (part.trim()) {
          finalResult.push({
            type: 'html',
            content: part,
            key: `html-segment-${htmlSegmentCount++}`
          });
        }
        
                 // Add QUICK_LINKS widget after each part (except the last one)
         if (index < quickLinksParts.length - 1) {
           finalResult.push({
             type: 'component',
             content: (
               <div 
                 key={`brokerage-widget-${index}`}
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
             ),
             key: `brokerage-widget-${index}`
           });
         }
      });
    }
  });
  
  return finalResult;
};

/**
 * Checks if content contains any widget insertion markers
 * 
 * @param content - The HTML content to check
 * @returns True if content contains widget markers
 */
export const contentHasWidgets = (content: string): boolean => {
  return content.includes('{INSERT_CTA_BLOCK}') || content.includes('{QUICK_LINKS}');
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
    .replace(/\{INSERT_CTA_BLOCK\}/g, '')
    .replace(/\{QUICK_LINKS\}/g, '');
};

/**
 * Component that renders processed content with injected widgets
 */
interface ProcessedContentProps {
  content: string;
  brief: Brief;
  onEmailSubmitted?: (email: string, isAuthenticated: boolean) => void;
  onSignupClick?: () => void;
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
       ? processContentWithWidgets(content, { brief, onEmailSubmitted, onSignupClick, country, countryLoading, geolocationError })
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
