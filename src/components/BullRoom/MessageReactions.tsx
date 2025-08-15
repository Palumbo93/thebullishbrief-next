import React, { useState, useRef } from 'react';
import { THEMED_EMOJI_LIST } from '../../types/bullRoom.types';
import { ReactionTooltip } from './ReactionTooltip';

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
  variant?: 'default' | 'compact';
  className?: string;
  userMap?: Record<string, string>; // userId -> username mapping
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
  variant = 'default',
  className = '',
  userMap = {}
}) => {
  const [tooltipState, setTooltipState] = useState<{
    isVisible: boolean;
    emoji: string;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    emoji: '',
    position: { x: 0, y: 0 }
  });

  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoveredButtonRef = useRef<HTMLButtonElement | null>(null);
  const handleReactionClick = (emoji: string) => {
    // Don't allow reactions if no current user
    if (!currentUserId) return;
    
    // Allow reactions to own messages - this is common in modern chat apps
    onAddReaction(messageId, emoji);
  };

  const handleReactionMouseEnter = (emoji: string, event: React.MouseEvent) => {
    const userIds = reactions[emoji] || [];
    if (userIds.length === 0) return;

    // Store reference to the button
    hoveredButtonRef.current = event.currentTarget as HTMLButtonElement;

    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    // Set timeout for tooltip to appear
    tooltipTimeoutRef.current = setTimeout(() => {
      const button = hoveredButtonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      setTooltipState({
        isVisible: true,
        emoji,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top - 8
        }
      });
    }, 300);
  };

  const handleReactionMouseLeave = () => {
    // Clear timeout if mouse leaves before tooltip appears
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    // Clear button reference
    hoveredButtonRef.current = null;
    
    // Hide tooltip after a short delay to allow moving to tooltip
    setTimeout(() => {
      setTooltipState(prev => ({ ...prev, isVisible: false }));
    }, 100);
  };

  const handleTooltipClose = () => {
    setTooltipState(prev => ({ ...prev, isVisible: false }));
  };

  const getReactionCount = (emoji: string) => {
    return reactions[emoji]?.length || 0;
  };

  const hasUserReacted = (emoji: string) => {
    return reactions[emoji]?.includes(currentUserId || '') || false;
  };

  // Styles based on variant
  const containerStyles = variant === 'compact' ? {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-1)'
  } : {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)'
  };

  const buttonStyles = variant === 'compact' ? {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: 'calc(var(--space-1) * 0.8) calc(var(--space-2) * 0.8)',
    borderRadius: 'var(--radius-lg)',
    fontSize: 'calc(var(--text-sm) * 0.8)',
    border: '1px solid var(--color-border-subtle)',
    background: 'var(--color-bg-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    // minHeight: '24px',
    // minWidth: '24px',
    position: 'relative' as const,
    overflow: 'hidden'
  } : {
    display: 'flex',
    alignItems: 'center',
    gap: '0px',
    justifyContent: 'center',
    padding: 'calc(var(--space-1) * 0.8) calc(var(--space-2) * 0.8)',
    borderRadius: 'var(--radius-xl)',
    fontSize: 'var(--text-sm)',
    border: '1px solid var(--color-border-subtle)',
    background: 'var(--color-bg-secondary)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    // minHeight: '32px',
    // minWidth: '32px',
    position: 'relative' as const,
    overflow: 'hidden'
  };

  const emojiStyles = variant === 'compact' ? {
    fontSize: 'calc(var(--text-base) * 0.8)'
  } : {
    fontSize: 'var(--text-sm)',
  };

  return (
    <div style={containerStyles} className={className}>
      {THEMED_EMOJI_LIST.map((emoji) => {
        const count = getReactionCount(emoji);
        const hasReacted = hasUserReacted(emoji);
        
        // Only show reactions that have a count > 0 (unless showAllEmojis is true)
        if (!showAllEmojis && count === 0) return null;
        
        return (
          <button
            key={emoji}
            onClick={() => handleReactionClick(emoji)}
            style={{
              ...buttonStyles,
              color: hasReacted ? 'var(--color-brand-primary)' : 'var(--color-text-muted)',
              background: hasReacted ? 'var(--color-success-bg)' : 'var(--color-bg-secondary)',
              border: hasReacted ? '1px solid var(--color-success-border)' : '1px solid var(--color-border-subtle)',
              transform: hasReacted ? 'scale(1.05)' : 'scale(1)',
              boxShadow: hasReacted ? '0 2px 8px rgba(var(--color-success-rgb), 0.2)' : 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = hasReacted 
                ? 'var(--color-success-bg-hover)' 
                : 'var(--color-bg-tertiary)';
              e.currentTarget.style.transform = 'scale(1.1)';
              handleReactionMouseEnter(emoji, e);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = hasReacted 
                ? 'var(--color-success-bg)' 
                : 'var(--color-bg-secondary)';
              e.currentTarget.style.transform = hasReacted ? 'scale(1.05)' : 'scale(1)';
              handleReactionMouseLeave();
            }}
          >
            <span style={emojiStyles}>{emoji}</span>
            {showCounts && count > 0 && (
              <span style={{ 
                fontSize: 'calc(var(--text-xs) * 0.8)', 
                fontWeight: 'var(--font-semibold)',
                marginLeft: 'var(--space-1)',
                transition: 'all 0.2s ease',
                opacity: count > 0 ? 1 : 0.7
              }}>
                {count}
              </span>
            )}
          </button>
        );
      })}
      
      {/* Reaction Tooltip */}
      <ReactionTooltip
        emoji={tooltipState.emoji}
        userIds={reactions[tooltipState.emoji] || []}
        userMap={userMap}
        isVisible={tooltipState.isVisible}
        position={tooltipState.position}
        onClose={handleTooltipClose}
      />
    </div>
  );
}; 