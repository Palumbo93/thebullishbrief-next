"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useAuthorBySlug } from '../hooks/useAuthorBySlug';
import { useArticlesByAuthor } from '../hooks/useArticlesByAuthor';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import { createMobileHeaderConfig } from '../utils/mobileHeaderConfigs';
import { AuthorAvatar } from '../components/articles/AuthorAvatar';
import { ArticleCard } from '../components/articles/ArticleCard';
import { AuthorNewsletterSignup } from '../components/AuthorNewsletterSignup';
import { LegalFooter } from '../components/LegalFooter';
import { ShareSheet } from '../components/ShareSheet';
import { DesktopBanner } from '../components/DesktopBanner';
import { convertNewlinesToJSX } from '../utils/contentProcessor';

interface AuthorPageProps {
  authorSlug: string;
  onCreateAccountClick?: () => void;
  onArticleSelect?: (articleId: number | string, articleTitle: string) => void;
}

export const AuthorPage: React.FC<AuthorPageProps> = ({ 
  authorSlug,
  onCreateAccountClick, 
  onArticleSelect 
}) => {
  const router = useRouter();
  const { setConfig } = useMobileHeader();
  
  const { author, isLoading: authorLoading, error: authorError } = useAuthorBySlug(authorSlug || '');
  const { articles, isLoading: articlesLoading, error: articlesError } = useArticlesByAuthor(author?.id || '');
  const [isShareSheetOpen, setIsShareSheetOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        router.push('/');
      }
    }
  };

  const handleArticleClick = (articleId: number | string, articleTitle: string) => {
    const article = articles.find(a => a.id === articleId);
    const routeId = article?.slug || articleId;
    router.push(`/articles/${routeId}`);
    onArticleSelect?.(typeof articleId === 'number' ? articleId : parseInt(String(articleId), 10), articleTitle);
  };

  // Handle scroll for header background
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Configure mobile header when author data is available
  React.useEffect(() => {
    if (author) {
      const mobileHeaderConfig = createMobileHeaderConfig.author({
        onMenuClick: () => {}, // Layout will override this with its own handler
        onLogoClick: () => router.push('/'),
        onShareClick: () => setIsShareSheetOpen(true)
      });
      
      setConfig(mobileHeaderConfig);
    }
    
    // Cleanup when component unmounts
    return () => {
      setConfig(null);
    };
  }, [author, setConfig, router]);

  // Author skeleton component
  const AuthorSkeleton = () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ minHeight: '100vh' }}>
        {/* Desktop Banner Skeleton */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          height: '56px',
          position: 'sticky',
          top: 0,
          zIndex: 20,
          borderBottom: '0.5px solid var(--color-border-primary)',
          padding: '0 var(--content-padding)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--color-bg-tertiary)',
              marginRight: 'var(--space-4)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
            <div style={{
              width: '80px',
              height: '20px',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
          </div>
        </div>

        {/* Author Header Skeleton */}
        <div style={{ 
          padding: 'var(--space-8) var(--content-padding)',
          borderBottom: '0.5px solid var(--color-border-primary)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            {/* Avatar Skeleton */}
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-bg-tertiary)',
              marginBottom: 'var(--space-4)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
            
            {/* Name Skeleton */}
            <div style={{
              width: '200px',
              height: '36px',
              background: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-sm)',
              marginBottom: 'var(--space-4)',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
            
            {/* Stats Skeleton */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-6)', marginBottom: 'var(--space-4)' }}>
              <div style={{
                width: '80px',
                height: '24px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
              <div style={{
                width: '80px',
                height: '24px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
            </div>
            
            {/* Bio Skeleton */}
            <div style={{ maxWidth: '600px', width: '100%' }}>
              <div style={{
                width: '100%',
                height: '20px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-2)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
              <div style={{
                width: '80%',
                height: '20px',
                background: 'var(--color-bg-tertiary)',
                borderRadius: 'var(--radius-sm)',
                margin: '0 auto',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }} />
            </div>
          </div>
        </div>
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
  );

  // Loading state
  if (authorLoading) {
    return <AuthorSkeleton />;
  }

  // Error state
  if (authorError || !author) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '400px',
        flexDirection: 'column',
        gap: 'var(--space-6)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: 'var(--text-2xl)',
            fontWeight: 'var(--font-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)'
          }}>
            Author Not Found
          </h1>
          <p style={{ 
            color: 'var(--color-text-tertiary)',
            marginBottom: 'var(--space-6)'
          }}>
            The author you're looking for doesn't exist.
          </p>
          <button
            onClick={handleBack}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ minHeight: '100vh' }}>
        {/* Desktop Banner - Hidden on mobile */}
        <DesktopBanner
          title="Author"
          isScrolled={isScrolled}
          actions={[
            {
              type: 'back',
              onClick: handleBack
            },
            {
              type: 'share',
              onClick: () => setIsShareSheetOpen(true)
            }
          ]}
        />

        {/* Author Header with Banner & Overlapping Avatar */}
        <div style={{ position: 'relative' }}>
          {/* Banner Section */}
          {author.banner_url ? (
            <div style={{
              position: 'relative',
              width: '100%',
              height: '250px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%)',
        
            }}>
              <Image
                src={author.banner_url}
                alt={`${author.name} banner`}
                fill
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center'
                }}
                onError={(e) => {
                  // Fallback to gradient background if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              {/* Gradient overlay for better text contrast */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.1) 50%, rgba(0, 0, 0, 0.4) 100%)'
              }} />
            </div>
          ) : (
            /* Fallback gradient when no banner */
            <div style={{
              width: '100%',
              height: '200px',
              background: 'linear-gradient(135deg, var(--color-brand-primary) 0%, var(--color-brand-secondary) 100%)',
              opacity: 0.1
            }} />
          )}

          {/* Content Container with Overlapping Avatar */}
          <div style={{ 
            position: 'relative',
            marginTop: author.banner_url ? '-60px' : '-50px', // Overlap the banner/gradient
            padding: '0 var(--content-padding) var(--space-8)',
            zIndex: 10
          }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              {/* Overlapping Avatar with Enhanced Styling */}
              <div style={{ 
                marginBottom: 'var(--space-6)',
                position: 'relative'
              }}>
                <div style={{
                  padding: '6px',
                  background: 'var(--color-bg-primary)',
                  borderRadius: 'var(--radius-full)'
                }}>
                  <AuthorAvatar 
                    author={author.name} 
                    image={author.avatar_url || undefined} 
                    size="profile" 
                  />
                </div>
               
              </div>
          
              {/* Author Info */}
              <div style={{ maxWidth: '600px' }}>
                {/* Author Name */}
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <h1 style={{
                    fontSize: 'var(--text-4xl)',
                    fontFamily: 'var(--font-editorial)',
                    fontWeight: 'var(--font-regular)',
                    color: 'var(--color-text-primary)',
                    margin: 0,
                    lineHeight: '1.2'
                  }}>
                    {author.name}
                  </h1>
                </div>
              
              
                {author.bio && (
                  <div style={{
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--text-lg)',
                    lineHeight: 'var(--leading-relaxed)',
                    marginBottom: 'var(--space-6)',
                    textAlign: 'center',
                    fontWeight: 'var(--font-regular)'
                  }}>
                    {convertNewlinesToJSX(author.bio)}
                  </div>
                )}
                
                {/* Enhanced Social Links */}
                {(author.linkedin_url || author.twitter_handle || author.website_url) && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    gap: 'var(--space-3)',
                    flexWrap: 'wrap'
                  }}>
                    {author.linkedin_url && (
                      <a
                        href={author.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 'var(--space-2)',
                          padding: 'var(--space-2) var(--space-4)',
                          background: 'var(--color-bg-primary)',
                          border: '1px solid var(--color-border-primary)',
                          borderRadius: 'var(--radius-full)',
                          color: 'var(--color-text-secondary)',
                          textDecoration: 'none',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-medium)',
                          transition: 'all var(--transition-base)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                          e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                          e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                        }}
                      >
                        LinkedIn
                        <ExternalLink style={{ width: '14px', height: '14px' }} />
                      </a>
                    )}
                  
                    {author.twitter_handle && (
                      <a
                        href={`https://twitter.com/${author.twitter_handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 'var(--space-2)',
                          padding: 'var(--space-2) var(--space-4)',
                          background: 'var(--color-bg-primary)',
                          border: '1px solid var(--color-border-primary)',
                          borderRadius: 'var(--radius-full)',
                          color: 'var(--color-text-secondary)',
                          textDecoration: 'none',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-medium)',
                          transition: 'all var(--transition-base)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                          e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                          e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                        }}
                      >
                        Twitter
                        <ExternalLink style={{ width: '14px', height: '14px' }} />
                      </a>
                    )}
                    
                    {author.website_url && (
                      <a
                        href={author.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: 'var(--space-2)',
                          padding: 'var(--space-2) var(--space-4)',
                          background: 'var(--color-bg-primary)',
                          border: '1px solid var(--color-border-primary)',
                          borderRadius: 'var(--radius-full)',
                          color: 'var(--color-text-secondary)',
                          textDecoration: 'none',
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-medium)',
                          transition: 'all var(--transition-base)',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                          e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                          e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                        }}
                      >
                        Website
                        <ExternalLink style={{ width: '14px', height: '14px' }} />
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup Section */}
        {author.audience_tag && (
          <div style={{
            marginBottom: 'var(--space-8)',
          }}>
            <AuthorNewsletterSignup 
              author={author}
              onEmailSubmitted={(email, isAuthenticated) => {
                // Newsletter signup handled by AuthorNewsletterSignup component
              }}
            />
          </div>
        )}

        {/* Articles Section */}
      <div
      style={{
        borderTop: '0.5px solid var(--color-border-primary)',
      }}
      >
        
        {articlesLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {Array.from({ length: 3 }).map((_, index) => (
              <article
                key={`skeleton-${index}`}
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
              </article>
            ))}
            
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
        ) : articlesError ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <p style={{ color: 'var(--color-text-tertiary)' }}>Failed to load articles</p>
          </div>
        ) : articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
            <p style={{ color: 'var(--color-text-tertiary)' }}>No articles found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={{
                  id: article.id,
                  title: article.title,
                  subtitle: article.subtitle || '',
                  author: author.name,
                  authorAvatar: author.avatar_url || undefined,
                  authorSlug: author.slug,
                  date: article.published_at ? new Date(article.published_at).toLocaleDateString() : '',
                  category: (article as any).category?.name || '',
                  time: `${article.reading_time_minutes || 0} min read`,
                  image: article.featured_image_url || '',
                  views: String(article.view_count || 0),
                  slug: article.slug
                }}
                onArticleClick={() => handleArticleClick(article.id, article.title)}
              />
            ))}
          </div>
        )}
      </div>
      </div>
      
      <LegalFooter />
      
      {/* Share Sheet */}
      <ShareSheet
        isOpen={isShareSheetOpen}
        onClose={() => setIsShareSheetOpen(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />
    </div>
  );
};

export default AuthorPage; 