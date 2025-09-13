"use client";

import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Edit3 } from 'lucide-react';

interface ImagePreviewProps {
  node: {
    attrs: {
      src: string;
      alt?: string;
      title?: string;
      figcaption?: string;
      width?: string;
      height?: string;
    };
  };
  updateAttributes: (attrs: any) => void;
  selected: boolean;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  node,
  updateAttributes,
  selected,
}) => {
  const { src, alt, title, figcaption, width, height } = node.attrs;

  const handleEdit = () => {
    // Dispatch a custom event that the RichTextEditor can listen to
    const event = new CustomEvent('editImage', {
      detail: {
        src,
        alt: alt || '',
        title: title || '',
        figcaption: figcaption || '',
        width: width || '',
        height: height || '',
        updateAttributes,
      },
    });
    window.dispatchEvent(event);
  };

  return (
    <NodeViewWrapper
      className={`image-preview ${selected ? 'ProseMirror-selectednode' : ''}`}
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
            zIndex: 10,
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
            title="Edit Image"
          >
            <Edit3 style={{ width: '14px', height: '14px' }} />
          </button>
        </div>

        {/* Figure element for images with captions */}
        {figcaption ? (
          <figure
            style={{
              margin: 0,
              maxWidth: '100%',
            }}
          >
            <img
              src={src}
              alt={alt || ''}
              title={title || ''}
              width={width || undefined}
              height={height || undefined}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: 'var(--radius-lg)',
                display: 'block',
                margin: '0 auto',
                boxShadow: selected ? '0 0 0 2px var(--color-primary)' : 'none',
                transition: 'box-shadow var(--transition-base)',
              }}
              loading="lazy"
            />
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
          <img
            src={src}
            alt={alt || ''}
            title={title || ''}
            width={width || undefined}
            height={height || undefined}
            style={{
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 'var(--radius-lg)',
              display: 'block',
              margin: '0 auto',
              boxShadow: selected ? '0 0 0 2px var(--color-primary)' : 'none',
              transition: 'box-shadow var(--transition-base)',
            }}
            loading="lazy"
          />
        )}
      </div>

      {/* Hover overlay for non-selected images */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.1)',
          opacity: selected ? 0 : 0,
          transition: 'opacity var(--transition-base)',
          pointerEvents: 'none',
          borderRadius: 'var(--radius-lg)',
        }}
        onMouseEnter={(e) => {
          if (!selected) {
            e.currentTarget.style.opacity = '1';
          }
        }}
        onMouseLeave={(e) => {
          if (!selected) {
            e.currentTarget.style.opacity = '0';
          }
        }}
      />
    </NodeViewWrapper>
  );
};
