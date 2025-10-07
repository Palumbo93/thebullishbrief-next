import React from 'react';
import { Clock, Calendar } from 'lucide-react';
import Image from 'next/image';
import { AuthorAvatar } from '../components/articles/AuthorAvatar';
import { LegalFooter } from '../components/LegalFooter';
import { calculateReadingTime, formatReadingTime } from '../utils/readingTime';
import { parseTOCFromContent } from '../utils/tocParser';
// ProcessedContent is a client component, we'll render HTML directly
import { ArticleAccessResult } from '../lib/serverAccessControl';

// Import client components that will handle interactivity
import { ArticleInteractiveShell } from '../components/articles/ArticleInteractiveShell';
import { ArticleScrollTracker } from '../components/articles/ArticleScrollTracker';
import { ArticleGradientBackground } from '../components/articles/ArticleGradientBackground';
import AudioNativeController from '../components/AudioNativeController';

/**
 * Article data structure for server-side rendering
 */
export interface ServerArticle {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  content: string;
  image?: string;
  category: string;
  author?: string;
  authorSlug?: string;
  authorAvatar?: string;
  date: string;
  tags?: string[];
  premium: boolean;
  status: string;
}

/**
 * Props for the server-side article page component
 */
interface ArticlePageServerProps {
  article: ServerArticle;
  accessResult: ArticleAccessResult;
  relatedArticles?: ServerArticle[];
  slug: string;
}

/**
 * Server-side Article Page Component
 * 
 * This component renders the core article content on the server,
 * ensuring that AI crawlers and search engines can read the full content.
 * Interactive features are handled by client components.
 */
export async function ArticlePageServer({ 
  article, 
  accessResult, 
  relatedArticles = [],
  slug 
}: ArticlePageServerProps) {
  // Calculate reading time from article content
  const readingTime = article.content ? calculateReadingTime(article.content) : 5;
  
  // Generate TOC sections from article content
  const tocSections = article.content ? parseTOCFromContent(article.content) : [];
  
  // Process text content to add Twitter handles and stock ticker links
  const processTextWithLinks = (text: string) => {
    if (!text) return text;
    
    // Split by existing link tags to avoid nested links
    const linkTagRegex = /<a\b[^>]*>.*?<\/a>/gi;
    const parts = text.split(linkTagRegex);
    const linkTags = text.match(linkTagRegex) || [];
    
    // Process each non-link part
    const processedParts = parts.map((part) => {
      if (!part) return part;
      
      // Replace Twitter handles (@username) with HTML links
      let processed = part.replace(/@([a-zA-Z0-9_]{1,15})\b/g, (match, username) => {
        return `<a href="https://x.com/${username}" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">${match}</a>`;
      });
      
      // Replace stock tickers ($TICKER) with HTML links
      processed = processed.replace(/\$([A-Z]{1,5})\b/g, (match, ticker) => {
        return `<a href="https://x.com/search?q=%24${ticker}&src=cashtag_click" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: underline;">${match}</a>`;
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

  // Determine content to render based on access level
  const contentToRender = accessResult.renderMode === 'full' 
    ? processTextWithLinks(article.content)
    : processTextWithLinks(article.content.substring(0, 1000) + '...');

  const maxWidth = 'var(--max-width)';

  return (
    <>
      {/* Gradient Background Effect - Client Component */}
      <ArticleGradientBackground article={article} />
      
      {/* Scroll Tracker - Client Component for Desktop Banner */}
      <ArticleScrollTracker article={article} accessResult={accessResult} slug={slug}>
        
        {/* Interactive Shell - Client Component for Mobile Header, Analytics, etc. */}
        <ArticleInteractiveShell 
          article={article} 
          accessResult={accessResult}
          tocSections={tocSections}
          relatedArticles={relatedArticles}
          slug={slug}
        >
          
          {/* Main Article Content - Server Rendered */}
          <div style={{ minHeight: '80vh', position: 'relative' }}>
            
            {/* Article Header - Clean text-only header */}
            <div 
              className="article-brief-header"
              style={{
                maxWidth: maxWidth,
                margin: '0 auto'
              }}
            >
              {/* Title */}
              <h1 className="article-brief-title" style={{
                marginBottom: 'var(--space-4)',
              }}>
                {article.title}
              </h1>

              {/* Category - Mobile Position (below title) */}
              <div className="mobile-category-info" style={{
                marginBottom: 'var(--space-4)',
                display: 'none'
              }}>
                <span
                  style={{
                    color: 'white',
                    background: 'var(--color-primary)',
                    padding: 'var(--space-2) var(--space-4)',
                    fontWeight: 'var(--font-semibold)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  {article.category}
                </span>
              </div>

              {/* Featured Image - Mobile Position */}
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
              
              {/* Featured Image - Desktop Position */}
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
              <div 
                className="mobile-flex-col article-meta-section" 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 'var(--space-4)',
                  padding: 'var(--space-4) 0px',
                  marginBottom: 'var(--space-8)',
                  borderTop: '0.5px solid var(--color-border-primary)',
                  borderBottom: '0.5px solid var(--color-border-primary)'
                }}
              >
                {/* Mobile Author and Category */}
                <div 
                  className="mobile-category-info" 
                  style={{
                    display: 'none',
                    flexDirection: 'column',
                    gap: 'var(--space-3)',
                    width: '100%'
                  }}
                >
                  {/* Author section */}
                  {article.author && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)'
                    }}>
                      <AuthorAvatar author={article.author} image={article.authorAvatar} size="md" />
                      <div>
                        <div style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-medium)',
                          color: 'var(--color-text-primary)',
                          marginBottom: 'var(--space-1)'
                        }}>
                          {article.author}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Date, reading time, and actions row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--space-3)',
                    flexWrap: 'wrap',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    width: '100%'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-3)',
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
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      {/* Bookmark placeholder */}
                      <div id="bookmark-placeholder" style={{
                        width: '16px',
                        height: '16px',
                        opacity: 0.5
                      }}>
                        {/* Client component will replace this */}
                      </div>
                      
                      {/* Share Button placeholder */}
                      <div id="share-button-placeholder" style={{
                        padding: 'var(--space-1) var(--space-2)',
                        border: '1px solid var(--color-border-primary)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        opacity: 0.5
                      }}>
                        Share
                      </div>
                    </div>
                  </div>
                </div>

                {/* Desktop Author and Category */}
                <div 
                  className="desktop-category-info" 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    minWidth: '0',
                    flex: '1 1 auto',
                    width: '100%'
                  }}
                >
                  {article.author && (
                    <AuthorAvatar author={article.author} image={article.authorAvatar} size="md" />
                  )}
                  <div style={{ textAlign: 'left', minWidth: '0', width: '100%' }}>
                    {article.author && (
                      <div
                        style={{
                          fontSize: 'var(--text-sm)',
                          fontWeight: 'var(--font-medium)',
                          color: 'var(--color-text-primary)',
                          marginBottom: 'var(--space-1)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {article.author}
                      </div>
                    )}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 'var(--space-3)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)',
                      width: '100%'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                        flexWrap: 'wrap'
                      }}>
                        <span
                          style={{
                            color: 'white',
                            background: 'var(--color-primary)',
                            padding: 'var(--space-2) var(--space-4)',
                            fontWeight: 'var(--font-semibold)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 'var(--text-sm)'
                          }}
                        >
                          {article.category}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                          <Calendar style={{ width: '14px', height: '14px' }} />
                          <span>{article.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
                          <Clock style={{ width: '14px', height: '14px' }} />
                          <span>{formatReadingTime(readingTime)}</span>
                        </div>
                     
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                         {/* Bookmark placeholder - desktop */}
                         <div id="bookmark-placeholder-desktop" style={{
                          width: '16px',
                          height: '16px',
                          opacity: 0.5
                        }}>
                          {/* Client component will replace this */}
                        </div>
                      {/* Share Button placeholder - desktop */}
                      <div id="share-button-placeholder-desktop" style={{
                        padding: 'var(--space-1) var(--space-2)',
                        border: '1px solid var(--color-border-primary)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 'var(--text-sm)',
                        opacity: 0.5
                      }}>
                        Share
                      </div>
                    </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Audio Native Player - Disabled on mobile for performance */}
              <div className="audio-player-wrapper">
                <AudioNativeController
                  textColorRgba='rgba(255, 255, 255, 1.0)'
                  backgroundColorRgba='rgba(7, 102, 255, 1.0)'
                  contentType="article"
                  title={article.title}
                  size="small"
                  triggerOffset={400}
                  metaInfoSelector=".article-meta-section"
                  actionPanelSelector=".article-sticky-section"
                />
                <style dangerouslySetInnerHTML={{
                  __html: `
                    /* Hide audio player on mobile for performance */
                    @media (max-width: 768px) {
                      .audio-player-wrapper {
                        display: none !important;
                      }
                    }
                  `
                }} />
              </div>

              {/* Article Content - Server Rendered HTML */}
              <article 
                className="prose prose-invert prose-lg max-w-none brief-content-container" 
                itemScope 
                itemType="https://schema.org/Article"
              >
                {/* Schema.org metadata for better content identification */}
                <meta itemProp="headline" content={article.title} />
                <meta itemProp="datePublished" content={article.date} />
                {article.author && <meta itemProp="author" content={article.author} />}
                
                <div className="article-content" data-elevenlabs-content="true">
                  {accessResult.renderMode === 'full' ? (
                    <div 
                      className="html-content brief-html-content"
                      dangerouslySetInnerHTML={{ __html: contentToRender }}
                    />
                  ) : (
                    <>
                      <div 
                        className="html-content brief-html-content"
                        dangerouslySetInnerHTML={{ __html: contentToRender }}
                      />
                      <div className="paywall-container" style={{
                        marginTop: 'var(--space-8)',
                        padding: 'var(--space-8)',
                        background: 'var(--color-bg-tertiary)',
                        borderRadius: 'var(--radius-xl)',
                        textAlign: 'center',
                        border: '1px solid var(--color-border-primary)'
                      }}>
                        <h3 style={{
                          fontSize: 'var(--text-xl)',
                          fontWeight: 'var(--font-semibold)',
                          color: 'var(--color-text-primary)',
                          marginBottom: 'var(--space-4)'
                        }}>
                          Continue Reading
                        </h3>
                        <p style={{
                          fontSize: 'var(--text-base)',
                          color: 'var(--color-text-secondary)',
                          marginBottom: 'var(--space-6)',
                          lineHeight: '1.6'
                        }}>
                          This article is available to premium subscribers only. 
                          Subscribe to get full access to all our content.
                        </p>
                        {accessResult.showSubscribePrompt && (
                          <div style={{
                            display: 'flex',
                            gap: 'var(--space-3)',
                            justifyContent: 'center',
                            flexWrap: 'wrap'
                          }}>
                            <button 
                              className="btn btn-primary"
                              style={{
                                padding: 'var(--space-3) var(--space-6)',
                                fontSize: 'var(--text-base)',
                                fontWeight: 'var(--font-medium)'
                              }}
                            >
                              Subscribe Now
                            </button>
                            <button 
                              className="btn btn-secondary"
                              style={{
                                padding: 'var(--space-3) var(--space-6)',
                                fontSize: 'var(--text-base)',
                                fontWeight: 'var(--font-medium)'
                              }}
                            >
                              Sign In
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </article>

              {/* Mobile-only Tags Section */}
              {article.tags && article.tags.length > 0 && (
                <div 
                  className="mobile-only-sections" 
                  style={{ 
                    display: 'none',
                    marginTop: 'var(--space-8)',
                    paddingTop: 'var(--space-8)',
                    borderTop: '0.5px solid var(--color-border-primary)'
                  }}
                >
                  <div className="mobile-tags-section" style={{
                    marginBottom: 'var(--space-8)'
                  }}>
                    <h3 style={{
                      fontSize: 'var(--text-lg)',
                      fontWeight: 'var(--font-semibold)',
                      color: 'var(--color-text-primary)',
                      marginBottom: 'var(--space-4)'
                    }}>
                      Tags
                    </h3>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 'var(--space-2)'
                    }}>
                      {article.tags.map((tag) => (
                        <span
                          key={tag}
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
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span style={{ opacity: 0.7 }}>#</span>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Related Articles - Mobile Only */}
              {relatedArticles && relatedArticles.length > 0 && (
                <div 
                  className="mobile-related-articles"
                  style={{
                    padding: 'var(--space-8) var(--content-padding)',
                    borderTop: '0.5px solid var(--color-border-primary)'
                  }}
                >
                  <h3 style={{
                    fontSize: 'var(--text-lg)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-4)'
                  }}>
                    Related Articles
                  </h3>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0
                  }}>
                    {relatedArticles.slice(0, 3).map((relatedArticle) => {
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

                      return (
                        <a
                          key={relatedArticle.id}
                          href={`/articles/${relatedArticle.slug}`}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr auto',
                            gap: 'var(--space-4)',
                            alignItems: 'flex-start',
                            padding: 'var(--space-4) 0',
                            borderBottom: '0.5px solid var(--color-border-primary)',
                            textDecoration: 'none',
                            color: 'var(--color-text-primary)',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h4 style={{
                              fontSize: 'var(--text-lg)',
                              fontFamily: 'var(--font-editorial)',
                              fontWeight: 'var(--font-semibold)',
                              lineHeight: 'var(--leading-tight)',
                              letterSpacing: '-0.01em',
                              color: 'inherit',
                              margin: '0 0 var(--space-2) 0',
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {relatedArticle.title}
                            </h4>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 'var(--space-2)',
                              fontSize: 'var(--text-xs)',
                              color: 'var(--color-text-muted)'
                            }}>
                              <span style={{ whiteSpace: 'nowrap' }}>
                                {formatDate(relatedArticle.date)}
                              </span>
                              <span style={{ color: 'var(--color-text-muted)' }}>•</span>
                              <span style={{ whiteSpace: 'nowrap' }}>
                                {calculateReadingTime(relatedArticle.content)} min
                              </span>
                            </div>
                          </div>
                          {relatedArticle.image && (
                            <div style={{
                              width: '80px',
                              height: '80px',
                              borderRadius: 'var(--radius-md)',
                              overflow: 'hidden',
                              background: 'var(--color-bg-tertiary)',
                              flexShrink: 0
                            }}>
                              <img
                                src={relatedArticle.image}
                                alt={relatedArticle.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                          )}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </main>
          </div>
          
        </ArticleInteractiveShell>
        
      </ArticleScrollTracker>
      
      {/* Action panel is now handled by Layout component */}
      
      {/* Server Component Styles - Using CSS classes defined in globals.css */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .article-brief-header {
            padding: var(--space-12) var(--content-padding) var(--space-4) var(--content-padding);
          }
          
          .article-brief-title {
            font-family: var(--font-editorial);
            font-weight: var(--font-semibold);
            color: var(--color-text-primary);
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
              display: flex !important;
            }
            
            .desktop-category-info {
              display: none !important;
            }
            
            .mobile-only-sections {
              display: block !important;
            }
          }
          
          .mobile-only {
            display: none;
          }
          
          .desktop-only {
            display: block;
          }
          
          @media (max-width: 768px) {
            .mobile-only {
              display: block !important;
            }
            
            .desktop-only {
              display: none !important;
            }
          }
        `
      }} />
    </>
  );
}
