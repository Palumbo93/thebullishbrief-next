import React from 'react';
import { X, Reply } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * ReplyPreview component for showing which message is being replied to
 */
export interface ReplyPreviewProps {
  username: string;
  content: string;
  onCancel: () => void;
  className?: string;
}

export const ReplyPreview: React.FC<ReplyPreviewProps> = ({
  username,
  content,
  onCancel,
  className = ''
}) => {
  const { theme } = useTheme();

  return (
    <div 
      className={`flex items-center justify-between gap-2 p-3 rounded-lg ${className}`}
      style={{
        borderTop: '0.5px solid var(--color-border-primary)',
        marginBottom: 'var(--space-3)',
        position: 'relative',
        width: '100%',
        padding: 'var(--space-2) var(--space-6)',
        borderRadius: '0',
        margin: '0'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)'
      }}>
      <Reply 
        size={14} 
        style={{ 
          color: 'var(--color-text-muted)',
          marginLeft: 'var(--space-1)'
        }} 
      />
      
      <div className="flex-1 min-w-0">
        <div 
          className="text-xs font-medium" 
          style={{ 
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--space-1)'
          }}
        >
          Replying to {username}
        </div>
        <div 
          className="text-xs" 
          style={{ 
            color: 'var(--color-text-muted)',
            lineHeight: 'var(--leading-snug)'
          }}
        >
          {content.length > 60 ? `${content.substring(0, 60)}...` : content}
        </div>
      </div>
      </div>
      <button
        onClick={onCancel}
        className="p-1 rounded-full transition-colors"
        style={{ 
          color: 'var(--color-text-muted)',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-text-secondary)';
          e.currentTarget.style.background = 'var(--color-bg-card-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
        aria-label="Cancel reply"
      >
        <X size={12} />
      </button>
    </div>
  );
};
