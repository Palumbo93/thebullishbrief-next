"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArticlesList } from '../components/articles/ArticlesList';
import { LegalFooter } from '../components/LegalFooter';
import { useArticlesByCategorySlug, useCategoryBySlug, Article } from '../hooks/useArticles';
import { ArticleSkeleton } from '@/components/ArticleSkeleton';

interface CategoryPageClientProps {
  params: Promise<{ slug: string }>;
}

export const CategoryPageClient: React.FC<CategoryPageClientProps> = ({ params }) => {
  const router = useRouter();
  const resolvedParams = use(params);
  const { slug } = resolvedParams;
  
  // Fetch category info and articles
  const { data: category, isLoading: categoryLoading, error: categoryError } = useCategoryBySlug(slug);
  const { data: articles = [], isLoading: articlesLoading } = useArticlesByCategorySlug(slug);
  
  const handleArticleClick = (articleId: number | string, articleTitle: string) => {
    // Find the article to get its slug
    const article = articles.find((a: Article) => a.id === articleId);
    const routeId = article?.slug || articleId;
    router.push(`/articles/${routeId}`);
  };

  // Handle loading states
  if (categoryLoading) {
    return (
      <>
        <div style={{ minHeight: '100vh' }}>
          <div style={{ 
            padding: 'var(--space-6) var(--content-padding) var(--space-4)',
            borderBottom: '0.5px solid var(--color-border-primary)'
          }}>
            <div style={{
              maxWidth: 'var(--max-width)',
              margin: '0 auto',
              textAlign: 'left'
            }}>
              <div style={{
                width: '200px',
                height: '24px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 0,
            maxWidth: 'var(--max-width)',
            margin: '0 auto',
            width: '100%'
          }}>
            <ArticleSkeleton />
          </div>
          
          <style>{`
            @keyframes pulse {
              0%, 100% {
                opacity: 1;
              }
              50% {
                opacity: .5;
              }
            }
          `}</style>
        </div>
        <LegalFooter />
      </>
    );
  }

  // Handle category not found
  if (categoryError || !category) {
    return (
      <>
        <div style={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-8) var(--content-padding)'
        }}>
          <div style={{ 
            textAlign: 'center',
            maxWidth: 'var(--max-width)',
            margin: '0 auto'
          }}>
            <h1 style={{ 
              fontSize: 'var(--text-4xl)', 
              marginBottom: 'var(--space-4)',
              color: 'var(--color-text-primary)'
            }}>
              Category Not Found
            </h1>
            <p style={{ 
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--space-6)'
            }}>
              The category "{slug}" could not be found.
            </p>
            <button
              onClick={() => router.push('/')}
              style={{
                padding: 'var(--space-3) var(--space-6)',
                background: 'var(--color-primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-base)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-primary-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-primary)';
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
        <LegalFooter />
      </>
    );
  }

  return (
    <>
      <div style={{ minHeight: '100vh' }}>
        {/* Category Header */}
        <div style={{ 
          padding: 'var(--space-6) var(--content-padding) var(--space-4)',
          borderBottom: '0.5px solid var(--color-border-primary)',
          background: 'var(--color-bg-primary)'
        }}>
          <div style={{ 
            maxWidth: 'var(--max-width)', 
            margin: '0 auto',
            textAlign: 'left'
          }}>
            <h1 style={{ 
              fontSize: 'var(--text-2xl)', 
              fontFamily: 'var(--font-editorial)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)',
              letterSpacing: '-0.02em'
            }}>
              {category.name}
            </h1>
          </div>
        </div>

        {/* Articles List with Container */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 0,
          maxWidth: 'var(--max-width)',
          margin: '0 auto',
          width: '100%'
        }}>
          <ArticlesList 
            articles={articles}
            onArticleClick={handleArticleClick}
            isLoading={articlesLoading}
          />
        </div>
      </div>
      
      <LegalFooter />
    </>
  );
};
