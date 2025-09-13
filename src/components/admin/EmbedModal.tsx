"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, FileCode, AlertTriangle } from 'lucide-react';

interface EmbedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (embedData: {
    content: string;
    title?: string;
    width?: string;
    height?: string;
    type?: 'iframe' | 'script' | 'html';
  }) => void;
  zIndex?: number;
  initialContent?: string;
  initialTitle?: string;
  initialWidth?: string;
  initialHeight?: string;
  initialType?: 'iframe' | 'script' | 'html';
}

export const EmbedModal: React.FC<EmbedModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  zIndex,
  initialContent,
  initialTitle,
  initialWidth,
  initialHeight,
  initialType 
}) => {
  const [embedContent, setEmbedContent] = useState('');
  const [title, setTitle] = useState('');
  const [width, setWidth] = useState('100%');
  const [height, setHeight] = useState('400px');
  const [embedType, setEmbedType] = useState<'iframe' | 'script' | 'html'>('html');

  // Initialize form with initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      setEmbedContent(initialContent || '');
      setTitle(initialTitle || '');
      setWidth(initialWidth || '100%');
      setHeight(initialHeight || '400px');
      setEmbedType(initialType || 'html');
    } else {
      // Reset form when modal closes
      setEmbedContent('');
      setTitle('');
      setWidth('100%');
      setHeight('400px');
      setEmbedType('html');
    }
  }, [isOpen, initialContent, initialTitle, initialWidth, initialHeight, initialType]);

  // Auto-detect embed type based on content
  useEffect(() => {
    if (embedContent.trim()) {
      if (embedContent.includes('<iframe')) {
        setEmbedType('iframe');
      } else if (embedContent.includes('<script')) {
        setEmbedType('script');
      } else {
        setEmbedType('html');
      }
    }
  }, [embedContent]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!embedContent.trim()) return;

    onSubmit({
      content: embedContent.trim(),
      title: title.trim() || undefined,
      width,
      height,
      type: embedType,
    });

    // Reset form
    setEmbedContent('');
    setTitle('');
    setWidth('100%');
    setHeight('400px');
    setEmbedType('html');
    onClose();
  };

  const isValidContent = embedContent.trim() !== '';

  // Security warning for script content
  const showSecurityWarning = embedType === 'script' || embedContent.includes('<script');

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
        maxWidth: '800px',
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
              <FileCode style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-1)'
              }}>
                Add Embed
              </h2>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-tertiary)'
              }}>
                Embed iframes, scripts, or custom HTML content
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
            {/* Security Warning */}
            {showSecurityWarning && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'rgba(255, 193, 7, 0.1)',
                border: '1px solid rgba(255, 193, 7, 0.3)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-2)'
              }}>
                <AlertTriangle style={{ 
                  width: '16px', 
                  height: '16px', 
                  color: 'var(--color-warning)',
                  marginTop: '2px',
                  flexShrink: 0
                }} />
                <div>
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-warning)',
                    marginBottom: 'var(--space-1)'
                  }}>
                    Security Notice
                  </p>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-secondary)',
                    lineHeight: '1.4'
                  }}>
                    Script content can execute JavaScript. Only embed content from trusted sources. 
                    This content will be rendered as-is and may affect page security.
                  </p>
                </div>
              </div>
            )}

            {/* Embed Content */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Embed Code *
              </label>
              <textarea
                value={embedContent}
                onChange={(e) => setEmbedContent(e.target.value)}
                placeholder="Paste your embed code here (iframe, script, or HTML)..."
                required
                rows={8}
                style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  background: 'var(--color-bg-tertiary)',
                  border: '0.5px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  color: 'var(--color-text-primary)',
                  fontSize: 'var(--text-sm)',
                  fontFamily: 'monospace',
                  lineHeight: '1.4',
                  resize: 'vertical',
                  transition: 'all var(--transition-base)'
                }}
              />
              <p style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                marginTop: 'var(--space-1)'
              }}>
                Supports iframes, scripts, and custom HTML. Type will be auto-detected.
              </p>
            </div>

            {/* Embed Type */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Embed Type
              </label>
              <select
                value={embedType}
                onChange={(e) => setEmbedType(e.target.value as 'iframe' | 'script' | 'html')}
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
              >
                <option value="html">HTML Content</option>
                <option value="iframe">Iframe Embed</option>
                <option value="script">Script Embed</option>
              </select>
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
                placeholder="Embed title for accessibility"
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
                  placeholder="400px"
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
                disabled={!isValidContent}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: isValidContent ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  color: isValidContent ? 'white' : 'var(--color-text-tertiary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  cursor: isValidContent ? 'pointer' : 'not-allowed',
                  transition: 'all var(--transition-base)'
                }}
                onMouseEnter={(e) => {
                  if (isValidContent) {
                    e.currentTarget.style.filter = 'brightness(0.9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isValidContent) {
                    e.currentTarget.style.filter = 'none';
                  }
                }}
              >
                Add Embed
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
