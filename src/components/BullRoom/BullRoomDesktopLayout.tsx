"use client";

import React from 'react';

interface BullRoomDesktopLayoutProps {
  children?: React.ReactNode;
  isAuthenticated: boolean;
  isLoading: boolean;
  roomSelector?: React.ReactNode;
  chatArea?: React.ReactNode;
  messageInput?: React.ReactNode;
  typingIndicator?: React.ReactNode;
  roomInfoSidebar?: React.ReactNode;
}

export const BullRoomDesktopLayout: React.FC<BullRoomDesktopLayoutProps> = ({
  children,
  isAuthenticated,
  isLoading,
  roomSelector,
  chatArea,
  messageInput,
  typingIndicator,
  roomInfoSidebar
}) => {
  // Desktop layout container - Three-column grid
  const desktopContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '22.5% 1fr 22.5%',
    gap: 0,
    height: '100%'
  };

  // Room selector container - Left sidebar
  const roomSelectorContainerStyle: React.CSSProperties = {
    padding: 'var(--space-4)',
    borderRight: '0.5px solid var(--color-border-primary)'
  };

  // Chat container - Center with flexbox layout
  const chatContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    position: 'relative'
  };

  // Chat area container - Takes remaining space
  const chatAreaContainerStyle: React.CSSProperties = {
    flex: 1,
    position: 'relative',
    overflow: 'hidden'
  };

  // Message input container - Fixed at bottom
  const inputContainerStyle: React.CSSProperties = {
    flexShrink: 0,
    background: 'var(--color-bg-primary)',
    backdropFilter: 'blur(4px)',
  };

  // Typing indicator container - Fixed at bottom left of chat column
  const typingContainerStyle: React.CSSProperties = {
    position: 'absolute',
    left: 'var(--space-6)',
    bottom: '4px', // Position above the input
    zIndex: 10
  };

  // Room info sidebar container - Right
  const sidebarContainerStyle: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div style={desktopContainerStyle}>
      {/* Room Selector - Left Sidebar */}
      <div style={roomSelectorContainerStyle}>
        {roomSelector}
      </div>

      {/* Chat Interface - Center with Flexbox Layout */}
      <div style={chatContainerStyle}>
        {/* Chat Area - Takes remaining space */}
        <div style={chatAreaContainerStyle}>
          {chatArea || children}
        </div>

        {/* Message Input - Fixed at bottom */}
        {messageInput && (
          <div style={inputContainerStyle}>
            {messageInput}
          </div>
        )}

        {/* Typing Indicator - Fixed at bottom left of chat column */}
        {typingIndicator && (
          <div style={typingContainerStyle}>
            {typingIndicator}
          </div>
        )}
      </div>

      {/* Room Info Sidebar - Right */}
      <div style={sidebarContainerStyle}>
        {roomInfoSidebar}
      </div>
    </div>
  );
};
