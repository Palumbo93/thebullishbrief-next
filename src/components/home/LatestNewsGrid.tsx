"use client";

import React from 'react';
import { LatestNewsGridProps, generateMetadata } from './types';

export const LatestNewsGrid: React.FC<LatestNewsGridProps> = ({
  articles,
  title,
  onArticleClick,
  maxItems = 9
}) => {
  if (!articles || articles.length === 0) return null;

  const displayArticles = articles.slice(0, maxItems);

  return (
    <section style={{
      padding: 'var(--space-8) var(--content-padding)'
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
        
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'var(--space-6)'
          }}
          className="latest-news-grid"
        >
          {displayArticles.map((article) => (
            <div
              key={article.id}
              onClick={() => onArticleClick(article.id, article.title, article.slug)}
              style={{
                cursor: 'pointer',
                padding: 'var(--space-4) 0px',
                borderBottom: '1px solid var(--color-border-primary)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-text-muted)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text-primary)';
              }}
            >
              {/* Article Image */}
              {article.image && (
                <div style={{
                  aspectRatio: '16/9',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  background: 'var(--color-bg-tertiary)',
                  marginBottom: 'var(--space-4)'
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

              {/* Category */}
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
                marginBottom: 'var(--space-2)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                {article.category}
              </div>

              {/* Article Title */}
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontFamily: 'var(--font-editorial)',
                fontWeight: 'var(--font-normal)',
                lineHeight: 'var(--leading-tight)',
                marginBottom: 'var(--space-3)',
                letterSpacing: '-0.01em',
                transition: 'opacity var(--transition-base)'
              }}
              >
                {article.title}
              </h3>

              {/* Article Meta */}
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)'
              }}>
                {generateMetadata(article.author, article.time, article.date, true)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          .latest-news-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
};
