import React from 'react';
import { BullRoomMessage } from '../../types/bullRoom.types';
import { MessageHeader } from './MessageHeader';
import { MessageContent } from './MessageContent';
import { MessageActions } from './MessageActions';
import { MessageReactions } from './MessageReactions';
import { InlineMessageEditor } from './InlineMessageEditor';
import { ReplyIndicator } from './ReplyIndicator';
import { shouldShowUsername, isOwnMessage, hasReactions } from './utils/messageUtils';

/**
 * MessageItem component for individual message display
 */
export interface MessageItemProps {
  message: BullRoomMessage;
  previousMessage?: BullRoomMessage;
  userId?: string;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string, username: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  editingMessageId?: string | null;
  onStartEdit?: (messageId: string) => void;
  onStopEdit?: () => void;
  onSaveEdit?: (messageId: string, newContent: string) => Promise<void>;
  className?: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  previousMessage,
  userId,
  onAddReaction,
  onRemoveReaction,
  onReply,
  onEdit,
  onDelete,
  editingMessageId,
  onStartEdit,
  onStopEdit,
  onSaveEdit,
  className = ''
}) => {
  const [hovered, setHovered] = React.useState(false);
  const showUsername = shouldShowUsername(message, previousMessage);
  const isOwn = isOwnMessage(message, userId);
  const isEditing = editingMessageId === message.id;

  return (
    <div 
      style={{
        position: 'relative',
        padding: 'var(--space-2) var(--space-6)',
        transition: 'all var(--transition-base)',
        cursor: 'pointer'
      }}
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Message Header */}
      <MessageHeader 
        message={message}
        showUsername={showUsername}
      />
      
      {/* Reply Indicator - subtle and integrated */}
      {message.reply_to_id && message.reply_to && (
        <ReplyIndicator
          replyToUsername={message.reply_to.username || 'Anonymous'}
          replyToContent={message.reply_to.content || ''}
        />
      )}
      
      {/* Message Content or Inline Editor */}
      <div style={{ maxWidth: '80%' }}>
        {isEditing ? (
          <InlineMessageEditor
            messageId={message.id}
            initialContent={message.content}
            onSave={onSaveEdit!}
            onCancel={onStopEdit!}
            maxLength={2000}
          />
        ) : (
          <MessageContent message={message} />
        )}
      </div>
      
      {/* Reactions under message - always visible if they exist */}
      {onAddReaction && onRemoveReaction && hasReactions(message) && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          <MessageReactions
            reactions={message.reactions as Record<string, string[]>}
            messageId={message.id}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            currentUserId={userId}
            messageOwnerId={message.user_id}
            showAllEmojis={false}
            showCounts={true}
          />
        </div>
      )}
      
      {/* Hover Actions - only show when not editing */}
      {hovered && !isEditing && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          right: 0,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 200ms',
          pointerEvents: hovered ? 'auto' : 'none'
        }}>
          <MessageActions
            message={message}
            userId={userId}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            onReply={onReply}
            onEdit={onStartEdit}
            onDelete={onDelete}
          />
        </div>
      )}
    </div>
  );
};
