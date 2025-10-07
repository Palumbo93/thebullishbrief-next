'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Share } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { useTrackBriefEngagement, useTrackBriefScrolling, useTrackVideoInteractions } from '../../hooks/useClarityAnalytics';
import { ShareSheet } from '../ShareSheet';
import { VideoModal } from '../VideoModal';
import BriefLeadGenPopup from '../BriefLeadGenPopup';
import { ProcessedContent } from '../../utils/contentProcessor';
import { parseTOCFromContent, getFirstTickerSymbol, getCountryAppropriateTickerSymbol } from '../../utils/tocParser';
import { fetchUserCountry } from '../../utils/geolocation';
import { ServerBrief } from '../../page-components/BriefPageServer';
import BriefsActionPanel from '../briefs/BriefsActionPanel';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';

// Lazy load TradingView widgets to reduce initial bundle size
const TradingViewWidget = dynamic(() => import('../TradingViewWidget'), {
  loading: () => (
    <div style={{
      width: '100%',
      height: '200px',
      backgroundColor: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-text-tertiary)',
      fontSize: 'var(--text-sm)'
    }}>
      Loading chart...
    </div>
  ),
  ssr: false
});

interface BriefInteractiveShellProps {
  brief: ServerBrief;
  slug: string;
  children: React.ReactNode;
  onCreateAccountClick?: () => void;
}

export function BriefInteractiveShell({
  brief,
  slug,
  children,
  onCreateAccountClick
}: BriefInteractiveShellProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { handleSignUpClick } = useAuthModal();
  
  // Analytics hooks
  const { trackShare: trackAnalyticsShare, trackLeadGenSignup } = useTrackBriefEngagement();
  const { trackPopupView } = useTrackBriefScrolling();
  const { trackVideoClick, trackVideoModalOpened, trackVideoModalClosed } = useTrackVideoInteractions();

  // State for interactive features
  const [isShareSheetOpen, setIsShareSheetOpen] = React.useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);
  const [currentInlineVideoUrl, setCurrentInlineVideoUrl] = React.useState<string | null>(null);
  const [contentProcessed, setContentProcessed] = React.useState(false);
  const [showClientContent, setShowClientContent] = React.useState(false);
  
  // Country detection state for geolocation-based features
  const [country, setCountry] = React.useState<string>('CA'); // Default to Canada
  const [countryLoading, setCountryLoading] = React.useState(true);
  const [geolocationError, setGeolocationError] = React.useState<string | null>(null);
  
  // Portal target state for action panel and content
  const [portalTarget, setPortalTarget] = React.useState<Element | null>(null);
  const [contentPortalTarget, setContentPortalTarget] = React.useState<Element | null>(null);

  // Parse TOC sections for action panel
  const tocSections = React.useMemo(() => {
    return brief.content ? parseTOCFromContent(brief.content) : [];
  }, [brief.content]);

  // Pre-process content to add IDs to H2 elements
  const processedContent = React.useMemo(() => {
    if (!brief.content || typeof window === 'undefined') return brief.content || '';
    
    // Create a temporary div to parse and modify the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = brief.content;
    
    // Find all H2 elements and add IDs using the same logic as parseTOCFromContent
    const h2Elements = tempDiv.querySelectorAll('h2');
    const usedIds = new Set<string>();
    
    h2Elements.forEach((h2) => {
      if (!h2.id) {
        const text = h2.textContent?.trim() || '';
        
        if (text) {
          // Generate base ID using same logic as parseTOCFromContent
          const baseId = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            .replace(/^-+|-+$/g, '');
          
          if (baseId) {
            // Ensure unique ID by adding counter if needed
            let uniqueId = baseId;
            let counter = 1;
            while (usedIds.has(uniqueId)) {
              uniqueId = `${baseId}-${counter}`;
              counter++;
            }
            
            usedIds.add(uniqueId);
            h2.id = uniqueId;
          }
        }
      }
    });
    
    return tempDiv.innerHTML;
  }, [brief.content]);

  // Handle video modal open
  const handleVideoClick = React.useCallback(() => {
    if (brief.video_url && brief.id && brief.title) {
      // Track video click
      trackVideoClick(String(brief.id), brief.title, brief.video_url, 'thumbnail');
      
      // Track modal opened
      trackVideoModalOpened(String(brief.id), brief.title, brief.video_url);
      
      setIsVideoModalOpen(true);
    }
  }, [brief, trackVideoClick, trackVideoModalOpened]);

  // Handle video modal close
  const handleVideoModalClose = React.useCallback(() => {
    const videoUrl = currentInlineVideoUrl || brief.video_url;
    if (videoUrl && brief.id && brief.title) {
      // Track modal closed
      trackVideoModalClosed(String(brief.id), brief.title, videoUrl);
    }
    setIsVideoModalOpen(false);
    setCurrentInlineVideoUrl(null);
  }, [brief, currentInlineVideoUrl, trackVideoModalClosed]);

  // Handle inline video click from content
  const handleInlineVideoClick = React.useCallback((videoSrc: string) => {
    if (brief.id && brief.title) {
      // Track video click
      trackVideoClick(String(brief.id), brief.title, videoSrc, 'inline_content');
      
      // Track modal opened
      trackVideoModalOpened(String(brief.id), brief.title, videoSrc);
      
      // Set video URL for modal and open it
      setCurrentInlineVideoUrl(videoSrc);
      setIsVideoModalOpen(true);
    }
  }, [brief, trackVideoClick, trackVideoModalOpened]);

  // Optimize content images for better performance
  const optimizeContentImages = React.useCallback((el: HTMLElement) => {
    const imgElements = el.querySelectorAll('img');
    imgElements.forEach((img, index) => {
      // Skip if already optimized
      if (img.hasAttribute('data-optimized')) return;
      
      // First image should load eagerly for better LCP, others lazily
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
      
      // Add responsive sizes for better performance
      if (!img.sizes) {
        img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, var(--max-width)';
      }
      
      // Add proper alt text if missing
      if (!img.alt && img.title) {
        img.alt = img.title;
      }
      
      // Mark as optimized to prevent re-processing
      img.setAttribute('data-optimized', 'true');
    });
  }, []);

  // Process embed content to execute scripts properly
  const processEmbedContent = React.useCallback((el: HTMLElement) => {
    const embedContainers = el.querySelectorAll('[data-embed]');
    embedContainers.forEach((container) => {
      const content = container.getAttribute('data-embed-content');
      
      if (content && !container.querySelector('.embed-processed-content')) {
        // Apply width and height from data attributes to the container
        const width = container.getAttribute('data-embed-width') || '100%';
        const height = container.getAttribute('data-embed-height') || 'auto';
        
        const containerElement = container as HTMLElement;
        containerElement.style.width = width;
        containerElement.style.height = height;
        containerElement.style.maxWidth = '100%';
        
        // Create a wrapper div for the processed content
        const processedDiv = document.createElement('div');
        processedDiv.className = 'embed-processed-content';
        processedDiv.style.cssText = 'width: 100%; height: 100%;';
        
        // Decode HTML entities and set the content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        processedDiv.innerHTML = tempDiv.innerHTML;
        
        // Add the processed content to the container
        container.appendChild(processedDiv);
        
        // Execute any scripts in the content
        const scripts = processedDiv.querySelectorAll('script');
        scripts.forEach((script) => {
          // Only process scripts that haven't been executed yet
          if (!script.hasAttribute('data-executed')) {
            const newScript = document.createElement('script');
            
            // Copy all attributes
            Array.from(script.attributes).forEach((attr) => {
              if (attr.name !== 'data-executed') {
                newScript.setAttribute(attr.name, attr.value);
              }
            });
            
            // Copy script content
            newScript.textContent = script.textContent;
            
            // Mark as executed and replace the old script
            newScript.setAttribute('data-executed', 'true');
            script.setAttribute('data-executed', 'true');
            script.parentNode?.replaceChild(newScript, script);
          }
        });
      }
    });
  }, []);

  // Optimize inline videos to prevent bandwidth usage
  const optimizeContentVideos = React.useCallback((el: HTMLElement) => {
    const videoContainers = el.querySelectorAll('div[data-video="direct"]');
    
    videoContainers.forEach((container) => {
      const videoEl = container.querySelector('video') as HTMLVideoElement;
      if (!videoEl || videoEl.hasAttribute('data-optimized')) return;
      
      // Store original video properties
      const videoSrc = videoEl.src;
      const posterSrc = videoEl.poster;
      const hasControls = videoEl.hasAttribute('controls');
      const hasAutoplay = videoEl.hasAttribute('autoplay');
      const hasLoop = videoEl.hasAttribute('loop');
      const isMuted = videoEl.hasAttribute('muted');
      
      // Detect if this is likely a small animation vs large video
      const isLikelyAnimation = hasAutoplay && hasLoop && isMuted && !hasControls;
      
      if (isLikelyAnimation) {
        // Keep small autoplay animations as-is, but add preload="metadata" for efficiency
        videoEl.setAttribute('preload', 'metadata');
        videoEl.setAttribute('data-optimized', 'true');
      } else if (hasControls || posterSrc) {
        // This is likely a large video with controls or poster - optimize it
        
        // Remove autoplay attributes to prevent automatic bandwidth usage
        videoEl.removeAttribute('autoplay');
        videoEl.setAttribute('preload', 'none');
        
        // Create thumbnail container
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.style.cssText = `
          position: relative;
          width: 100%;
          height: 400px;
          background: var(--color-bg-secondary);
          border-radius: var(--radius-lg);
          cursor: pointer;
          overflow: hidden;
          margin: 1.5em 0;
        `;
        
        // Create thumbnail image
        if (posterSrc) {
          const thumbnail = document.createElement('img');
          thumbnail.src = posterSrc;
          thumbnail.alt = 'Video thumbnail';
          thumbnail.className = 'video-thumbnail';
          thumbnail.style.cssText = `
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
          `;
          thumbnailContainer.appendChild(thumbnail);
        }
        
        // Create play button overlay
        const playButton = document.createElement('div');
        playButton.innerHTML = '▶';
        playButton.style.cssText = `
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        `;
        
        // Add hover effects
        playButton.addEventListener('mouseenter', () => {
          playButton.style.background = 'rgba(0, 0, 0, 0.9)';
          playButton.style.transform = 'translate(-50%, -50%) scale(1.1)';
        });
        
        playButton.addEventListener('mouseleave', () => {
          playButton.style.background = 'rgba(0, 0, 0, 0.7)';
          playButton.style.transform = 'translate(-50%, -50%) scale(1)';
        });
        
        thumbnailContainer.appendChild(playButton);
        
        // Add click handler to open video modal
        thumbnailContainer.addEventListener('click', () => {
          handleInlineVideoClick(videoSrc);
        });
        
        // Replace the video container with the thumbnail
        container.replaceWith(thumbnailContainer);
      } else {
        // Unknown video type - apply minimal optimization
        videoEl.setAttribute('preload', 'metadata');
        videoEl.setAttribute('data-optimized', 'true');
      }
    });
  }, [handleInlineVideoClick]);

  // Fetch user's country on component mount
  React.useEffect(() => {
    const fetchCountry = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Geolocation timeout')), 3000)
        );
        
        const userCountry = await Promise.race([
          fetchUserCountry(),
          timeoutPromise
        ]);
        
        setCountry(userCountry as string);
        setGeolocationError(null);
      } catch (error) {
        console.error('Error fetching user country:', error);
        setGeolocationError('Unable to detect location');
        // Keep default country (CA)
      } finally {
        setCountryLoading(false);
      }
    };

    fetchCountry();
  }, []);

  // Generate ticker widget for action panel
  const firstTickerSymbol = React.useMemo(() => {
    if (!brief.tickers) return null;
    return !countryLoading ? getCountryAppropriateTickerSymbol(brief.tickers, country) : getFirstTickerSymbol(brief.tickers);
  }, [brief.tickers, country, countryLoading]);

  const tickerWidget = React.useMemo(() => {
    return firstTickerSymbol ? <TradingViewWidget symbol={firstTickerSymbol} /> : null;
  }, [firstTickerSymbol]);

  // Create action panel component with safe ticker data
  const actionPanelComponent = React.useMemo(() => {
    // Convert tickers to safe format while preserving ticker data
    const safeTickers = (() => {
      if (!brief.tickers) return undefined;
      if (Array.isArray(brief.tickers)) {
        // Keep the original array structure for ticker objects like [{CSE: "SONC"}]
        return brief.tickers;
      }
      // If it's a single object like {CSE: "SONC"}, wrap in array
      if (typeof brief.tickers === 'object') {
        return [brief.tickers];
      }
      return undefined;
    })();

    return (
      <BriefsActionPanel
        briefId={String(brief.id)}
        brief={{
          ...brief,
          tickers: safeTickers // Use the safe ticker array
        }}
        tickerWidget={tickerWidget}
        sections={tocSections}
        tickers={safeTickers}
        companyName={brief.company_name || undefined}
        // Include video data when feature_featured_video is false (video goes in action panel)
        videoUrl={(!brief.feature_featured_video && brief.video_url) ? brief.video_url : undefined}
        videoThumbnail={(!brief.feature_featured_video && brief.video_url) ? (brief.featured_video_thumbnail || brief.featured_image_url) : undefined}
        videoTitle={(!brief.feature_featured_video && brief.video_url) ? 
          ((brief.additional_copy as any)?.featuredVideoTitle || 'Featured Video') : undefined}
        onVideoClick={(!brief.feature_featured_video && brief.video_url) ? handleVideoClick : undefined}
        onWidgetEmailSubmitted={(email: string, isAuthenticated: boolean) => {
          // Track widget lead generation signup for analytics
          if (brief.id && brief.title && trackLeadGenSignup) {
            trackLeadGenSignup(String(brief.id), brief.title, 'sidebar_widget', isAuthenticated ? 'authenticated' : 'guest');
          }
        }}
        // Pass country context for geolocation-based features
        country={country}
        countryLoading={countryLoading}
        geolocationError={geolocationError}
      />
    );
  }, [brief, tickerWidget, tocSections, handleVideoClick, trackLeadGenSignup, country, countryLoading, geolocationError]);

  // Find portal target and update layout classes for action panel
  React.useEffect(() => {
    const target = document.getElementById('dynamic-action-panel-root');
    const appContainer = document.querySelector('.app-container');
    const mainContent = document.querySelector('.main-content');
    
    if (target) {
      setPortalTarget(target);
      
      // Add classes to indicate action panel is present
      if (appContainer && mainContent) {
        appContainer.classList.add('with-action-panel');
        mainContent.classList.add('with-action-panel');
      }
    }
    
    // Cleanup function
    return () => {
      if (appContainer && mainContent) {
        appContainer.classList.remove('with-action-panel');
        mainContent.classList.remove('with-action-panel');
      }
    };
  }, []);

  // Check for widget markers and switch to client content if needed
  React.useEffect(() => {
    const widgetMarkers = ['INLINE_CTA', 'BROKERAGE_LINKS', 'FEATURED_VIDEO', 'TRADING_VIEW'];
    const hasWidgetMarkers = brief.content ? widgetMarkers.some(marker => brief.content!.includes(`{${marker}}`)) : false;
    
    if (hasWidgetMarkers && !showClientContent) {
      setShowClientContent(true);
    }
  }, [brief.content, showClientContent]);

  // Set up portal target for ProcessedContent
  React.useEffect(() => {
    if (!showClientContent) return;

    const findPortalTarget = () => {
      const serverContent = document.querySelector('.server-content');
      if (serverContent) {
        // Hide server content
        (serverContent as HTMLElement).style.display = 'none';
        // Use the parent of server content as portal target
        setContentPortalTarget(serverContent.parentElement);
      }
    };

    // Wait a bit for DOM to be ready
    const timeout = setTimeout(findPortalTarget, 100);
    return () => clearTimeout(timeout);
  }, [showClientContent]);

  // Add IDs to H2 elements and process embeds in the visible content
  React.useEffect(() => {
    const processVisibleContent = () => {
      // Try multiple selectors to find the content container
      const contentContainer = document.querySelector('.brief-content-container, .article-content, .html-content, .brief-html-content, .prose');
      if (!contentContainer) {
        return;
      }

      // Add IDs to H2 elements for TOC functionality
      const h2Elements = contentContainer.querySelectorAll('h2');
      const usedIds = new Set<string>();

      h2Elements.forEach((h2) => {
        if (!h2.id) {
          const text = h2.textContent?.trim() || '';
          if (text) {
            // Generate ID using the same logic as parseTOCFromContent
            let baseId = text
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim()
              .replace(/^-+|-+$/g, '');

            if (!baseId) {
              baseId = `section-${usedIds.size + 1}`;
            }

            let uniqueId = baseId;
            let counter = 1;
            while (usedIds.has(uniqueId)) {
              uniqueId = `${baseId}-${counter}`;
              counter++;
            }

            usedIds.add(uniqueId);
            h2.id = uniqueId;
          }
        }
      });

      // Process embed content
      processEmbedContent(contentContainer as HTMLElement);
      
      // Optimize images and videos
      optimizeContentImages(contentContainer as HTMLElement);
      optimizeContentVideos(contentContainer as HTMLElement);
    };

    // Try immediately
    processVisibleContent();

    // Also try after a short delay in case content is still loading
    const timeout = setTimeout(processVisibleContent, 500);

    return () => clearTimeout(timeout);
  }, [brief.content, processEmbedContent, optimizeContentImages, optimizeContentVideos, showClientContent]);

  // Enhanced share button functionality
  React.useEffect(() => {
    const shareButton = document.getElementById('share-button-placeholder');
    if (shareButton) {
      // Replace placeholder with functional button
      shareButton.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <polyline points="16,6 12,2 8,6"></polyline>
          <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
        <span>Share</span>
      `;
      shareButton.style.cursor = 'pointer';
      shareButton.style.opacity = '1';
      shareButton.style.transition = 'all var(--transition-base)';
      
      const handleClick = () => setIsShareSheetOpen(true);
      const handleMouseOver = () => {
        shareButton.style.background = 'var(--color-bg-secondary)';
        shareButton.style.color = 'var(--color-text-secondary)';
        shareButton.style.borderColor = 'var(--color-border-secondary)';
      };
      const handleMouseOut = () => {
        shareButton.style.background = 'transparent';
        shareButton.style.color = 'var(--color-text-muted)';
        shareButton.style.borderColor = 'var(--color-border-primary)';
      };
      
      shareButton.addEventListener('click', handleClick);
      shareButton.addEventListener('mouseenter', handleMouseOver);
      shareButton.addEventListener('mouseleave', handleMouseOut);
      
      return () => {
        shareButton.removeEventListener('click', handleClick);
        shareButton.removeEventListener('mouseenter', handleMouseOver);
        shareButton.removeEventListener('mouseleave', handleMouseOut);
      };
    }
  }, []);

  return (
    <>
      {children}
      
      {/* Client-side ProcessedContent for widget support - Portaled into visible DOM */}
      {brief.content && showClientContent && contentPortalTarget && createPortal(
        <ProcessedContent
          content={processedContent}
          brief={brief as any}
          onEmailSubmitted={(email, isAuthenticated) => {
            // Track widget lead generation signup for analytics
            if (brief.id && brief.title && trackLeadGenSignup) {
              trackLeadGenSignup(String(brief.id), brief.title, 'inline_content_widget', isAuthenticated ? 'authenticated' : 'guest');
            }
          }}
          onSignupClick={onCreateAccountClick || handleSignUpClick}
          onVideoClick={handleVideoClick}
          onContentReady={(el) => {
            if (el && !contentProcessed) {
              // Optimize images in content for better performance
              optimizeContentImages(el);
              
              // Optimize inline videos to prevent autoplay bandwidth usage
              optimizeContentVideos(el);
              
              // Process embed content to execute scripts
              processEmbedContent(el);
              
              setContentProcessed(true);
            }
          }}
          className="html-content brief-html-content client-content"
          country={country}
          countryLoading={countryLoading}
          geolocationError={geolocationError}
        />,
        contentPortalTarget
      )}

      {/* Brief Lead Generation Popup */}
      {brief && (() => {
        // Extract popup configuration from brief.popup_copy
        const popupConfig = brief.popup_copy && typeof brief.popup_copy === 'object' && !Array.isArray(brief.popup_copy) 
          ? brief.popup_copy as any 
          : {};
        
        // Get configuration values with defaults
        const showPopup = popupConfig.showPopup !== false; // Default to true if not specified
        const triggerScrollPercentage = popupConfig.popupScrollPercentage ?? 70; // Default to 70%
        const showDelay = popupConfig.popupDelay ?? 2000; // Default to 2000ms

        // Only render popup if showPopup is true
        return showPopup ? (
          <BriefLeadGenPopup
            brief={brief as any}
            triggerScrollPercentage={triggerScrollPercentage}
            showDelay={showDelay}
            onPopupViewed={() => {
              if (brief.id && brief.title) {
                trackPopupView(String(brief.id), brief.title, 'lead_generation_popup');
              }
            }}
            onEmailSubmitted={(email, isAuthenticated) => {
              // Track lead generation signup for analytics
              if (brief.id && brief.title && trackLeadGenSignup) {
                trackLeadGenSignup(String(brief.id), brief.title, 'popup', isAuthenticated ? 'authenticated' : 'guest');
              }
            }}
          />
        ) : null;
      })()}
      
      {/* Share Sheet */}
      <ShareSheet
        isOpen={isShareSheetOpen}
        onClose={() => setIsShareSheetOpen(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        onShare={(platform) => {
          if (brief.title) {
            trackAnalyticsShare(String(brief.id), brief.title, platform);
          }
        }}
      />
      
      {/* Video Modal - Handles both featured video and inline content videos */}
      {(brief.video_url || currentInlineVideoUrl) && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={handleVideoModalClose}
          videoUrl={currentInlineVideoUrl || brief.video_url || ''}
          title={currentInlineVideoUrl ? 'Video' : ((brief.additional_copy as any)?.featuredVideoTitle || 'Featured Video')}
        />
      )}
      
      {/* Action Panel Portal */}
      {portalTarget && createPortal(
        actionPanelComponent,
        portalTarget
      )}
    </>
  );
}
