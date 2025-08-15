"use client";

import React, { useState, useEffect, useRef } from 'react';
import { getFullHeightStyles, getSafeAreaInsetPadding } from '../../utils/viewportUtils';

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
  isEditing?: boolean; // New prop to control MessageInput visibility during editing
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

  // Measure TypingIndicator height changes
  useEffect(() => {
    if (!typingIndicatorRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTypingIndicatorHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(typingIndicatorRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [typingIndicator]);

  // Calculate total bottom space needed - hide MessageInput when editing
  const totalBottomSpace = isEditing ? typingIndicatorHeight : messageInputHeight + typingIndicatorHeight;

  // Mobile layout container - Using viewport-aware height
  const mobileContainerStyle: React.CSSProperties = {
    ...getFullHeightStyles({ includeSafeAreaInsets: false }),
    position: 'relative',
    overflow: 'hidden',
    paddingTop: header ? '60px' : '0px' // Account for mobile header when it exists
  };

  // Chat interface container - Absolutely positioned to fill available space
  const chatContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: header ? '60px' : '0px', // Start below the header if it exists
    left: 0,
    right: 0,
    bottom: totalBottomSpace, // Dynamically adjusted based on MessageInput and TypingIndicator height
    overflow: 'hidden'
  };

  // Message input container - Fixed at bottom with safe area inset
  const inputContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(4px)',
    borderTop: '0.5px solid var(--color-border-primary)',
    zIndex: 50,
    ...getSafeAreaInsetPadding() // Add safe area inset padding
  };

  // Typing indicator container - Fixed above message input with safe area inset
  const typingContainerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: messageInputHeight, // Position above MessageInput
    left: 0,
    right: 0,
    paddingLeft: 'var(--space-4)',
    paddingBottom: 'var(--space-1)',
    background: 'rgba(0, 0, 0, 0.95)',
    backdropFilter: 'blur(4px)',
    zIndex: 50,
    ...getSafeAreaInsetPadding() // Add safe area inset padding
  };

  return (
    <div style={mobileContainerStyle}>
      {/* Mobile Header */}
      {header && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
          {header}
        </div>
      )}

      {/* Chat Interface - Absolutely positioned to fill available space */}
      <div style={chatContainerStyle}>
        {chatArea || children}
      </div>

      {/* Mobile Typing Indicator - Fixed above message input */}
      {typingIndicator && (
        <div ref={typingIndicatorRef} style={typingContainerStyle}>
          {typingIndicator}
        </div>
      )}

      {/* Mobile Message Input - Fixed at bottom of viewport (hidden when editing) */}
      {messageInput && !isEditing && (
        <div ref={messageInputRef} style={inputContainerStyle}>
          {messageInput}
        </div>
      )}

      {/* Mobile Info Panel - Rendered directly without container */}
        {infoPanel}

    </div>
  );
};
