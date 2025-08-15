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
  className?: string;
}

export const MessageHeader: React.FC<MessageHeaderProps> = ({ 
  message, 
  showUsername, 
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
      <span style={{
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--font-black)',
        color: 'var(--color-text-primary)'
      }}>
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
