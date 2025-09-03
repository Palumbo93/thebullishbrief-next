"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, Settings, ExternalLink } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (videoData: {
    src: string;
    title?: string;
    width?: string;
    height?: string;
    controls?: boolean;
    autoplay?: boolean;
    muted?: boolean;
    loop?: boolean;
    poster?: string;
  }) => void;
  zIndex?: number;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, onSubmit, zIndex }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [title, setTitle] = useState('');
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('auto');
  const [controls, setControls] = useState(true);
  const [autoplay, setAutoplay] = useState(false);
  const [muted, setMuted] = useState(false);
  const [loop, setLoop] = useState(false);
  const [poster, setPoster] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (videoUrl) {
      // Generate preview URL for YouTube/Vimeo
      const youtubeMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
      const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
      
      if (youtubeMatch) {
        const videoId = youtubeMatch[1];
        setPreviewUrl(`https://www.youtube.com/embed/${videoId}`);
      } else if (vimeoMatch) {
        const videoId = vimeoMatch[1];
        setPreviewUrl(`https://player.vimeo.com/video/${videoId}`);
      } else {
        setPreviewUrl(videoUrl);
      }
    } else {
      setPreviewUrl('');
    }
  }, [videoUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to parent forms
    if (!videoUrl.trim()) return;

    onSubmit({
      src: videoUrl.trim(),
      title: title.trim() || undefined,
      width,
      height,
      controls,
      autoplay,
      muted,
      loop,
      poster: poster.trim() || undefined,
    });

    // Reset form
    setVideoUrl('');
    setTitle('');
    setWidth('100%');
    setHeight('auto');
    setControls(true);
    setAutoplay(false);
    setMuted(false);
    setLoop(false);
    setPoster('');
    onClose();
  };

  const isValidUrl = videoUrl.trim() !== '';

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: zIndex || 'var(--z-modal)',
      padding: 'var(--space-4)'
    }} onClick={onClose}>
      <div style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-xl)',
        padding: 'var(--space-6)',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid var(--color-border-primary)'
      }} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-6)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--color-primary)',
              borderRadius: 'var(--radius-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Play style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-1)'
              }}>
                Add Video
              </h2>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-tertiary)'
              }}>
                Embed a video from YouTube, Vimeo, or direct URL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-tertiary)',
              cursor: 'pointer',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              transition: 'all var(--transition-base)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-bg-tertiary)';
              e.currentTarget.style.color = 'var(--color-text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'none';
              e.currentTarget.style.color = 'var(--color-text-tertiary)';
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* Video URL */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Video URL *
              </label>
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/... or direct video URL"
                required
                style={{
                  width: '100%',
                  height: 'var(--input-height)',
                  padding: '0 var(--input-padding-x)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)',
                  transition: 'all var(--transition-base)'
                }}
              />
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                marginTop: 'var(--space-1)'
              }}>
                Supports YouTube, Vimeo, and direct video file URLs
              </p>
            </div>

            {/* Title */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Video title for accessibility"
                style={{
                  width: '100%',
                  height: 'var(--input-height)',
                  padding: '0 var(--input-padding-x)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)',
                  transition: 'all var(--transition-base)'
                }}
              />
            </div>

            {/* Poster URL */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Poster Image URL (Optional)
              </label>
              <input
                type="url"
                value={poster}
                onChange={(e) => setPoster(e.target.value)}
                placeholder="https://example.com/thumbnail.jpg"
                style={{
                  width: '100%',
                  height: 'var(--input-height)',
                  padding: '0 var(--input-padding-x)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-base)',
                  transition: 'all var(--transition-base)'
                }}
              />
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                marginTop: 'var(--space-1)'
              }}>
                URL to an image that will be shown before the video plays
              </p>
            </div>

            {/* Size Controls */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-4)'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Width
                </label>
                <input
                  type="text"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  placeholder="100%"
                  style={{
                    width: '100%',
                    height: 'var(--input-height)',
                    padding: '0 var(--input-padding-x)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)',
                    transition: 'all var(--transition-base)'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Height
                </label>
                <input
                  type="text"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="auto"
                  style={{
                    width: '100%',
                    height: 'var(--input-height)',
                    padding: '0 var(--input-padding-x)',
                    background: 'var(--color-bg-tertiary)',
                    border: '0.5px solid var(--color-border-primary)',
                    borderRadius: 'var(--radius-lg)',
                    color: 'var(--color-text-primary)',
                    fontSize: 'var(--text-base)',
                    transition: 'all var(--transition-base)'
                  }}
                />
              </div>
            </div>

            {/* Video Options */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-3)'
              }}>
                <Settings style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />
                <span style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-semibold)',
                  color: 'var(--color-text-primary)'
                }}>
                  Video Options
                </span>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-3)'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={controls}
                    onChange={(e) => setControls(e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)'
                  }}>
                    Show Controls
                  </span>
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={autoplay}
                    onChange={(e) => setAutoplay(e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)'
                  }}>
                    Autoplay
                  </span>
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={muted}
                    onChange={(e) => setMuted(e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)'
                  }}>
                    Muted
                  </span>
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={loop}
                    onChange={(e) => setLoop(e.target.checked)}
                    style={{ margin: 0 }}
                  />
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)'
                  }}>
                    Loop
                  </span>
                </label>
              </div>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  marginBottom: 'var(--space-3)'
                }}>
                  <ExternalLink style={{ width: '16px', height: '16px', color: 'var(--color-text-tertiary)' }} />
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)'
                  }}>
                    Preview
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '200px',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden'
                }}>
                  <iframe
                    src={previewUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ border: 'none' }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              justifyContent: 'flex-end',
              marginTop: 'var(--space-4)'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: 'var(--color-bg-tertiary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-base)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValidUrl}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: isValidUrl ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  color: isValidUrl ? 'white' : 'var(--color-text-tertiary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  cursor: isValidUrl ? 'pointer' : 'not-allowed',
                  transition: 'all var(--transition-base)'
                }}
                onMouseEnter={(e) => {
                  if (isValidUrl) {
                    e.currentTarget.style.filter = 'brightness(0.9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isValidUrl) {
                    e.currentTarget.style.filter = 'none';
                  }
                }}
              >
                Add Video
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
