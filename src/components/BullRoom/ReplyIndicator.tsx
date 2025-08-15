import React from 'react';
import { Reply } from 'lucide-react';

/**
 * ReplyIndicator component for showing when a message is a reply
 */
export interface ReplyIndicatorProps {
  replyToUsername: string;
  replyToContent: string;
  className?: string;
}

export const ReplyIndicator: React.FC<ReplyIndicatorProps> = ({
  replyToUsername,
  replyToContent,
  className = ''
}) => {
  return (
    <div 
      className={`flex items-center gap-2 text-xs opacity-70 ${className}`}
      style={{
        color: 'var(--color-text-muted, #6b7280)',
        fontSize: 'var(--text-xs)',
        marginBottom: 'var(--space-1)'
      }}
    >
      <Reply size={12} style={{ color: 'var(--color-text-muted, #6b7280)' }} />
      <span style={{ color: 'var(--color-text-muted, #6b7280)' }}>
        {replyToUsername}
      </span>
      <span 
        className="truncate max-w-32" 
        style={{ color: 'var(--color-text-muted, #6b7280)' }}
      >
        {replyToContent}
      </span>
    </div>
  );
};
