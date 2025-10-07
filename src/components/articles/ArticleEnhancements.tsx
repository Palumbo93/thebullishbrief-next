"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Tag } from 'lucide-react';
import { ServerArticle } from '../../page-components/ArticlePageServer';
import { ArticleAccessResult } from '../../lib/serverAccessControl';
import { TOCSection } from '../../utils/tocParser';
import ArticleActionPanel from './ArticleActionPanel';

interface ArticleEnhancementsProps {
  article: ServerArticle;
  tocSections: TOCSection[];
  relatedArticles: ServerArticle[];
  accessResult: ArticleAccessResult;
}

/**
 * Client component that handles enhanced article features like TOC and related articles
 * This component provides the action panel and related content functionality
 */
export const ArticleEnhancements: React.FC<ArticleEnhancementsProps> = ({
  article,
  tocSections,
  relatedArticles,
  accessResult
}) => {
  const router = useRouter();

  // Prepare action panel component
  const actionPanelComponent = (
    <ArticleActionPanel
      articleId={article.id}
      sections={tocSections}
      tags={article.tags || []}
      relatedArticles={relatedArticles.map(a => ({
        id: a.id,
        title: a.title,
        slug: a.slug,
        category: a.category,
        date: a.date,
        author: a.author
      }))}
      onTagClick={(tag) => {
        // Navigate to search page with tag selected
        router.push(`/search?tags=${encodeURIComponent(tag)}`);
      }}
      onRelatedArticleClick={(articleId, articleTitle) => {
        // Find the related article to get its slug
        const relatedArticle = relatedArticles.find(a => a.id === articleId);
        router.push(`/articles/${relatedArticle?.slug || articleId}`);
      }}
    />
  );

  return (
    <>
      {/* Desktop Action Panel - Rendered via Layout */}
      <div className="article-sticky-section desktop-only" style={{ display: 'none' }}>
        {actionPanelComponent}
      </div>

      {/* Mobile Related Articles Section */}
      {relatedArticles && relatedArticles.length > 0 && (
        <div 
          className="mobile-related-articles-section mobile-only" 
          style={{ 
            display: 'none',
            padding: 'var(--space-8) var(--content-padding)',
            maxWidth: 'var(--max-width)',
            margin: '0 auto',
            borderTop: '0.5px solid var(--color-border-primary)'
          }}
        >
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-semibold)',
            color: 'var(--color-text-primary)',
            margin: '0 0 var(--space-4) 0'
          }}>
            Related Articles
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-3)'
          }}>
            {relatedArticles.map((relatedArticle) => (
              <button
                key={relatedArticle.id}
                onClick={() => {
                  router.push(`/articles/${relatedArticle.slug || relatedArticle.id}`);
                }}
                style={{
                  width: '100%',
                  background: 'none',
                  border: '0.5px solid var(--color-border-primary)',
                  textAlign: 'left',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)'
                }}>
                  <h4 style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    lineHeight: '1.4',
                    margin: '0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {relatedArticle.title}
                  </h4>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)'
                  }}>
                    <span style={{
                      fontWeight: 'var(--font-medium)',
                      color: 'var(--color-primary)'
                    }}>
                      {relatedArticle.category}
                    </span>
                    <span>{relatedArticle.date}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Tags Section */}
      {article.tags && article.tags.length > 0 && (
        <div 
          className="mobile-tags-section mobile-only" 
          style={{
            display: 'none',
            padding: 'var(--space-8) var(--content-padding)',
            maxWidth: 'var(--max-width)',
            margin: '0 auto',
            borderTop: '0.5px solid var(--color-border-primary)'
          }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            marginBottom: 'var(--space-4)'
          }}>
            <Tag style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              margin: '0'
            }}>
              Tags
            </h3>
          </div>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--space-2)'
          }}>
            {article.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  router.push(`/search?tags=${encodeURIComponent(tag)}`);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  background: 'var(--color-bg-card)',
                  border: '0.5px solid var(--color-border-primary)',
                  color: 'var(--color-text-secondary)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                  e.currentTarget.style.color = 'var(--color-text-primary)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-card)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span style={{ opacity: 0.7 }}>#</span>
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @media (min-width: 769px) {
          .desktop-only {
            display: block !important;
          }
          .mobile-only {
            display: none !important;
          }
        }
        
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
      `}</style>
    </>
  );
};
