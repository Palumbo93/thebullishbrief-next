import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import Image from 'next/image';
import { FeaturedMedia } from '../components/briefs/FeaturedMedia';
import AudioNativeController from '../components/AudioNativeController';

// Server-side Brief interface (simplified from database)
export interface ServerBrief {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  content?: string;
  disclaimer?: string;
  company_name?: string;
  tickers?: string[];
  brokerage_links?: { [key: string]: string } | null;
  featured_image_url?: string;
  featured_image_alt?: string;
  video_url?: string;
  featured_video_thumbnail?: string;
  feature_featured_video?: boolean;
  show_featured_media?: boolean;
  published_at?: string;
  created_at?: string;
  reading_time_minutes?: number;
  additional_copy?: any;
  popup_copy?: any;
}

interface BriefPageServerProps {
  brief: ServerBrief;
  slug: string;
}

export async function BriefPageServer({
  brief,
  slug
}: BriefPageServerProps) {
  // Calculate reading time if not provided
  const readingTime = brief.reading_time_minutes || 4;

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const displayDate = formatDate(brief.published_at || brief.created_at);

  // Process content for server rendering
  const processedContent = (() => {
    if (!brief.content) return '';
    
    // For server components, we'll return the content as-is
    // Content processing will be handled by client components if needed
    return brief.content;
  })();

  const maxWidth = 'var(--max-width)';

  return (
    <>
      {/* Main Brief Content - Server Rendered */}
      <div style={{ minHeight: '80vh', position: 'relative' }}>

        {/* Brief Header - Clean text-only header */}
        <div
          className="article-brief-header"
          style={{
            maxWidth: maxWidth,
            margin: '0 auto'
          }}
        >
          {/* Title */}
          <h1 className="article-brief-title" style={{
            marginBottom: 'var(--space-4)',
          }}>
            {brief.title}
          </h1>

          {/* Featured Media - Mobile Position (below headline, above info bar) */}
          {brief.show_featured_media !== false && (
            <div className="mobile-only" style={{ marginBottom: 'var(--space-4)' }}>
              <FeaturedMedia
                featureFeaturedVideo={brief.feature_featured_video}
                videoUrl={brief.video_url || undefined}
                videoThumbnail={brief.featured_video_thumbnail || undefined}
                featuredImageUrl={brief.featured_image_url || undefined}
                title={brief.title || undefined}
                // Note: onVideoClick will be handled by client component
              />
            </div>
          )}

          {/* Disclaimer - Simple one-liner */}
          {brief.disclaimer && (
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
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
          maxWidth: maxWidth,
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
                <span>{displayDate}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                <Clock style={{ width: '14px', height: '14px' }} />
                <span>{readingTime} min</span>
              </div>
            </div>

            {/* Share Button placeholder - will be enhanced by client component */}
            <div id="share-button-placeholder" style={{
              padding: 'var(--space-1) var(--space-2)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              opacity: 0.5
            }}>
              Share
            </div>
          </div>

          {/* Subtitle - Clean callout style */}
          {brief.subtitle && (
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

          {/* Featured Media - Desktop Position */}
          {brief.show_featured_media !== false && (
            <div style={{ display: 'none', marginBottom: 'var(--space-8)' }} className="desktop-only">
              <FeaturedMedia
                featureFeaturedVideo={brief.feature_featured_video}
                videoUrl={brief.video_url || undefined}
                videoThumbnail={brief.featured_video_thumbnail || undefined}
                featuredImageUrl={brief.featured_image_url || undefined}
                title={brief.title || undefined}
                // Note: onVideoClick will be handled by client component
              />
            </div>
          )}

          {/* Audio Native Player */}
          <AudioNativeController
            textColorRgba='rgba(255, 255, 255, 1.0)'
            backgroundColorRgba='rgba(7, 102, 255, 1.0)'
            contentType="brief"
            title={brief.title}
            size="small"
            triggerOffset={400}
            metaInfoSelector=".meta-info-section"
            actionPanelSelector=".briefs-sticky-section"
          />

          {/* Brief Content - Server Rendered HTML */}
          <article 
            className="prose prose-invert prose-lg max-w-none brief-content-container" 
            itemScope 
            itemType="https://schema.org/Article"
          >
            {/* Schema.org metadata for better content identification */}
            <meta itemProp="headline" content={brief.title} />
            <meta itemProp="datePublished" content={brief.published_at || brief.created_at || ''} />
            {brief.company_name && <meta itemProp="about" content={brief.company_name} />}
            
            <div className="brief-content" data-elevenlabs-content="true">
              {brief.content ? (
                <div
                  className="html-content brief-html-content server-content"
                  dangerouslySetInnerHTML={{ __html: processedContent }}
                />
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: 'var(--space-12)',
                  background: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-xl)',
                  marginBottom: 'var(--space-8)',
                  border: '1px solid var(--color-border-primary)'
                }}>
                  <p style={{
                    fontSize: 'var(--text-lg)',
                    color: 'var(--color-text-secondary)',
                    marginBottom: 'var(--space-6)'
                  }}>
                    This brief is available to premium subscribers only.
                  </p>
                  <div id="subscribe-button-placeholder">
                    {/* Client component will replace this */}
                  </div>
                </div>
              )}
            </div>
          </article>
        </main>
      </div>

      {/* Server Component Styles - Using inline styles to avoid styled-jsx */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .article-brief-header {
            padding: var(--space-12) var(--content-padding) var(--space-4) var(--content-padding);
          }

          .article-brief-title {
            font-family: var(--font-editorial);
            font-weight: var(--font-semibold);
            color: var(--color-text-primary);
            font-size: clamp(1.875rem, 4vw, 2.5rem);
            line-height: var(--leading-tight);
            letter-spacing: -0.01em;
          }

          @media (max-width: 768px) {
            .article-brief-header {
              padding: var(--space-4) var(--content-padding) var(--space-3) var(--content-padding);
            }

            .article-brief-title {
              font-size: clamp(1.875rem, 6vw, 2.5rem);
            }

            .mobile-category-info {
              display: block !important;
            }
          }

          .mobile-only {
            display: none;
          }

          .desktop-only {
            display: block;
          }

          @media (max-width: 768px) {
            .mobile-only {
              display: block !important;
            }

            .desktop-only {
              display: none !important;
            }
          }
        `
      }} />
    </>
  );
}
