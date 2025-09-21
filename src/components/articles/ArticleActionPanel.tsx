import React, { useRef } from 'react';
import { X, Tag } from 'lucide-react';

interface TOCItem {
  id: string;
  label: string;
  level: number;
}

interface RelatedArticle {
  id: number | string;
  title: string;
  slug?: string;
  category: string;
  date: string;
  excerpt?: string;
  author?: string;
  image?: string;
}

interface ArticleActionPanelProps {
  articleId?: string; // Article ID for analytics tracking
  sections?: TOCItem[];
  onSectionClick?: (sectionId: string) => void;
  isMobileOverlay?: boolean; // Whether this panel is being used in mobile overlay
  onClose?: () => void; // Close handler for mobile overlay
  tags?: string[]; // Article tags
  relatedArticles?: RelatedArticle[]; // Related articles
  onTagClick?: (tag: string) => void; // Handler for tag clicks
  onRelatedArticleClick?: (articleId: number | string, articleTitle: string) => void; // Handler for related article clicks
}

const ArticleActionPanel: React.FC<ArticleActionPanelProps> = ({ 
  articleId,
  sections = [],
  onSectionClick,
  isMobileOverlay = false,
  onClose,
  tags = [],
  relatedArticles = [],
  onTagClick,
  onRelatedArticleClick
}) => {
  const tocRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = React.useState<string>('');

  // Set first section as active by default when sections are available
  React.useEffect(() => {
    if (sections.length > 0 && !activeSection) {
      setActiveSection(sections[0].id);
    }
  }, [sections, activeSection]);

  // Intersection Observer to track which section is currently visible
  React.useEffect(() => {
    if (sections.length === 0) return;

    let observer: IntersectionObserver | null = null;
    let timeoutId: NodeJS.Timeout;
    
    const setupObserver = () => {
      // Clean up existing observer
      if (observer) {
        observer.disconnect();
      }

      // Find all elements that exist
      const elementsToObserve: { element: Element; id: string }[] = [];
      
      sections.forEach((section) => {
        const element = document.getElementById(section.id);
        if (element) {
          elementsToObserve.push({ element, id: section.id });
        } else {
          console.log('ArticleActionPanel: Element not found for section:', section.id);
        }
      });

      }
      
      // Create a single observer for all sections
      observer = new IntersectionObserver(
        (entries) => {
          // Collect all currently intersecting sections
          const intersectingSections: { id: string; ratio: number; top: number; element: Element }[] = [];
          
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const sectionData = elementsToObserve.find(item => item.element === entry.target);
              if (sectionData) {
                intersectingSections.push({
                  id: sectionData.id,
                  ratio: entry.intersectionRatio,
                  top: entry.boundingClientRect.top,
                  element: entry.target
                });
              }
            }
          });
          
          if (intersectingSections.length > 0) {
            // Sort by position in the sections array (reading order) and then by visibility
            intersectingSections.sort((a, b) => {
              const indexA = sections.findIndex(s => s.id === a.id);
              const indexB = sections.findIndex(s => s.id === b.id);
              
              // If one section is significantly more visible, prefer it
              const ratioDiff = b.ratio - a.ratio;
              if (Math.abs(ratioDiff) > 0.3) {
                return ratioDiff > 0 ? 1 : -1;
              }
              
              // Otherwise, prefer the one that appears first in reading order
              return indexA - indexB;
            });
            
            const bestSection = intersectingSections[0];
            
            // Debounce the active section change to prevent flickering
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              setActiveSection(bestSection.id);
            }, 150);
          }
        },
        { 
          threshold: [0.1, 0.5, 0.9],
          rootMargin: '-80px 0px -50% 0px'
        }
      );
      
      // Observe all elements
      elementsToObserve.forEach(({ element }) => {
        observer!.observe(element);
      });
    };

    // Try to setup observer immediately
    setupObserver();

    // Also retry after delays to catch any late-rendered content
    const retryTimeout1 = setTimeout(() => {
      setupObserver();
    }, 500);

    const retryTimeout2 = setTimeout(() => {
      setupObserver();
    }, 1000);

    const retryTimeout3 = setTimeout(() => {
      setupObserver();
    }, 2000);

    // Set up a MutationObserver to watch for new elements being added
    const contentContainer = document.querySelector('.brief-content-container');
    let mutationObserver: MutationObserver | null = null;
    
    if (contentContainer) {
      mutationObserver = new MutationObserver((mutations) => {
        let shouldRetry = false;
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (element.tagName === 'H2' || element.querySelector('h2')) {
                  shouldRetry = true;
                }
              }
            });
          }
          if (mutation.type === 'attributes' && mutation.attributeName === 'id') {
            const target = mutation.target as Element;
            if (target.tagName === 'H2') {
              shouldRetry = true;
            }
          }
        });
        
        if (shouldRetry) {
          // Retry setting up observer after content changes
          setTimeout(setupObserver, 100);
        }
      });

      mutationObserver.observe(contentContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['id']
      });
    }

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(retryTimeout1);
      clearTimeout(retryTimeout2);
      clearTimeout(retryTimeout3);
      if (observer) {
        observer.disconnect();
      }
      if (mutationObserver) {
        mutationObserver.disconnect();
      }
    };
  }, [sections]);

  const handleSectionClick = (sectionId: string) => {
    const scrollToElement = () => {
      const element = document.getElementById(sectionId);
      if (element) {
        // Add a small offset to account for any fixed headers
        const offset = 80; // Adjust this value based on your header height
        const elementTop = element.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        });
        return true;
      }
      return false;
    };

    // Try to scroll immediately, with retry if element not found
    if (!scrollToElement()) {
      // If element not found, wait a bit and try again (content might still be processing)
      setTimeout(() => {
        scrollToElement();
      }, 100);
    }
    
    // Close mobile panel after clicking TOC item (with slight delay to allow scroll to start)
    if (isMobileOverlay && onClose) {
      setTimeout(() => {
        onClose();
      }, 300); // Small delay to let the scroll animation start
    }
    
    onSectionClick?.(sectionId);
  };

  // If no sections, tags, or related articles, don't render the panel
  if (sections.length === 0 && tags.length === 0 && relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className={`article-action-panel ${isMobileOverlay ? 'mobile-overlay' : ''}`} ref={tocRef}>
      {/* Mobile Header with Close Button - Only show when used as mobile overlay */}
      {isMobileOverlay && onClose && (
        <div className="article-mobile-header">
          <div className="article-mobile-header-content">
            <h3 className="article-mobile-header-title">Contents</h3>
            <button
              onClick={onClose}
              className="article-mobile-close-btn"
              aria-label="Close panel"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                background: 'var(--color-bg-tertiary)',
                color: 'var(--color-text-primary)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-card-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--color-bg-tertiary)';
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-brand-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>
      )}
      
      {/* Content Container */}
      <div className="article-content-container">
        <div className="article-sticky-section">
          {/* Table of Contents */}
          {sections.length > 0 && (
            <div className="article-toc-section">
              <h3 className="article-section-title">Contents</h3>
              <nav className="article-toc-nav" role="navigation" aria-label="Table of contents">
                <ul className="article-toc-list">
                  {sections.map((section) => (
                  <li key={section.id} className="article-toc-item">
                    <button
                      className={`article-toc-link ${
                        activeSection === section.id || 
                        (!activeSection && section.id === sections[0]?.id) 
                          ? 'active' 
                          : ''
                      }`}
                      onClick={() => handleSectionClick(section.id)}
                    >
                      {section.label}
                    </button>
                  </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="article-tags-section">
              <div className="article-section-header">
                <Tag style={{ width: '16px', height: '16px' }} />
                <h3 className="article-section-title">Tags</h3>
              </div>
              <div className="article-tags-list">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onTagClick?.(tag)}
                    className="article-tag-button"
                  >
                    <span style={{ opacity: 0.7 }}>#</span>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="article-related-section">
              <h3 className="article-section-title">Related Articles</h3>
              <div className="article-related-list">
                {relatedArticles.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => onRelatedArticleClick?.(article.id, article.title)}
                    className="article-related-item"
                  >
                    <div className="article-related-content">
                      <h4 className="article-related-title">{article.title}</h4>
                      <div className="article-related-meta">
                        <span className="article-related-category">{article.category}</span>
                        <span className="article-related-date">{article.date}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .article-action-panel {
          position: relative;
          height: 100%;
          background: var(--color-bg-primary);
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        .article-content-container {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        
        /* Hide scrollbars */
        .article-content-container::-webkit-scrollbar {
          display: none;
        }
        
        /* Firefox scrollbar */
        .article-content-container {
          scrollbar-width: none;
        }
        
        .article-sticky-section {
          position: sticky;
          top: 0;
        }
        
        .article-section-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin: 0 0 1rem 0;
          letter-spacing: 0.02em;
        }
        
        /* Table of Contents Styles */
        .article-toc-section {
          padding: 2rem 1.5rem;
          border-bottom: 0.5px solid var(--color-border-primary);
        }
        
        .article-toc-section:last-child {
          border-bottom: none;
        }
        
        .article-toc-nav {
          flex: 1;
        }
        
        .article-toc-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .article-toc-item {
          margin: 0;
        }
        
        .article-toc-link {
          display: block;
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          padding: 0.875rem 1rem;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: all 0.2s cubic-bezier(0.4,0,0.2,1);
          line-height: 1.4;
          outline: none;
          position: relative;
        }
        
        .article-toc-link:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
          transform: translateY(-1px);
        }
        
        .article-toc-link:focus {
          box-shadow: 0 0 0 2px var(--color-primary);
        }
        
        .article-toc-link.active {
          background: var(--color-primary-dim-background);
          color: var(--color-primary);
          font-weight: 600;
        }
        
        /* Tags Section Styles */
        .article-tags-section {
          padding: 2rem 1.5rem;
          border-bottom: 0.5px solid var(--color-border-primary);
        }
        
        .article-tags-section:last-child {
          border-bottom: none;
        }
        
        .article-section-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: 1rem;
        }
        
        .article-section-header .article-section-title {
          margin: 0;
        }
        
        .article-section-header svg {
          color: var(--color-text-tertiary);
        }
        
        .article-tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        
        .article-tag-button {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--color-bg-card);
          border: 0.5px solid var(--color-border-primary);
          color: var(--color-text-secondary);
          padding: 0.5rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-base);
          white-space: nowrap;
        }
        
        .article-tag-button:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
          transform: translateY(-1px);
        }
        
        /* Related Articles Section Styles */
        .article-related-section {
          padding: 2rem 1.5rem;
        }
        
        .article-related-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .article-related-item {
          width: 100%;
          background: none;
          border: none;
          text-align: left;
          padding: 1rem;
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-base);
          border: 0.5px solid var(--color-border-primary);
        }
        
        .article-related-item:hover {
          background: var(--color-bg-tertiary);
          transform: translateY(-1px);
        }
        
        .article-related-content {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .article-related-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--color-text-primary);
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .article-related-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.8rem;
          color: var(--color-text-muted);
        }
        
        .article-related-category {
          font-weight: 500;
          color: var(--color-primary);
        }
        
        /* Mobile Header Styles */
        .article-mobile-header {
          position: sticky;
          top: 0;
          z-index: 10;
          background: var(--color-bg-primary);
          border-bottom: 0.5px solid var(--color-border-primary);
          backdrop-filter: blur(10px);
          padding-top: 56px; /* Account for mobile header height */
        }
        
        .article-mobile-header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2) var(--content-padding);
        }
        
        .article-mobile-header-title {
          font-size: var(--text-lg);
          font-weight: var(--font-semibold);
          color: var(--color-text-primary);
          margin: 0;
        }
        
        /* Mobile styles */
        @media (max-width: 1023px) {
          .article-action-panel {
            display: ${isMobileOverlay ? 'flex' : 'none'}; /* Show when used as mobile overlay */
          }
          
          .article-toc-section,
          .article-tags-section,
          .article-related-section {
            padding: 1.5rem 1rem;
          }
          
          .article-tags-list {
            gap: 0.375rem;
          }
          
          .article-tag-button {
            font-size: 0.8rem;
            padding: 0.375rem 0.625rem;
          }
          
          .article-related-item {
            padding: 0.75rem;
          }
          
          .article-related-title {
            font-size: 0.85rem;
          }
          
          .article-related-meta {
            font-size: 0.75rem;
          }
          
          /* Mobile overlay specific styles */
          .article-action-panel.mobile-overlay {
            position: relative;
            top: 0;
            height: 100%;
            border-left: none;
            border-radius: 0;
            padding: 0;
            background: var(--color-bg-primary);
          }
          
          /* Prevent background scrolling when panel is open */
          .article-action-panel.mobile-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            -webkit-overflow-scrolling: touch;
          }
        }
        
        /* Desktop styles */
        @media (min-width: 1024px) {
          .article-action-panel {
            position: relative; /* Keep relative positioning */
            height: 100%; /* Use 100% height */
          }
        }
      `}</style>
    </div>
  );
};

export default ArticleActionPanel;
