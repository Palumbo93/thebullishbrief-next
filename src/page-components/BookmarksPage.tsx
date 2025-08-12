"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { useBookmarks } from '../hooks/useArticles';
import { useAuth } from '../contexts/AuthContext';
import { ArticleCard } from '../components/articles/ArticleCard';
import { LegalFooter } from '../components/LegalFooter';

interface BookmarksPageProps {
  onCreateAccountClick?: () => void;
}

export const BookmarksPage: React.FC<BookmarksPageProps> = ({ 
  onCreateAccountClick 
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const { data: bookmarks, isLoading, error } = useBookmarks();

  // If user is not authenticated, show sign-up prompt
  if (!user) {
    return (
      <div style={{ minHeight: '100vh' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--color-bg-primary)',
          height: '56px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          borderBottom: '0.5px solid var(--color-border-primary)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            color: 'var(--color-text-primary)',
            padding: '0 var(--content-padding)',
            width: '100%',
          }}>
            <button 
              onClick={() => router.push('/')}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: 'var(--radius-lg)',
                transition: 'background var(--transition-base)',
                marginRight: 'var(--space-4)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              aria-label="Back to Home"
            >
              <ArrowLeft style={{ width: '24px', height: '24px' }} />
            </button>
            <div style={{
              fontWeight: 'bold',
              fontSize: '1.25rem',
              letterSpacing: '-0.01em',
              textAlign: 'left',
              flex: 1,
            }}>
              Bookmarks
            </div>
          </div>
        </div>

        {/* Sign-up prompt */}
        <div style={{
          maxWidth: '800px',
          padding: 'var(--space-16) var(--content-padding)',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-8)'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--color-bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-4)'
            }}>
              <Bookmark style={{ width: '40px', height: '40px', color: 'var(--color-text-muted)' }} />
            </div>
            <h1 style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--font-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)'
            }}>
              Save Articles for Later
            </h1>
            <p style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--leading-relaxed)',
              maxWidth: '500px',
              marginBottom: 'var(--space-8)'
            }}>
              Create an account to bookmark your favorite articles and access them anytime, anywhere.
            </p>
            <button
              onClick={onCreateAccountClick}
              style={{
                background: 'var(--color-brand-primary)',
                color: 'var(--color-text-primary)',
                border: 'none',
                padding: 'var(--space-4) var(--space-8)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-semibold)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-brand-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-brand-primary)';
              }}
            >
              <Bookmark style={{ width: '20px', height: '20px' }} />
              <span>Create Account</span>
            </button>
          </div>
        </div>
        <LegalFooter />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ minHeight: '100vh' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'var(--color-bg-primary)',
        height: '56px',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        borderBottom: '0.5px solid var(--color-border-primary)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          color: 'var(--color-text-primary)',
          padding: '0 var(--content-padding)',
          width: '100%',
        }}>
          <button 
            onClick={() => router.push('/')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg)',
              transition: 'background var(--transition-base)',
              marginRight: 'var(--space-4)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            aria-label="Back to Home"
          >
            <ArrowLeft style={{ width: '24px', height: '24px' }} />
          </button>
          <div style={{
            fontWeight: 'bold',
            fontSize: '1.25rem',
            letterSpacing: '-0.01em',
            textAlign: 'left',
            flex: 1,
          }}>
            Bookmarks
          </div>
          <div style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)'
          }}>
            {bookmarks?.length || 0} saved
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: '0',
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Loading state */}
        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid var(--color-border-primary)',
                borderTop: '3px solid var(--color-brand-primary)',
                borderRadius: '50%',
                margin: '0 auto var(--space-4)',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ color: 'var(--color-text-tertiary)' }}>Loading bookmarks...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              marginBottom: 'var(--space-4)',
              color: 'var(--color-text-primary)'
            }}>
              Something went wrong
            </h2>
            <p style={{
              color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--space-6)'
            }}>
              Unable to load your bookmarks. Please try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'var(--color-brand-primary)',
                color: 'var(--color-text-primary)',
                border: 'none',
                padding: 'var(--space-3) var(--space-6)',
                borderRadius: 'var(--radius-lg)',
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-semibold)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-brand-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-brand-primary)';
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && (!bookmarks || bookmarks.length === 0) && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'var(--color-bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-6)'
            }}>
              <Bookmark style={{ width: '40px', height: '40px', color: 'var(--color-text-muted)' }} />
            </div>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontWeight: 'var(--font-bold)',
              marginBottom: 'var(--space-4)',
              color: 'var(--color-text-primary)'
            }}>
              No bookmarks yet
            </h2>
            <p style={{
              color: 'var(--color-text-tertiary)',
              marginBottom: 'var(--space-6)',
              maxWidth: '400px'
            }}>
              Start exploring articles and bookmark your favorites to see them here.
            </p>
          </div>
        )}

        {/* Bookmarks list */}
        {!isLoading && !error && bookmarks && bookmarks.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {bookmarks.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onArticleClick={(articleId: number | string, articleTitle: string) => {
                  // Navigate to the article
                  router.push(`/articles/${article.slug || article.id}`);
                }}
              />
            ))}
          </div>
        )}
      </div>
      </div>
      <LegalFooter />
    </div>
  );
};

export default BookmarksPage; 