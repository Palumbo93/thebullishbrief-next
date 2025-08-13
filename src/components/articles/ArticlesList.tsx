import React from 'react';
import { ArticleCard } from './ArticleCard';

interface Article {
  id: number | string;
  category: string;
  title: string;
  subtitle: string;
  author: string;
  time: string;
  date: string;
  image: string;
  views: string;
  bookmark_count?: number;
  slug?: string;
}

interface ArticlesListProps {
  articles: Article[];
  categories: string[];
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onArticleClick?: (articleId: number | string, articleTitle: string) => void;
  isLoading?: boolean;
}

// Skeleton loading component for articles
const ArticleSkeleton: React.FC = () => (
  <article
    style={{
      position: 'relative',
      padding: 'var(--space-8) var(--content-padding)',
      borderBottom: '0.5px solid var(--color-border-primary)',
      background: 'transparent'
    }}
  >
    {/* Top line skeleton */}
    <div style={{
      marginBottom: 'var(--space-4)',
      fontSize: 'var(--text-sm)',
      color: 'var(--color-text-muted)'
    }}>
      <div style={{
        width: '200px',
        height: '16px',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }} />
    </div>

    {/* Main content skeleton */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      gap: 'var(--space-8)',
      alignItems: 'center',
      marginBottom: 'var(--space-4)'
    }}>
      {/* Text content skeleton */}
      <div style={{ minWidth: 0 }}>
        {/* Headline skeleton */}
        <div style={{
          width: '100%',
          height: '24px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-3)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
        
        {/* Subheadline skeleton */}
        <div style={{
          width: '80%',
          height: '16px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: 'var(--space-2)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
        <div style={{
          width: '60%',
          height: '16px',
          background: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-sm)',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }} />
      </div>
      
      {/* Image skeleton */}
      <div style={{
        width: '150px',
        height: '150px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--color-bg-tertiary)',
        flexShrink: 0,
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }} />
    </div>

    {/* Bottom line skeleton */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-6)',
      fontSize: 'var(--text-sm)',
      color: 'var(--color-text-muted)'
    }}>
      <div style={{
        width: '60px',
        height: '14px',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }} />
      <div style={{
        width: '40px',
        height: '14px',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }} />
      <div style={{
        width: '30px',
        height: '14px',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }} />
    </div>

    {/* Pulse animation */}
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
  </article>
);

export const ArticlesList: React.FC<ArticlesListProps> = ({ 
  articles, 
  categories, 
  activeFilter, 
  onFilterChange,
  onArticleClick,
  isLoading = false
}) => {
  const filteredArticles = activeFilter === 'All' 
    ? articles 
    : articles.filter(article => article.category === activeFilter);

  // Calculate reading time based on title and subtitle length
  const calculateReadingTime = (title: string, subtitle: string) => {
    const words = (title + ' ' + subtitle).split(' ').length;
    const readingTime = Math.ceil(words / 200); // Average reading speed
    return readingTime < 1 ? 1 : readingTime;
  };

  return (
    <section style={{ 
      padding: 0
    }}>
      <style>{`
        .article-filter-bar {
          position: sticky;
          top: 0;
          background: var(--color-bg-primary);
          border-bottom: 0.5px solid var(--color-border-primary);
          padding: var(--space-4) var(--content-padding);
          z-index: 10;
        }
        
        @media (max-width: 768px) {
          .article-filter-bar {
            top: 56px; /* Below mobile header */
          }
        }
      `}</style>
      
      {/* Filter Bar - Twitter-style top navigation */}
      <div className="article-filter-bar">
        {/* Category Filters - Horizontal scrollable */}
        <div className="hide-scrollbar-horizontal" style={{ 
          display: 'flex', 
          gap: 'var(--space-2)', 
          overflowX: 'auto',
          
        }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onFilterChange(category)}
              className={`btn ${activeFilter === category ? 'btn-primary' : 'btn-ghost'}`}
              style={{ 
                fontSize: 'var(--text-sm)',
                whiteSpace: 'nowrap',
                borderRadius: 'var(--radius-full)',
                padding: 'var(--space-2) var(--space-4)',
                minHeight: '32px'
              }}
            >
              {category}
            </button>
          ))}
        </div>
        

      </div>

      {/* Articles Feed - Twitter-style timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {isLoading ? (
          // Show skeleton loading states
          Array.from({ length: 5 }).map((_, index) => (
            <ArticleSkeleton key={`skeleton-${index}`} />
          ))
        ) : (
          // Show actual articles
          filteredArticles.map((article, index) => (
            <ArticleCard
              key={article.id} 
              article={article}
              onArticleClick={onArticleClick}
              onFilterChange={onFilterChange}
            />
          ))
        )}
      </div>


      {/* Empty State */}
      {!isLoading && filteredArticles.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: 'var(--space-16) 0',
          color: 'var(--color-text-tertiary)'
        }}>
          <h3 style={{ 
            fontSize: 'var(--text-xl)', 
            marginBottom: 'var(--space-2)',
            color: 'var(--color-text-secondary)'
          }}>
            No articles found
          </h3>
        </div>
      )}
    </section>
  );
};