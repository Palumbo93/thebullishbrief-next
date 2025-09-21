'use client';

import { useEffect, useState } from 'react';

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
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/player/audioNativeHelper.js';
    script.async = true;
    script.onerror = () => console.error('Failed to load ElevenLabs Audio Native script');
    
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
        data-playerurl="https://elevenlabs.io/player/index.html"
        data-small={size === 'small' ? 'True' : 'False'}
        data-textcolor={textColorRgba ?? 'rgba(255, 255, 255, 1.0)'}
        data-backgroundcolor={backgroundColorRgba ?? 'var(--color-primary)'}
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
