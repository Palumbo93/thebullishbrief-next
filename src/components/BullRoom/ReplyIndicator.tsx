import React from 'react';
import { Reply } from 'lucide-react';

/**
 * ReplyIndicator component for showing when a message is a reply
 */
export interface ReplyIndicatorProps {
  replyToUsername: string;
  replyToContent: string;
  onReplyClick?: () => void;
  className?: string;
}

export const ReplyIndicator: React.FC<ReplyIndicatorProps> = ({
  replyToUsername,
  replyToContent,
  onReplyClick,
  className = ''
}) => {
  return (
    <div 
      className={`flex items-center gap-2 text-xs ${className}`}
      style={{
        color: 'var(--color-text-muted)',
        fontSize: 'var(--text-xs)',
        marginBottom: 'var(--space-2)',
        padding: 'var(--space-2) var(--space-3)',
        background: 'rgba(20, 20, 20, 0.2)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(31, 31, 31, 0.2)',
        cursor: onReplyClick ? 'pointer' : 'default',
        transition: 'all var(--transition-base)',
        position: 'relative'
      }}
      onClick={onReplyClick}
      onMouseEnter={(e) => {
        if (onReplyClick) {
          e.currentTarget.style.background = 'rgba(20, 20, 20, 0.3)';
          e.currentTarget.style.borderColor = 'rgba(31, 31, 31, 0.4)';
        }
      }}
      onMouseLeave={(e) => {
        if (onReplyClick) {
          e.currentTarget.style.background = 'rgba(20, 20, 20, 0.2)';
          e.currentTarget.style.borderColor = 'rgba(31, 31, 31, 0.2)';
        }
      }}
    >
      {/* Reply line indicator */}
      <div 
        style={{
          position: 'absolute',
          left: '0',
          top: '0',
          bottom: '0',
          width: '3px',
          background: 'var(--color-brand-primary)',
          borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)'
        }}
      />
      
      <Reply 
        size={12} 
        style={{ 
          color: 'var(--color-text-muted)',
          marginLeft: 'var(--space-1)'
        }} 
      />
      
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ 
          color: 'var(--color-text-secondary)',
          fontWeight: 'var(--font-medium)'
        }}>
          {replyToUsername}
        </span>
        <span 
          style={{ 
            color: 'var(--color-text-muted)',
            marginLeft: 'var(--space-1)'
          }}
        >
          {replyToContent.length > 50 ? `${replyToContent.substring(0, 50)}...` : replyToContent}
        </span>
      </div>
    </div>
  );
};
