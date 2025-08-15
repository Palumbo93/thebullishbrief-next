import React from 'react';
import { X, Reply } from 'lucide-react';

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
  return (
    <div 
      className={`flex items-center gap-2 p-2 rounded-lg ${className}`}
      style={{
        backgroundColor: 'rgba(20, 20, 20, 0.3)',
        border: '1px solid rgba(31, 31, 31, 0.3)',
        marginBottom: 'var(--space-2)'
      }}
    >
      <Reply size={14} style={{ color: 'var(--color-text-muted, #6b7280)' }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium" style={{ color: 'var(--color-text-primary, #111827)' }}>
          Replying to {username}
        </div>
        <div 
          className="text-xs truncate" 
          style={{ color: 'var(--color-text-muted, #6b7280)' }}
        >
          {content}
        </div>
      </div>
      <button
        onClick={onCancel}
        className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        style={{ 
          color: 'var(--color-text-muted, #6b7280)',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        aria-label="Cancel reply"
      >
        <X size={12} />
      </button>
    </div>
  );
};
