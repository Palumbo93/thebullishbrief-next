"use client";

import React from 'react';
import { ArrowLeft, Clock, Eye, User, Calendar, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useArticleBySlug, useRelatedArticles, useToggleBookmark, useIsBookmarked } from '../hooks/useArticles';
import { useTrackArticleView, useArticleViewCount } from '../hooks/useArticleViews';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTrackArticleEngagement } from '../hooks/useClarityAnalytics';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import { createMobileHeaderConfig } from '../utils/mobileHeaderConfigs';
import { ArticleCard } from '../components/articles/ArticleCard';
import { AuthorAvatar } from '../components/articles/AuthorAvatar';
import { LegalFooter } from '../components/LegalFooter';
import { ShareSheet } from '../components/ShareSheet';

import { DesktopBanner } from '../components/DesktopBanner';
import { calculateReadingTime, formatReadingTime } from '../utils/readingTime';
import { ArticleSkeleton } from '../components/ArticleSkeleton';
import Image from 'next/image';

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
  const { theme } = useTheme();
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
    if (typeof window === 'undefined') return;
    
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle window resize for mobile detection
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    
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
    } else {
      // Fallback for SSR
      router.push('/');
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
        } : () => onCreateAccountClick?.(),
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
  }, [article?.id, article?.title, isBookmarked, user, toggleBookmark.isPending]);



  /**
   * Optimizes images within HTML content for better performance
   * 
   * Features:
   * - First image loads eagerly for better LCP
   * - Subsequent images load lazily for performance
   * - Adds proper decoding attributes
   * - Adds responsive sizes
   * 
   * @param el - The HTML element containing images to optimize
   */
  const optimizeContentImages = (el: HTMLElement) => {
    const imgElements = el.querySelectorAll('img');
    imgElements.forEach((img, index) => {
      // Skip if already optimized
      if (img.hasAttribute('data-optimized')) return;
      
      // First image should load eagerly for better LCP, others lazily
      img.loading = index === 0 ? 'eager' : 'lazy';
      img.decoding = 'async';
      
      // Add responsive sizes for better performance
      if (!img.sizes) {
        img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px';
      }
      
      // Add proper alt text if missing
      if (!img.alt && img.title) {
        img.alt = img.title;
      }
      
      // Mark as optimized to prevent re-processing
      img.setAttribute('data-optimized', 'true');
    });
  };

  /**
   * Processes text content to automatically convert Twitter handles and stock tickers to clickable links
   * 
   * Features:
   * - @username → links to https://x.com/username
   * - $TICKER → links to https://x.com/search?q=%24TICKER&src=cashtag_click
   * - Avoids creating nested links by checking if text is already within <a> tags
   * 
   * @param text - The raw text content to process
   * @returns Text with HTML link tags for handles and tickers
   */
  const processTextWithLinks = (text: string) => {
    // First, we need to process the text while avoiding areas that are already within link tags
    // We'll split the text by <a> tags and process each non-link segment
    
    const linkTagRegex = /<a\b[^>]*>.*?<\/a>/gi;
    const parts = text.split(linkTagRegex);
    const linkTags = text.match(linkTagRegex) || [];
    
    // Process each non-link part
    const processedParts = parts.map((part, index) => {
      if (!part) return part;
      
      // Replace Twitter handles (@username) with HTML links
      // Matches @ followed by alphanumeric characters and underscores, 1-15 characters long
      let processed = part.replace(/@([a-zA-Z0-9_]{1,15})\b/g, (match, username) => {
        return `<a href="https://x.com/${username}" target="_blank" rel="noopener noreferrer" style="color: #1d9bf0; text-decoration: none;">${match}</a>`;
      });
      
      // Replace stock tickers ($TICKER) with HTML links
      // Matches $ followed by 1-5 uppercase letters, ensuring it's not part of a larger word
      processed = processed.replace(/\$([A-Z]{1,5})\b/g, (match, ticker) => {
        return `<a href="https://x.com/search?q=%24${ticker}&src=cashtag_click" target="_blank" rel="noopener noreferrer" style="color: #00ba7c; text-decoration: none;">${match}</a>`;
      });
      
      return processed;
    });
    
    // Reconstruct the text by interleaving processed parts with original link tags
    let result = '';
    for (let i = 0; i < processedParts.length; i++) {
      result += processedParts[i];
      if (i < linkTags.length) {
        result += linkTags[i];
      }
    }
    
    return result;
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
      <div style={{ minHeight: '100vh', position: 'relative' }}>
        {/* Enhanced Gradient Background Overlay - When featured_color is set */}
        {article?.featured_color && (() => {
          // Theme-aware opacity values
          const isDark = theme === 'dark';
          const mainOpacities = isDark 
            ? ['40', '30', '22', '16', '12', '08', '05', '03'] // Dark mode - stronger
            : ['20', '15', '12', '08', '05', '03', '02', '01']; // Light mode - subtle
          const ambientOpacities = isDark
            ? { left: ['18', '12', '06'], right: ['15', '08', '04'] } // Dark mode
            : { left: ['08', '04', '02'], right: ['06', '03', '01'] }; // Light mode
          const textureOpacities = isDark
            ? ['10', '06', '03'] // Dark mode
            : ['05', '03', '01']; // Light mode

          return (
            <>
              {/* Main gradient overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100vh',
                background: `
                  radial-gradient(ellipse 200% 120% at 50% -20%, 
                    ${article.featured_color}${mainOpacities[0]} 0%, 
                    ${article.featured_color}${mainOpacities[1]} 10%, 
                    ${article.featured_color}${mainOpacities[2]} 20%, 
                    ${article.featured_color}${mainOpacities[3]} 30%, 
                    ${article.featured_color}${mainOpacities[4]} 40%, 
                    ${article.featured_color}${mainOpacities[5]} 50%, 
                    ${article.featured_color}${mainOpacities[6]} 60%, 
                    ${article.featured_color}${mainOpacities[7]} 70%, 
                    transparent 85%
                  )
                `,
                pointerEvents: 'none',
                zIndex: 1
              }} />
              
              {/* Secondary ambient glow */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '60vh',
                background: `
                  radial-gradient(ellipse 120% 80% at 30% 0%, 
                    ${article.featured_color}${ambientOpacities.left[0]} 0%, 
                    ${article.featured_color}${ambientOpacities.left[1]} 25%, 
                    ${article.featured_color}${ambientOpacities.left[2]} 50%, 
                    transparent 75%
                  ),
                  radial-gradient(ellipse 120% 80% at 70% 0%, 
                    ${article.featured_color}${ambientOpacities.right[0]} 0%, 
                    ${article.featured_color}${ambientOpacities.right[1]} 30%, 
                    ${article.featured_color}${ambientOpacities.right[2]} 60%, 
                    transparent 80%
                  )
                `,
                pointerEvents: 'none',
                zIndex: 2
              }} />
              
              {/* Enhanced noisy texture overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '100vh',
                backgroundImage: `
                  url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='500' height='500'%3E%3Cfilter id='noise' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeBlend mode='screen'/%3E%3C/filter%3E%3Crect width='500' height='500' filter='url(%23noise)' opacity='0.8'/%3E%3C/svg%3E"),
                  linear-gradient(180deg, 
                    ${article.featured_color}${textureOpacities[0]} 0%, 
                    ${article.featured_color}${textureOpacities[1]} 20%, 
                    ${article.featured_color}${textureOpacities[2]} 40%, 
                    transparent 70%
                  )
                `,
                backgroundSize: isDark ? '400px 400px, 100% 100%' : '280px 280px, 100% 100%',
                backgroundRepeat: 'repeat, no-repeat',
                pointerEvents: 'none',
                zIndex: 4,
                opacity: isDark ? 0.18 : 0.18,
                mixBlendMode: 'soft-light'
              }} />
            </>
          );
        })()}
        
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

        {/* Article Header - Clean text-only header */}
        <div style={{
          padding: 'var(--space-10) var(--content-padding) var(--space-4) var(--content-padding)',
          maxWidth: maxWidth,
          margin: '0 auto',
          position: 'relative',
          zIndex: 5
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

          {/* Featured Image - Mobile Position (below headline, above info bar) */}
          {article.image && (
            <div className="mobile-only" style={{ marginBottom: 'var(--space-4)' }}>
              <Image
                src={article.image}
                alt={article.title || 'Article featured image'}
                width={800}
                height={400}
                priority={true}
                sizes="(max-width: 768px) 100vw, 800px"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 'var(--radius-lg)',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

        </div>

        {/* Main Content */}
        <main style={{
          padding: '0px var(--content-padding) 0px var(--content-padding)',
          maxWidth: maxWidth,
          margin: '0 auto',
          position: 'relative',
          zIndex: 5
        }}>

        
          {/* Featured Image - Desktop Position (after title, before meta info) */}
          {article.image && (
            <div style={{ display: 'none', marginBottom: 'var(--space-4)' }} className="desktop-only">
              <Image
                src={article.image}
                alt={article.title || 'Article featured image'}
                width={800}
                height={400}
                priority={true}
                sizes="(max-width: 1200px) 800px, 800px"
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 'var(--radius-lg)',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}

          {/* Article Meta Info - Combined author and metadata section */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-4)',
            padding: 'var(--space-4) 0px',
            marginBottom: 'var(--space-8)',
            borderTop: '0.5px solid var(--color-border-primary)',
            borderBottom: '0.5px solid var(--color-border-primary)'
                        }}>
            {/* Author and Category */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              minWidth: '0',
              flex: '1 1 auto'
            }}>
              <AuthorAvatar author={article.author} image={article.authorAvatar} size="md" />
              <div style={{ textAlign: 'left', minWidth: '0' }}>
                <button
                  onClick={() => {
                    if (article.authorSlug) {
                      router.push(`/${article.authorSlug}`);
                    }
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-medium)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-1)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'opacity var(--transition-base)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  {article.author}
                </button>
                <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)'
                }}>
                  in{' '}
                  <button
                    onClick={() => {
                      const categoryParam = article.category === 'All' ? '' : `?category=${encodeURIComponent(article.category)}`;
                      router.push(`/articles${categoryParam}`);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-text-primary)',
                      fontWeight: 'var(--font-medium)',
                      cursor: 'pointer',
                      padding: '0',
                      fontSize: 'inherit',
                      textDecoration: 'underline',
                      textDecorationColor: 'transparent',
                      transition: 'text-decoration-color var(--transition-base)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.textDecorationColor = 'var(--color-text-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.textDecorationColor = 'transparent';
                    }}
                  >
                    {article.category}
                  </button>
                </div>
              </div>
            </div>

            {/* Meta Information */}
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



          {/* Content */}
          <div>
            {article.content ? (
              <div 
                className="html-content"
                dangerouslySetInnerHTML={{ 
                  __html: processTextWithLinks(article.content) 
                }}
                ref={(el) => {
                  if (el) {
                    // Optimize images in content for better performance
                    optimizeContentImages(el);
                  }
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
        </main>
      </div>
      
      <LegalFooter />
      
      {/* Share Sheet */}
      {article && (
        <ShareSheet
          isOpen={isShareSheetOpen}
          onClose={() => setIsShareSheetOpen(false)}
          url={typeof window !== 'undefined' ? window.location.href : ''}
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