import { useState } from 'react';
import { useMessageEdit } from './useMessageEdit';
import { useMessageReply } from './useMessageReply';
import { useTypingIndicator } from './useTypingIndicator';

export const useBullRoomUI = (roomId?: string, textareaRef?: React.RefObject<HTMLTextAreaElement | null>) => {
  // Mobile UI state
  const [isMobileInfoPanelOpen, setIsMobileInfoPanelOpen] = useState(false);

  // Message editing state
  const {
    editingMessageId,
    startEditing,
    stopEditing,
    saveEdit,
    isEditing: isEditingMessage,
    isUpdating
  } = useMessageEdit();

  // Create a boolean for overall editing state
  const isEditing = editingMessageId !== null;

  // Message reply state
  const { 
    replyingTo, 
    startReply, 
    cancelReply, 
    isReplying 
  } = useMessageReply();

  // Typing indicator state
  const { 
    typingUsers, 
    startTyping, 
    stopTyping 
  } = useTypingIndicator(roomId || '');

  // Mobile panel handlers
  const openMobileInfoPanel = () => setIsMobileInfoPanelOpen(true);
  const closeMobileInfoPanel = () => setIsMobileInfoPanelOpen(false);
  const toggleMobileInfoPanel = () => setIsMobileInfoPanelOpen(!isMobileInfoPanelOpen);

  // Message action handlers
  const handleReply = (messageId: string, username: string, content: string) => {
    startReply(messageId, username, content);
    // Focus the textarea after starting reply
    if (textareaRef?.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100); // Small delay to ensure the reply state is set
    }
  };

  const handleEdit = (messageId: string, content: string) => {
    startEditing(messageId);
  };

  const handleCancelEdit = () => {
    stopEditing();
  };

  const handleSaveEdit = async (messageId: string, newContent: string) => {
    await saveEdit(messageId, newContent);
  };

  const handleCancelReply = () => {
    cancelReply();
  };

  // Typing handlers
  const handleStartTyping = () => {
    if (roomId) {
      startTyping();
    }
  };

  const handleStopTyping = () => {
    if (roomId) {
      stopTyping();
    }
  };

  // Message input change handler with typing indicator
  const handleMessageInputChange = (value: string, onTypingChange?: (isTyping: boolean) => void) => {
    if (value.trim() === '') {
      handleStopTyping();
      onTypingChange?.(false);
    } else {
      handleStartTyping();
      onTypingChange?.(true);
    }
  };

  return {
    // Mobile UI state
    isMobileInfoPanelOpen,
    openMobileInfoPanel,
    closeMobileInfoPanel,
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
    handleStartTyping,
    handleStopTyping,
    handleMessageInputChange
  };
};
