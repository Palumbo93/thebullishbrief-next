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
  triggerOffset = 300,
  metaInfoSelector = '.meta-info-section, .article-meta-section',
  actionPanelSelector = '.briefs-sticky-section, .article-sticky-section'
}) => {
  const [isMovedToPanel, setIsMovedToPanel] = useState(false);
  const metaPlayerRef = useRef<HTMLDivElement>(null);
  const panelPlayerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Disabled scroll-based movement to prevent crashes
  /*
  useEffect(() => {
    // All scroll-based logic disabled for stability
  }, []);
  */

  // Disabled portal effect to prevent crashes
  /*
  useEffect(() => {
    // Portal logic disabled for stability
  }, []);
  */

  // Get public user ID from environment variable or use provided prop
  const userIdToUse = publicUserId || process.env.NEXT_PUBLIC_ELEVENLABS_PUBLIC_USER_ID;

  // Don't render if no public user ID is available
  if (!userIdToUse) {
    console.warn('AudioNativeController: No public user ID provided. Set NEXT_PUBLIC_ELEVENLABS_PUBLIC_USER_ID environment variable or pass publicUserId prop.');
    return null;
  }

  const audioPlayerElement = (
    <ElevenLabsAudioNative
      publicUserId={userIdToUse}
      size={size}
      textColorRgba={textColorRgba}
      backgroundColorRgba={backgroundColorRgba}
    >
      {title ? `Listen to: ${title}` : 'Loading the Elevenlabs Text to Speech AudioNative Player...'}
    </ElevenLabsAudioNative>
  );

  return (
    <div className="audio-native-controller">
      {/* Audio player in meta section - always visible, no movement */}
      <div 
        ref={metaPlayerRef}
        className="audio-native-meta visible"
      >
        {audioPlayerElement}
      </div>

      {/* Disabled: Audio player for action panel - commented out to prevent crashes */}
      {/* 
      <div 
        ref={panelPlayerRef}
        className="audio-native-panel hidden"
      >
      </div>
      */}

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
