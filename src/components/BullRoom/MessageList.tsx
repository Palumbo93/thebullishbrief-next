import React from 'react';
import { BullRoomMessage } from '../../types/bullRoom.types';
import { MessageItem } from './MessageItem';
import { EmptyState } from './EmptyState';

/**
 * MessageList component for displaying a list of messages
 */
export interface MessageListProps {
  messages: BullRoomMessage[];
  userId?: string;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string, username: string, content: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  editingMessageId?: string | null;
  onStartEdit?: (messageId: string) => void;
  onStopEdit?: () => void;
  onSaveEdit?: (messageId: string, newContent: string) => Promise<void>;
  className?: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
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
  // Show empty state if no messages
  if (messages.length === 0) {
    return <EmptyState className={className} />;
  }

  // Reverse messages to show oldest first (proper chat order)
  const reversedMessages = [...messages].reverse();

  return (
    <div className={className}>
      {reversedMessages.map((message, index) => {
        const previousMessage = index > 0 ? reversedMessages[index - 1] : undefined;
        
        return (
          <MessageItem
            key={message.id}
            message={message}
            previousMessage={previousMessage}
            userId={userId}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            editingMessageId={editingMessageId}
            onStartEdit={onStartEdit}
            onStopEdit={onStopEdit}
            onSaveEdit={onSaveEdit}
          />
        );
      })}
    </div>
  );
};
