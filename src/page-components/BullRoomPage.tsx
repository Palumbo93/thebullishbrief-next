"use client";

import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAuthModal } from '../contexts/AuthModalContext';
import { RoomSelector } from '../components/BullRoom/RoomSelector';
import { ChatArea } from '../components/BullRoom/ChatArea';
import { MessageInput } from '../components/BullRoom/MessageInput';
import { RoomInfoSidebar } from '../components/BullRoom/RoomInfoSidebar';
import { AuthOverlay } from '../components/BullRoom/AuthOverlay';
import { TypingIndicator } from '../components/BullRoom/TypingIndicator';
import { BullRoomMobileHeader } from '../components/BullRoom/BullRoomMobileHeader';
import { BullRoomMobileInfoPanel } from '../components/BullRoom/BullRoomMobileInfoPanel';
import { ChatAreaSkeleton } from '../components/BullRoom/ChatAreaSkeleton';
import { RoomSelectorSkeleton } from '../components/BullRoom/RoomSelectorSkeleton';
import { RoomInfoSkeleton } from '../components/BullRoom/RoomInfoSkeleton';
import { BullRoomPageLayout } from '../components/BullRoom/BullRoomPageLayout';
import { BullRoomChatContainer } from '../components/BullRoom/BullRoomChatContainer';
import { useBullRoomRealtime } from '../hooks/useBullRoomRealtime';
import { useBullRoomState } from '../hooks/useBullRoomState';
import { useBullRoomUI } from '../hooks/useBullRoomUI';
import { useBullRoomActions } from '../hooks/useBullRoomActions';
import { BullRoomMessage } from '../types/bullRoom.types';
import { BullRoomMessage as DBBullRoomMessage } from '../lib/database.aliases';
import { BullRoomErrorBoundary } from '../components/BullRoom/BullRoomErrorBoundary';

interface BullRoomPageProps {
  roomSlug?: string;
  onCreateAccountClick?: () => void;
}

export const BullRoomPage: React.FC<BullRoomPageProps> = ({ roomSlug, onCreateAccountClick }) => {
  const { user, loading: authLoading } = useAuth();
  const { handleSignUpClick } = useAuthModal();

  // Use our organized hooks
  const {
    // Room state
    rooms,
    roomsLoading,
    roomsError,
    currentRoom,
    roomLoading,
    roomError,
    selectedRoomSlug,
    
    // Message state
    messages,
    messagesLoading,
    messagesError,
    newMessage,
    fileUploads,
    
    // Infinite scroll state
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    
    // Refs
    fileInputRef,
    textareaRef,
    
    // Handlers
    handleRoomRedirect,
    handleSelectRoom,
    handleFileSelect,
    removeFileUpload,
    updateNewMessage,
    clearNewMessage,
    handleSendMessageWithCleanup
  } = useBullRoomState(roomSlug);

  const {
    // Mobile UI state
    isMobileInfoPanelOpen,
    toggleMobileInfoPanel,
    
    // Message editing state
    editingMessageId,
    isEditing,
    isUpdating,
    handleEdit,
    handleCancelEdit,
    handleSaveEdit,

    // Message reply state
    replyingTo,
    isReplying,
    handleReply,
    handleCancelReply,

    // Typing indicator state
    typingUsers,
    handleMessageInputChange
  } = useBullRoomUI(currentRoom?.id, textareaRef);

  const {
    // Action handlers
    handleSendMessage,
    handleDeleteMessage,
    handleAddReaction,
    handleRemoveReaction,

    // Loading states
    isActionLoading,
    isCreatingMessage
  } = useBullRoomActions(currentRoom?.id);

  // Auto-redirect to general room if no specific room is provided
  useEffect(() => {
    handleRoomRedirect();
  }, [handleRoomRedirect]);

  // Enable real-time messaging only for authenticated users
  useBullRoomRealtime(currentRoom?.id || '');



  // Wrapper for onStartEdit to match expected signature
  const handleStartEdit = (messageId: string) => {
    handleEdit(messageId, '');
  };







  return (
    <BullRoomErrorBoundary>
      <BullRoomPageLayout
        isAuthenticated={!!user}
        isLoading={authLoading}
        isInfoPanelOpen={isMobileInfoPanelOpen}
        mobileHeader={currentRoom && (
          <BullRoomMobileHeader
            rooms={rooms}
            selectedRoom={currentRoom}
            onSelectRoom={handleSelectRoom}
            onToggleInfoPanel={toggleMobileInfoPanel}
            isInfoPanelOpen={isMobileInfoPanelOpen}
          />
        )}
        mobileChatArea={
          <BullRoomChatContainer
            isLoading={messagesLoading || roomLoading}
            isEmpty={messages.length === 0 && !messagesLoading}
          >
            {messagesLoading || roomLoading ? (
              <ChatAreaSkeleton />
            ) : (
              <ChatArea 
                messages={messages as BullRoomMessage[]} 
                userId={user?.id} 
                onAddReaction={(messageId: string, emoji: string) => handleAddReaction(messageId, emoji)}
                onRemoveReaction={(messageId: string, emoji: string) => handleRemoveReaction(messageId, emoji)}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDeleteMessage}
                editingMessageId={editingMessageId}
                onStartEdit={handleStartEdit}
                onStopEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            )}
          </BullRoomChatContainer>
        }
        mobileMessageInput={
          <MessageInput
            value={newMessage}
            onChange={(e) => {
              updateNewMessage(e.target.value);
              handleMessageInputChange(e.target.value);
            }}
            onSend={handleSendMessageWithCleanup}
            onFileSelect={handleFileSelect}
            fileUploads={fileUploads}
            onRemoveFile={removeFileUpload}
            disabled={!user || !currentRoom || isCreatingMessage}
            textareaRef={textareaRef}
            fileInputRef={fileInputRef}
            replyingTo={replyingTo}
            onCancelReply={handleCancelReply}
            user={user}
          />
        }
        mobileTypingIndicator={
          <TypingIndicator 
            isVisible={typingUsers.length > 0} 
            typingUsers={typingUsers} 
          />
        }
        mobileInfoPanel={
          currentRoom && (
            <BullRoomMobileInfoPanel
              isOpen={isMobileInfoPanelOpen}
              onClose={() => toggleMobileInfoPanel()}
              room={currentRoom}
              messages={messages as BullRoomMessage[]}
            />
          )
        }
        desktopRoomSelector={
          roomsLoading ? (
            <RoomSelectorSkeleton />
          ) : (
            <RoomSelector
              rooms={rooms}
              selectedRoomId={selectedRoomSlug}
              onSelectRoom={handleSelectRoom}
              isLoading={roomsLoading}
              error={roomsError ? 'Failed to load rooms' : null}
            />
          )
        }
        desktopChatArea={
          <BullRoomChatContainer
            isLoading={messagesLoading || roomLoading}
            isEmpty={messages.length === 0 && !messagesLoading}
          >
            {messagesLoading || roomLoading ? (
              <ChatAreaSkeleton />
            ) : (
              <ChatArea 
                messages={messages as BullRoomMessage[]} 
                userId={user?.id} 
                onAddReaction={(messageId: string, emoji: string) => handleAddReaction(messageId, emoji)}
                onRemoveReaction={(messageId: string, emoji: string) => handleRemoveReaction(messageId, emoji)}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDeleteMessage}
                editingMessageId={editingMessageId}
                onStartEdit={handleStartEdit}
                onStopEdit={handleCancelEdit}
                onSaveEdit={handleSaveEdit}
                hasNextPage={hasNextPage}
                fetchNextPage={fetchNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
            )}
          </BullRoomChatContainer>
        }
        desktopMessageInput={
          <MessageInput
            value={newMessage}
            onChange={(e) => {
              updateNewMessage(e.target.value);
              handleMessageInputChange(e.target.value);
            }}
            onSend={handleSendMessageWithCleanup}
            onFileSelect={handleFileSelect}
            fileUploads={fileUploads}
            onRemoveFile={removeFileUpload}
            disabled={!user || !currentRoom || isCreatingMessage}
            textareaRef={textareaRef}
            fileInputRef={fileInputRef}
            replyingTo={replyingTo}
            onCancelReply={handleCancelReply}
            user={user}
          />
        }
        desktopTypingIndicator={
          <TypingIndicator 
            isVisible={typingUsers.length > 0} 
            typingUsers={typingUsers} 
          />
        }
        desktopRoomInfoSidebar={
          roomLoading ? (
            <RoomInfoSkeleton />
          ) : currentRoom ? (
            <RoomInfoSidebar 
              room={currentRoom}
              messages={messages as BullRoomMessage[]}
            />
          ) : (
            <RoomInfoSkeleton />
          )
        }
        isEditing={isEditing}
      />

      {/* Authentication Overlay for unauthenticated users - Rendered outside layout to ensure proper positioning */}
      {!authLoading && !user && (
        <AuthOverlay onCreateAccountClick={handleSignUpClick} />
      )}
    </BullRoomErrorBoundary>
  );
};

export default BullRoomPage;