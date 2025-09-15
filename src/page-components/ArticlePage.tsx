"use client";

import React from 'react';
import { ArrowLeft, Clock, User, Calendar, Tag, Bookmark, Share } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useArticleBySlug, useRelatedArticles, useToggleBookmark, useIsBookmarked } from '../hooks/useArticles';
import { useTrackArticleView } from '../hooks/useArticleViews';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTrackArticleEngagement } from '../hooks/useClarityAnalytics';
import { useMobileHeader } from '../contexts/MobileHeaderContext';
import { createMobileHeaderConfig } from '../utils/mobileHeaderConfigs';
import { ArticleCard } from '../components/articles/ArticleCard';
import { AuthorAvatar } from '../components/articles/AuthorAvatar';
import ArticleActionPanel from '../components/articles/ArticleActionPanel';
import { LegalFooter } from '../components/LegalFooter';
import { ShareSheet } from '../components/ShareSheet';
import { ImageZoomModal } from '../components/ui/ImageZoomModal';

import { calculateReadingTime, formatReadingTime } from '../utils/readingTime';
import { parseTOCFromContent } from '../utils/tocParser';
import { ProcessedContent } from '../utils/contentProcessor';
import { ArticleSkeleton } from '../components/ArticleSkeleton';
import { Layout } from '../components/Layout';
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
  const { trackBookmark: trackAnalyticsBookmark, trackShare: trackAnalyticsShare } = useTrackArticleEngagement();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isShareSheetOpen, setIsShareSheetOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isImageZoomOpen, setIsImageZoomOpen] = React.useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = React.useState<string>('');
  const [zoomedImageAlt, setZoomedImageAlt] = React.useState<string>('');
  const [contentProcessed, setContentProcessed] = React.useState(false);

  const maxWidth = 'var(--max-width)';
  
  // Calculate reading time from article content
  const readingTime = React.useMemo(() => {
    return article?.content ? calculateReadingTime(article.content) : 5;
  }, [article?.content]);

  // Generate TOC sections from article content
  const tocSections = React.useMemo(() => {
    return article?.content ? parseTOCFromContent(article.content) : [];
  }, [article?.content]);

  // Pre-process content to add IDs to H2 elements before React renders them
  const processedContent = React.useMemo(() => {
    if (!article?.content) return '';
    
    // Create a temporary div to parse and modify the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content;
    
    // Find all H2 elements and add IDs using the same logic as parseTOCFromContent
    const h2Elements = tempDiv.querySelectorAll('h2');
    const usedIds = new Set<string>();
    const addedIds: Array<{ text: string; id: string }> = [];
    
    h2Elements.forEach((h2, index) => {
      if (!h2.id) {
        const text = h2.textContent?.trim() || '';
        
        if (text) {
          // Generate base ID using same logic as parseTOCFromContent
          const baseId = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            .replace(/^-+|-+$/g, '');
          
          if (baseId) {
            // Ensure unique ID by adding counter if needed
            let uniqueId = baseId;
            let counter = 1;
            while (usedIds.has(uniqueId)) {
              uniqueId = `${baseId}-${counter}`;
              counter++;
            }
            
            usedIds.add(uniqueId);
            h2.id = uniqueId;
            addedIds.push({ text, id: uniqueId });
          }
        }
      }
    });
    
    return tempDiv.innerHTML;
  }, [article?.content]);

  // Reset content processing when article content changes
  React.useEffect(() => {
    setContentProcessed(false);
  }, [article?.content]);

  // Post-render H2 ID assignment - runs after all React rendering is complete
  React.useEffect(() => {
    if (!article?.content || !contentProcessed) return;

    const assignH2IdsPostRender = () => {
      const contentContainer = document.querySelector('.brief-content-container');
      if (!contentContainer) {
        return;
      }

      const h2Elements = contentContainer.querySelectorAll('h2');
      if (h2Elements.length === 0) return;

      const usedIds = new Set<string>();
      const assignedIds: Array<{ text: string; id: string }> = [];

      h2Elements.forEach((h2, index) => {
        const text = h2.textContent?.trim() || '';
        
        if (!h2.id && text) {
          // Generate base ID using same logic as parseTOCFromContent
          const baseId = text
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim()
            .replace(/^-+|-+$/g, '');
          
          if (baseId) {
            // Ensure unique ID by adding counter if needed
            let uniqueId = baseId;
            let counter = 1;
            while (usedIds.has(uniqueId)) {
              uniqueId = `${baseId}-${counter}`;
              counter++;
            }
            
            usedIds.add(uniqueId);
            h2.id = uniqueId;
            assignedIds.push({ text, id: uniqueId });
          }
        }
      });
      
      // Set up MutationObserver to watch for ID removal
      if (assignedIds.length > 0) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'id') {
              // Track H2 ID modifications if needed for debugging
            }
            if (mutation.type === 'childList') {
              mutation.removedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  // Track H2 element removal if needed for debugging
                }
              });
            }
          });
        });

        observer.observe(contentContainer, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeOldValue: true,
          attributeFilter: ['id']
        });

        // Clean up observer after 10 seconds
        setTimeout(() => observer.disconnect(), 10000);
      }
      
      // Final verification that IDs are properly set
      setTimeout(() => {
        // Verification complete
      }, 50);
    };

    // Use multiple strategies to ensure IDs stick
    requestAnimationFrame(() => {
      assignH2IdsPostRender();
      
      // Also try after a small delay to catch any late re-renders
      setTimeout(assignH2IdsPostRender, 100);
    });

  }, [article?.content, contentProcessed]);


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
        bookmarkLoading: toggleBookmark.isPending
      });
      
      setConfig(mobileHeaderConfig);
    }
    
    // Cleanup when component unmounts
    return () => {
      setConfig(null);
    };
  }, [article?.id, article?.title, isBookmarked, user, toggleBookmark.isPending]);

  /**
   * Handle image click to open zoom modal
   */
  const handleImageClick = (imageUrl: string, imageAlt: string = 'Image') => {
    setZoomedImageUrl(imageUrl);
    setZoomedImageAlt(imageAlt);
    setIsImageZoomOpen(true);
  };




  /**
   * Optimizes images within HTML content for better performance and adds zoom functionality
   * 
   * Features:
   * - First image loads eagerly for better LCP
   * - Subsequent images load lazily for performance
   * - Adds proper decoding attributes
   * - Adds responsive sizes
   * - Adds click-to-zoom functionality with cursor pointer
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
        img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, var(--max-width)';
      }
      
      // Add proper alt text if missing
      if (!img.alt && img.title) {
        img.alt = img.title;
      }
      
      // Add zoom functionality
      img.style.cursor = 'zoom-in';
      img.style.transition = 'transform var(--transition-base)';
      
      // Add hover effects
      img.addEventListener('mouseenter', () => {
        img.style.transform = 'scale(1.02)';
      });
      
      img.addEventListener('mouseleave', () => {
        img.style.transform = 'scale(1)';
      });
      
      // Add click handler for zoom
      img.addEventListener('click', (e) => {
        e.preventDefault();
        handleImageClick(img.src, img.alt || 'Content image');
      });
      
      // Mark as optimized to prevent re-processing
      img.setAttribute('data-optimized', 'true');
    });
  };

  /**
   * Processes embed content to execute scripts properly
   * 
   * Features:
   * - Executes scripts in embed containers
   * - Handles TradingView widgets and other script-based embeds
   * 
   * @param el - The HTML element containing embeds to process
   */
  const processEmbedContent = (el: HTMLElement) => {
    const embedContainers = el.querySelectorAll('[data-embed]');
    embedContainers.forEach((container) => {
      const content = container.getAttribute('data-embed-content');
      
      if (content && !container.querySelector('.embed-processed-content')) {
        // Apply width and height from data attributes to the container
        const width = container.getAttribute('data-embed-width') || '100%';
        const height = container.getAttribute('data-embed-height') || 'auto';
        
        const containerElement = container as HTMLElement;
        containerElement.style.width = width;
        containerElement.style.height = height;
        containerElement.style.maxWidth = '100%';
        
        // Create a wrapper div for the processed content
        const processedDiv = document.createElement('div');
        processedDiv.className = 'embed-processed-content';
        processedDiv.style.cssText = 'width: 100%; height: 100%;';
        
        // Decode HTML entities and set the content
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        processedDiv.innerHTML = tempDiv.innerHTML;
        
        // Add the processed content to the container
        container.appendChild(processedDiv);
        
        // Execute any scripts in the content
        const scripts = processedDiv.querySelectorAll('script');
        scripts.forEach((script) => {
          // Only process scripts that haven't been executed yet
          if (!script.hasAttribute('data-executed')) {
            const newScript = document.createElement('script');
            
            // Copy all attributes
            Array.from(script.attributes).forEach((attr) => {
              if (attr.name !== 'data-executed') {
                newScript.setAttribute(attr.name, attr.value);
              }
            });
            
            // Copy script content
            newScript.textContent = script.textContent;
            
            // Mark as executed and replace the old script
            newScript.setAttribute('data-executed', 'true');
            script.setAttribute('data-executed', 'true');
            script.parentNode?.replaceChild(newScript, script);
          }
        });
      }
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

  // Prepare action panel component
  const actionPanelComponent = article ? (
    <ArticleActionPanel
      articleId={String(article.id)}
      sections={tocSections}
    />
  ) : undefined;

  // Mobile header props for Layout
  const mobileHeaderProps = article ? {
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
  } : {};

  // Loading state
  if (loading) {
    return (
      <Layout>
        <div style={{ minHeight: '80vh' }}>
          <ArticleSkeleton />
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <Layout
      mobileHeader={mobileHeaderProps}
      actionPanel={actionPanelComponent}
    >
      <div style={{ minHeight: '80vh', position: 'relative' }}>
        

        {/* Article Header - Clean text-only header */}
        <div 
          className="article-brief-header"
          style={{
            maxWidth: maxWidth,
            margin: '0 auto'
          }}>
          {/* Title */}
          <h1 className="article-brief-title" style={{
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-4)'
          }}>
            {article.title}
          </h1>

          {/* Category - Mobile Position (below title) */}
          <div className="mobile-category-info" style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-4)',
            display: 'none'
          }}>
            In{' '}
            <button
              onClick={() => {
                const categoryParam = article.category === 'All' ? '' : `?category=${encodeURIComponent(article.category)}`;
                router.push(`/articles${categoryParam}`);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-primary)',
                cursor: 'pointer',
                padding: '0',
                fontSize: 'inherit',
                fontWeight: 'var(--font-semibold)',
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

          {/* Featured Image - Mobile Position (below headline, above info bar) */}
          {article.image && (
            <div className="mobile-only" style={{ marginBottom: 'var(--space-4)' }}>
              <Image
                src={article.image}
                alt={article.title || 'Article featured image'}
                width={800}
                height={400}
                priority={true}
                sizes="(max-width: 768px) 100vw, var(--max-width)"
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
          margin: '0 auto'
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
                sizes="(max-width: 1200px) var(--max-width), var(--max-width)"
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
          <div className="mobile-flex-col" style={{
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
            <div className="desktop-category-info" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              minWidth: '0',
              flex: '1 1 auto'
            }}>
              {article.author && (
                <AuthorAvatar author={article.author} image={article.authorAvatar} size="md" />
              )}
              <div style={{ textAlign: 'left', minWidth: '0' }}>
                {article.author && (
                  <button
                    onClick={() => {
                      if (article.authorSlug) {
                        router.push(`/${article.authorSlug}`);
                      }
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: article.authorSlug ? 'pointer' : 'default',
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
                      if (article.authorSlug) {
                        e.currentTarget.style.opacity = '0.8';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (article.authorSlug) {
                        e.currentTarget.style.opacity = '1';
                      }
                    }}
                  >
                    {article.author}
                  </button>
                )}
                <div style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)'
                }}>
                  {article.author ? 'in' : 'In'}{' '}
                  <button
                    onClick={() => {
                      const categoryParam = article.category === 'All' ? '' : `?category=${encodeURIComponent(article.category)}`;
                      router.push(`/articles${categoryParam}`);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      cursor: 'pointer',
                      padding: '0',
                      fontSize: 'inherit',
                      fontWeight: 'var(--font-semibold)',
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

            {/* Meta Information and Actions */}
            <div 
              className="article-meta-section"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 'var(--space-3)',
                flexWrap: 'wrap'
              }}>
              {/* Meta Info */}
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
                {/* Bookmark Icon */}
                <button
                  onClick={() => {
                    if (user && article?.id) {
                      toggleBookmark.mutate(String(article.id));
                      
                      // Track analytics bookmark event
                      if (article.title) {
                        trackAnalyticsBookmark(String(article.id), article.title);
                      }
                    } else if (!user) {
                      onCreateAccountClick?.();
                    }
                  }}
                  disabled={!user || toggleBookmark.isPending}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: isBookmarked ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    cursor: (!user || toggleBookmark.isPending) ? 'not-allowed' : 'pointer',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'color var(--transition-base)',
                    opacity: (!user || toggleBookmark.isPending) ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (user && !toggleBookmark.isPending) {
                      e.currentTarget.style.color = isBookmarked ? 'var(--color-primary)' : 'var(--color-text-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (user && !toggleBookmark.isPending) {
                      e.currentTarget.style.color = isBookmarked ? 'var(--color-primary)' : 'var(--color-text-muted)';
                    }
                  }}
                  title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
                >
                  <Bookmark 
                    style={{ 
                      width: '16px', 
                      height: '16px',
                      fill: isBookmarked ? 'currentColor' : 'none'
                    }} 
                  />
                </button>
              </div>

              {/* Share Button */}
              <button
                onClick={() => setIsShareSheetOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  padding: 'var(--space-1) var(--space-2)',
                  background: 'transparent',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-secondary)';
                  e.currentTarget.style.color = 'var(--color-text-secondary)';
                  e.currentTarget.style.borderColor = 'var(--color-border-secondary)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--color-text-muted)';
                  e.currentTarget.style.borderColor = 'var(--color-border-primary)';
                }}
              >
                <Share style={{ width: '14px', height: '14px' }} />
                <span>Share</span>
              </button>
            </div>

          </div>

          {/* Content */}
          <div className="prose prose-invert prose-lg max-w-none brief-content-container">
            {article.content ? (
              <ProcessedContent
                content={processTextWithLinks(processedContent)}
                brief={article as any} // Articles have similar structure to briefs
                onContentReady={(el) => {
                  if (el && !contentProcessed) {
                    // Optimize images in content for better performance
                    optimizeContentImages(el);
                    
                    // Process embed content to execute scripts
                    processEmbedContent(el);
                    
                    setContentProcessed(true);
                  }
                }}
                className="html-content brief-html-content"
                injectWidgets={false} // Articles don't need brief-specific widgets
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
                      borderRadius: 'var(--radius-sm)',
                      padding: 'var(--space-2) var(--space-3)',
                      height: 'auto',
                      minHeight: '32px',
                      whiteSpace: 'nowrap',
                      background: 'var(--color-bg-card)',
                      border: '0.5px solid var(--color-border-primary)',
                      color: 'var(--color-text-secondary)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-base)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-1)'
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
      
      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={isImageZoomOpen}
        onClose={() => setIsImageZoomOpen(false)}
        imageUrl={zoomedImageUrl}
        imageAlt={zoomedImageAlt}
        imageName={zoomedImageAlt}
      />
      
      <style jsx>{`
        .article-brief-header {
          padding: var(--space-12) var(--content-padding) var(--space-4) var(--content-padding);
        }
        
        .article-brief-title {
          font-family: var(--font-editorial);
          font-weight: var(--font-medium);
          font-size: clamp(1.875rem, 4vw, 2.5rem);
          line-height: var(--leading-tight);
          letter-spacing: -0.01em;
        }
        
        @media (max-width: 768px) {
          .article-brief-header {
            padding: var(--space-4) var(--content-padding) var(--space-3) var(--content-padding);
          }
          
          .article-brief-title {
            font-size: clamp(1.875rem, 6vw, 2.5rem);
          }
          
          .mobile-category-info {
            display: block !important;
          }
          
          .desktop-category-info {
            display: none !important;
          }
          
          .article-meta-section {
            flex-wrap: wrap !important;
            justify-content: space-between !important;
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
};

export default ArticlePage;