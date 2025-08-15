import React, { useState, useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';

/**
 * InlineMessageEditor component for editing messages inline
 */
export interface InlineMessageEditorProps {
  messageId: string;
  initialContent: string;
  onSave: (messageId: string, newContent: string) => void;
  onCancel: () => void;
  maxLength?: number;
  className?: string;
}

export const InlineMessageEditor: React.FC<InlineMessageEditorProps> = ({
  messageId,
  initialContent,
  onSave,
  onCancel,
  maxLength = 2000,
  className = ''
}) => {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus and select content on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [content]);

  const handleSave = async () => {
    if (!content.trim() || content === initialContent) {
      onCancel();
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(messageId, content.trim());
    } catch (error) {
      console.error('Failed to save message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (content !== initialContent) {
      // Ask for confirmation if content has changed
      if (window.confirm('Discard changes?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const canSave = content.trim() && content !== initialContent;

  return (
    <div 
      style={{
        position: 'relative',
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border-primary)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-3)',
        marginTop: 'var(--space-2)'
      }}
      className={className}
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Edit your message..."
        style={{
          width: '100%',
          minHeight: '60px',
          maxHeight: '200px',
          padding: 'var(--space-2)',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontSize: 'var(--text-input)',
          lineHeight: 'var(--leading-relaxed)',
          color: 'var(--color-text-primary)',
          fontFamily: 'inherit'
        }}
        disabled={isSubmitting}
      />
      
      {/* Action buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 'var(--space-2)',
        gap: 'var(--space-2)'
      }}>
        <button
          onClick={handleCancel}
          disabled={isSubmitting}
          style={{
            padding: 'var(--space-2)',
            background: 'transparent',
            border: '1px solid var(--color-border-primary)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            fontSize: 'var(--text-sm)',
            transition: 'all var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-tertiary)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          <X style={{ width: '14px', height: '14px' }} />
          Cancel
        </button>
        
        <button
          onClick={handleSave}
          disabled={!canSave || isSubmitting}
          style={{
            padding: 'var(--space-2) var(--space-3)',
            background: canSave ? 'var(--color-brand-primary)' : 'var(--color-bg-tertiary)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: canSave ? '#000000' : 'var(--color-text-muted)',
            cursor: canSave ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-medium)',
            transition: 'all var(--transition-base)'
          }}
          onMouseEnter={(e) => {
            if (canSave) {
              e.currentTarget.style.background = '#f5f5f5';
              e.currentTarget.style.transform = 'scale(1.02)';
            }
          }}
          onMouseLeave={(e) => {
            if (canSave) {
              e.currentTarget.style.background = 'var(--color-brand-primary)';
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
        >
          <Check style={{ width: '14px', height: '14px' }} />
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
};
