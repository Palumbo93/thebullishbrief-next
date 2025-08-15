import { useState, useCallback } from 'react';
import { useUpdateMessage } from './useBullRoomMessages';
import { useToast } from './useToast';

/**
 * Hook for managing message editing state and mutations
 */
export const useMessageEdit = () => {
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const updateMessage = useUpdateMessage();
  const toast = useToast();

  const startEditing = useCallback((messageId: string) => {
    setEditingMessageId(messageId);
  }, []);

  const stopEditing = useCallback(() => {
    setEditingMessageId(null);
  }, []);

  const saveEdit = useCallback(async (messageId: string, newContent: string) => {
    try {
      await updateMessage.mutateAsync({
        messageId,
        updates: {
          content: newContent,
          is_edited: true,
          edited_at: new Date().toISOString()
        }
      });
      
      toast.success('Message updated successfully');
      stopEditing();
    } catch (error) {
      console.error('Failed to update message:', error);
      toast.error('Failed to update message. Please try again.');
      throw error; // Re-throw so the component can handle it
    }
  }, [updateMessage, toast, stopEditing]);

  const isEditing = useCallback((messageId: string) => {
    return editingMessageId === messageId;
  }, [editingMessageId]);

  return {
    editingMessageId,
    startEditing,
    stopEditing,
    saveEdit,
    isEditing,
    isUpdating: updateMessage.isPending
  };
};
