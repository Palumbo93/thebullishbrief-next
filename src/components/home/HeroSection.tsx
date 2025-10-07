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

  const featuredImage = (heroContent as any).image || (heroContent as any).featured_image_url;

  return (
    <section style={{
      position: 'relative',
      minHeight: '60vh',
      borderBottom: '0.5px solid var(--color-border-primary)',
      background: featuredImage ? `url(${featuredImage})` : 'var(--color-bg-primary)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      overflow: 'hidden'
    }}>
      {/* Background overlay */}
      {featuredImage && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0.1) 100%)',
          zIndex: 1
        }} />
      )}
      
      <div style={{ 
        position: 'relative',
        zIndex: 2,
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '0 var(--content-padding) var(--space-12) var(--content-padding)',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'flex-end'
      }}>
        <div 
          className="hero-content"
        >
          {/* Main Hero Content */}
          <div
            onClick={handleClick}
            style={{
              cursor: 'pointer',
              color: featuredImage ? '#ffffff' : 'var(--color-text-primary)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            

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
                transition: 'opacity var(--transition-base)',
                maxWidth: '920px',
                marginRight: 'auto'
              }}
            >
              {heroContent.title}
            </h1>

            {/* Hero Subtitle */}
            <p 
              className="hero-subtitle"
              style={{
                fontSize: 'var(--text-lg)',
                color: featuredImage ? 'rgba(255, 255, 255, 0.9)' : 'var(--color-text-secondary)',
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
                color: featuredImage ? 'rgba(255, 255, 255, 0.8)' : 'var(--color-text-muted)'
              }}>
              {isHeroBrief ? (
                // Brief metadata - show company name and reading time
                <>
                  <span
                    style={{
                      color: 'white',
                background: 'var(--color-primary)',
                padding: 'var(--space-2) var(--space-4)',
                fontWeight: 'var(--font-semibold)',
                    }}
                  >{heroContent.company_name}</span>
                  {heroContent.reading_time_minutes && (
                    <>
                      <span>•</span>
                      <span>{heroContent.reading_time_minutes} min read</span>
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
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          section {
            min-height: 50vh !important;
          }
          
          .hero-content {
            max-width: 100% !important;
          }
          
          .hero-headline {
            font-size: clamp(1.5rem, 4vw, 2rem) !important;
            margin-bottom: var(--space-3) !important;
          }
          
          .hero-subtitle {
            font-size: var(--text-base) !important;
            margin-bottom: var(--space-3) !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 3 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          
          .hero-meta {
            font-size: 0.75rem !important;
            flex-wrap: wrap !important;
          }
        }
      `}</style>
    </section>
  );
};
