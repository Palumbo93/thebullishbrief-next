import React, { useState } from 'react';
import { Reply, Edit, Trash2, Shield, UserX, Trash, Volume2 } from 'lucide-react';
import { BullRoomMessage } from '../../types/bullRoom.types';
import { MessageReactions } from './MessageReactions';
import { ActionButton } from './ActionButton';
import { isOwnMessage } from './utils/messageUtils';
import { useIsMobile } from '../../hooks/useIsMobile';
import { useAdminBullRoomActions } from '../../hooks/useAdminBullRoomActions';
import { useAuth } from '../../contexts/AuthContext';

/**
 * MessageActions component for hover action buttons
 */
export interface MessageActionsProps {
  message: BullRoomMessage;
  userId?: string;
  roomId?: string;
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
  roomId,
  onAddReaction,
  onRemoveReaction,
  onReply,
  onEdit,
  onDelete,
  className = '',
  userMap = {}
}) => {
  const [showAdminActions, setShowAdminActions] = useState(false);
  const isOwn = isOwnMessage(message, userId);
  const isMobile = useIsMobile();
  const { hasRole } = useAuth();
  const {
    isAdmin,
    handleAdminDeleteMessage,
    handleToggleMute,
    handleDeleteAllUserMessages,
    isUserMuted,
    isAdminActionLoading
  } = useAdminBullRoomActions(roomId);
  
  const messageUsername = message.username || userMap[message.user_id] || 'Anonymous';

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

  // If admin actions are shown, display only admin controls
  if (showAdminActions && isAdmin && !isOwn && message.user_id !== userId) {
    const userIsMuted = isUserMuted(message.user_id);
    
    return (
      <div style={containerStyles} className={className}>
        <ActionButton
          icon={Shield}
          label="Admin Delete"
          variant="danger"
          size={isMobile ? 'sm' : 'md'}
          disabled={isAdminActionLoading}
          onClick={() => handleAdminDeleteMessage(message.id)}
        />
        
        <ActionButton
          icon={userIsMuted ? Volume2 : UserX}
          label={userIsMuted ? "Unmute User" : "Mute User"}
          variant="danger"
          size={isMobile ? 'sm' : 'md'}
          disabled={isAdminActionLoading}
          onClick={() => handleToggleMute(message.user_id, messageUsername)}
        />
        
        <ActionButton
          icon={Trash}
          label="Delete All"
          variant="danger"
          size={isMobile ? 'sm' : 'md'}
          disabled={isAdminActionLoading}
          onClick={() => handleDeleteAllUserMessages(message.user_id, messageUsername)}
        />
        
        {/* Back button to return to normal actions */}
        <div style={{
          width: '1px',
          height: '20px',
          background: 'var(--color-border-secondary)',
          margin: '0 var(--space-1)'
        }} />
        
        <ActionButton
          icon={Reply}
          label="Back"
          variant="secondary"
          size={isMobile ? 'sm' : 'md'}
          onClick={() => setShowAdminActions(false)}
        />
      </div>
    );
  }

  // Normal actions
  return (
    <div style={containerStyles} className={className}>
      {/* Reply button - always available */}
      <ActionButton
        icon={Reply}
        label="Reply"
        variant="secondary"
        onClick={() => onReply?.(message.id, messageUsername, message.content || '')}
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
      
      {/* Admin shield button - only visible to admins for others' messages */}
      {isAdmin && !isOwn && message.user_id !== userId && (
        <>
          {/* Visual separator */}
          <div style={{
            width: '1px',
            height: '20px',
            background: 'var(--color-border-secondary)',
            margin: '0 var(--space-1)'
          }} />
          
          <ActionButton
            icon={Shield}
            label={isUserMuted(message.user_id) ? "Admin (User Muted)" : "Admin"}
            variant={isUserMuted(message.user_id) ? "danger" : "secondary"}
            size={isMobile ? 'sm' : 'md'}
            onClick={() => setShowAdminActions(true)}
          />
        </>
      )}
    </div>
  );
};
