"use client";

import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Edit3 } from 'lucide-react';

interface VideoPreviewProps {
  node: {
    attrs: {
      src: string;
      title?: string;
      width?: string;
      height?: string;
      controls?: boolean;
      autoplay?: boolean;
      muted?: boolean;
      loop?: boolean;
      poster?: string;
      figcaption?: string;
    };
  };
  updateAttributes: (attrs: any) => void;
  selected: boolean;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const { src, title, width, height, controls, autoplay, muted, loop, poster, figcaption } = node.attrs;

  const handleEdit = () => {
    // Dispatch a custom event that the RichTextEditor can listen to
    const event = new CustomEvent('editVideo', {
      detail: {
        src,
        title: title || '',
        width: width || '100%',
        height: height || 'auto',
        controls: controls !== false,
        autoplay: autoplay || false,
        muted: muted || false,
        loop: loop || false,
        poster: poster || '',
        figcaption: figcaption || '',
        updateAttributes,
      },
    });
    window.dispatchEvent(event);
  };

  const renderVideoContent = () => {
    // Check if it's a YouTube URL
    const youtubeMatch = src?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      
      return (
        <div style={{
          width: width || '100%',
          height: height || '400px',
          maxWidth: '100%',
          position: 'relative',
        }}>
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={title || 'YouTube video'}
            style={{
              borderRadius: 'var(--radius-lg)',
              boxShadow: selected ? '0 0 0 2px var(--color-primary)' : 'none',
              transition: 'box-shadow var(--transition-base)',
            }}
          />
        </div>
      );
    }
    
    // Check if it's a Vimeo URL
    const vimeoMatch = src?.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      const embedUrl = `https://player.vimeo.com/video/${videoId}`;
      
      return (
        <div style={{
          width: width || '100%',
          height: height || '400px',
          maxWidth: '100%',
          position: 'relative',
        }}>
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={title || 'Vimeo video'}
            style={{
              borderRadius: 'var(--radius-lg)',
              boxShadow: selected ? '0 0 0 2px var(--color-primary)' : 'none',
              transition: 'box-shadow var(--transition-base)',
            }}
          />
        </div>
      );
    }
    
    // Direct video file
    const videoAttributes: Record<string, any> = {
      src,
      style: {
        width: '100%',
        height: '100%',
        borderRadius: 'var(--radius-lg)',
        boxShadow: selected ? '0 0 0 2px var(--color-primary)' : 'none',
        transition: 'box-shadow var(--transition-base)',
      },
      playsInline: true,
    };

    if (poster) videoAttributes.poster = poster;
    if (controls) videoAttributes.controls = true;
    if (autoplay) {
      videoAttributes.autoPlay = true;
      videoAttributes.muted = true; // Always mute autoplay videos for browser compliance
    } else if (muted) {
      videoAttributes.muted = true;
    }
    if (loop) videoAttributes.loop = true;

    return (
      <div style={{
        width: width || '100%',
        height: height || 'auto',
        maxWidth: '100%',
        position: 'relative',
      }}>
        <video {...videoAttributes} />
        {/* Play button overlay for direct videos */}
        {controls && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80px',
              height: '80px',
              background: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '50%',
              zIndex: 10,
              pointerEvents: 'none',
              transition: 'all var(--transition-base)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
            }}
          >
            ▶
          </div>
        )}
      </div>
    );
  };

  return (
    <NodeViewWrapper
      className={`video-preview ${selected ? 'ProseMirror-selectednode' : ''}`}
      style={{
        position: 'relative',
        display: 'block',
        margin: 'var(--space-4) 0',
        textAlign: 'center',
        maxWidth: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          maxWidth: '100%',
        }}
      >
        {/* Edit button overlay */}
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-2)',
            right: 'var(--space-2)',
            zIndex: 20,
            opacity: selected ? 1 : 0,
            transition: 'opacity var(--transition-base)',
          }}
        >
          <button
            type="button"
            onClick={handleEdit}
            style={{
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-sm)',
              backdropFilter: 'blur(4px)',
            }}
            title="Edit Video"
          >
            <Edit3 style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        {/* Figure element for videos with captions */}
        {figcaption ? (
          <figure
            style={{
              margin: 0,
              maxWidth: '100%',
            }}
          >
            {renderVideoContent()}
            <figcaption
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-secondary)',
                marginTop: 'var(--space-2)',
                fontStyle: 'italic',
                textAlign: 'center',
                lineHeight: '1.4',
              }}
            >
              {figcaption}
            </figcaption>
          </figure>
        ) : (
          renderVideoContent()
        )}
      </div>
    </NodeViewWrapper>
  );
};
