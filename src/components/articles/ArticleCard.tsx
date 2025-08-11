"use client";
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, Bookmark, MessageSquare, Clock } from 'lucide-react';
import { useToggleBookmark, useIsBookmarked } from '../../hooks/useArticles';
import { useAuth } from '../../contexts/AuthContext';
import { useArticleViewCount } from '../../hooks/useArticleViews';

interface Article {
  id: number | string;
  category: string;
  title: string;
  subtitle: string;
  author: string;
  authorAvatar?: string;
  authorSlug?: string;
  time: string;
  date: string;
  image: string;
  views: string;
  bookmark_count?: number;
  comment_count?: number;
  slug?: string;
}

interface ArticleCardProps {
  article: Article;
  onArticleClick?: (articleId: number | string, articleTitle: string) => void;
  onFilterChange?: (filter: string) => void;
  hasHorizontalPadding?: boolean;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  onArticleClick,
  onFilterChange,
  hasHorizontalPadding = true
}) => {
  const { user } = useAuth();
  const toggleBookmark = useToggleBookmark();
  const { data: isBookmarked } = useIsBookmarked(article.id);
  const { data: viewCount } = useArticleViewCount(String(article.id));
  const router = useRouter();
  
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
  
  // Local state for immediate feedback
  const [localBookmarkCount, setLocalBookmarkCount] = React.useState(article.bookmark_count || 0);
  
  // Update local count when article prop changes
  React.useEffect(() => {
    setLocalBookmarkCount(article.bookmark_count || 0);
  }, [article.bookmark_count]);

  const handleArticleClick = () => {
    onArticleClick?.(article.id, article.title);
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Navigate to home page with category parameter
    const categoryParam = article.category === 'All' ? '' : `?category=${encodeURIComponent(article.category)}`;
    router.push(`/${categoryParam}`);
  };

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (article.authorSlug) {
      router.push(`/authors/${article.authorSlug}`);
    }
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (user) {
      // Optimistically update the count immediately
      const newCount = isBookmarked ? Math.max(localBookmarkCount - 1, 0) : localBookmarkCount + 1;
      setLocalBookmarkCount(newCount);
      
      // Then perform the actual bookmark operation
      toggleBookmark.mutate(String(article.id));
    }
  };

  // Get the route ID (slug or id)
  const routeId = article.slug || article.id;
  const articleUrl = `/articles/${routeId}`;

  // List  - redesigned according to specifications
  return (
    <Link
      href={articleUrl}
      style={{
        position: 'relative',
        padding: `var(--space-8) ${hasHorizontalPadding ? 'var(--content-padding)' : '0'}`,
        borderBottom: '0.5px solid var(--color-border-primary)',
        cursor: 'pointer',
        transition: 'all var(--transition-slow)',
        background: 'transparent',
        textDecoration: 'none',
        display: 'block'
      }}
      onClick={handleArticleClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--color-bg-secondary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      {/* Top line: "In {category} by {author}" */}
      <div style={{
        marginBottom: 'var(--space-4)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)'
      }}>
        <span>In </span>
        <button
          onClick={handleCategoryClick}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            transition: 'color var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
        >
          {article.category}
        </button>
        <span> by </span>
        <button
          onClick={handleAuthorClick}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-semibold)',
            transition: 'color var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
        >
          {article.author}
        </button>
      </div>

      {/* Main content: headline, subheadline inline with image */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 'var(--space-8)',
        alignItems: 'center',
        marginBottom: 'var(--space-4)'
      }}>
        {/* Text content */}
        <div style={{ minWidth: 0 }}>
          {/* Headline */}
          <h2 style={{
            fontSize: '1.875rem',
            fontFamily: 'var(--font-editorial)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--leading-tight)',
            marginBottom: 'var(--space-3)',
            letterSpacing: '-0.02em'
          }}>
            {article.title}
          </h2>
          
          {/* Subheadline */}
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-base)',
            lineHeight: 'var(--leading-relaxed)',
            maxWidth: '600px'
          }}>
            {article.subtitle}
          </p>
          
          {/* Published date line */}
          {article.date && (
            <div style={{
              marginTop: 'var(--space-3)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)'
            }}>
              Published {formatDate(article.date)}
            </div>
          )}
        </div>
        
        {/* Image */}
        {article.image && (
          <div style={{
            width: 'min(150px, 25vw)',
            height: 'min(150px, 25vw)',
            borderRadius: 'var(--radius-lg)',
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
                objectFit: 'cover',
                transition: 'transform var(--transition-slow)'
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom line: read time, views, comments, bookmark */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-6)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <Clock style={{ width: '16px', height: '16px' }} />
          <span>{article.time}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <Eye style={{ width: '16px', height: '16px' }} />
          <span>{viewCount?.toLocaleString() || article.views}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <MessageSquare style={{ width: '16px', height: '16px' }} />
          <span>{article.comment_count || 0}</span>
        </div>
        <button
          onClick={handleBookmarkClick}
          style={{
            background: 'none',
            border: 'none',
            cursor: user ? 'pointer' : 'default',
            color: isBookmarked ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
            padding: 'var(--space-1)',
            borderRadius: 'var(--radius-sm)',
            transition: 'all var(--transition-base)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            opacity: user ? 1 : 0.5
          }}
          onMouseEnter={(e) => {
            if (user) {
              e.currentTarget.style.color = isBookmarked ? 'var(--color-brand-secondary)' : 'var(--color-text-primary)';
              e.currentTarget.style.background = 'var(--color-bg-tertiary)';
            }
          }}
          onMouseLeave={(e) => {
            if (user) {
              e.currentTarget.style.color = isBookmarked ? 'var(--color-brand-primary)' : 'var(--color-text-muted)';
              e.currentTarget.style.background = 'transparent';
            }
          }}
          title={user ? (isBookmarked ? 'Remove bookmark' : 'Add bookmark') : 'Sign in to bookmark'}
        >
          <Bookmark 
            style={{ 
              width: '16px', 
              height: '16px',
              fill: isBookmarked ? 'currentColor' : 'none'
            }} 
          />
          <span>{localBookmarkCount}</span>
        </button>
      </div>
    </Link>
  );
}; 