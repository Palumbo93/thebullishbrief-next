"use client";

import React from 'react';

interface Article {
  id: number | string;
  category: string;
  categorySlug?: string;
  title: string;
  subtitle: string;
  author?: string;
  authorAvatar?: string;
  authorSlug?: string;
  time: string;
  date: string;
  image: string;
  bookmark_count?: number;
  slug?: string;
}

interface ArticleCardProps {
  article: Article;
  onArticleClick?: (articleId: number | string, articleTitle: string, slug?: string) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  onArticleClick
}) => {
  // Format date to show year only if not current year
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const currentYear = new Date().getFullYear();
    const articleYear = date.getFullYear();
    
    if (articleYear === currentYear) {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const handleArticleClick = () => {
    onArticleClick?.(article.id, article.title, article.slug);
  };

  // Helper function to format metadata properly
  const formatMetadata = (items: (string | null | undefined)[]): string => {
    return items.filter(Boolean).join(' • ');
  };

  const generateMetadata = (): string => {
    const metadataItems: string[] = [];
    
    if (article.author && article.author.trim()) {
      metadataItems.push(`By ${article.author.trim()}`);
    }
    
    if (article.date) {
      metadataItems.push(formatDate(article.date));
    }
    
    if (article.time) {
      metadataItems.push(article.time);
    }
    
    return formatMetadata(metadataItems);
  };

  return (
    <div
      onClick={handleArticleClick}
      style={{
        cursor: 'pointer',
        borderBottom: '0.5px solid var(--color-border-primary)',
        padding: 'var(--space-4) 0px',
        transition: 'opacity var(--transition-base)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--color-text-muted)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--color-text-primary)';
      }}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 'var(--space-4)',
        alignItems: 'flex-start'
      }}>
        <div>
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-2)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            {article.category}
          </div>
          
          <h3 style={{
            fontSize: 'var(--text-lg)',
            fontFamily: 'var(--font-editorial)',
            fontWeight: 'var(--font-normal)',
            lineHeight: 'var(--leading-tight)',
            marginBottom: 'var(--space-2)',
            letterSpacing: '-0.01em'
          }}>
            {article.title}
          </h3>
          
          <div style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)'
          }}>
            {generateMetadata()}
          </div>
        </div>
        
        {article.image && (
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: 'var(--radius-md)',
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
  );
}; 