"use client";

import React from 'react';
import { FeaturedStoriesGridProps, generateMetadata } from './types';

export const FeaturedStoriesGrid: React.FC<FeaturedStoriesGridProps> = ({
  articles,
  title,
  onArticleClick
}) => {
  if (!articles || articles.length === 0) return null;

  const primaryArticle = articles[0];
  const secondaryArticles = articles.slice(1, 4);

  return (
    <section style={{
      padding: 'var(--space-8) var(--content-padding)',
      borderBottom: '0.5px solid var(--color-border-primary)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontFamily: 'var(--font-editorial)',
          fontWeight: 'var(--font-normal)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-6)',
          borderBottom: '2px solid var(--color-border-primary)',
          paddingBottom: 'var(--space-3)'
        }}>
          {title}
        </h2>
        
        {/* Editorial Grid Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: 'var(--space-8)',
          minHeight: '400px'
        }} className="featured-grid">
          {/* Left Side - Primary Article */}
          {primaryArticle && (
            <div
              onClick={() => onArticleClick(primaryArticle.id, primaryArticle.title, primaryArticle.slug)}
              style={{
                cursor: 'pointer',
                padding: 'var(--space-6) var(--space-6) var(--space-6) 0px',
                borderRight: '0.5px solid var(--color-border-primary)',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-text-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
            >
              {/* Article Image */}
              {primaryArticle.image && (
                <div style={{
                  aspectRatio: '16/9',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: 'var(--color-bg-tertiary)',
                  marginBottom: 'var(--space-4)'
                }}>
                  <img
                    src={primaryArticle.image}
                    alt={primaryArticle.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}

              {/* Category Badge - moved below image */}
              <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-1)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
              }}>
                {primaryArticle.category}
              </div>

              {/* Article Title */}
              <h3 style={{
                fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                fontFamily: 'var(--font-editorial)',
                fontWeight: 'var(--font-normal)',
                lineHeight: 'var(--leading-tight)',
                marginBottom: 'var(--space-3)',
                letterSpacing: '-0.02em',
                transition: 'opacity var(--transition-base)'
              }}
              >
                {primaryArticle.title}
              </h3>

              {/* Article Subtitle */}
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--color-text-secondary)',
                lineHeight: 'var(--leading-relaxed)',
                marginBottom: 'auto',
                opacity: 0.9
              }}>
                {primaryArticle.subtitle}
              </p>

              {/* Article Meta */}
              <div style={{
                marginTop: 'var(--space-4)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)'
              }}>
                {generateMetadata(primaryArticle.author, primaryArticle.time, primaryArticle.date, true)}
              </div>
            </div>
          )}

          {/* Right Side - Secondary Articles */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}>
            {secondaryArticles.map((article, index) => (
              <div
                key={article.id}
                onClick={() => onArticleClick(article.id, article.title, article.slug)}
                style={{
                  cursor: 'pointer',
                  padding: 'var(--space-4) 0px var(--space-4) 0px',
                  borderBottom: '0.5px solid var(--color-border-primary)',
                  flex: '1'
                }}
              >
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 'var(--space-3)',
                  alignItems: 'flex-start'
                }}>
                  <div>
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)',
                      marginBottom: 'var(--space-1)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {article.category}
                    </div>
                    
                    <h4 style={{
                      fontSize: 'var(--text-base)',
                      fontFamily: 'var(--font-editorial)',
                      fontWeight: 'var(--font-normal)',
                      color: 'var(--color-text-primary)',
                      lineHeight: 'var(--leading-tight)',
                      marginBottom: 'var(--space-2)',
                      letterSpacing: '-0.01em',
                      transition: 'opacity var(--transition-base)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.7';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                    }}
                    >
                      {article.title}
                    </h4>
                    
                    <div style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-muted)'
                    }}>
                      {generateMetadata(article.author, article.time, article.date, true)}
                    </div>
                  </div>
                  
                  {/* Small thumbnail */}
                  {article.image && (
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      background: 'var(--color-bg-tertiary)',
                      flexShrink: 0
                    }}>
                      <img
                        src={article.image}
                        alt={article.title}
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
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .featured-grid {
            grid-template-columns: 1fr !important;
            gap: var(--space-6) !important;
          }
          
          .featured-grid > div:first-child {
            border-right: none !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </section>
  );
};
