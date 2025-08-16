import React, { useRef, useEffect, useCallback } from 'react';
import { BullRoomMessage } from '../../types/bullRoom.types';
import { MessageItem } from './MessageItem';
import { EmptyState } from './EmptyState';
import { LoadMoreSkeleton } from './LoadMoreSkeleton';

/**
 * MessageList component for displaying a list of messages with infinite scroll
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
  // Infinite scroll props
  hasNextPage?: boolean;
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  scrollableTarget?: string;
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
  className = '',
  hasNextPage = false,
  fetchNextPage,
  isFetchingNextPage = false,
  scrollableTarget = 'scrollableDiv'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollHeight = useRef<number>(0);
  const lastScrollTop = useRef<number>(0);

  // Show empty state if no messages
  if (messages.length === 0) {
    return <EmptyState className={className} />;
  }

  // Create a comprehensive user map from all messages
  const userMap: Record<string, string> = {};
  messages.forEach(message => {
    if (message.user_id && message.username) {
      userMap[message.user_id] = message.username;
    }
    // Also include user data from the user object if available
    if (message.user?.id && message.user?.username) {
      userMap[message.user.id] = message.user.username;
    }
  });

  // For proper chat order: newest messages at bottom, oldest at top
  // Since messages come newest-first from query, we need to reverse them
  const displayMessages = [...messages].reverse();



  // Custom infinite scroll implementation
  const isLoadingMore = useRef(false);

  // Handle scroll position restoration after loading more messages
  useEffect(() => {
    const container = document.getElementById(scrollableTarget);
    if (container && lastScrollHeight.current > 0 && isLoadingMore.current) {
      const newScrollHeight = container.scrollHeight;
      const heightDifference = newScrollHeight - lastScrollHeight.current;
      
      // Maintain scroll position by adjusting for new content at the top
      if (heightDifference > 0) {
        container.scrollTop = lastScrollTop.current + heightDifference;
      }
      isLoadingMore.current = false;
    }
  }, [messages.length, scrollableTarget]);

  // Auto-scroll management
  const hasInitiallyScrolled = useRef(false);
  const previousMessageCount = useRef(0);
  
  // Check if user is near the bottom of the chat
  const isNearBottom = useCallback(() => {
    const container = document.getElementById(scrollableTarget);
    if (!container) return false;
    
    const threshold = 100; // pixels from bottom
    const isNear = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    return isNear;
  }, [scrollableTarget]);

  // Auto-scroll to bottom on initial load and smart scroll on new messages
  useEffect(() => {
    const container = document.getElementById(scrollableTarget);
    if (!container) return;
    
    // Initial scroll to bottom
    if (messages.length > 0 && !hasInitiallyScrolled.current) {
      container.scrollTop = container.scrollHeight;
      hasInitiallyScrolled.current = true;
      previousMessageCount.current = messages.length;
      return;
    }
    
    // Smart scroll on new messages
    if (messages.length > previousMessageCount.current) {
      // Only scroll if user was near the bottom before new messages arrived
      if (isNearBottom()) {
        // Small delay to ensure DOM is updated
        requestAnimationFrame(() => {
          container.scrollTop = container.scrollHeight;
        });
      }
      previousMessageCount.current = messages.length;
    }
  }, [messages.length, scrollableTarget, isNearBottom]);

  // Custom infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = document.getElementById(scrollableTarget);
    if (!container || !hasNextPage || isFetchingNextPage || isLoadingMore.current) {
      return;
    }

    // Check if we're near the top (within 100px)
    const isNearTop = container.scrollTop < 100;
    
    if (isNearTop) {
      // Store current scroll position
      lastScrollHeight.current = container.scrollHeight;
      lastScrollTop.current = container.scrollTop;
      isLoadingMore.current = true;
      
      // Trigger fetch
      fetchNextPage?.();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, scrollableTarget]);

  // Attach scroll listener
  useEffect(() => {
    const container = document.getElementById(scrollableTarget);
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll, scrollableTarget]);

  return (
    <div style={{ height: '100%' }}>
      {/* Loading skeleton at top when fetching more messages */}
      {isFetchingNextPage && <LoadMoreSkeleton />}
      
      {/* End indicator when no more messages to load */}
      {!hasNextPage && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: 'var(--space-4) 0'
        }}>
          <div style={{
            width: '32px',
            height: '2px',
            background: 'var(--color-bg-tertiary)',
            borderRadius: '1px',
            opacity: 0.5
          }} />
        </div>
      )}
      
      {/* Messages */}
      {/* Only show spacer if we're not loading more messages to avoid gap */}
      {!isFetchingNextPage && <div style={{ height: '76px' }} />}
      {displayMessages.map((message, index) => {
        const previousMessage = index > 0 ? displayMessages[index - 1] : undefined;
        
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
            userMap={userMap}
          />
        );
      })}
      

    </div>
  );
};
