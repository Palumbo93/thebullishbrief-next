"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBriefBySlug } from '../hooks/useBriefs';
import { useTrackBriefView } from '../hooks/useBriefViews';
import { useTrackBriefEngagement, useTrackBriefScrolling, useTrackVideoInteractions } from '../hooks/useClarityAnalytics';
import { ArrowLeft, User, Calendar, Clock, Share, Play, Pause } from 'lucide-react';


import { parseTOCFromContent, getFirstTickerSymbol, getCountryAppropriateTickerSymbol } from '../utils/tocParser';
import { fetchUserCountry } from '../utils/geolocation';
import { ProcessedContent } from '../utils/contentProcessor';
import dynamic from 'next/dynamic';

// Lazy load TradingView widgets to reduce initial bundle size
const TradingViewWidget = dynamic(() => import('../components/TradingViewWidget'), {
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

const CustomWidget = dynamic(() => import('../components/CustomWidget'), {
  loading: () => (
    <div style={{
      width: '100%',
      height: '100px',
      backgroundColor: 'var(--color-bg-secondary)',
      borderRadius: 'var(--radius-lg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--color-text-tertiary)',
      fontSize: 'var(--text-sm)'
    }}>
      Loading widget...
    </div>
  ),
  ssr: false
});
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ShareSheet } from '../components/ShareSheet';
import { LegalFooter } from '../components/LegalFooter';
import { Layout } from '../components/Layout';
import { ArticleSkeleton } from '@/components/ArticleSkeleton';
import BriefLeadGenPopup from '../components/BriefLeadGenPopup';
import { VideoModal } from '../components/VideoModal';
import { FeaturedMedia } from '../components/briefs/FeaturedMedia';
import BriefsActionPanel from '../components/briefs/BriefsActionPanel';

import Image from 'next/image';


interface BriefPageProps {
  briefSlug: string;
  onCreateAccountClick?: () => void;
}

export const BriefPage: React.FC<BriefPageProps> = ({ 
  briefSlug, 
  onCreateAccountClick 
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();
  const { data: brief, isLoading, error } = useBriefBySlug(briefSlug);
  const trackView = useTrackBriefView();
  
  // Country detection state for geolocation-based features
  const [country, setCountry] = React.useState<string>('CA'); // Default to Canada
  const [countryLoading, setCountryLoading] = React.useState(true);
  const [geolocationError, setGeolocationError] = React.useState<string | null>(null);
  
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        router.push('/');
      }
    }
  };
  const { trackShare: trackAnalyticsShare, trackLeadGenSignup } = useTrackBriefEngagement();
  const { trackPopupView } = useTrackBriefScrolling();
  const { trackVideoClick, trackVideoModalOpened, trackVideoModalClosed } = useTrackVideoInteractions();

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = React.useState(false);
  const [contentProcessed, setContentProcessed] = React.useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = React.useState(false);
  const [currentInlineVideoUrl, setCurrentInlineVideoUrl] = React.useState<string | null>(null);
  



  
  // Handle scroll for header background only
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user's country on component mount
  React.useEffect(() => {
    const fetchCountry = async () => {
      try {
        const userCountry = await fetchUserCountry();
        setCountry(userCountry);
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

  // Track brief view when component mounts
  React.useEffect(() => {
    if (brief?.id && String(brief.id).trim() !== '') {
      // Use the brief's UUID for tracking, not the slug
      trackView.mutate(String(brief.id));
    }
  }, [brief?.id, brief?.title]);

  // Reset content processing when brief content changes
  React.useEffect(() => {
    setContentProcessed(false);
  }, [brief?.content]);

  // Post-render H2 ID assignment - runs after all React rendering is complete
  React.useEffect(() => {
    if (!brief?.content || !contentProcessed) return;

    const assignH2IdsPostRender = () => {
      const contentContainer = document.querySelector('.brief-content-container');
      if (!contentContainer) {
        return;
      }

      const h2Elements = contentContainer.querySelectorAll('h2');
      if (h2Elements.length === 0) return;

      const usedIds = new Set<string>();
      const assignedIds: Array<{ text: string; id: string }> = [];

      h2Elements.forEach((h2, index) => {
        const text = h2.textContent?.trim() || '';
        
        if (!h2.id && text) {
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
            assignedIds.push({ text, id: uniqueId });
          }
        }
      });
      
      // Set up MutationObserver to watch for ID removal
      if (assignedIds.length > 0) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'id') {
              // Track H2 ID modifications if needed for debugging
            }
            if (mutation.type === 'childList') {
              mutation.removedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  // Track H2 element removal if needed for debugging
                }
              });
            }
          });
        });

        observer.observe(contentContainer, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeOldValue: true,
          attributeFilter: ['id']
        });

        // Clean up observer after 10 seconds
        setTimeout(() => observer.disconnect(), 10000);
      }
      
      // Final verification that IDs are properly set
      setTimeout(() => {
        // Verification complete
      }, 50);
    };

    // Use multiple strategies to ensure IDs stick
    requestAnimationFrame(() => {
      assignH2IdsPostRender();
      
      // Also try after a small delay to catch any late re-renders
      setTimeout(assignH2IdsPostRender, 100);
    });

  }, [brief?.content, contentProcessed]);

  // Prevent scrolling during loading state
  React.useEffect(() => {
    // Always start at top when component mounts
    window.scrollTo(0, 0);
    
    if (isLoading) {
      // Disable scrolling during loading
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.width = '100%';
    } else if (brief) {
      // Re-enable scrolling when loading completes and we have content
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
      // Ensure we're at the top after re-enabling scroll
      window.scrollTo(0, 0);
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.width = '';
    };
  }, [isLoading, brief]);

  // Handle video modal open
  const handleVideoClick = () => {
    if (brief?.video_url && brief?.id && brief?.title) {
      // Track video click
      trackVideoClick(String(brief.id), brief.title, brief.video_url, 'thumbnail');
      
      // Track modal opened
      trackVideoModalOpened(String(brief.id), brief.title, brief.video_url);
      
      setIsVideoModalOpen(true);
    }
  };

  // Handle video modal close
  const handleVideoModalClose = () => {
    const videoUrl = currentInlineVideoUrl || brief?.video_url;
    if (videoUrl && brief?.id && brief?.title) {
      // Track modal closed
      trackVideoModalClosed(String(brief.id), brief.title, videoUrl);
    }
    setIsVideoModalOpen(false);
    setCurrentInlineVideoUrl(null);
  };






  // Mobile navigation items


  /**
   * Optimizes images within HTML content for better performance
   * 
   * Features:
   * - First image loads eagerly for better LCP
   * - Subsequent images load lazily for performance
   * - Adds proper decoding attributes
   * - Adds responsive sizes
   * 
   * @param el - The HTML element containing images to optimize
   */
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

  /**
   * Processes embed content to execute scripts properly
   * 
   * Features:
   * - Executes scripts in embed containers
   * - Handles TradingView widgets and other script-based embeds
   * 
   * @param el - The HTML element containing embeds to process
   */
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

  /**
   * Optimizes inline videos to prevent bandwidth usage from large videos
   * while preserving small autoplay animations
   * 
   * Features:
   * - Preserves autoplay for small looping animations (tiny file sizes)
   * - Converts large videos with controls to click-to-play thumbnails
   * - Uses file size and duration heuristics to determine video type
   * 
   * @param el - The HTML element containing videos to optimize
   */
  const optimizeContentVideos = React.useCallback((el: HTMLElement) => {
    const videoContainers = el.querySelectorAll('div[data-video="direct"]');
    
    videoContainers.forEach((container, index) => {
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
        `;
        
        // Create thumbnail image
        if (posterSrc) {
          const thumbnail = document.createElement('img');
          thumbnail.src = posterSrc;
          thumbnail.alt = 'Video thumbnail';
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
          if (brief?.id && brief?.title) {
            // Track video click
            trackVideoClick(String(brief.id), brief.title, videoSrc, 'inline_content');
            
            // Track modal opened
            trackVideoModalOpened(String(brief.id), brief.title, videoSrc);
            
            // Set video URL for modal and open it
            setCurrentInlineVideoUrl(videoSrc);
            setIsVideoModalOpen(true);
          }
        });
        
        // Replace the video container with the thumbnail
        container.replaceWith(thumbnailContainer);
      } else {
        // Unknown video type - apply minimal optimization
        videoEl.setAttribute('preload', 'metadata');
        videoEl.setAttribute('data-optimized', 'true');
      }
    });
  }, [brief, trackVideoClick, trackVideoModalOpened]);

  /**
   * Processes text content to automatically convert Twitter handles and stock tickers to clickable links
   * 
   * Features:
   * - @username → links to https://x.com/username (blue color)
   * - $TICKER → links to https://x.com/search?q=%24TICKER&src=cashtag_click (green color)
   * 
   * @param text - The raw text content to process
   * @returns Text with HTML link tags for handles and tickers
   */
  const processTextWithLinks = (text: string) => {
    // Replace Twitter handles (@username) with HTML links
    // Matches @ followed by alphanumeric characters and underscores, 1-15 characters long
    const withHandles = text.replace(/@([a-zA-Z0-9_]{1,15})\b/g, (match, username) => {
      return `<a href="https://x.com/${username}" target="_blank" rel="noopener noreferrer" style="color: #1DA1F2; text-decoration: underline;">${match}</a>`;
    });
    
    // Replace stock tickers ($TICKER) with HTML links
    // Matches $ followed by 1-5 uppercase letters, ensuring it's not part of a larger word
    const withTickers = withHandles.replace(/\$([A-Z]{1,5})\b/g, (match, ticker) => {
      return `<a href="https://x.com/search?q=%24${ticker}&src=cashtag_click" target="_blank" rel="noopener noreferrer" style="color: #00D4AA; text-decoration: underline;">${match}</a>`;
    });
    
    return withTickers;
  };

  // Only prepare data if brief exists (not loading) - moved before early return to fix hook rules
  const tocSections = brief ? parseTOCFromContent(brief.content) : [];
  
  // Pre-process content to add IDs to H2 elements before React renders them - moved before early return
  const processedContent = React.useMemo(() => {
    if (!brief?.content) return '';
    
    // Create a temporary div to parse and modify the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = brief.content;
    
    // Find all H2 elements and add IDs using the same logic as parseTOCFromContent
    const h2Elements = tempDiv.querySelectorAll('h2');
    const usedIds = new Set<string>();
    const addedIds: Array<{ text: string; id: string }> = [];
    
    h2Elements.forEach((h2, index) => {
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
            addedIds.push({ text, id: uniqueId });
          }
        }
      }
    });
    
    return tempDiv.innerHTML;
  }, [brief?.content]);

  if (!isLoading && (error || !brief)) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        textAlign: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)'
          }}>
            Brief Not Found
          </h1>
          <p style={{
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-6)'
          }}>
            The brief you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={handleBack}
            className="btn btn-primary"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            <ArrowLeft style={{ width: '16px', height: '16px' }} />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    );
  }

  // Generate ticker widget - TradingView first, then custom widget if available
  // Use country-appropriate ticker selection when country is available
  const firstTickerSymbol = brief ? 
    (!countryLoading ? getCountryAppropriateTickerSymbol(brief.tickers, country) : getFirstTickerSymbol(brief.tickers)) : null;
  const tickerWidget = (
    <div>
      {/* TradingView Widget (always shows if tickers exist) */}
      {firstTickerSymbol && (
        <TradingViewWidget symbol={firstTickerSymbol} />
      )}
      

    </div>
  );

  // Prepare action panel component
  const actionPanelComponent = brief ? (
    <BriefsActionPanel
      briefId={String(brief.id)}
      brief={brief}
      tickerWidget={tickerWidget}
      sections={tocSections}
      tickers={brief.tickers}
      companyName={brief.company_name || undefined}
      // Include video data when feature_featured_video is false (video goes in action panel)
      videoUrl={(!brief.feature_featured_video && brief.video_url) ? brief.video_url : undefined}
      videoThumbnail={(!brief.feature_featured_video && brief.video_url) ? (brief.featured_video_thumbnail || brief.featured_image_url) : undefined}
      videoTitle={(!brief.feature_featured_video && brief.video_url) ? 
        ((brief.additional_copy as any)?.featuredVideoTitle || 'Featured Video') : undefined}
      onVideoClick={(!brief.feature_featured_video && brief.video_url) ? handleVideoClick : undefined}
      onSignUpClick={onCreateAccountClick}
      onWidgetEmailSubmitted={(email: string, isAuthenticated: boolean) => {
        // Track widget lead generation signup for analytics
        if (brief?.id && brief?.title && trackLeadGenSignup) {
          trackLeadGenSignup(String(brief.id), brief.title, 'sidebar_widget', isAuthenticated ? 'authenticated' : 'guest');
        }
      }}
      // Pass country context for geolocation-based features
      country={country}
      countryLoading={countryLoading}
      geolocationError={geolocationError}
    />
  ) : undefined;

  const mobileHeaderProps = brief ? {
    companyName: brief.company_name || undefined,
    tickers: Array.isArray(brief.tickers) ? brief.tickers as string[] : undefined,
    onShareClick: () => setIsShareSheetOpen(true)
  } : {};

  return (
    <Layout
      mobileHeader={mobileHeaderProps}
      actionPanel={actionPanelComponent}
    >
      {/* Loading state */}
      {isLoading && (
        <div style={{ minHeight: '100vh' }}>
          <ArticleSkeleton />
        </div>
      )}

      {/* Brief Content */}
      {!isLoading && (
        <div style={{ minHeight: '100vh', position: 'relative' }}>
        

        {/* Brief Header - Clean text-only header */}
        <div 
          className="article-brief-header"
          style={{
            maxWidth: 'var(--max-width)',
            margin: '0 auto'
          }}>
          {/* Title */}
          <h1 className="article-brief-title" style={{
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)'
          }}>
            {brief?.title}
          </h1>

          {/* Featured Media - Mobile Position (below headline, above info bar) */}
          {(brief as any)?.show_featured_media !== false && (
            <div className="mobile-only">
              <FeaturedMedia
                featureFeaturedVideo={brief?.feature_featured_video}
                videoUrl={brief?.video_url || undefined}
                videoThumbnail={brief?.featured_video_thumbnail || undefined}
                featuredImageUrl={brief?.featured_image_url || undefined}
                title={brief?.title || undefined}
                onVideoClick={handleVideoClick}
              />
            </div>
          )}


          {/* Disclaimer - Simple one-liner */}
          {brief?.disclaimer && (
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              // fontStyle: 'italic',
              fontWeight: 'var(--font-light)',
              marginTop: 'var(--space-4)'
            }}>
              {brief.disclaimer}
            </p>
          )}

        </div>

        {/* Main Content */}
        <main style={{
          padding: '0px var(--content-padding) 50px var(--content-padding)',
          maxWidth: 'var(--max-width)',
          margin: '0 auto'
        }}>

          {/* Meta Info - Date, Reading Time, and Share */}
          <div 
            className="meta-info-section"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-3)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-6)',
              paddingBottom: 'var(--space-4)',
              borderBottom: '0.5px solid var(--color-border-primary)'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <Calendar style={{ width: '14px', height: '14px' }} />
                <span>{brief?.published_at ? new Date(brief.published_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : new Date(brief?.created_at || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <Clock style={{ width: '14px', height: '14px' }} />
                <span>{brief?.reading_time_minutes ? `${brief.reading_time_minutes} min` : '4 min'}</span>
              </div>
            </div>

            {/* Share Button */}
            <button
              onClick={() => setIsShareSheetOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1)',
                padding: 'var(--space-1) var(--space-2)',
                background: 'transparent',
                border: '1px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-text-muted)',
                fontSize: 'var(--text-sm)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-secondary)';
                e.currentTarget.style.color = 'var(--color-text-secondary)';
                e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-text-muted)';
                e.currentTarget.style.borderColor = 'var(--color-border-primary)';
              }}
            >
              <Share style={{ width: '14px', height: '14px' }} />
              <span>Share</span>
            </button>
          </div>

          {/* Subtitle - Clean callout style */}
          {brief?.subtitle && (
            <div style={{
              padding: 'var(--space-2) var(--space-6)',
              marginBottom: 'var(--space-4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Subtle accent border */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '3px',
                height: '100%',
                background: 'var(--color-primary)',
                opacity: 1
              }} />
              
              <div style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-medium)',
                lineHeight: 'var(--leading-tight)',
                color: 'var(--color-text-primary)',
                letterSpacing: '-0.01em',
                textAlign: 'left',
                margin: 0
              }}>
                {brief.subtitle}
              </div>
            </div>
          )}

          {/* Featured Media - Desktop Position (current location) */}
          {(brief as any)?.show_featured_media !== false && (
            <div style={{ display: 'none' }} className="desktop-only">
              <FeaturedMedia
                featureFeaturedVideo={brief?.feature_featured_video}
                videoUrl={brief?.video_url || undefined}
                videoThumbnail={brief?.featured_video_thumbnail || undefined}
                featuredImageUrl={brief?.featured_image_url || undefined}
                title={brief?.title || undefined}
                onVideoClick={handleVideoClick}
                style={{ marginBottom: 'var(--space-8)' }}
              />
            </div>
          )}



          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none brief-content-container">
            {brief?.content ? (
              <ProcessedContent
                content={processedContent}
                brief={brief}
                onEmailSubmitted={(email, isAuthenticated) => {
                  // Track widget lead generation signup for analytics
                  if (brief?.id && brief?.title && trackLeadGenSignup) {
                    trackLeadGenSignup(String(brief.id), brief.title, 'inline_content_widget', isAuthenticated ? 'authenticated' : 'guest');
                  }
                }}
                onSignupClick={onCreateAccountClick}
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
                className="html-content brief-html-content"
                country={country}
                countryLoading={countryLoading}
                geolocationError={geolocationError}
              />
            ) : (
              <div className="text-center py-12 bg-tertiary rounded-xl mb-8">
                <p className="text-lg text-secondary mb-6">
                  This brief is available to premium subscribers only.
                </p>
                {!user && (
                  <button onClick={onCreateAccountClick} className="btn btn-primary">
                    <User className="w-4 h-4" />
                    <span>Subscribe to Read Full Brief</span>
                  </button>
                )}
              </div>
            )}
          </div>



        </main>


      </div>
      )}
      
      {/* Brief Lead Generation Popup - Shows on both mobile and desktop */}
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
            brief={brief}
            triggerScrollPercentage={triggerScrollPercentage}
            // triggerScrollPixels={2000} // Also trigger after var(--max-width) scroll (better for mobile)
            showDelay={showDelay}
            onPopupViewed={() => {
              if (brief?.id && brief?.title) {
                trackPopupView(String(brief.id), brief.title, 'lead_generation_popup');
              }
            }}
            onEmailSubmitted={(email, isAuthenticated) => {
              // Track lead generation signup for analytics
              if (brief?.id && brief?.title && trackLeadGenSignup) {
                trackLeadGenSignup(String(brief.id), brief.title, 'popup', isAuthenticated ? 'authenticated' : 'guest');
              }
            }}
            onSignupClick={() => {
              onCreateAccountClick?.();
            }}
          />
        ) : null;
      })()}
      
      
      
      {/* Legal Footer */}
      <LegalFooter />
      
      {/* Share Sheet */}
      {brief && (
        <ShareSheet
          isOpen={isShareSheetOpen}
          onClose={() => setIsShareSheetOpen(false)}
          url={typeof window !== 'undefined' ? window.location.href : ''}
          onShare={(platform) => {
            if (brief?.title) {
              trackAnalyticsShare(String(brief.id), brief.title, platform);
            }
          }}
        />
      )}
      
      {/* Video Modal - Handles both featured video and inline content videos */}
      {(brief?.video_url || currentInlineVideoUrl) && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={handleVideoModalClose}
          videoUrl={currentInlineVideoUrl || brief?.video_url || ''}
          title={currentInlineVideoUrl ? 'Video' : ((brief?.additional_copy as any)?.featuredVideoTitle || 'Featured Video')}
        />
      )}
      
      <style jsx>{`
        .article-brief-header {
          padding: var(--space-12) var(--content-padding) var(--space-4) var(--content-padding);
        }
        
        .article-brief-title {
          font-family: var(--font-editorial);
          font-weight: var(--font-medium);
          font-size: clamp(1.875rem, 4vw, 2.5rem);
          line-height: var(--leading-tight);
          letter-spacing: -0.01em;
        }
        
        @media (max-width: 768px) {
          .article-brief-header {
            padding: var(--space-4) var(--content-padding) var(--space-3) var(--content-padding);
          }
          
          .article-brief-title {
            font-size: clamp(1.5rem, 5vw, 2rem);
          }
          
          .mobile-category-info {
            display: block !important;
          }
        }
      `}</style>

    </Layout>
  );
};

export default BriefPage; 