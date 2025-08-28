import React from 'react';
import { Brief } from '../lib/database.aliases';
import { BriefLeadGenWidget } from '../components/BriefLeadGenWidget';

interface ContentProcessorOptions {
  brief: Brief;
  onEmailSubmitted?: (email: string, isAuthenticated: boolean) => void;
  onSignupClick?: () => void;
}

/**
 * Processes HTML content and injects React components at specified points
 * 
 * Currently supports:
 * - {INSERT_CTA_BLOCK} - Injects BriefLeadGenWidget (mobile-only)
 * 
 * @param content - The raw HTML content
 * @param options - Configuration options including brief data and callbacks
 * @returns Array of content segments and React components
 */
export const processContentWithWidgets = (
  content: string,
  options: ContentProcessorOptions
): Array<{ type: 'html' | 'component'; content: string | React.ReactElement; key: string }> => {
  const { brief, onEmailSubmitted, onSignupClick } = options;
  
  // Split content by the CTA block marker
  const segments = content.split('{INSERT_CTA_BLOCK}');
  
  const result: Array<{ type: 'html' | 'component'; content: string | React.ReactElement; key: string }> = [];
  
  segments.forEach((segment, index) => {
    // Add the HTML segment
    if (segment.trim()) {
      result.push({
        type: 'html',
        content: segment,
        key: `html-segment-${index}`
      });
    }
    
    // Add the CTA widget after each segment except the last one
    if (index < segments.length - 1) {
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
  
  return result;
};

/**
 * Checks if content contains any widget insertion markers
 * 
 * @param content - The HTML content to check
 * @returns True if content contains widget markers
 */
export const contentHasWidgets = (content: string): boolean => {
  return content.includes('{INSERT_CTA_BLOCK}');
};

/**
 * Removes all widget markers from content without injecting components
 * Used for desktop or when we want clean content without markers
 * 
 * @param content - The HTML content with markers
 * @returns Clean HTML content with markers removed
 */
export const removeWidgetMarkers = (content: string): string => {
  return content.replace(/\{INSERT_CTA_BLOCK\}/g, '');
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
}

export const ProcessedContent: React.FC<ProcessedContentProps> = ({
  content,
  brief,
  onEmailSubmitted,
  onSignupClick,
  onContentReady,
  className,
  injectWidgets = true
}) => {
  const contentRef = React.useRef<HTMLDivElement>(null);
  
  // Check if content has widgets to inject
  const hasWidgets = contentHasWidgets(content);
  
  // Always process content to remove markers
  // If widgets should be injected, process with widgets; otherwise just clean
  const processedSegments = hasWidgets
    ? (injectWidgets 
       ? processContentWithWidgets(content, { brief, onEmailSubmitted, onSignupClick })
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
