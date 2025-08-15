import React from 'react';
import { BullRoomMessage } from '../../types/bullRoom.types';
import { MessageReactions } from './MessageReactions';
import { isOwnMessage } from './utils/messageUtils';

/**
 * MessageActions component for hover action buttons
 */
export interface MessageActionsProps {
  message: BullRoomMessage;
  userId?: string;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string, username: string, content: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  className?: string;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  userId,
  onAddReaction,
  onRemoveReaction,
  onReply,
  onEdit,
  onDelete,
  className = ''
}) => {
  const isOwn = isOwnMessage(message, userId);

  if (isOwn) {
    // Own message actions: Reply, Edit, Delete
    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          background: 'var(--color-bg-secondary)',
          border: '1px solid rgba(31, 31, 31, 0.3)',
          borderRadius: 'var(--radius-full)',
          padding: 'var(--space-2) var(--space-4)',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
        }}
        className={className}
      >
        <button 
          onClick={() => onReply?.(message.id, message.username || 'Anonymous', message.content || '')}
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-md)',
            transition: 'color var(--transition-base)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          Reply
        </button>
        <button 
          onClick={() => onEdit?.(message.id, message.content)}
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-md)',
            transition: 'color var(--transition-base)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-muted)';
          }}
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete?.(message.id)}
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-error)',
            padding: 'var(--space-1) var(--space-2)',
            borderRadius: 'var(--radius-md)',
            transition: 'color var(--transition-base)',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-error)';
          }}
        >
          Delete
        </button>
      </div>
    );
  }

  // Others' message actions: Reactions and Reply
  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        background: 'var(--color-bg-secondary)',
        border: '1px solid rgba(31, 31, 31, 0.3)',
        borderRadius: 'var(--radius-full)',
        padding: 'var(--space-2) var(--space-4)',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}
      className={className}
    >
      <button 
        onClick={() => onReply?.(message.id, message.username || 'Anonymous', message.content || '')}
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          padding: 'var(--space-1) var(--space-2)',
          borderRadius: 'var(--radius-md)',
          transition: 'color var(--transition-base)',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--color-text-muted)';
        }}
      >
        Reply
      </button>
      {onAddReaction && onRemoveReaction && (
        <MessageReactions
          reactions={message.reactions as Record<string, string[]>}
          messageId={message.id}
          onAddReaction={onAddReaction}
          onRemoveReaction={onRemoveReaction}
          currentUserId={userId}
          messageOwnerId={message.user_id}
          showAllEmojis={true}
          showCounts={false}
        />
      )}
    </div>
  );
};
