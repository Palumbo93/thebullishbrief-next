"use client";

import React from 'react';
import { HeroSectionProps, isBrief, generateMetadata, shouldShowDate } from './types';

export const HeroSection: React.FC<HeroSectionProps> = ({
  heroContent,
  onArticleClick,
  onBriefClick
}) => {
  if (!heroContent) return null;

  const handleClick = () => {
    if (isBrief(heroContent)) {
      onBriefClick(heroContent.id, heroContent.title, heroContent.slug);
    } else {
      onArticleClick(heroContent.id, heroContent.title, heroContent.slug);
    }
  };

  const showDate = shouldShowDate(heroContent, true);
  const isHeroBrief = isBrief(heroContent);

  return (
    <section style={{
      padding: 'var(--space-12) var(--content-padding)',
      borderBottom: '0.5px solid var(--color-border-primary)',
      background: 'var(--color-bg-primary)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 'var(--space-8)',
            alignItems: 'center'
          }}
          className="hero-grid"
        >
          {/* Main Hero Content */}
          <div
            onClick={handleClick}
            style={{
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
          >
            {/* Category/Type Badge */}
            <div 
              className="hero-badge"
              style={{
                display: 'inline-block',
                color: 'var(--color-primary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                borderRadius: 'var(--radius-sm)',
                letterSpacing: '0.05em',
                marginBottom: 'var(--space-4)'
              }}>
              {isHeroBrief ? 'Featured Brief' : 'Featured'}
            </div>

            {/* Hero Headline */}
            <h1 
              className="hero-headline"
              style={{
                fontSize: 'clamp(2rem, 5vw, 3rem)',
                fontFamily: 'var(--font-editorial)',
                fontWeight: 'var(--font-semibold)',
                lineHeight: 'var(--leading-tight)',
                marginBottom: 'var(--space-4)',
                letterSpacing: '-0.02em',
                transition: 'opacity var(--transition-base)'
              }}
            >
              {heroContent.title}
            </h1>

            {/* Hero Subtitle */}
            <p 
              className="hero-subtitle"
              style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: 'var(--space-4)',
                maxWidth: '600px'
              }}>
              {heroContent.subtitle}
            </p>

            {/* Hero Meta */}
            <div 
              className="hero-meta"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-4)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)'
              }}>
              {isHeroBrief ? (
                // Brief metadata - show company name and reading time
                <>
                  <span>{heroContent.company_name}</span>
                  {heroContent.reading_time_minutes && (
                    <>
                      <span>•</span>
                      <span>{heroContent.reading_time_minutes} min</span>
                    </>
                  )}
                </>
              ) : (
                // Article metadata - show author and date/time
                <>
                  {generateMetadata(
                    heroContent.author,
                    heroContent.time,
                    heroContent.date,
                    showDate
                  ).split(' • ').map((item, index, array) => (
                    <React.Fragment key={index}>
                      <span>{item}</span>
                      {index < array.length - 1 && <span>•</span>}
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Hero Image */}
          {((heroContent as any).image || (heroContent as any).featured_image_url) && (
            <div 
              style={{
                aspectRatio: '4/3',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'var(--color-bg-tertiary)'
              }}
              className="hero-image"
            >
              <img
                src={(heroContent as any).image || (heroContent as any).featured_image_url}
                alt={heroContent.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          section {
            padding: var(--space-4) var(--content-padding) !important;
          }
          
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: var(--space-4) !important;
          }
          
          .hero-image {
            order: -1 !important;
            aspect-ratio: 16/9 !important;
          }
          
          .hero-headline {
            font-size: clamp(1.5rem, 4vw, 2rem) !important;
            margin-bottom: var(--space-3) !important;
          }
          
          .hero-badge {
            margin-bottom: var(--space-3) !important;
            font-size: 0.75rem !important;
          }
          
          .hero-subtitle {
            font-size: var(--text-base) !important;
            margin-bottom: var(--space-3) !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          
          .hero-meta {
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </section>
  );
};
