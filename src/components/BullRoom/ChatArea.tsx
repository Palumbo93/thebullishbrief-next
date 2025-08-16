import React from 'react';
import { BullRoomMessage } from '../../types/bullRoom.types';
import { MessageList } from './MessageList';
import { useIsMobile } from '../../hooks/useIsMobile';

/**
 * ChatArea displays the list of messages for the current room with infinite scroll.
 * @param messages - Array of messages to display.
 * @param userId - The current user's ID for message alignment.
 */
export interface ChatAreaProps {
  messages: BullRoomMessage[];
  userId: string | undefined;
  roomId?: string;
  onAddReaction?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onReply?: (messageId: string, username: string, content: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  editingMessageId?: string | null;
  onStartEdit?: (messageId: string) => void;
  onStopEdit?: () => void;
  onSaveEdit?: (messageId: string, newContent: string) => Promise<void>;
  // Infinite scroll props
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  messages, 
  userId, 
  roomId,
  onAddReaction, 
  onRemoveReaction,
  onReply,
  onEdit,
  onDelete,
  editingMessageId,
  onStartEdit,
  onStopEdit,
  onSaveEdit,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage
}) => {
  const isMobile = useIsMobile();
  const scrollableTargetId = 'chat-area-scrollable';

  return (
    <div 
      id={scrollableTargetId}
      style={{
        // Use absolute positioning for both mobile and desktop
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0, // Will be dynamically adjusted based on MessageInput height
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: isMobile ? 'var(--space-4) 0' : 'var(--space-6) 0',
        paddingBottom: isMobile ? 'var(--space-4)' : 'var(--space-4)',
      }} 
      className="hide-scrollbar"
    >
      <MessageList
        messages={messages}
        userId={userId}
        roomId={roomId}
        onAddReaction={onAddReaction}
        onRemoveReaction={onRemoveReaction}
        onReply={onReply}
        onEdit={onEdit}
        onDelete={onDelete}
        editingMessageId={editingMessageId}
        onStartEdit={onStartEdit}
        onStopEdit={onStopEdit}
        onSaveEdit={onSaveEdit}
        hasNextPage={hasNextPage}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        scrollableTarget={scrollableTargetId}
      />
    </div>
  );
}; 



