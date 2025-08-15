"use client";

import React, { useState, useEffect, useRef } from 'react';
import { getSafeAreaInsetPadding } from '../../utils/viewportUtils';

interface BullRoomMobileLayoutProps {
  children?: React.ReactNode;
  isAuthenticated: boolean;
  isLoading: boolean;
  header?: React.ReactNode;
  chatArea?: React.ReactNode;
  messageInput?: React.ReactNode;
  typingIndicator?: React.ReactNode;
  infoPanel?: React.ReactNode;
  isInfoPanelOpen?: boolean;
  isEditing?: boolean;
}

export const BullRoomMobileLayout: React.FC<BullRoomMobileLayoutProps> = ({
  children,
  isAuthenticated,
  isLoading,
  header,
  chatArea,
  messageInput,
  typingIndicator,
  infoPanel,
  isInfoPanelOpen = false,
  isEditing = false
}) => {
  const [messageInputHeight, setMessageInputHeight] = useState(0);
  const [typingIndicatorHeight, setTypingIndicatorHeight] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const messageInputRef = useRef<HTMLDivElement>(null);
  const typingIndicatorRef = useRef<HTMLDivElement>(null);

  // Measure MessageInput height changes
  useEffect(() => {
    if (!messageInputRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setMessageInputHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(messageInputRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [messageInput]);

  // Handle keyboard height changes
  useEffect(() => {
    const handleVisualViewportChange = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const newKeyboardHeight = Math.max(0, windowHeight - viewportHeight);
        setKeyboardHeight(newKeyboardHeight);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      handleVisualViewportChange(); // Initial call
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
      }
    };
  }, []);

  // Calculate heights
  const headerHeight = header ? 60 : 0; // Fixed header height
  const totalBottomSpace = isEditing ? typingIndicatorHeight : messageInputHeight + typingIndicatorHeight;

  // Main mobile container - Takes full viewport control
  const mobileContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: 'var(--color-bg-primary)',
    zIndex: 1
  };

  // Header container
  const headerContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    background: 'var(--color-bg-primary)',
    height: `${headerHeight}px`
  };

  // Chat area container - Positioned to avoid header and input, with proper scroll handling
  const chatContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0, // Start below header
    left: 0,
    right: 0,
    bottom: totalBottomSpace + keyboardHeight, // End above input + keyboard
    overflow: 'visible', // Allow scroll events to pass through
    background: 'var(--color-bg-primary)',
    pointerEvents: 'auto' // Ensure pointer events work
  };

  // Message input container - Fixed at bottom
  const inputContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: keyboardHeight, // Account for keyboard
    left: 0,
    right: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(4px)',
    zIndex: 50,
    ...getSafeAreaInsetPadding()
  };

  // Typing indicator container - Fixed above message input
  const typingContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0, // Account for keyboard + input
    left: 0,
    right: 0,
    paddingLeft: 'var(--space-4)',
    paddingBottom: 'var(--space-1)',
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(4px)',
    zIndex: 150,
  };

  // Info panel container - Overlay
  const infoPanelContainerStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    zIndex: 100,
    display: isInfoPanelOpen ? 'flex' : 'none',
    alignItems: 'flex-end'
  };

  return (
    <div style={mobileContainerStyle}>
      {/* Header */}
      {header && (
        <div style={headerContainerStyle}>
          {header}
        </div>
      )}

      {/* Chat Area - Positioned to avoid header and input */}
      <div style={chatContainerStyle}>
        {chatArea || children}
      </div>

      {/* Typing Indicator */}
      {typingIndicator && (
        <div ref={typingIndicatorRef} style={typingContainerStyle}>
          {typingIndicator}
        </div>
      )}

      {/* Message Input - Hidden when editing */}
      {messageInput && !isEditing && (
        <div ref={messageInputRef} style={inputContainerStyle}>
          {messageInput}
        </div>
      )}

      {/* Info Panel Overlay */}
      {infoPanel && (
        <div style={infoPanelContainerStyle}>
          {infoPanel}
        </div>
      )}
    </div>
  );
};
