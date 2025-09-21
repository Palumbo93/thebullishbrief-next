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
    document.body.appendChild(script);

    return () => {
      // Only try to remove if the script is still in the DOM and is a child of document.body
      try {
        if (script.parentNode === document.body) {
          document.body.removeChild(script);
        }
      } catch (error) {
        // Script may have already been removed, ignore the error
        console.debug('ElevenLabs script cleanup: Script already removed');
      }
    };
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
