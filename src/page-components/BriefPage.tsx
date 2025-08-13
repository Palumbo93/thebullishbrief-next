"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBriefBySlug } from '../hooks/useBriefs';
import { useTrackBriefEngagement } from '../hooks/useAnalytics';
import { ArrowLeft, User, Calendar, Clock, Eye } from 'lucide-react';
import { calculateReadingTime, formatReadingTime } from '../utils/readingTime';

import { parseTOCFromContent, getFirstTickerSymbol } from '../utils/tocParser';
import TradingViewWidget from '../components/TradingViewWidget';
import CustomWidget from '../components/CustomWidget';
import { useAuth } from '../contexts/AuthContext';
import { ShareSheet } from '../components/ShareSheet';
import { Button } from '../components/ui/Button';
import { CTABanner } from '../components/CTABanner';
import { LegalFooter } from '../components/LegalFooter';
import { BriefDesktopBanner } from '../components/briefs/BriefDesktopBanner';
import { Layout } from '../components/Layout';
import { ArticleSkeleton } from '@/components/ArticleSkeleton';


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
  const { data: brief, isLoading, error } = useBriefBySlug(briefSlug);
  
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        router.push('/');
      }
    }
  };
  const { trackView: trackAnalyticsView, trackShare: trackAnalyticsShare } = useTrackBriefEngagement();

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = React.useState(false);
  
  // Calculate reading time from brief content
  const readingTime = React.useMemo(() => {
    return brief?.content ? calculateReadingTime(brief.content) : 5;
  }, [brief?.content]);
  
  // Handle scroll for header background
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track view when brief loads
  React.useEffect(() => {
    if (brief && brief.title) {
      // Track analytics view
      trackAnalyticsView(String(brief.id), brief.title);
    }
  }, [brief]);



  // Mobile navigation items


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
    tickerWidget,
    sections: tocSections,
    tickers: brief.tickers,
    companyName: brief.company_name || undefined,
    companyLogoUrl: brief.company_logo_url || undefined,
    investorDeckUrl: brief.investor_deck_url || undefined
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

        {/* Brief Header with Background Image */}
        <div style={{
          position: 'relative',
          backgroundImage: `url(${brief?.featured_image_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
          marginBottom: 'var(--space-8)',
          minHeight: '250px',
          display: 'flex',
          alignItems: 'flex-end',
        }}>
          {/* Gradient Overlay */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 40%, rgba(0, 0, 0, 0.85) 70%, rgba(0, 0, 0, 0.95) 85%, rgba(0, 0, 0, 1) 100%)',
            zIndex: 1
          }} />
          
          {/* Grain Texture Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(255,255,255,0.02) 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: '8px 8px, 8px 8px',
            backgroundPosition: '0 0, 4px 4px',
            opacity: 0.5,
            pointerEvents: 'none',
            zIndex: 2
          }} />
          
          {/* Content */}
          <div style={{
            position: 'relative',
            zIndex: 3,
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            padding: 'var(--space-16) var(--content-padding) 0 var(--content-padding)',
            maxWidth: '800px',
            margin: '0 auto',
          }}>


            {/* Title */}
            <h1 style={{
              fontSize: 'var(--headline-size-desktop)',
              fontFamily: 'var(--font-editorial)',
              fontWeight: 'var(--font-normal)',
              lineHeight: 'var(--leading-tight)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)',
              letterSpacing: '-0.01em'
            }}>
              {brief?.title}
            </h1>

            
          </div>
        </div>

        {/* Main Content */}
        <main style={{
          padding: '0px var(--content-padding) 50px var(--content-padding)',
          maxWidth: '800px',
          margin: '0 auto'
        }}>

          {/* Meta Info - Date and Reading Time */}
          <div style={{
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
              <span>{(brief as any)?.date || new Date(brief?.created_at || new Date()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <Clock style={{ width: '14px', height: '14px' }} />
              <span>{formatReadingTime(readingTime)}</span>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {brief?.content ? (
              <div 
                className="html-content"
                dangerouslySetInnerHTML={{ 
                  __html: brief.content
                }}
                ref={(el) => {
                  if (el) {
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



          {/* Disclaimer */}
          {brief?.disclaimer && (
            <div style={{
              marginTop: 'var(--space-8)',
              padding: 'var(--space-4)',
              background: 'var(--color-bg-card)',
              border: '0.5px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-lg)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-secondary)'
            }}>
              <strong>Disclaimer:</strong> {brief.disclaimer}
            </div>
          )}
        </main>


      </div>
      )}
      
      {/* CTA Banner */}
      <CTABanner 
        onCreateAccountClick={onCreateAccountClick}
        variant="secondary"
        position="bottom"
      />
      
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
      
    </Layout>
  );
};

export default BriefPage; 