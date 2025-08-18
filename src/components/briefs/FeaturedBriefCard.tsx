import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useFeaturedBrief } from '../../hooks/useBriefs';
import { getTickers } from '../../utils/tickerUtils';
import { BriefCardImage, CompanyLogoImage } from '../ui/OptimizedImage';

interface FeaturedBriefCardProps {
  className?: string;
}

interface MediaComponentProps {
  brief: any;
  isMobile?: boolean;
}

const MediaComponent: React.FC<MediaComponentProps> = ({ brief, isMobile = false }) => {
  const containerStyle: React.CSSProperties = isMobile ? {
    width: '100%',
    height: '200px',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    background: 'var(--color-bg-tertiary)',
    flexShrink: 0,
    position: 'relative',
    marginBottom: 'var(--space-4)'
  } : {
    width: '220px',
    height: '140px',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
    background: 'var(--color-bg-tertiary)',
    flexShrink: 0,
    position: 'relative'
  };

  return (
    <div style={containerStyle}>
      {brief.video_url ? (
        // Video with play button overlay
        <>
          <video
            src={brief.video_url}
            poster={brief.featured_image_url || undefined}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            autoPlay
            muted
            loop
            playsInline
          />
          {/* Play button overlay */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.18)',
            }}
          >
            <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="22" cy="22" r="22" fill="rgba(0,0,0,0.55)" />
              <polygon points="18,14 32,22 18,30" fill="#FFD700" />
            </svg>
          </div>
        </>
      ) : brief.featured_image_url ? (
        // Featured image
        <BriefCardImage
          src={brief.featured_image_url}
          alt={brief.featured_image_alt || brief.title || ''}
        />
      ) : (
        // Placeholder
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-bg-tertiary)',
          color: 'var(--color-text-tertiary)',
          fontSize: 'var(--text-sm)'
        }}>
          No Media
        </div>
      )}
    </div>
  );
};

export const FeaturedBriefCard: React.FC<FeaturedBriefCardProps> = ({ className }) => {
  const { data: brief, isLoading, error } = useFeaturedBrief();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768); // 768px breakpoint for mobile
    };

    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  // If no featured brief or loading, don't render anything
  if (isLoading || error || !brief) {
    return null;
  }

  return (
    <div>
      <Link
        href={`/briefs/${brief.slug}`}
        style={{
          position: 'relative',
          padding: 'var(--space-8) var(--content-padding)',
          borderBottom: '0.5px solid var(--color-border-primary)',
          cursor: 'pointer',
          transition: 'all var(--transition-slow)',
          background: 'transparent',
          marginBottom: 'var(--space-6)',
          textDecoration: 'none',
          display: 'block'
        }}
        className={className}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--color-bg-secondary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {/* Mobile: Video/Image above header */}
        {isMobile && <MediaComponent brief={brief} isMobile={true} />}

        {/* Company Profile and Sponsored Badge Row */}
        <div style={{
          marginBottom: 'var(--space-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          {/* Company Profile Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: '999px',
            padding: '0.25rem 0.75rem 0.25rem 0.25rem',
            width: 'fit-content'
          }}>
            {brief.company_logo_url ? (
            <CompanyLogoImage
              src={brief.company_logo_url}
              alt={`${brief.company_name} Logo`}
              size="md"
            />
          ) : (
            <div style={{
              height: '32px',
              width: '32px',
              borderRadius: '50%',
              background: 'var(--color-bg-tertiary)',
              marginRight: '10px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-tertiary)'
            }}>
              {brief.company_name?.charAt(0) || 'B'}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <div style={{ 
              fontWeight: 700, 
              color: 'var(--color-text-primary)', 
              fontSize: '1rem', 
              letterSpacing: '0.01em', 
              marginBottom: '5px', 
              lineHeight: 1.1 
            }}>
              {brief.company_name || 'Brief'}
            </div>
            <div style={{ 
              color: 'var(--color-text-tertiary)', 
              fontSize: '0.85rem', 
              fontWeight: 500, 
              lineHeight: 1.1 
            }}>
              {(() => {
                const tickers = getTickers(brief.tickers);
                if (!tickers || tickers.length === 0) {
                  return 'Featured Brief';
                }
                
                return (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    flexWrap: 'wrap'
                  }}>
                    {tickers.map((ticker) => (
                      <span
                        key={`${ticker.exchange}-${ticker.symbol}`}
                        style={{
                          background: 'var(--color-bg-tertiary)',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          fontWeight: 'var(--font-medium)',
                          color: 'var(--color-text-secondary)'
                        }}
                      >
                        {ticker.exchange}:{ticker.symbol}
                      </span>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
          
        {/* Sponsored Badge */}
          {brief.sponsored && (
            <div style={{
              background: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-medium)',
              padding: 'var(--space-1) var(--space-2)',
              borderRadius: 'var(--radius-full)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Sponsored
            </div>
          )}
        </div>

        {/* Main content: headline, subheadline inline with video/image (desktop only) */}
        <div style={{
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: isMobile ? 'none' : '1fr auto',
          gap: isMobile ? '0' : 'var(--space-8)',
          alignItems: isMobile ? 'stretch' : 'center',
          marginBottom: 'var(--space-4)'
        }}>
          {/* Text content */}
          <div style={{ minWidth: 0 }}>
            {/* Headline */}
            <h2 style={{
              fontSize: isMobile ? '1.5rem' : '1.875rem',
              fontFamily: 'var(--font-editorial)',
              fontWeight: 'var(--font-normal)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--leading-tight)',
              marginBottom: 'var(--space-3)',
              letterSpacing: '-0.02em'
            }}>
              {brief.title}
            </h2>
            
            {/* Subheadline */}
            <p style={{
              color: 'var(--color-text-tertiary)',
              fontSize: 'var(--text-base)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: isMobile ? '100%' : '600px'
            }}>
              {brief.subtitle}
            </p>
          </div>
          
          {/* Desktop: Video or Image */}
          {!isMobile && <MediaComponent brief={brief} isMobile={false} />}
        </div>

        {/* Bottom line: Continue Reading */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)'
        }}>
          <span>Continue Reading</span>
        </div>
      </Link>
    </div>
  );
}; 