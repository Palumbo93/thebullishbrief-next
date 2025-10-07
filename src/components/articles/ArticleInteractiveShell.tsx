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
  
  // Client-side data hooks
  const { data: isBookmarked } = useIsBookmarked(article.id);
  const toggleBookmark = useToggleBookmark();
  const trackView = useTrackArticleView();
  const { trackBookmark: trackAnalyticsBookmark, trackShare: trackAnalyticsShare } = useTrackArticleEngagement();
  
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
    setConfig
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

  // Add IDs to H2 elements and process embeds in the visible content
  React.useEffect(() => {
    const processVisibleContent = () => {
      const contentContainer = document.querySelector('.brief-content-container, .article-content');
      if (!contentContainer) return;

      // Add IDs to H2 elements for TOC functionality
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

      // Process embed content, images, and videos if the functions exist
      if (typeof processEmbedContent === 'function') {
        processEmbedContent(contentContainer as HTMLElement);
      }
      if (typeof optimizeContentImages === 'function') {
        optimizeContentImages(contentContainer as HTMLElement);
      }
      if (typeof optimizeContentVideos === 'function') {
        optimizeContentVideos(contentContainer as HTMLElement);
      }
    };

    // Try immediately
    processVisibleContent();

    // Also try after a short delay in case content is still loading
    const timeout = setTimeout(processVisibleContent, 500);

    return () => clearTimeout(timeout);
  }, [article.content]);

  // Handle image click to open zoom modal
  const handleImageClick = React.useCallback((imageUrl: string, imageAlt: string = 'Image') => {
    setZoomedImageUrl(imageUrl);
    setZoomedImageAlt(imageAlt);
    setIsImageZoomOpen(true);
  }, []);

  // Optimize images within HTML content for better performance and add zoom functionality
  const optimizeContentImages = React.useCallback((el: HTMLElement) => {
    const imgElements = el.querySelectorAll('img');
    imgElements.forEach((img, index) => {
      // Skip if already optimized
      if (img.hasAttribute('data-optimized')) {
        return;
      }
      
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
  }, [handleImageClick]);

  // Process embed content to execute scripts properly
  const processEmbedContent = React.useCallback((el: HTMLElement) => {
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
  }, []);

  // Process content when it's ready
  React.useEffect(() => {
    if (!contentProcessed) {
      const contentContainer = document.querySelector('.brief-content-container');
      if (contentContainer) {
        optimizeContentImages(contentContainer as HTMLElement);
        processEmbedContent(contentContainer as HTMLElement);
        setContentProcessed(true);
      }
    }
  }, [contentProcessed, optimizeContentImages, processEmbedContent]);

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
