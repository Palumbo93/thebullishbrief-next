"use client";

import React from 'react';
import { ChatAreaSkeleton } from './ChatAreaSkeleton';
import { EmptyState } from './EmptyState';

interface BullRoomChatContainerProps {
  children: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  className?: string;
}

export const BullRoomChatContainer: React.FC<BullRoomChatContainerProps> = ({
  children,
  isLoading = false,
  isEmpty = false,
  className = ''
}) => {
  // Chat container base styles - Now using absolute positioning
  const chatContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    position: 'relative'
  };

  // Chat messages area - Absolutely positioned to fill container
  const messagesAreaStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: 'var(--space-4)',
    scrollBehavior: 'smooth'
  };

  return (
    <div style={chatContainerStyle} className={className}>
      {isLoading ? (
        <ChatAreaSkeleton />
      ) : isEmpty ? (
        <EmptyState />
      ) : (
        <div style={messagesAreaStyle}>
          {children}
        </div>
      )}
    </div>
  );
};
