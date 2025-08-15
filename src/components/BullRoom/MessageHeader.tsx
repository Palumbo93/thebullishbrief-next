import React from 'react';
import { BullRoomMessage } from '../../types/bullRoom.types';
import { formatTime } from './utils/formatters';
import { getMessageDisplayName } from './utils/messageUtils';

/**
 * MessageHeader component for displaying username and timestamp
 */
export interface MessageHeaderProps {
  message: BullRoomMessage;
  showUsername: boolean;
  onProfileClick?: (event: React.MouseEvent) => void;
  className?: string;
}

export const MessageHeader: React.FC<MessageHeaderProps> = ({ 
  message, 
  showUsername, 
  onProfileClick,
  className = '' 
}) => {
  if (!showUsername) return null;

  return (
    <div 
      style={{
        marginBottom: 'var(--space-1)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)'
      }}
      className={className}
    >
      <span 
        style={{
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--font-semibold)',
          color: 'var(--color-text-primary)',
          cursor: onProfileClick ? 'pointer' : 'default'
        }}
        onClick={onProfileClick}
        onMouseEnter={(e) => {
          if (onProfileClick) {
            e.currentTarget.style.textDecoration = 'underline';
          }
        }}
        onMouseLeave={(e) => {
          if (onProfileClick) {
            e.currentTarget.style.textDecoration = 'none';
          }
        }}
      >
        {getMessageDisplayName(message)}
      </span>
      <span style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-muted)'
      }}>
        {formatTime(message.created_at)}
      </span>
      {message.is_edited && (
        <span style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic'
        }}>
          (edited)
        </span>
      )}
    </div>
  );
};
