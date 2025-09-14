import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { BullRoomMessageService } from '../services/bullRoomMessages';
import { BullRoomMessage } from '../types/bullRoom.types';
import { useCallback, useMemo } from 'react';
import { useToast } from './useToast';


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
 * Hook for fetching Bull Room messages with infinite scroll
 * Loads messages from the past 48 hours in smart batches:
 * - Authenticated users: 50 messages per batch (Discord-like)
 * - Unauthenticated users: 10 messages per batch (lighter load)
 */
export const useBullRoomMessagesInfinite = (roomId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Smart batch sizing based on authentication status
  const batchSize = user ? 50 : 10;
  
  const infiniteQuery = useInfiniteQuery({
    queryKey: ['bull-room-messages-infinite', roomId, batchSize],
    queryFn: ({ pageParam = 0 }) => messageService.getMessages(roomId, batchSize, pageParam),
    enabled: !!roomId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    getNextPageParam: (lastPage, allPages) => {
      // If the last page has fewer than batchSize messages, we've reached the end
      if (!lastPage || lastPage.length < batchSize) {
        return undefined;
      }
      // Calculate the next offset based on total messages loaded
      return allPages.reduce((total, page) => total + page.length, 0);
    },
    initialPageParam: 0,
  });

  // Flatten all pages into a single array of messages
  const messages = useMemo(() => {
    return infiniteQuery.data?.pages.flat() || [];
  }, [infiniteQuery.data]);

  // Handle real-time message updates by updating the first page
  const addMessageToCache = useCallback((newMessage: BullRoomMessage) => {
    queryClient.setQueryData(
      ['bull-room-messages-infinite', roomId, batchSize],
      (oldData: any) => {
        if (!oldData?.pages?.length) {
          return {
            pages: [[newMessage]],
            pageParams: [0],
          };
        }
        
        // Add to the first page (most recent messages)
        const newPages = [...oldData.pages];
        newPages[0] = [newMessage, ...newPages[0]];
        
        return {
          ...oldData,
          pages: newPages,
        };
      }
    );
  }, [queryClient, roomId, batchSize]);

  // Update a message in the cache
  const updateMessageInCache = useCallback((updatedMessage: BullRoomMessage) => {
    queryClient.setQueryData(
      ['bull-room-messages-infinite', roomId, batchSize],
      (oldData: any) => {
        if (!oldData?.pages?.length) return oldData;
        
        const newPages = oldData.pages.map((page: BullRoomMessage[]) =>
          page.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
        );
        
        return {
          ...oldData,
          pages: newPages,
        };
      }
    );
  }, [queryClient, roomId, batchSize]);

  // Remove a message from the cache
  const removeMessageFromCache = useCallback((messageId: string) => {
    queryClient.setQueryData(
      ['bull-room-messages-infinite', roomId, batchSize],
      (oldData: any) => {
        if (!oldData?.pages?.length) return oldData;
        
        const newPages = oldData.pages.map((page: BullRoomMessage[]) =>
          page.filter(msg => msg.id !== messageId)
        );
        
        return {
          ...oldData,
          pages: newPages,
        };
      }
    );
  }, [queryClient, roomId, batchSize]);



  return {
    ...infiniteQuery,
    messages,
    addMessageToCache,
    updateMessageInCache,
    removeMessageFromCache,
  };
};

/**
 * Hook for creating a new message
 * @param isMuted - Whether the user is currently muted (passed from parent to avoid duplicate hook calls)
 */
export const useCreateMessage = (isMuted: boolean = false) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const toast = useToast();
  
  // Match the cache key structure from useBullRoomMessagesInfinite
  const batchSize = user ? 50 : 10;

  return useMutation({
    mutationFn: async (messageData: Partial<BullRoomMessage>) => {
      // Check if user is muted before sending message (using real-time state)
      if (isMuted) {
        throw new Error('You are currently muted and cannot send messages.');
      }

      return messageService.createMessage({
        ...messageData,
        user_id: user?.id!,
        username: user?.profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Anonymous',
      });
    },
    onMutate: async (messageData) => {
      // Cancel any outgoing refetches for infinite scroll cache
      await queryClient.cancelQueries({ queryKey: ['bull-room-messages-infinite', messageData.room_id, batchSize] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['bull-room-messages-infinite', messageData.room_id, batchSize]);

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

      // Optimistically add message to infinite scroll cache
      queryClient.setQueryData(
        ['bull-room-messages-infinite', messageData.room_id, batchSize],
        (oldData: any) => {
          if (!oldData?.pages?.length) {
            return {
              pages: [[optimisticMessage]],
              pageParams: [0],
            };
          }
          
          // Add to the first page (most recent messages)
          const newPages = [...oldData.pages];
          newPages[0] = [optimisticMessage, ...newPages[0]];
          
          return {
            ...oldData,
            pages: newPages,
          };
        }
      );

      return { previousMessages, optimisticMessage };
    },
    onError: (error, variables, context) => {
      // Rollback on error for infinite scroll cache
      if (context?.previousMessages) {
        queryClient.setQueryData(['bull-room-messages-infinite', variables.room_id, batchSize], context.previousMessages);
      }
      
      // Show appropriate error message
      if (error instanceof Error && error.message.includes('muted')) {
        toast.error('You are currently muted and cannot send messages.');
      } else {
        toast.error('Failed to send message');
      }
      
      console.error('Failed to create message:', error);
    },
    onSuccess: (newMessage, variables, context) => {
      // Replace optimistic message with real one, but be careful about duplicates
      queryClient.setQueryData(
        ['bull-room-messages-infinite', variables.room_id, batchSize],
        (oldData: any) => {
          if (!oldData?.pages?.length) return oldData;
          
          // Process first page where optimistic message would be
          const firstPage = oldData.pages[0] || [];
          
          // Remove optimistic message
          const withoutOptimistic = firstPage.filter((msg: BullRoomMessage) => msg.id !== context?.optimisticMessage?.id);
          
          // Check if real message already exists (from real-time subscription)
          const realMessageExists = withoutOptimistic.some((msg: BullRoomMessage) => msg.id === newMessage.id);
          if (realMessageExists) {
            // Just remove optimistic message
            const newPages = [...oldData.pages];
            newPages[0] = withoutOptimistic;
            return {
              ...oldData,
              pages: newPages,
            };
          }
          
          // Add real message if it doesn't exist
          const newPages = [...oldData.pages];
          newPages[0] = [newMessage, ...withoutOptimistic];
          
          return {
            ...oldData,
            pages: newPages,
          };
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
  
  // Match the cache key structure from useBullRoomMessagesInfinite
  const batchSize = user ? 50 : 10;

  return useMutation({
    mutationFn: ({ messageId, emoji, roomId }: { messageId: string; emoji: string; roomId: string }) =>
      messageService.addReaction(messageId, emoji, user?.id!),
    onMutate: async ({ messageId, emoji, roomId }) => {
      // Cancel any outgoing refetches for infinite scroll cache
      await queryClient.cancelQueries({ queryKey: ['bull-room-messages-infinite', roomId, batchSize] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['bull-room-messages-infinite', roomId, batchSize]);

      // Optimistically update reactions for infinite scroll cache
      queryClient.setQueryData(
        ['bull-room-messages-infinite', roomId, batchSize],
        (oldData: any) => {
          if (!oldData?.pages?.length) {
            return oldData;
          }

          const newPages = oldData.pages.map((page: BullRoomMessage[]) =>
            page.map(msg => {
              if (msg.id === messageId) {
                const reactions = { ...(msg.reactions || {}) };
                const userId = user?.id!;
                const hasReacted = reactions[emoji]?.includes(userId);
                
                if (hasReacted) {
                  // Remove reaction
                  reactions[emoji] = reactions[emoji].filter(id => id !== userId);
                  if (reactions[emoji].length === 0) delete reactions[emoji];
                } else {
                  // Add reaction
                  if (!reactions[emoji]) reactions[emoji] = [];
                  reactions[emoji].push(userId);
                }
                
                return { ...msg, reactions };
              }
              return msg;
            })
          );
          
          return {
            ...oldData,
            pages: newPages,
          };
        }
      );

      return { previousMessages };
    },
    onError: (err, { messageId, emoji, roomId }, context) => {
      // Rollback on error for infinite scroll cache  
      const batchSize = user ? 50 : 10;
      if (context?.previousMessages) {
        queryClient.setQueryData(['bull-room-messages-infinite', roomId, batchSize], context.previousMessages);
      }
      console.error('Failed to toggle reaction:', err);
    },
    onSuccess: (_, { messageId, emoji, roomId }) => {
      // The optimistic update should already be correct since we're using toggle behavior
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