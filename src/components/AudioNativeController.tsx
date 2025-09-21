'use client';

import React, { useEffect, useState, useRef } from 'react';
import ElevenLabsAudioNative from './ElevenLabsAudioNative';

interface AudioNativeControllerProps {
  // Audio player props
  publicUserId?: string;
  textColorRgba?: string;
  backgroundColorRgba?: string;
  size?: 'small' | 'large';
  
  // Content identification
  title?: string;
  contentType?: 'article' | 'brief';
  
  // Scroll behavior control
  triggerOffset?: number; // Pixels scrolled before moving to action panel
  metaInfoSelector?: string; // CSS selector for meta info section
  actionPanelSelector?: string; // CSS selector for action panel sticky section
}

export const AudioNativeController: React.FC<AudioNativeControllerProps> = ({
  publicUserId,
  textColorRgba,
  backgroundColorRgba,
  size = 'small',
  title,
  contentType = 'article',
  triggerOffset = 300,
  metaInfoSelector = '.meta-info-section, .article-meta-section',
  actionPanelSelector = '.briefs-sticky-section, .article-sticky-section'
}) => {
  const [isMovedToPanel, setIsMovedToPanel] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const metaPlayerRef = useRef<HTMLDivElement>(null);
  const panelPlayerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const shouldMoveToPanel = scrollY > triggerOffset;
      
      if (shouldMoveToPanel !== isMovedToPanel) {
        setIsMovedToPanel(shouldMoveToPanel);
      }
    };

    // Set up intersection observer to track when meta section goes out of view
    const setupObserver = () => {
      const metaElement = document.querySelector(metaInfoSelector);
      
      if (metaElement && !observerRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              // When meta section is not visible and user has scrolled enough,
              // move audio player to action panel
              const shouldMoveToPanel = !entry.isIntersecting && window.scrollY > triggerOffset;
              setIsMovedToPanel(shouldMoveToPanel);
            });
          },
          {
            threshold: 0.1,
            rootMargin: '-50px 0px 0px 0px'
          }
        );
        
        observerRef.current.observe(metaElement);
      }
    };

    // Initial setup
    setupObserver();
    
    // Fallback scroll listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Retry observer setup if elements aren't ready yet
    const retryTimeout = setTimeout(setupObserver, 1000);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(retryTimeout);
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, [isMovedToPanel, triggerOffset, metaInfoSelector]);

  // Portal effect to move audio player to action panel
  useEffect(() => {
    if (isMovedToPanel) {
      const actionPanelElement = document.querySelector(actionPanelSelector);
      const panelContainer = panelPlayerRef.current;
      
      if (actionPanelElement && panelContainer) {
        // Insert the panel player container at the top of the action panel sticky section
        const firstChild = actionPanelElement.firstChild;
        if (firstChild) {
          actionPanelElement.insertBefore(panelContainer, firstChild);
        } else {
          actionPanelElement.appendChild(panelContainer);
        }
      }
    } else {
      // Move panel player back to its original container if needed
      const panelContainer = panelPlayerRef.current;
      const originalContainer = document.querySelector('.audio-native-controller');
      
      if (panelContainer && originalContainer && !originalContainer.contains(panelContainer)) {
        originalContainer.appendChild(panelContainer);
      }
    }
  }, [isMovedToPanel, actionPanelSelector]);

  const audioPlayerElement = (
    <ElevenLabsAudioNative
      publicUserId={publicUserId}
      size={size}
      textColorRgba={textColorRgba}
      backgroundColorRgba={backgroundColorRgba}
      className="audio-native-player"
    >
      {title ? `Listen to: ${title}` : 'Loading audio player...'}
    </ElevenLabsAudioNative>
  );

  return (
    <div className="audio-native-controller">
      {/* Audio player in meta section - visible when not moved to panel */}
      <div 
        ref={metaPlayerRef}
        className={`audio-native-meta ${isMovedToPanel ? 'hidden' : 'visible'}`}
        style={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isMovedToPanel ? 0 : 1,
          transform: isMovedToPanel ? 'translateY(-10px)' : 'translateY(0)',
          pointerEvents: isMovedToPanel ? 'none' : 'auto'
        }}
      >
        {!isMovedToPanel && audioPlayerElement}
      </div>

      {/* Audio player for action panel - moved via portal effect */}
      <div 
        ref={panelPlayerRef}
        className={`audio-native-panel ${isMovedToPanel ? 'visible' : 'hidden'}`}
        style={{
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: isMovedToPanel ? 1 : 0,
          transform: isMovedToPanel ? 'translateY(0)' : 'translateY(-10px)',
          pointerEvents: isMovedToPanel ? 'auto' : 'none',
          marginBottom: isMovedToPanel ? 'var(--space-4)' : '0',
          borderBottom: isMovedToPanel ? '0.5px solid var(--color-border-primary)' : 'none',
          paddingBottom: isMovedToPanel ? 'var(--space-4)' : '0'
        }}
      >
        {isMovedToPanel && audioPlayerElement}
      </div>

      <style jsx>{`
        .audio-native-controller {
          width: 100%;
        }

        .audio-native-meta {
          width: 100%;
          margin: var(--space-4) 0;
        }

        .audio-native-panel {
          width: 100%;
          padding: 0 var(--space-6);
        }

        .audio-native-meta.hidden,
        .audio-native-panel.hidden {
          height: 0;
          overflow: hidden;
          margin: 0;
          padding: 0;
        }

        .audio-native-meta.visible,
        .audio-native-panel.visible {
          height: auto;
        }

        /* Ensure smooth transitions */
        .audio-native-controller :global(.audio-native-player) {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Action panel specific styles */
        .audio-native-panel.visible {
          animation: slideInFromTop 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes slideInFromTop {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .audio-native-panel {
            padding: 0 var(--space-4);
          }
          
          .audio-native-meta {
            margin: var(--space-3) 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AudioNativeController;
