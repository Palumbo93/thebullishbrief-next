"use client";

import React, { useState } from 'react';

export interface DeleteModalProps<T> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  item: T | null;
  onDelete: (id: string) => Promise<void>;
  getItemId: (item: T) => string;
  getItemName: (item: T) => string;
}

export function DeleteModal<T>({
  isOpen,
  onClose,
  title,
  message,
  item,
  onDelete,
  getItemId,
  getItemName
}: DeleteModalProps<T>) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!item) return;
    
    setIsDeleting(true);
    try {
      await onDelete(getItemId(item));
      onClose();
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen || !item) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}
    >
      <div style={{
        background: 'var(--color-bg-card)',
        padding: 'var(--space-6)',
        borderRadius: 'var(--radius-xl)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h3 style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-semibold)',
          marginBottom: 'var(--space-4)',
          color: 'var(--color-text-primary)'
        }}>
          {title}
        </h3>
        <p style={{ 
          color: 'var(--color-text-tertiary)',
          marginBottom: 'var(--space-4)'
        }}>
          {message.replace('{name}', getItemName(item))}
        </p>
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="btn btn-secondary"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn btn-error"
            style={{ fontSize: 'var(--text-sm)' }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
} 