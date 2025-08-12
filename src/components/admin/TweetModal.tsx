import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TweetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { embedCode: string }) => void;
}

export const TweetModal: React.FC<TweetModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [embedCode, setEmbedCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!embedCode.trim()) return;

    setIsSubmitting(true);

    onSubmit({
      embedCode: embedCode.trim(),
    });

    setEmbedCode('');
    setIsSubmitting(false);
    onClose();
  };

  const handleClose = () => {
    setEmbedCode('');
    onClose();
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
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 'var(--z-modal)',
        padding: 'var(--space-4)'
      }}
      onClick={handleClose}
    >
      <div
        style={{
          background: 'var(--color-bg-primary)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-6)',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid var(--color-border-primary)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: '600', color: 'var(--color-text-primary)' }}>
            Embed Tweet
          </h3>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-2)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label
              htmlFor="embed-code"
              style={{
                display: 'block',
                marginBottom: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
                color: 'var(--color-text-primary)',
              }}
            >
              Tweet Embed Code
            </label>
            <textarea
              id="embed-code"
              value={embedCode}
              onChange={(e) => setEmbedCode(e.target.value)}
              placeholder="Paste the Twitter embed code here..."
              required
                              style={{
                  width: '100%',
                  padding: 'var(--space-3)',
                  border: '1px solid var(--color-border-primary)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-base)',
                  background: 'var(--color-bg-secondary)',
                  color: 'var(--color-text-primary)',
                  boxSizing: 'border-box',
                  minHeight: '120px',
                  resize: 'vertical',
                }}
              />
              <p style={{
                marginTop: 'var(--space-2)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-tertiary)',
              }}>
                Paste the Twitter embed code from the "Embed Tweet" option on Twitter.
              </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                border: '1px solid var(--color-border-primary)',
                borderRadius: 'var(--radius-md)',
                background: 'transparent',
                color: 'var(--color-text-primary)',
                cursor: 'pointer',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!embedCode.trim() || isSubmitting}
              style={{
                padding: 'var(--space-3) var(--space-4)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: embedCode.trim() && !isSubmitting ? 'var(--color-primary)' : 'var(--color-border-primary)',
                color: 'white',
                cursor: embedCode.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                fontSize: 'var(--text-sm)',
                fontWeight: '500',
              }}
            >
              {isSubmitting ? 'Adding...' : 'Add Tweet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
