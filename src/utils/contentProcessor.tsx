import React from 'react';
import { Brief } from '../lib/database.aliases';
import { BriefLeadGenWidget } from '../components/BriefLeadGenWidget';
import BrokerageWidget from '../components/BrokerageWidget';

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
  const { brief, onEmailSubmitted, onSignupClick } = options;
  
  // Process content by splitting on all widget markers
  // We'll use a simple approach: replace all markers with unique placeholders first
  let processedContent = content;
  const widgets: Array<{ placeholder: string; component: React.ReactElement; key: string }> = [];
  
  // Replace QUICK_LINKS markers
  let quickLinksCount = 0;
  processedContent = processedContent.replace(/\{QUICK_LINKS\}/g, () => {
    const placeholder = `__BROKERAGE_WIDGET_${quickLinksCount}__`;
    widgets.push({
      placeholder,
      component: (
        <div 
          key={`brokerage-widget-${quickLinksCount}`}
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
          />
        </div>
      ),
      key: `brokerage-widget-${quickLinksCount}`
    });
    quickLinksCount++;
    return placeholder;
  });
  
  // Replace INSERT_CTA_BLOCK markers
  let ctaCount = 0;
  processedContent = processedContent.replace(/\{INSERT_CTA_BLOCK\}/g, () => {
    const placeholder = `__CTA_WIDGET_${ctaCount}__`;
    widgets.push({
      placeholder,
      component: (
        <div 
          key={`cta-widget-${ctaCount}`}
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
      key: `cta-widget-${ctaCount}`
    });
    ctaCount++;
    return placeholder;
  });
  
  // If no widgets were found, return original content
  if (widgets.length === 0) {
    return [{
      type: 'html',
      content: content,
      key: 'original-content'
    }];
  }
  
  // Split content by all placeholders and build result
  const result: Array<{ type: 'html' | 'component'; content: string | React.ReactElement; key: string }> = [];
  let remainingContent = processedContent;
  let htmlSegmentCount = 0;
  
  widgets.forEach((widget) => {
    const parts = remainingContent.split(widget.placeholder);
    if (parts.length > 1) {
      // Add HTML content before the widget
      if (parts[0].trim()) {
        result.push({
          type: 'html',
          content: parts[0],
          key: `html-segment-${htmlSegmentCount++}`
        });
      }
      
      // Add the widget
      result.push({
        type: 'component',
        content: widget.component,
        key: widget.key
      });
      
      // Continue with the remaining content after the first placeholder
      remainingContent = parts.slice(1).join(widget.placeholder);
    }
  });
  
  // Add any remaining HTML content
  if (remainingContent.trim()) {
    result.push({
      type: 'html',
      content: remainingContent,
      key: `html-segment-${htmlSegmentCount}`
    });
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
