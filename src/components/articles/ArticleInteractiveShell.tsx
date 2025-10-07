"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthModal } from '../../contexts/AuthModalContext';
import { useMobileHeader } from '../../contexts/MobileHeaderContext';
import { useToggleBookmark, useIsBookmarked, useRelatedArticles } from '../../hooks/useArticles';
import { useTrackArticleView } from '../../hooks/useArticleViews';
import { useTrackArticleEngagement } from '../../hooks/useClarityAnalytics';
import { createMobileHeaderConfig } from '../../utils/mobileHeaderConfigs';
import { ShareSheet } from '../ShareSheet';
import { ImageZoomModal } from '../ui/ImageZoomModal';
import AudioNativeController from '../AudioNativeController';
import { ServerArticle } from '../../page-components/ArticlePageServer';
import { ArticleAccessResult } from '../../lib/serverAccessControl';
import { TOCSection } from '../../utils/tocParser';
import { ArticleActionPanelWrapper } from './ArticleActionPanelWrapper';
import { createPortal } from 'react-dom';

interface ArticleInteractiveShellProps {
  article: ServerArticle;
  accessResult: ArticleAccessResult;
  tocSections: TOCSection[];
  relatedArticles: ServerArticle[];
  slug: string;
  children: React.ReactNode;
}

/**
 * Client component that handles all interactive features for the article page
 * This includes mobile header configuration, analytics tracking, share functionality,
 * bookmark management, and modal states.
 */
export const ArticleInteractiveShell: React.FC<ArticleInteractiveShellProps> = ({
  article,
  accessResult,
  tocSections,
  relatedArticles,
  slug,
  children
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { handleSignUpClick } = useAuthModal();
  const { setConfig } = useMobileHeader();
  
  // DISABLED FOR PERFORMANCE - Client-side data hooks
  // const { data: isBookmarked } = useIsBookmarked(article.id);
  // const toggleBookmark = useToggleBookmark();
  // const trackView = useTrackArticleView();
  // const { trackBookmark: trackAnalyticsBookmark, trackShare: trackAnalyticsShare } = useTrackArticleEngagement();
  
  // Mock values
  const isBookmarked = false;
  const toggleBookmark = { mutate: (_id: string) => {}, isPending: false };
  const trackView = { mutate: (_id: string) => {} };
  const trackAnalyticsBookmark = (_id: string, _title: string) => {};
  const trackAnalyticsShare = (_id: string, _title: string, _method: string) => {};
  
  // Modal and UI state
  const [isShareSheetOpen, setIsShareSheetOpen] = React.useState(false);
  const [isImageZoomOpen, setIsImageZoomOpen] = React.useState(false);
  const [zoomedImageUrl, setZoomedImageUrl] = React.useState<string>('');
  
  // Portal target state for action panel
  const [portalTarget, setPortalTarget] = React.useState<Element | null>(null);
  const [zoomedImageAlt, setZoomedImageAlt] = React.useState<string>('');
  const [contentProcessed, setContentProcessed] = React.useState(false);

  // Track article view when component mounts
  React.useEffect(() => {
    if (article.id && article.id.trim() !== '') {
      trackView.mutate(article.id);
    }
  }, [article.id, trackView]);

  // Configure mobile header when article data is available
  React.useEffect(() => {
    const mobileHeaderConfig = createMobileHeaderConfig.article({
      onMenuClick: () => {}, // Layout will override this with its own handler
      onSearchClick: (path?: string) => router.push(path || '/search'),
      onLogoClick: () => router.push('/'),
      isBookmarked: isBookmarked,
      onBookmarkClick: accessResult.canBookmark ? () => {
        if (article.id) {
          toggleBookmark.mutate(article.id);
          if (article.title) {
            trackAnalyticsBookmark(article.id, article.title);
          }
        }
      } : () => handleSignUpClick(),
      onShareClick: () => setIsShareSheetOpen(true),
      bookmarkLoading: toggleBookmark.isPending,
      showSubscribe: accessResult.showSubscribePrompt,
      onSubscribeClick: () => handleSignUpClick()
    });
    
    setConfig(mobileHeaderConfig);
    
    // Cleanup when component unmounts
    return () => {
      setConfig(null);
    };
  }, [
    article.id, 
    article.title, 
    isBookmarked, 
    accessResult.canBookmark,
    accessResult.showSubscribePrompt,
    toggleBookmark.isPending, 
    setConfig,
    router,
    handleSignUpClick
  ]);

  // Find portal target and update layout classes for action panel
  React.useEffect(() => {
    const target = document.getElementById('dynamic-action-panel-root');
    const appContainer = document.querySelector('.app-container');
    const mainContent = document.querySelector('.main-content');
    
    if (target) {
      setPortalTarget(target);
      
      // Add classes to indicate action panel is present
      if (appContainer && mainContent) {
        appContainer.classList.add('with-action-panel');
        mainContent.classList.add('with-action-panel');
      }
    }
    
    // Cleanup function
    return () => {
      if (appContainer && mainContent) {
        appContainer.classList.remove('with-action-panel');
        mainContent.classList.remove('with-action-panel');
      }
    };
  }, []);

  // Handle image click to open zoom modal
  const handleImageClick = React.useCallback((imageUrl: string, imageAlt: string = 'Image') => {
    setZoomedImageUrl(imageUrl);
    setZoomedImageAlt(imageAlt);
    setIsImageZoomOpen(true);
  }, []);

  // Optimize images within HTML content for better performance and add zoom functionality
  const optimizeContentImages = React.useCallback((el: HTMLElement) => {
    const imgElements = el.querySelectorAll('img');
    
    // Only process first 3 images immediately, lazy load the rest
    imgElements.forEach((img, index) => {
      // Skip if already optimized
      if (img.hasAttribute('data-optimized')) {
        return;
      }
      
      // First image loads eagerly for LCP, next 2 load early, rest are lazy
      if (index === 0) {
        img.loading = 'eager';
      } else if (index <= 2) {
        img.loading = 'lazy';
      } else {
        // Far images use native lazy loading
        img.loading = 'lazy';
        img.decoding = 'async';
        img.setAttribute('data-optimized', 'true');
        return; // Skip processing for far images until they're near viewport
      }
      
      img.decoding = 'async';
      
      // Add responsive sizes for better performance
      if (!img.sizes) {
        img.sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, var(--max-width)';
      }
      
      // Add proper alt text if missing
      if (!img.alt && img.title) {
        img.alt = img.title;
      }
      
      // Add zoom functionality - use CSS for hover effects instead of JS listeners
      img.style.cursor = 'zoom-in';
      img.classList.add('zoomable-image');
      
      // Add click handler for zoom - use passive listener
      const clickHandler = (e: Event) => {
        e.preventDefault();
        handleImageClick(img.src, img.alt || 'Content image');
      };
      img.addEventListener('click', clickHandler, { passive: false });
      
      // Mark as optimized to prevent re-processing
      img.setAttribute('data-optimized', 'true');
    });
  }, [handleImageClick]);

  // Process embed content to execute scripts properly - only for first visible embed
  const processEmbedContent = React.useCallback((el: HTMLElement) => {
    const embedContainers = el.querySelectorAll('[data-embed]');
    
    // Only process first 2 embeds immediately to reduce initial load
    embedContainers.forEach((container, index) => {
      // Skip embeds beyond the first 2 on initial load
      if (index > 1) return;
      
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
  }, []);

  // Add IDs to H2 elements and process embeds for TOC functionality
  React.useEffect(() => {
    // Only run once per content change using a ref to track processing
    if (contentProcessed) return;
    
    const processVisibleContent = () => {
      const contentContainer = document.querySelector('.brief-content-container, .article-content');
      if (!contentContainer) return false;

      // Use requestIdleCallback for non-critical H2 processing
      const processH2s = () => {
        const h2Elements = contentContainer.querySelectorAll('h2');
        const usedIds = new Set<string>();

        h2Elements.forEach((h2) => {
          if (!h2.id) {
            const text = h2.textContent?.trim() || '';
            if (text) {
              // Generate ID using the same logic as parseTOCFromContent
              let baseId = text
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .trim()
                .replace(/^-+|-+$/g, '');

              if (!baseId) {
                baseId = `section-${usedIds.size + 1}`;
              }

              let uniqueId = baseId;
              let counter = 1;
              while (usedIds.has(uniqueId)) {
                uniqueId = `${baseId}-${counter}`;
                counter++;
              }

              usedIds.add(uniqueId);
              h2.id = uniqueId;
            }
          }
        });
      };

      // Process embeds immediately (needed for functionality)
      processEmbedContent(contentContainer as HTMLElement);

      // Defer H2 processing using requestIdleCallback or setTimeout
      if ('requestIdleCallback' in window) {
        requestIdleCallback(processH2s);
      } else {
        setTimeout(processH2s, 100);
      }
      
      return true;
    };

    // Use requestAnimationFrame to process after paint
    requestAnimationFrame(() => {
      if (processVisibleContent()) {
        setContentProcessed(true);
      }
    });
  }, [article.content, contentProcessed, processEmbedContent]);

  // Enhanced share button functionality - both mobile and desktop
  React.useEffect(() => {
    const setupShareButton = (buttonId: string) => {
      const shareButton = document.getElementById(buttonId);
      if (!shareButton) return null;
      
      // Replace placeholder with functional button
      shareButton.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <polyline points="16,6 12,2 8,6"></polyline>
          <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
        <span>Share</span>
      `;
      shareButton.style.cursor = 'pointer';
      shareButton.style.opacity = '1';
      shareButton.style.transition = 'all var(--transition-base)';
      shareButton.style.display = 'flex';
      shareButton.style.alignItems = 'center';
      shareButton.style.gap = 'var(--space-2)';
      
      const handleClick = () => setIsShareSheetOpen(true);
      const handleMouseOver = () => {
        shareButton.style.background = 'var(--color-bg-secondary)';
        shareButton.style.color = 'var(--color-text-secondary)';
        shareButton.style.borderColor = 'var(--color-border-secondary)';
      };
      const handleMouseOut = () => {
        shareButton.style.background = 'transparent';
        shareButton.style.color = 'var(--color-text-muted)';
        shareButton.style.borderColor = 'var(--color-border-primary)';
      };
      
      shareButton.addEventListener('click', handleClick);
      shareButton.addEventListener('mouseenter', handleMouseOver);
      shareButton.addEventListener('mouseleave', handleMouseOut);
      
      return () => {
        shareButton.removeEventListener('click', handleClick);
        shareButton.removeEventListener('mouseenter', handleMouseOver);
        shareButton.removeEventListener('mouseleave', handleMouseOut);
      };
    };
    
    const cleanupMobile = setupShareButton('share-button-placeholder');
    const cleanupDesktop = setupShareButton('share-button-placeholder-desktop');
    
    return () => {
      cleanupMobile?.();
      cleanupDesktop?.();
    };
  }, []);

  // Enhanced bookmark button functionality - both mobile and desktop
  React.useEffect(() => {
    const setupBookmarkButton = (buttonId: string) => {
      const bookmarkButton = document.getElementById(buttonId);
      if (!bookmarkButton) return null;
      
      // Replace placeholder with functional button
      const updateBookmarkIcon = () => {
        bookmarkButton.innerHTML = isBookmarked ? `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
        ` : `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
          </svg>
        `;
      };

      updateBookmarkIcon();
      bookmarkButton.style.opacity = '1';
      bookmarkButton.style.cursor = 'pointer';
      bookmarkButton.style.display = 'flex';
      bookmarkButton.style.alignItems = 'center';
      bookmarkButton.style.justifyContent = 'center';
      bookmarkButton.style.color = isBookmarked ? 'var(--color-primary)' : 'var(--color-text-muted)';
      
      // Add click handler
      const handleBookmarkClick = () => {
        if (accessResult.canBookmark) {
          if (article.id) {
            toggleBookmark.mutate(article.id);
            if (article.title) {
              trackAnalyticsBookmark(article.id, article.title);
            }
          }
        } else {
          handleSignUpClick();
        }
      };

      bookmarkButton.addEventListener('click', handleBookmarkClick);
      
      return () => {
        bookmarkButton.removeEventListener('click', handleBookmarkClick);
      };
    };
    
    const cleanupMobile = setupBookmarkButton('bookmark-placeholder');
    const cleanupDesktop = setupBookmarkButton('bookmark-placeholder-desktop');
    
    return () => {
      cleanupMobile?.();
      cleanupDesktop?.();
    };
  }, [isBookmarked, accessResult.canBookmark, article.id, article.title, toggleBookmark, trackAnalyticsBookmark, handleSignUpClick]);

  // Removed duplicate content processing - now handled in single effect above

  return (
    <>
      {/* Main Content */}
      {children}
      
      {/* Share Sheet */}
      <ShareSheet
        isOpen={isShareSheetOpen}
        onClose={() => setIsShareSheetOpen(false)}
        url={typeof window !== 'undefined' ? window.location.href : ''}
        onShare={(platform) => {
          if (article.title) {
            trackAnalyticsShare(article.id, article.title, platform);
          }
        }}
      />
      
      {/* Image Zoom Modal */}
      <ImageZoomModal
        isOpen={isImageZoomOpen}
        onClose={() => setIsImageZoomOpen(false)}
        imageUrl={zoomedImageUrl}
        imageAlt={zoomedImageAlt}
        imageName={zoomedImageAlt}
      />
      
      {/* Action Panel Portal */}
      {portalTarget && createPortal(
        <ArticleActionPanelWrapper
          article={article}
          tocSections={tocSections}
          relatedArticles={relatedArticles}
        />,
        portalTarget
      )}
    </>
  );
};
