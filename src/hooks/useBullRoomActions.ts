import { useCreateMessage, useDeleteMessage, useToggleReaction } from './useBullRoomMessages';
import { useConfirm } from './useConfirm';

export const useBullRoomActions = (roomId?: string) => {
  // Message mutations
  const createMessageMutation = useCreateMessage();
  const deleteMessageMutation = useDeleteMessage();
  const toggleReactionMutation = useToggleReaction();

  // Confirmation dialog
  const confirm = useConfirm();

  // Send message handler
  const handleSendMessage = (
    content: string, 
    replyToId?: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    if (!content.trim() || !roomId) {
      onError?.(new Error('Invalid message or room'));
      return;
    }

    createMessageMutation.mutate({
      room_id: roomId,
      content: content.trim(),
      message_type: 'text',
      reply_to_id: replyToId
    }, {
      onSuccess: () => {
        onSuccess?.();
      },
      onError: (error) => {
        onError?.(error);
      }
    });
  };

  // Delete message handler with confirmation
  const handleDeleteMessage = (
    messageId: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    if (!roomId) {
      onError?.(new Error('No room selected'));
      return;
    }

    confirm.danger(
      'Delete Message',
      'Are you sure you want to delete this message? This action cannot be undone.',
      async () => {
        deleteMessageMutation.mutate(
          { messageId, roomId },
          {
            onSuccess: () => {
              onSuccess?.();
            },
            onError: (error) => {
              onError?.(error);
            }
          }
        );
      }
    );
  };

  // Toggle reaction handler
  const handleToggleReaction = (
    messageId: string,
    emoji: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    toggleReactionMutation.mutate(
      { messageId, emoji },
      {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: (error) => {
          onError?.(error);
        }
      }
    );
  };

  // Add reaction handler (alias for toggle)
  const handleAddReaction = (
    messageId: string,
    emoji: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    handleToggleReaction(messageId, emoji, onSuccess, onError);
  };

  // Remove reaction handler (alias for toggle)
  const handleRemoveReaction = (
    messageId: string,
    emoji: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    handleToggleReaction(messageId, emoji, onSuccess, onError);
  };

  // Message validation
  const validateMessage = (content: string): { isValid: boolean; error?: string } => {
    if (!content.trim()) {
      return { isValid: false, error: 'Message cannot be empty' };
    }
    
    if (content.length > 2000) {
      return { isValid: false, error: 'Message is too long (max 2000 characters)' };
    }

    return { isValid: true };
  };

  // Check if actions are loading
  const isActionLoading = createMessageMutation.isPending || 
                         deleteMessageMutation.isPending || 
                         toggleReactionMutation.isPending;

  return {
    // Action handlers
    handleSendMessage,
    handleDeleteMessage,
    handleToggleReaction,
    handleAddReaction,
    handleRemoveReaction,

    // Validation
    validateMessage,

    // Loading states
    isActionLoading,
    isCreatingMessage: createMessageMutation.isPending,
    isDeletingMessage: deleteMessageMutation.isPending,
    isTogglingReaction: toggleReactionMutation.isPending,

    // Error states
    createMessageError: createMessageMutation.error,
    deleteMessageError: deleteMessageMutation.error,
    toggleReactionError: toggleReactionMutation.error
  };
};
