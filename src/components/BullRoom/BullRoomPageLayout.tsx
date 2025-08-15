"use client";

import React from 'react';
import { useIsMobile } from '../../hooks/useIsMobile';
import { BullRoomMobileLayout } from './BullRoomMobileLayout';
import { BullRoomDesktopLayout } from './BullRoomDesktopLayout';

interface BullRoomPageLayoutProps {
  children?: React.ReactNode;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Mobile layout props
  mobileHeader?: React.ReactNode;
  mobileChatArea?: React.ReactNode;
  mobileMessageInput?: React.ReactNode;
  mobileTypingIndicator?: React.ReactNode;
  mobileInfoPanel?: React.ReactNode;
  // Desktop layout props
  desktopRoomSelector?: React.ReactNode;
  desktopChatArea?: React.ReactNode;
  desktopMessageInput?: React.ReactNode;
  desktopTypingIndicator?: React.ReactNode;
  desktopRoomInfoSidebar?: React.ReactNode;
  // Editing state
  isEditing?: boolean;
}

export const BullRoomPageLayout: React.FC<BullRoomPageLayoutProps> = ({
  children,
  isAuthenticated,
  isLoading,
  // Mobile layout props
  mobileHeader,
  mobileChatArea,
  mobileMessageInput,
  mobileTypingIndicator,
  mobileInfoPanel,
  // Desktop layout props
  desktopRoomSelector,
  desktopChatArea,
  desktopMessageInput,
  desktopTypingIndicator,
  desktopRoomInfoSidebar,
  // Editing state
  isEditing = false
}) => {
  const isMobile = useIsMobile();

  // Desktop container with full viewport height
  const containerStyleDesktop: React.CSSProperties = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  return (
    <>
      {isMobile ? (
        // Mobile: Let the mobile layout take full control
        <BullRoomMobileLayout
          isAuthenticated={isAuthenticated}
          isLoading={isLoading}
          header={mobileHeader}
          chatArea={mobileChatArea}
          messageInput={mobileMessageInput}
          typingIndicator={mobileTypingIndicator}
          infoPanel={mobileInfoPanel}
          isEditing={isEditing}
        >
          {children}
        </BullRoomMobileLayout>
      ) : (
        // Desktop: Use container wrapper
        <div style={containerStyleDesktop}>
          <BullRoomDesktopLayout
            isAuthenticated={isAuthenticated}
            isLoading={isLoading}
            roomSelector={desktopRoomSelector}
            chatArea={desktopChatArea}
            messageInput={desktopMessageInput}
            typingIndicator={desktopTypingIndicator}
            roomInfoSidebar={desktopRoomInfoSidebar}
          >
            {children}
          </BullRoomDesktopLayout>
        </div>
      )}
    </>
  );
};
