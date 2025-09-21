'use client';

import React, { useEffect } from 'react';

export type ElevenLabsProps = {
  publicUserId?: string;
  textColorRgba?: string;
  backgroundColorRgba?: string;
  size?: 'small' | 'large';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export const ElevenLabsAudioNative = ({
  publicUserId,
  size = 'small',
  textColorRgba,
  backgroundColorRgba,
  children,
  className = '',
  style = {},
}: ElevenLabsProps) => {
  // Get public user ID from environment variable or use provided prop
  const userIdToUse = publicUserId || process.env.NEXT_PUBLIC_ELEVENLABS_PUBLIC_USER_ID;

  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src="https://elevenlabs.io/player/audioNativeHelper.js"]');
    
    if (existingScript) {
      console.log('ElevenLabsAudioNative: Script already loaded');
      return;
    }

    console.log('ElevenLabsAudioNative: Loading Audio Native script');
    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/player/audioNativeHelper.js';
    script.async = true;
    script.onload = () => console.log('ElevenLabsAudioNative: Script loaded successfully');
    script.onerror = () => console.error('ElevenLabsAudioNative: Failed to load Audio Native script');
    
    document.body.appendChild(script);

    return () => {
      // Only remove if this component added it
      if (!document.querySelector('script[src="https://elevenlabs.io/player/audioNativeHelper.js"]:not([data-added-by-component])')) {
        try {
          document.body.removeChild(script);
        } catch {
          // Script might have already been removed
        }
      }
    };
  }, []);

  // Don't render if no public user ID is available
  if (!userIdToUse) {
    console.warn('ElevenLabsAudioNative: No public user ID provided. Set NEXT_PUBLIC_ELEVENLABS_PUBLIC_USER_ID environment variable or pass publicUserId prop.');
    return null;
  }


  // Debug logging to help identify issues (only once)
  React.useEffect(() => {
    console.log('ElevenLabsAudioNative: Initializing with public user ID:', userIdToUse);
    console.log('ElevenLabsAudioNative: Current URL:', typeof window !== 'undefined' ? window.location.href : 'SSR');
    console.log('ElevenLabsAudioNative: Player configuration:', {
      size,
      textColor: textColorRgba ?? 'rgba(255, 255, 255, 1.0)',
      backgroundColor: backgroundColorRgba ?? 'var(--color-primary)',
      autoplay: 'false'
    });
  }, [userIdToUse]);

  return (
    <div
      className={`elevenlabs-audio-native ${className}`}
      style={style}
    >
      <div
        id="elevenlabs-audionative-widget"
        data-height={size === 'small' ? '90' : '120'}
        data-width="100%"
        data-frameborder="no"
        data-scrolling="no"
        data-publicuserid={userIdToUse}
        data-projectid={userIdToUse}
        data-playerurl="https://elevenlabs.io/player/index.html"
        data-small={size === 'small' ? 'True' : 'False'}
        data-textcolor={textColorRgba ?? 'rgba(255, 255, 255, 1.0)'}
        data-backgroundcolor={backgroundColorRgba ?? 'var(--color-primary)'}
        data-autoplay="false"
      >
        {children ? children : 'Loading Elevenlabs AudioNative Player...'}
      </div>

      <style jsx>{`
        .elevenlabs-audio-native {
          width: 100%;
          position: relative;
        }

        #elevenlabs-audionative-widget {
          width: 100%;
          border-radius: var(--radius-lg);
          overflow: hidden;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          transition: all var(--transition-base);
        }

        #elevenlabs-audionative-widget:hover {
          border-color: var(--color-border-secondary);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* Loading state */
        #elevenlabs-audionative-widget:empty::after {
          content: 'Loading audio player...';
          display: flex;
          align-items: center;
          justify-content: center;
          height: ${size === 'small' ? '90' : '120'}px;
          color: var(--color-text-tertiary);
          font-size: var(--text-sm);
          background: var(--color-bg-secondary);
        }
      `}</style>
    </div>
  );
};

export default ElevenLabsAudioNative;
