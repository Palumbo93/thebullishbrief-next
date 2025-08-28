"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useBriefBySlug } from '../hooks/useBriefs';
import { useTrackBriefView } from '../hooks/useBriefViews';
import { useTrackBriefEngagement, useTrackBriefScrolling, useTrackVideoInteractions } from '../hooks/useClarityAnalytics';
import { ArrowLeft, User, Calendar, Clock, Play, Pause } from 'lucide-react';


import { parseTOCFromContent, getFirstTickerSymbol } from '../utils/tocParser';
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
import { CTABanner } from '../components/CTABanner';
import { LegalFooter } from '../components/LegalFooter';
import { BriefDesktopBanner } from '../components/briefs/BriefDesktopBanner';
import { Layout } from '../components/Layout';
import { ArticleSkeleton } from '@/components/ArticleSkeleton';
import BriefLeadGenPopup from '../components/BriefLeadGenPopup';
import SidebarJoinCTA from '../components/SidebarJoinCTA';
import { VideoModal } from '../components/VideoModal';
import { FeaturedMedia } from '../components/briefs/FeaturedMedia';

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
  



  
  // Handle scroll for header background only
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    if (brief?.video_url && brief?.id && brief?.title) {
      // Track modal closed
      trackVideoModalClosed(String(brief.id), brief.title, brief.video_url);
    }
    setIsVideoModalOpen(false);
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
        img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px';
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

  // Only prepare data if brief exists (not loading)
  const tocSections = brief ? parseTOCFromContent(brief.content) : [];
  
  // Generate ticker widget - TradingView first, then custom widget if available
  const firstTickerSymbol = brief ? getFirstTickerSymbol(brief.tickers) : null;
  const tickerWidget = (
    <div>
      {/* TradingView Widget (always shows if tickers exist) */}
      {firstTickerSymbol && (
        <TradingViewWidget symbol={firstTickerSymbol} />
      )}
      
      {/* Custom Widget (shows below TradingView if widget_code exists) */}
      {brief?.widget_code && (
        <CustomWidget code={brief.widget_code} title="Additional Widget" />
      )}
    </div>
  );

  // Prepare action panel data
  const briefActionPanel = brief ? {
    briefId: String(brief.id),
    brief: brief, // Pass the full brief object for lead generation widget
    tickerWidget,
    sections: tocSections,
    tickers: brief.tickers,
    companyName: brief.company_name || undefined,
    companyLogoUrl: brief.company_logo_url || undefined,
    investorDeckUrl: brief.investor_deck_url || undefined,
    // Include video data when feature_featured_video is false (video goes in action panel)
    videoUrl: (!brief.feature_featured_video && brief.video_url) ? brief.video_url : undefined,
    videoThumbnail: (!brief.feature_featured_video && brief.video_url) ? (brief.featured_video_thumbnail || brief.featured_image_url) : undefined,
    videoTitle: (!brief.feature_featured_video && brief.video_url) ? brief.title : undefined,
    onVideoClick: (!brief.feature_featured_video && brief.video_url) ? handleVideoClick : undefined,
    onSignUpClick: onCreateAccountClick,
    onWidgetEmailSubmitted: (email: string, isAuthenticated: boolean) => {
      // Track widget lead generation signup for analytics
      if (brief?.id && brief?.title && trackLeadGenSignup) {
        trackLeadGenSignup(String(brief.id), brief.title, 'sidebar_widget', isAuthenticated ? 'authenticated' : 'guest');
      }
    }
  } : undefined;

  const mobileHeaderProps = brief ? {
    companyName: brief.company_name || undefined,
    tickers: Array.isArray(brief.tickers) ? brief.tickers as string[] : undefined,
    onShareClick: () => setIsShareSheetOpen(true)
  } : {};

  return (
    <Layout
      showActionPanel={true}
      actionPanelType="brief"
      briefActionPanel={briefActionPanel}
      mobileHeader={mobileHeaderProps}
    >
      {/* Loading state */}
      {isLoading && (
        <div style={{ minHeight: '100vh' }}>
          <ArticleSkeleton />
        </div>
      )}

      {/* Brief Content */}
      {!isLoading && (
        <div style={{ minHeight: '100vh' }}>
        {/* Desktop Banner - Hidden on mobile */}
        <BriefDesktopBanner
          companyName={brief?.company_name || undefined}
          companyLogoUrl={brief?.company_logo_url || undefined}
          tickers={brief?.tickers || []}
          isScrolled={isScrolled}
          actions={[
            {
              type: 'back',
              onClick: handleBack
            },
            {
              type: 'share',
              onClick: () => setIsShareSheetOpen(true)
            }
          ]}
        />

        {/* Brief Header - Clean text-only header */}
        <div style={{
          padding: 'var(--space-10) var(--content-padding) var(--space-4) var(--content-padding)',
          maxWidth: '800px',
          margin: '0 auto',
        }}>
          {/* Title */}
          <h1 style={{
            fontSize: 'var(--brief-headline-size-desktop)',
            fontWeight: 'var(--font-bold)',
            lineHeight: 'var(--leading-tight)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)',
            letterSpacing: '-0.01em'
          }}>
            {brief?.title}
          </h1>

          {/* Disclaimer - Simple one-liner */}
          {brief?.disclaimer && (
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              // fontStyle: 'italic',
              fontWeight: 'var(--font-light)',
              marginBottom: 'var(--space-4)'
            }}>
              {brief.disclaimer}
            </p>
          )}

          {/* Featured Media - Mobile Position (below headline, above info bar) */}
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

        </div>

        {/* Main Content */}
        <main style={{
          padding: '0px var(--content-padding) 50px var(--content-padding)',
          maxWidth: '800px',
          margin: '0 auto'
        }}>

          {/* Meta Info - Date */}
          <div 
            className="meta-info-section"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-6)',
              paddingBottom: 'var(--space-4)',
              borderBottom: '0.5px solid var(--color-border-primary)'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Calendar style={{ width: '14px', height: '14px' }} />
              <span>{new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Clock style={{ width: '14px', height: '14px' }} />
              <span>4 min</span>
            </div>

     
            
          </div>

          {/* Subtitle - Clean callout style */}
          {brief?.subtitle && (
            <div style={{
              background: 'var(--color-bg-secondary)',
              border: '0.5px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6) var(--space-8)',
              marginBottom: 'var(--space-4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Subtle accent border */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                background: 'var(--color-success)',
                opacity: 0.6
              }} />
              
              <div style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-light)',
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



          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none brief-content-container">
                          {brief?.content ? (
                <div 
                  className="html-content brief-html-content"
                  dangerouslySetInnerHTML={{ 
                    __html: brief.content
                  }}
                ref={(el) => {
                  if (el && !contentProcessed) {
                    // Add IDs to H2 headings for TOC functionality
                    const h2Elements = el.querySelectorAll('h2');
                    h2Elements.forEach((h2, index) => {
                      if (!h2.id) {
                        const text = h2.textContent?.trim() || '';
                        const id = text
                          .toLowerCase()
                          .replace(/[^a-z0-9\s-]/g, '')
                          .replace(/\s+/g, '-')
                          .replace(/-+/g, '-')
                          .trim()
                          .replace(/^-+|-+$/g, '');
                        
                        if (id) {
                          h2.id = id;
                        }
                      }
                    });

                    // Optimize images in content for better performance
                    optimizeContentImages(el);
                    setContentProcessed(true);
                  }
                }}
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
      {brief && (
        <BriefLeadGenPopup
          brief={brief}
          triggerScrollPercentage={40}
          triggerScrollPixels={800} // Also trigger after 800px scroll (better for mobile)
          showDelay={2000}
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
      )}
      
      
      {/* CTA Banner - Only show when content is loaded */}
      {!isLoading && (
        <CTABanner 
          onCreateAccountClick={onCreateAccountClick}
          variant="secondary"
          position="bottom"
        />
      )}
      
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
      
      {/* Video Modal */}
      {brief?.video_url && (
        <VideoModal
          isOpen={isVideoModalOpen}
          onClose={handleVideoModalClose}
          videoUrl={brief.video_url}
          title={brief.title}
        />
      )}

    </Layout>
  );
};

export default BriefPage; 