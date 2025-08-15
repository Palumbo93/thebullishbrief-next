import React from 'react';
import { Reply, Edit, Trash2 } from 'lucide-react';
import { BullRoomMessage } from '../../types/bullRoom.types';
import { MessageReactions } from './MessageReactions';
import { ActionButton } from './ActionButton';
import { isOwnMessage } from './utils/messageUtils';
import { useIsMobile } from '../../hooks/useIsMobile';

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
  userMap?: Record<string, string>; // userId -> username mapping for all users in the room
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  message,
  userId,
  onAddReaction,
  onRemoveReaction,
  onReply,
  onEdit,
  onDelete,
  className = '',
  userMap = {}
}) => {
  const isOwn = isOwnMessage(message, userId);
  const isMobile = useIsMobile();

  // Container styles with mobile optimization
  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 'var(--space-1)' : 'var(--space-2)',
    background: 'var(--color-bg-secondary)',
    border: '1px solid var(--color-border-primary)',
    borderRadius: 'var(--radius-xl)',
    padding: isMobile ? 'var(--space-3) var(--space-4)' : 'var(--space-1) var(--space-1)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    backdropFilter: 'blur(8px)',
    transition: 'all var(--transition-base)'
  };

  return (
    <div style={containerStyles} className={className}>
      {/* Reply button - always available */}
      <ActionButton
        icon={Reply}
        label="Reply"
        variant="secondary"
        onClick={() => onReply?.(message.id, message.username || 'Anonymous', message.content || '')}
      />
      
      {isOwn ? (
        // Own message actions
        <>
          <ActionButton
            icon={Edit}
            label="Edit"
            variant="secondary"
            onClick={() => onEdit?.(message.id, message.content)}
          />
          <ActionButton
            icon={Trash2}
            label="Delete"
            variant="danger"
            onClick={() => onDelete?.(message.id)}
          />
        </>
      ) : (
        // Others' message actions
        onAddReaction && onRemoveReaction && (
          <MessageReactions
            reactions={message.reactions as Record<string, string[]>}
            messageId={message.id}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            currentUserId={userId}
            messageOwnerId={message.user_id}
            showAllEmojis={true}
            showCounts={false}
            variant="compact"
            userMap={userMap}
          />
        )
      )}
    </div>
  );
};
