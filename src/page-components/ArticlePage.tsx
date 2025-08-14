"use client";

import React from 'react';
import { ArrowLeft, Clock, Eye, User, Calendar, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useArticleBySlug, useRelatedArticles, useToggleBookmark, useIsBookmarked } from '../hooks/useArticles';
import { useTrackArticleView, useArticleViewCount } from '../hooks/useArticleViews';
import { useAuth } from '../contexts/AuthContext';
import { useTrackArticleEngagement } from '../hooks/useDatafastAnalytics';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import { createMobileHeaderConfig } from '../utils/mobileHeaderConfigs';
import { ArticleCard } from '../components/articles/ArticleCard';
import { AuthorAvatar } from '../components/articles/AuthorAvatar';
import { LegalFooter } from '../components/LegalFooter';
import { ShareSheet } from '../components/ShareSheet';

import { DesktopBanner } from '../components/DesktopBanner';
import { calculateReadingTime, formatReadingTime } from '../utils/readingTime';
import { ArticleSkeleton } from '../components/ArticleSkeleton';

interface ArticlePageProps {
  articleId: number | string;
  onBack?: () => void;
  onCreateAccountClick?: () => void;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({ 
  articleId, 
  onBack, 
  onCreateAccountClick 
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const { setConfig } = useMobileHeader();
  const { data: article, isLoading: loading, error } = useArticleBySlug(String(articleId));
  const { data: relatedArticles } = useRelatedArticles(article || null, 3);
  const { data: isBookmarked } = useIsBookmarked(article?.id);
  const toggleBookmark = useToggleBookmark();
  const trackView = useTrackArticleView();
  const { data: viewCount } = useArticleViewCount(article?.id ? String(article.id) : '');
  const { trackBookmark: trackAnalyticsBookmark, trackShare: trackAnalyticsShare } = useTrackArticleEngagement();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  const maxWidth = '800px';
  
  // Calculate reading time from article content
  const readingTime = React.useMemo(() => {
    return article?.content ? calculateReadingTime(article.content) : 5;
  }, [article?.content]);

  // Handle scroll for header background
  React.useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle window resize for mobile detection
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Set initial value
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Track article view when component mounts
  React.useEffect(() => {
    if (article?.id && String(article.id).trim() !== '') {
      // Use the article's UUID for tracking, not the slug
      trackView.mutate(String(article.id));
      
      // Note: Page views are automatically tracked by Datafa.st script
      // No need to manually track article views as goals
    }
  }, [article?.id, article?.title, article?.author]);

  // Handle back navigation
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      // Try to go back in history, fallback to home page
      if (window.history.length > 1) {
        window.history.back();
      } else {
        router.push('/');
      }
    }
  };

  // Configure mobile header when article data is available
  React.useEffect(() => {
    if (article) {
      const mobileHeaderConfig = createMobileHeaderConfig.article({
        onMenuClick: () => {}, // Layout will override this with its own handler
        onSearchClick: (path?: string) => router.push(path || '/search'),
        onLogoClick: () => router.push('/'),
        isBookmarked: isBookmarked,
        onBookmarkClick: user ? () => {
          if (article?.id) {
            toggleBookmark.mutate(String(article.id));
            if (article.title) {
              trackAnalyticsBookmark(String(article.id), article.title);
            }
          }
        } : onCreateAccountClick,
        onShareClick: () => setIsShareSheetOpen(true),
        bookmarkLoading: toggleBookmark.isPending,
        // Comment functionality - Layout will override these handlers
        onCommentClick: () => {}, // Placeholder - Layout will override
        commentsActive: false     // Placeholder - Layout will override
      });
      
      setConfig(mobileHeaderConfig);
    }
    
    // Cleanup when component unmounts
    return () => {
      setConfig(null);
    };
  }, [article, isBookmarked, user, toggleBookmark.isPending, setConfig, router, onCreateAccountClick, trackAnalyticsBookmark]);



  /**
   * Processes text content to automatically convert Twitter handles and stock tickers to clickable links
   * 
   * Features:
   * - @username → links to https://x.com/username (blue color)
   * - $TICKER → links to https://x.com/search?q=%24TICKER&src=cashtag_click (green color)
   * 
   * @param text - The raw text content to process
   * @returns Text with markdown link syntax for handles and tickers
   */
  const processTextWithLinks = (text: string) => {
    // Replace Twitter handles (@username) with links
    // Matches @ followed by alphanumeric characters and underscores, 1-15 characters long
    const withHandles = text.replace(/@([a-zA-Z0-9_]{1,15})\b/g, (match, username) => {
      return `[${match}](https://x.com/${username})`;
    });
    
    // Replace stock tickers ($TICKER) with links
    // Matches $ followed by 1-5 uppercase letters, ensuring it's not part of a larger word
    const withTickers = withHandles.replace(/\$([A-Z]{1,5})\b/g, (match, ticker) => {
      return `[${match}](https://x.com/search?q=%24${ticker}&src=cashtag_click)`;
    });
    
    return withTickers;
  };

  // Loading state
  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <ArticleSkeleton />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 style={{
          fontSize: 'var(--text-2xl)',
          fontFamily: 'var(--font-editorial)',
          fontWeight: 'var(--font-normal)',
          marginBottom: 'var(--space-4)',
          color: 'var(--color-text-primary)'
        }}>Article Not Found</h2>
        <p className="text-tertiary mb-6">The article you're looking for doesn't exist or has been removed.</p>
        <button onClick={handleBack} className="btn btn-primary">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </button>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <div>
      



      
      <div style={{ minHeight: '100vh' }}>
        {/* Desktop Banner - Hidden on mobile */}
        <DesktopBanner
          title="Article"
          isScrolled={isScrolled}
          maxWidth={maxWidth}
          actions={[
            {
              type: 'back',
              onClick: handleBack
            },
            {
              type: 'share',
              onClick: () => setIsShareSheetOpen(true)
            },
            {
              type: 'bookmark',
              onClick: () => {
                if (user && article?.id) {
                  toggleBookmark.mutate(String(article.id));
                  
                  // Track analytics bookmark event
                  if (article.title) {
                    trackAnalyticsBookmark(String(article.id), article.title);
                  }
                } else if (!user) {
                  onCreateAccountClick?.();
                }
              },
              active: isBookmarked,
              disabled: !user
            }
          ]}
        />

              {/* Article Header with Background Image */}
        <div style={{
        position: 'relative',
        backgroundImage: `url(${article.image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        overflow: 'hidden',
        marginBottom: 'var(--space-4)',
        minHeight: '300px',
        display: 'flex',
        alignItems: 'flex-end',
      }}>
        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.6) 40%, rgba(0, 0, 0, 0.85) 70%, rgba(0, 0, 0, 0.95) 85%, rgba(0, 0, 0, 1) 100%)',
          zIndex: 1
        }} />
        
        {/* Grain Texture Overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.02) 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '8px 8px, 8px 8px',
          backgroundPosition: '0 0, 4px 4px',
          opacity: 0.5,
          pointerEvents: 'none',
          zIndex: 2
        }} />
        
        {/* Content */}
        <div style={{
          position: 'relative',
          zIndex: 3,
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: 'var(--space-16) var(--content-padding) 0 var(--content-padding)',
          maxWidth: maxWidth,
          margin: '0 auto',
        }}>


        {/* Title */}
        <h1 style={{
          fontSize: 'var(--headline-size-desktop)',
            fontFamily: 'var(--font-editorial)',
            fontWeight: 'var(--font-normal)',
          lineHeight: 'var(--leading-tight)',
          color: 'var(--color-text-primary)',
          marginBottom: 'var(--space-4)',
          letterSpacing: '-0.01em'
        }}>
          {article.title}
        </h1>

        {/* Subtitle */}
        {/* <p style={{
            fontSize: 'var(--text-lg)',
            fontFamily: 'var(--font-primary)',
            color: 'var(--color-text-secondary)',
          lineHeight: 'var(--leading-relaxed)',
            marginBottom: 'var(--space-2)',
            fontWeight: '400',
            maxWidth: '600px'
        }}>
          {article.subtitle}
        </p> */}


        </div>
      </div>

      {/* Article Content */}
      <article
        style={{
          maxWidth: maxWidth,
          padding: '0 var(--content-padding)',
          margin: '0 auto',
        }}
      >
        {/* Author Info and Meta */}
                 {isMobile ? (
           // Mobile Layout - Author on one row, meta on another
           <div style={{
             paddingBottom: 'var(--space-2)',
             marginBottom: 'var(--space-8)',
             borderBottom: '0.5px solid var(--color-border-primary)'
           }}>
                          {/* Author Info - Mobile */}
             <div style={{ 
               display: 'flex', 
               alignItems: 'center', 
               flexWrap: 'wrap',
               gap: 'var(--space-1)',
               marginBottom: 'var(--space-4)',
               fontSize: 'var(--text-sm)',
               color: 'var(--color-text-muted)',
               lineHeight: '1.4'
             }}>
               <span style={{ marginRight: 'var(--space-1)' }}>By</span>
               <button
                 onClick={() => {
                   if (article.authorSlug) {
                     router.push(`/authors/${article.authorSlug}`);
                   }
                 }}
                 style={{
                   background: 'none',
                   border: 'none',
                   cursor: 'pointer',
                   display: 'flex',
                   alignItems: 'center',
                   gap: 'var(--space-2)',
                   transition: 'opacity var(--transition-base)',
                   padding: '0'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.opacity = '0.8';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.opacity = '1';
                 }}
               >
                 <AuthorAvatar author={article.author} image={article.authorAvatar} size="xs" />
                 <span style={{
                   fontSize: 'var(--text-sm)',
                   fontWeight: 'var(--font-medium)',
                   color: 'var(--color-text-primary)'
                 }}>
                   {article.author}
                 </span>
               </button>
               <span>in</span>
               <button
                 onClick={() => {
                   const categoryParam = article.category === 'All' ? '' : `?category=${encodeURIComponent(article.category)}`;
                   router.push(`/${categoryParam}`);
                 }}
                 style={{
                   fontSize: 'var(--text-sm)',
                   color: 'var(--color-text-primary)',
                   fontWeight: 'var(--font-medium)',
                   background: 'none',
                   border: 'none',
                   cursor: 'pointer',
                   transition: 'opacity var(--transition-base)',
                   padding: '0'
                 }}
                 onMouseEnter={(e) => {
                   e.currentTarget.style.opacity = '0.7';
                 }}
                 onMouseLeave={(e) => {
                   e.currentTarget.style.opacity = '1';
                 }}
               >
                 {article.category}
               </button>
             </div>
             
                   {/* Meta Info - Mobile */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-4)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <Calendar style={{ width: '14px', height: '14px' }} />
                    <span>{article.date}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <Clock style={{ width: '14px', height: '14px' }} />
                    <span>{formatReadingTime(readingTime)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                    <Eye style={{ width: '14px', height: '14px' }} />
                    <span>{viewCount?.toLocaleString() || article.views}</span>
                  </div>
                </div>
           </div>
        ) : (
          // Desktop Layout - Original design
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            paddingBottom: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
            borderBottom: '0.5px solid var(--color-border-primary)'
          }}>
            {/* Author Info */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)' }}>
              <button
                onClick={() => {
                  if (article.authorSlug) {
                    router.push(`/authors/${article.authorSlug}`);
                  }
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  transition: 'opacity var(--transition-base)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <AuthorAvatar author={article.author} image={article.authorAvatar} size="lg" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{
                    fontSize: 'var(--text-base)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-1)',
                    textAlign: 'left'
                  }}>
                    {article.author}
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <Calendar style={{ width: '14px', height: '14px' }} />
                      <span>{article.date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <Clock style={{ width: '14px', height: '14px' }} />
                      <span>{formatReadingTime(readingTime)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                      <Eye style={{ width: '14px', height: '14px' }} />
                      <span>{viewCount?.toLocaleString() || article.views}</span>
                    </div>
                  </div>
                </div>
              </button>
            </div>
            
            {/* Category Badge */}
            <div>
              <button
                onClick={() => {
                  const categoryParam = article.category === 'All' ? '' : `?category=${encodeURIComponent(article.category)}`;
                  router.push(`/${categoryParam}`);
                }}
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-primary)',
                  fontWeight: 'var(--font-semibold)',
                  letterSpacing: '0.05em',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity var(--transition-base)',
                  padding: '0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {article.category}
              </button>
            </div>
          </div>
        )}

                <div>
          {article.content ? (
            <div 
              className="html-content"
              dangerouslySetInnerHTML={{ 
                __html: processTextWithLinks(article.content) 
              }}
            />
          ) : (
            <div className="text-center py-12 bg-tertiary rounded-xl mb-8">
              <p className="text-lg text-secondary mb-6">
                This article is available to premium subscribers only.
              </p>
              {!user && (
                <button onClick={onCreateAccountClick} className="btn btn-primary">
                  <User className="w-4 h-4" />
                  <span>Subscribe to Read Full Article</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        {article.tags && (
          <div style={{
            marginTop: 'var(--space-8)',
            paddingTop: 'var(--space-6)',
            borderTop: '0.5px solid var(--color-border-primary)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-3)'
            }}>
              <Tag style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />
              <span style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)'
              }}>
                Tags
              </span>
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
                    // Navigate to search page with tag selected
                    router.push(`/search?tags=${encodeURIComponent(tag)}`);
                  }}
                  style={{
                    fontSize: 'var(--text-sm)',
                    borderRadius: 'var(--radius-full)',
                    padding: 'var(--space-2) var(--space-4)',
                    height: 'auto',
                    minHeight: '32px',
                    whiteSpace: 'nowrap',
                    background: 'var(--color-bg-card)',
                    border: '0.5px solid var(--color-border-primary)',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-base)'
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
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <div style={{
            marginTop: 'var(--space-16)',
            paddingTop: 'var(--space-8)',
            borderTop: '0.5px solid var(--color-border-primary)'
          }}>
            <h2 style={{
              fontSize: 'var(--text-2xl)',
              fontFamily: 'var(--font-editorial)',
              fontWeight: 'var(--font-normal)',
              marginBottom: 'var(--space-6)',
              color: 'var(--color-text-primary)'
            }}>Related Articles</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {relatedArticles.map((relatedArticle) => (
                <ArticleCard
                  key={relatedArticle.id}
                  article={relatedArticle}
                  onArticleClick={(articleId: number | string, articleTitle: string) => {
                    // Navigate to the related article
                    router.push(`/articles/${relatedArticle.slug || relatedArticle.id}`);
                  }}
                  hasHorizontalPadding={false}
                />
              ))}
            </div>
          </div>
        )}
      </article>
      </div>
      
      <LegalFooter />
      
      {/* Share Sheet */}
      {article && (
              <ShareSheet
        isOpen={isShareSheetOpen}
        onClose={() => setIsShareSheetOpen(false)}
        url={window.location.href}
        onShare={(platform) => {
          if (article?.title) {
            trackAnalyticsShare(String(article.id), article.title, platform);
          }
        }}
      />
      )}
    </div>
  );
};

export default ArticlePage;