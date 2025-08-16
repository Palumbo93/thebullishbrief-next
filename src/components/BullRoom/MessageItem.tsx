import React from 'react';
import { BullRoomMessage } from '../../types/bullRoom.types';
import { MessageHeader } from './MessageHeader';
import { MessageContent } from './MessageContent';
import { MessageActions } from './MessageActions';
import { MessageReactions } from './MessageReactions';
import { InlineMessageEditor } from './InlineMessageEditor';
import { ReplyIndicator } from './ReplyIndicator';
import { UserAvatar } from '../ui/UserAvatar';
import { UserProfilePopUp } from '../ui/UserProfilePopUp';
import { shouldShowUsername, isOwnMessage, hasReactions } from './utils/messageUtils';
import { useIsMobile } from '../../hooks/useIsMobile';

/**
 * MessageItem component for individual message display
 */
export interface MessageItemProps {
  message: BullRoomMessage;
  previousMessage?: BullRoomMessage;
  userId?: string;
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
  className?: string;
  userMap?: Record<string, string>; // userId -> username mapping for all users in the room
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  previousMessage,
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
  className = '',
  userMap = {}
}) => {
  const [hovered, setHovered] = React.useState(false);
  const [mobileActionsOpen, setMobileActionsOpen] = React.useState(false);
  const [profilePopupOpen, setProfilePopupOpen] = React.useState(false);
  const [profilePopupPosition, setProfilePopupPosition] = React.useState({ x: 0, y: 0 });
  const showUsername = shouldShowUsername(message, previousMessage);
  const isOwn = isOwnMessage(message, userId);
  const isEditing = editingMessageId === message.id;
  const isMobile = useIsMobile();
  // Handle scroll to original message when reply indicator is clicked
  const handleReplyClick = () => {
    if (message.reply_to_id) {
      const originalMessage = document.getElementById(`message-${message.reply_to_id}`);
      if (originalMessage) {
        originalMessage.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // Add a subtle highlight effect
        originalMessage.style.background = 'rgba(255, 255, 255, 0.05)';
        setTimeout(() => {
          originalMessage.style.background = 'transparent';
        }, 2000);
      }
    }
  };

  // Handle profile popup click
  const handleProfileClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setProfilePopupPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });
    setProfilePopupOpen(true);
  };

  // Close profile popup
  const closeProfilePopup = () => {
    setProfilePopupOpen(false);
  };

  // Handle mobile message click
  const handleMessageClick = () => {
    if (isMobile && !isEditing) {
      setMobileActionsOpen(!mobileActionsOpen);
      // Clear hover state when toggling mobile actions
      setHovered(false);
    }
  };



  // Close mobile actions when clicking outside
  const handleMessageMouseLeave = () => {
    if (isMobile) {
      setMobileActionsOpen(false);
    }
    setHovered(false);
  };

  return (
    <div 
      id={`message-${message.id}`}
      style={{
        position: 'relative',
        padding: isMobile ? 'var(--space-3) var(--space-2)' : 'var(--space-2) var(--space-4)',
        transition: 'all var(--transition-base)',
        cursor: 'pointer',
        background: hovered ? 'var(--color-bg-secondary)' : 
                   mobileActionsOpen ? 'var(--color-bg-tertiary)' : 'transparent'
      }}
      className={className}
      onClick={handleMessageClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMessageMouseLeave}
    >
      <div style={{
        display: 'flex',
        gap: 'var(--space-3)',
        alignItems: 'flex-start'
      }}>
        {/* Avatar - only show when username is displayed */}
        {showUsername ? (
          <div 
            style={{
              flexShrink: 0,
              marginTop: 'var(--space-1)',
              cursor: 'pointer'
            }}
            onClick={handleProfileClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            <UserAvatar
              user={{
                username: message.username || 'Anonymous',
                profile_image: message.user?.profile_image || null
              }}
              size="sm"
            />
          </div>
        ) : (
          /* Spacer to align with message content above */
          <div style={{
            flexShrink: 0,
            width: '32px' /* Same width as small avatar */
          }} />
        )}

        {/* Message Content Area */}
        <div style={{
          flex: 1,
          minWidth: 0
        }}>
          {/* Message Header */}
          <MessageHeader 
            message={message}
            showUsername={showUsername}
            onProfileClick={handleProfileClick}
          />
          
          {/* Reply Indicator - subtle and integrated */}
          {message.reply_to_id && (
            <ReplyIndicator
              replyToUsername={message.reply_to?.username || message.reply_to?.user?.username || 'Anonymous'}
              replyToContent={message.reply_to?.content || 'Message not found'}
              onReplyClick={handleReplyClick}
            />
          )}
          
          {/* Message Content or Inline Editor */}
          <>
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
          </>
          
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
                userMap={userMap}
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Hover Actions - only show when not editing */}
      {((hovered && !isMobile) || (mobileActionsOpen && isMobile)) && !isEditing && (
        <div style={{
          position: 'absolute',
          top: '-12px',
          right: 'var(--space-2)',
          opacity: (hovered && !isMobile) || (mobileActionsOpen && isMobile) ? 1 : 0,
          transition: 'opacity 200ms',
          pointerEvents: (hovered && !isMobile) || (mobileActionsOpen && isMobile) ? 'auto' : 'none'
        }}>
          <MessageActions
            message={message}
            userId={userId}
            roomId={roomId}
            onAddReaction={onAddReaction}
            onRemoveReaction={onRemoveReaction}
            onReply={onReply}
            onEdit={onStartEdit}
            onDelete={onDelete}
            userMap={userMap}
          />
        </div>
      )}

      {/* User Profile Popup */}
      <UserProfilePopUp
        userId={message.user_id}
        username={message.username || 'Anonymous'}
        profile_image={message.user?.profile_image || null}
        isOpen={profilePopupOpen}
        onClose={closeProfilePopup}
        position={profilePopupPosition}
      />
    </div>
  );
};