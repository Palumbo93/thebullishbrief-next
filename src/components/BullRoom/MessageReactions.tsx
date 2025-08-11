import React from 'react';
import { THEMED_EMOJI_LIST } from '../../types/bullRoom.types';

/**
 * MessageReactions displays emoji reactions on messages
 */
export interface MessageReactionsProps {
  reactions: Record<string, string[]>;
  messageId: string;
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  currentUserId?: string;
  messageOwnerId?: string;
  showAllEmojis?: boolean;
  showCounts?: boolean;
}

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  messageId,
  onAddReaction,
  onRemoveReaction,
  currentUserId,
  messageOwnerId,
  showAllEmojis = false,
  showCounts = true,
}) => {
  const handleReactionClick = (emoji: string) => {
    // Don't allow reactions if no current user or if trying to react to own message
    if (!currentUserId || currentUserId === messageOwnerId) return;
    
    // Use addReaction for toggle behavior (it now handles both add and remove)
    onAddReaction(messageId, emoji);
  };

  const getReactionCount = (emoji: string) => {
    return reactions[emoji]?.length || 0;
  };

  const hasUserReacted = (emoji: string) => {
    return reactions[emoji]?.includes(currentUserId || '') || false;
  };

  return (
    <div className="flex items-center space-x-2">
      {THEMED_EMOJI_LIST.map((emoji) => {
        const count = getReactionCount(emoji);
        const hasReacted = hasUserReacted(emoji);
        
        // Only show reactions that have a count > 0 (unless showAllEmojis is true)
        if (!showAllEmojis && count === 0) return null;
        
        return (
          <button
            key={emoji}
            onClick={() => handleReactionClick(emoji)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-sm transition-all duration-200 hover:scale-105 ${
              hasReacted
                ? 'bg-brand/20 text-brand border border-brand/40'
                : 'bg-tertiary/20 text-muted hover:bg-tertiary/30 border border-border-primary/20'
            }`}
          >
            <span className="text-lg">{emoji}</span>
            {showCounts && count > 0 && <span className="font-semibold text-xs">{count}</span>}
          </button>
        );
      })}
    </div>
  );
}; 