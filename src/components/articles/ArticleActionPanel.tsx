import React, { useRef } from 'react';
import { X } from 'lucide-react';

interface TOCItem {
  id: string;
  label: string;
  level: number;
}

interface ArticleActionPanelProps {
  articleId?: string; // Article ID for analytics tracking
  sections?: TOCItem[];
  onSectionClick?: (sectionId: string) => void;
  isMobileOverlay?: boolean; // Whether this panel is being used in mobile overlay
  onClose?: () => void; // Close handler for mobile overlay
}

const ArticleActionPanel: React.FC<ArticleActionPanelProps> = ({ 
  articleId,
  sections = [],
  onSectionClick,
  isMobileOverlay = false,
  onClose
}) => {
  const tocRef = useRef<HTMLDivElement>(null);

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

  // If no sections, don't render the panel
  if (sections.length === 0) {
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
          <div className="article-toc-section">
            <h3 className="article-section-title">Contents</h3>
            <nav className="article-toc-nav" role="navigation" aria-label="Table of contents">
              <ul className="article-toc-list">
                {sections.map((section) => (
                  <li key={section.id} className="article-toc-item">
                    <button
                      className="article-toc-link"
                      onClick={() => handleSectionClick(section.id)}
                      style={{ paddingLeft: '16px' }}
                    >
                      {section.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
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
          padding: 0.75rem 1rem;
          color: var(--color-text-tertiary);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          line-height: 1.4;
        }
        
        .article-toc-link:hover {
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
          transform: translateX(4px);
        }
        
        .article-toc-link.active {
          background: var(--color-bg-card-hover);
          color: var(--color-brand-primary);
          font-weight: 600;
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
