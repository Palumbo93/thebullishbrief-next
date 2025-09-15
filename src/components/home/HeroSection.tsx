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
      padding: 'var(--space-8) var(--content-padding)',
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
            <div style={{
              display: 'inline-block',
              padding: 'var(--space-1) var(--space-3)',
              background: isHeroBrief ? 'var(--color-primary)' : 'var(--color-accent)',
              color: isHeroBrief ? 'white' : 'var(--color-text-primary)',
              fontSize: 'var(--text-xs)',
              fontWeight: '600',
              borderRadius: 'var(--radius-sm)',
              letterSpacing: '0.05em',
              marginBottom: 'var(--space-4)'
            }}>
              {isHeroBrief ? 'Featured Brief' : 'Featured'}
            </div>

            {/* Hero Headline */}
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontFamily: 'var(--font-editorial)',
              fontWeight: 'var(--font-normal)',
              lineHeight: 'var(--leading-tight)',
              marginBottom: 'var(--space-4)',
              letterSpacing: '-0.02em',
              transition: 'opacity var(--transition-base)'
            }}
            >
              {heroContent.title}
            </h1>

            {/* Hero Subtitle */}
            <p style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              marginBottom: 'var(--space-4)',
              maxWidth: '600px'
            }}>
              {heroContent.subtitle}
            </p>

            {/* Hero Meta */}
            <div style={{
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
          .hero-grid {
            grid-template-columns: 1fr !important;
            gap: var(--space-6) !important;
          }
          
          .hero-image {
            order: -1 !important;
          }
        }
      `}</style>
    </section>
  );
};
