import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { BullRoomMessageService } from '../services/bullRoomMessages';
import { BullRoomMessage } from '../types/bullRoom.types';

const messageService = new BullRoomMessageService();

/**
 * Hook for fetching Bull Room messages
 */
export const useBullRoomMessages = (roomId: string) => {
  return useQuery({
    queryKey: ['bull-room-messages', roomId],
    queryFn: () => messageService.getMessages(roomId),
    enabled: !!roomId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for creating a new message
 */
export const useCreateMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (messageData: Partial<BullRoomMessage>) => 
      messageService.createMessage({
        ...messageData,
        user_id: user?.id!,
        username: user?.profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Anonymous',
      }),
    onMutate: async (messageData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bull-room-messages'] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['bull-room-messages', messageData.room_id]);

      // Create optimistic message
      const optimisticMessage: BullRoomMessage = {
        id: `temp-${Date.now()}`,
        room_id: messageData.room_id!,
        user_id: user?.id!,
        username: user?.profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'You',
        content: messageData.content!,
        message_type: 'text',
        reply_to_id: messageData.reply_to_id,
        reactions: {},
        is_edited: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: {
          id: user?.id!,
          username: user?.profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'You',
        },
      };

      // Optimistically add message to cache
      queryClient.setQueryData(
        ['bull-room-messages', messageData.room_id],
        (oldData: BullRoomMessage[] = []) => [optimisticMessage, ...oldData]
      );

      return { previousMessages, optimisticMessage };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['bull-room-messages', variables.room_id], context.previousMessages);
      }
      console.error('Failed to create message:', error);
    },
    onSuccess: (newMessage, variables, context) => {
      // Replace optimistic message with real one, but be careful about duplicates
      queryClient.setQueryData(
        ['bull-room-messages', variables.room_id],
        (oldData: BullRoomMessage[] = []) => {
          // Remove optimistic message
          const withoutOptimistic = oldData.filter(msg => msg.id !== context?.optimisticMessage?.id);
          
          // Check if real message already exists (from real-time subscription)
          const realMessageExists = withoutOptimistic.some(msg => msg.id === newMessage.id);
          if (realMessageExists) {
            return withoutOptimistic;
          }
          
          // Add real message if it doesn't exist
          return [newMessage, ...withoutOptimistic];
        }
      );
      
      // Update room stats
      queryClient.invalidateQueries({ queryKey: ['bull-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['bull-room', variables.room_id] });
    },
  });
};

/**
 * Hook for updating a message
 */
export const useUpdateMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, updates }: { messageId: string; updates: Partial<BullRoomMessage> }) =>
      messageService.updateMessage(messageId, updates),
    onSuccess: (updatedMessage) => {
      // Update the message in cache
      queryClient.setQueryData(
        ['bull-room-messages', updatedMessage.room_id],
        (oldData: BullRoomMessage[] = []) =>
          oldData.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
      );
    },
    onError: (error) => {
      console.error('Failed to update message:', error);
    },
  });
};

/**
 * Hook for deleting a message
 */
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ messageId, roomId }: { messageId: string; roomId: string }) => 
      messageService.deleteMessage(messageId),
    onMutate: async ({ messageId, roomId }) => {
      // Cancel any outgoing refetches for this room
      await queryClient.cancelQueries({ queryKey: ['bull-room-messages', roomId] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['bull-room-messages', roomId]);

      // Optimistically remove the message
      queryClient.setQueryData(
        ['bull-room-messages', roomId],
        (oldData: BullRoomMessage[] = []) =>
          oldData.filter(msg => msg.id !== messageId)
      );

      return { previousMessages };
    },
    onError: (err, { messageId, roomId }, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['bull-room-messages', roomId], context.previousMessages);
      }
      console.error('Failed to delete message:', err);
    },
    onSuccess: (_, { messageId, roomId }) => {
      // Message already removed optimistically, just ensure it's gone
      queryClient.setQueryData(
        ['bull-room-messages', roomId],
        (oldData: BullRoomMessage[] = []) =>
          oldData.filter(msg => msg.id !== messageId)
      );
    },
  });
};

/**
 * Hook for toggling a reaction on a message (add/remove)
 */
export const useToggleReaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      messageService.addReaction(messageId, emoji, user?.id!),
    onMutate: async ({ messageId, emoji }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bull-room-messages'] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['bull-room-messages']);

      // Optimistically update reactions - simplified and faster
      queryClient.setQueryData(
        ['bull-room-messages'],
        (oldData: BullRoomMessage[] = []) =>
          oldData.map(msg => {
            if (msg.id === messageId) {
              const reactions = { ...(msg.reactions || {}) };
              const userId = user?.id!;
              const hasReacted = reactions[emoji]?.includes(userId);
              
              if (hasReacted) {
                // Remove reaction - simplified
                reactions[emoji] = reactions[emoji].filter(id => id !== userId);
                if (reactions[emoji].length === 0) delete reactions[emoji];
              } else {
                // Add reaction - simplified
                if (!reactions[emoji]) reactions[emoji] = [];
                reactions[emoji].push(userId);
              }
              
              return { ...msg, reactions };
            }
            return msg;
          })
      );

      return { previousMessages };
    },
    onError: (err, { messageId, emoji }, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['bull-room-messages'], context.previousMessages);
      }
      console.error('Failed to toggle reaction:', err);
    },
    // Removed onSettled to prevent unnecessary refetches
  });
};

/**
 * Hook for adding a reaction to a message (kept for backward compatibility)
 */
export const useAddReaction = () => {
  return useToggleReaction();
};

/**
 * Hook for removing a reaction from a message (kept for backward compatibility)
 */
export const useRemoveReaction = () => {
  return useToggleReaction();
};

/**
 * Hook for getting message count
 */
export const useMessageCount = (roomId: string) => {
  return useQuery({
    queryKey: ['bull-room-message-count', roomId],
    queryFn: () => messageService.getMessageCount(roomId),
    enabled: !!roomId,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for searching messages
 */
export const useSearchMessages = (roomId: string, query: string) => {
  return useQuery({
    queryKey: ['bull-room-message-search', roomId, query],
    queryFn: () => messageService.searchMessages(roomId, query),
    enabled: !!roomId && !!query && query.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}; 