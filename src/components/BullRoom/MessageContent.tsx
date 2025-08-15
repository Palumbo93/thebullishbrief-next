import React from 'react';
import { BullRoomMessage } from '../../types/bullRoom.types';
import { getMessageType, isImageMessage, isFileMessage, hasFileData } from './utils/messageUtils';
import { MessageContentRenderer } from './MessageContentRenderer';
import { FilePreview } from './FilePreview';

/**
 * MessageContent component for rendering different message types
 */
export interface MessageContentProps {
  message: BullRoomMessage;
  className?: string;
}

export const MessageContent: React.FC<MessageContentProps> = ({ 
  message, 
  className = '' 
}) => {
  const messageType = getMessageType(message);

  // Handle image messages
  if (isImageMessage(message) && hasFileData(message)) {
    return (
      <FilePreview 
        fileData={message.file_data as { name: string; url: string; size: number; type: string; preview_url?: string }}
        content={message.content}
        className={className}
      />
    );
  }

  // Handle file messages
  if (isFileMessage(message) && hasFileData(message)) {
    return (
      <FilePreview 
        fileData={message.file_data as { name: string; url: string; size: number; type: string; preview_url?: string }}
        content={message.content}
        className={className}
      />
    );
  }

  // Handle system messages
  if (messageType === 'system') {
    return (
      <div 
        style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          fontStyle: 'italic',
          textAlign: 'center',
          padding: 'var(--space-2)',
          background: 'rgba(20, 20, 20, 0.2)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid rgba(31, 31, 31, 0.2)'
        }}
        className={className}
      >
        {message.content}
      </div>
    );
  }

  // Handle text messages (default)
  return (
    <div 
      style={{ 
        lineHeight: 'var(--leading-relaxed)',
        maxWidth: '100%'
      }}
      className={className}
    >
      <p 
        style={{
          fontSize: 'var(--text-sm)',
          whiteSpace: 'pre-wrap',
          margin: 0
        }}
      >
        <MessageContentRenderer text={message.content} />
      </p>
    </div>
  );
};
