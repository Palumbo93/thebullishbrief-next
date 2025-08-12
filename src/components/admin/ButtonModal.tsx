"use client";

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MousePointer, Settings, ExternalLink } from 'lucide-react';

interface ButtonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (buttonData: {
    text: string;
    href: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'base' | 'lg';
    target?: '_blank' | '_self';
    icon?: string;
    iconSide?: 'left' | 'right';
  }) => void;
}

export const ButtonModal: React.FC<ButtonModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [text, setText] = useState('');
  const [href, setHref] = useState('');
  const [variant, setVariant] = useState<'primary' | 'secondary' | 'ghost'>('primary');
  const [size, setSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [target, setTarget] = useState<'_blank' | '_self'>('_self');
  const [icon, setIcon] = useState('');
  const [iconSide, setIconSide] = useState<'left' | 'right'>('left');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling to parent forms
    if (!text.trim() || !href.trim()) return;

    onSubmit({
      text: text.trim(),
      href: href.trim(),
      variant,
      size,
      target,
      icon: icon.trim() || undefined,
      iconSide,
    });

    // Reset form
    setText('');
    setHref('');
    setVariant('primary');
    setSize('base');
    setTarget('_self');
    setIcon('');
    setIconSide('left');
    onClose();
  };

  const isValidForm = text.trim() !== '' && href.trim() !== '';

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
      zIndex: 'var(--z-modal)',
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
              <MousePointer style={{ width: '20px', height: '20px', color: 'white' }} />
            </div>
            <div>
              <h2 style={{
                fontSize: 'var(--text-xl)',
                fontWeight: 'var(--font-bold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-1)'
              }}>
                Add Button
              </h2>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-tertiary)'
              }}>
                Create an interactive button with custom styling
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
            {/* Button Text */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Button Text *
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Click me"
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
            </div>

            {/* Link URL */}
            <div>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-2)'
              }}>
                Link URL *
              </label>
              <input
                type="url"
                value={href}
                onChange={(e) => setHref(e.target.value)}
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
              />
            </div>

            {/* Style Options */}
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
                  Style Options
                </span>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)'
              }}>
                {/* Variant */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    Variant
                  </label>
                  <select
                    value={variant}
                    onChange={(e) => setVariant(e.target.value as 'primary' | 'secondary' | 'ghost')}
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
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                    <option value="ghost">Ghost</option>
                  </select>
                </div>

                {/* Size */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    Size
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value as 'sm' | 'base' | 'lg')}
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
                    <option value="sm">Small</option>
                    <option value="base">Medium</option>
                    <option value="lg">Large</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Link Options */}
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
                  Link Options
                </span>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 'var(--space-4)'
              }}>
                {/* Target */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    Open In
                  </label>
                  <select
                    value={target}
                    onChange={(e) => setTarget(e.target.value as '_blank' | '_self')}
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
                    <option value="_self">Same Window</option>
                    <option value="_blank">New Window</option>
                  </select>
                </div>

                {/* Icon */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    Icon (Optional)
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="arrow-right, download, etc."
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

              {/* Icon Side */}
              {icon && (
                <div style={{ marginTop: 'var(--space-3)' }}>
                  <label style={{
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-semibold)',
                    color: 'var(--color-text-primary)',
                    marginBottom: 'var(--space-2)'
                  }}>
                    Icon Position
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: 'var(--space-3)'
                  }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="iconSide"
                        value="left"
                        checked={iconSide === 'left'}
                        onChange={(e) => setIconSide(e.target.value as 'left' | 'right')}
                        style={{ margin: 0 }}
                      />
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-primary)'
                      }}>
                        Left
                      </span>
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-2)',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="iconSide"
                        value="right"
                        checked={iconSide === 'right'}
                        onChange={(e) => setIconSide(e.target.value as 'left' | 'right')}
                        style={{ margin: 0 }}
                      />
                      <span style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-primary)'
                      }}>
                        Right
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Preview */}
            {isValidForm && (
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
                  padding: 'var(--space-4)',
                  background: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-lg)',
                  textAlign: 'center'
                }}>
                  <a
                    href="#"
                    className={`btn btn-${variant} ${size !== 'base' ? `btn-${size}` : ''}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'var(--space-2)',
                      textDecoration: 'none',
                      pointerEvents: 'none'
                    }}
                  >
                    {icon && iconSide === 'left' && (
                      <span style={{ fontSize: 'var(--text-sm)' }}>🔗</span>
                    )}
                    <span>{text}</span>
                    {icon && iconSide === 'right' && (
                      <span style={{ fontSize: 'var(--text-sm)' }}>🔗</span>
                    )}
                  </a>
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
                disabled={!isValidForm}
                style={{
                  padding: 'var(--space-3) var(--space-6)',
                  background: isValidForm ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                  border: 'none',
                  borderRadius: 'var(--radius-lg)',
                  color: isValidForm ? 'white' : 'var(--color-text-tertiary)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  cursor: isValidForm ? 'pointer' : 'not-allowed',
                  transition: 'all var(--transition-base)'
                }}
                onMouseEnter={(e) => {
                  if (isValidForm) {
                    e.currentTarget.style.filter = 'brightness(0.9)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isValidForm) {
                    e.currentTarget.style.filter = 'none';
                  }
                }}
              >
                Add Button
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
