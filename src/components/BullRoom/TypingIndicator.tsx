import React from 'react';
import { MessageSquare } from 'lucide-react';

/**
 * TypingIndicator shows when users are typing in the chat
 */
export interface TypingIndicatorProps {
  isVisible: boolean;
  typingUsers: string[];
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible, typingUsers }) => {
  if (!isVisible || typingUsers.length === 0) return null;

  const formatTypingUsers = (users: string[]) => {
    if (users.length === 1) {
      return `${users[0]} is typing...`;
    } else if (users.length === 2) {
      return `${users[0]} and ${users[1]} are typing...`;
    } else if (users.length === 3) {
      return `${users[0]}, ${users[1]}, and ${users[2]} are typing...`;
    } else {
      return `${users[0]}, ${users[1]}, and ${users.length - 2} others are typing...`;
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-muted">{formatTypingUsers(typingUsers)}</span>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-1 h-1 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-1 h-1 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  );
}; 