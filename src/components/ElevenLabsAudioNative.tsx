'use client';

import { useEffect } from 'react';

export type ElevenLabsProps = {
  publicUserId: string;
  projectId?: string;
  textColorRgba?: string;
  backgroundColorRgba?: string;
  size?: 'small' | 'large';
  children?: React.ReactNode;
};

export const ElevenLabsAudioNative = ({
  publicUserId,
  projectId,
  size,
  textColorRgba,
  backgroundColorRgba,
  children,
}: ElevenLabsProps) => {
  useEffect(() => {
    // Check if script is already loaded to avoid duplicates
    const existingScript = document.querySelector('script[src="https://elevenlabs.io/player/audioNativeHelper.js"]');
    
    if (existingScript) {
      return; // Script already exists, no cleanup needed
    }

    const script = document.createElement('script');
    script.src = 'https://elevenlabs.io/player/audioNativeHelper.js';
    script.async = true;
    script.setAttribute('data-elevenlabs-script', 'true');
    document.body.appendChild(script);

    // No cleanup function - let the script persist for the entire session
    // ElevenLabs scripts are designed to be loaded once and shared across components
  }, []);

  return (
    <div
      id="elevenlabs-audionative-widget"
      data-height="90"
      data-width="100%"
      data-frameborder="no"
      data-scrolling="no"
      data-publicuserid={publicUserId}
      data-playerurl="https://elevenlabs.io/player/index.html"
      {...(projectId && { 'data-projectid': projectId })}
      data-small={size === 'small' ? 'True' : 'False'}
      data-textcolor={textColorRgba ?? 'rgba(0, 0, 0, 1.0)'}
      data-backgroundcolor={backgroundColorRgba ?? 'rgba(255, 255, 255, 1.0)'}
    >
      {children ? children : 'Loading the Elevenlabs Text to Speech AudioNative Player...'}
    </div>
  );
};

export default ElevenLabsAudioNative;
