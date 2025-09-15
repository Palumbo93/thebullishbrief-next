"use client";

import React, { useState } from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  author?: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  view_count: number;
  slug?: string;
}

interface ArticleDeleteModalProps {
  article: Article;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const ArticleDeleteModal: React.FC<ArticleDeleteModalProps> = ({ article, onClose, onDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await onDelete(article.id);
    } catch (error) {
      console.error('Error deleting article:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'var(--color-bg-card)',
      border: '0.5px solid var(--color-border-primary)',
      borderRadius: 'var(--radius-xl)',
      width: '100%',
      maxWidth: '500px',
      animation: 'modalEnter 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards'
    }}>
        {/* Header */}
        <div style={{
          padding: 'var(--space-6)',
          borderBottom: '0.5px solid var(--color-border-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--color-error)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle style={{ width: '16px', height: '16px', color: 'var(--color-text-inverse)' }} />
            </div>
            <h2 style={{
              fontSize: 'var(--text-xl)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)'
            }}>
              Delete Article
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost"
            style={{
              padding: 'var(--space-2)',
              fontSize: 'var(--text-sm)'
            }}
          >
            <X style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--space-6)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-4)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'var(--color-error-bg)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--color-error-border)'
            }}>
              <Trash2 style={{ width: '24px', height: '24px', color: 'var(--color-error)' }} />
            </div>
            <div>
              <h3 style={{
                fontSize: 'var(--text-lg)',
                fontWeight: 'var(--font-semibold)',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-1)'
              }}>
                Are you sure?
              </h3>
              <p style={{
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--text-sm)',
                lineHeight: 'var(--leading-relaxed)'
              }}>
                This action cannot be undone. The article will be permanently deleted.
              </p>
            </div>
          </div>

          {/* Article Info */}
          <div style={{
            background: 'var(--color-bg-tertiary)',
            border: '0.5px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-6)'
          }}>
            <h4 style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-2)'
            }}>
              {article.title}
            </h4>
            {article.subtitle && (
              <p style={{
                color: 'var(--color-text-tertiary)',
                fontSize: 'var(--text-sm)',
                marginBottom: 'var(--space-2)',
                lineHeight: 'var(--leading-relaxed)'
              }}>
                {article.subtitle}
              </p>
            )}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-4)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)'
            }}>
              <span>ID: {article.id}</span>
              <span>•</span>
              <span>Status: {article.status}</span>
              <span>•</span>
              <span>{article.view_count || 0} views</span>
            </div>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="btn"
              style={{
                fontSize: 'var(--text-sm)',
                background: 'var(--color-error)',
                color: 'var(--color-text-inverse)',
                border: 'none'
              }}
            >
              <Trash2 style={{ width: '16px', height: '16px' }} />
              <span>{loading ? 'Deleting...' : 'Delete Article'}</span>
            </button>
          </div>
        </div>
      </div>
  );
}; 