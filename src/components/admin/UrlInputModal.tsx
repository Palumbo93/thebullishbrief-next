"use client";

import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface UrlInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, displayText: string) => void;
  initialUrl?: string;
  initialDisplayText?: string;
  zIndex?: number;
}

export const UrlInputModal: React.FC<UrlInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialUrl = '',
  initialDisplayText = '',
  zIndex
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [displayText, setDisplayText] = useState(initialDisplayText);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setDisplayText(initialDisplayText);
      setError('');
    }
  }, [isOpen, initialUrl, initialDisplayText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setError('URL must start with http:// or https://');
      return;
    }

    try {
      onSubmit(url.trim(), displayText.trim() || url.trim());
      onClose();
    } catch (error) {
      console.error('Error submitting URL:', error);
      setError('Failed to insert link');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent clicks on the modal backdrop from bubbling up to parent forms
    e.stopPropagation();
    e.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: zIndex || 'var(--z-modal)',
        padding: 'var(--space-4)'
      }}
      onClick={handleModalClick}
    >
      <div style={{
        background: 'var(--color-bg-primary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-border-primary)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'var(--space-4)',
          borderBottom: '1px solid var(--color-border-primary)',
          background: 'var(--color-bg-secondary)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}>
            <LinkIcon style={{
              width: '20px',
              height: '20px',
              color: 'var(--color-primary)'
            }} />
            <h3 style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              margin: 0
            }}>
              Insert Link
            </h3>
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all var(--transition-base)'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Content */}
        <form 
          onSubmit={handleSubmit} 
          style={{ padding: 'var(--space-4)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {/* URL Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                URL *
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
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
                onKeyDown={handleKeyDown}
              />
            </div>

            {/* Display Text Input */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Display Text
              </label>
              <input
                type="text"
                value={displayText}
                onChange={(e) => setDisplayText(e.target.value)}
                placeholder="Link text (optional)"
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
                onKeyDown={handleKeyDown}
              />
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-tertiary)',
                marginTop: 'var(--space-1)'
              }}>
                Leave empty to use the URL as display text
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)'
              }}>
                {error}
              </div>
            )}

            {/* Preview */}
            {url && (
              <div style={{
                padding: 'var(--space-3)',
                background: 'var(--color-bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border-primary)'
              }}>
                <div style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--color-text-primary)',
                  marginBottom: 'var(--space-2)'
                }}>
                  Preview:
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--color-primary)',
                    textDecoration: 'underline',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    fontSize: 'var(--text-sm)'
                  }}
                >
                  {displayText || url}
                  <ExternalLink style={{ width: '14px', height: '14px' }} />
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-3)',
            justifyContent: 'flex-end',
            marginTop: 'var(--space-6)',
            paddingTop: 'var(--space-4)',
            borderTop: '1px solid var(--color-border-primary)'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'transparent',
                border: '1px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-lg)',
                color: 'var(--color-text-primary)',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--color-primary)',
                border: 'none',
                borderRadius: 'var(--radius-lg)',
                color: 'white',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-medium)',
                cursor: 'pointer',
                transition: 'all var(--transition-base)'
              }}
            >
              Insert Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 