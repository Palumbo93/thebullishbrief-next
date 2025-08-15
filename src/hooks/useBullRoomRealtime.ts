import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BullRoomMessage } from '../types/bullRoom.types';

/**
 * Hook for real-time Bull Room messaging using Supabase realtime
 */
export const useBullRoomRealtime = (roomId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  useEffect(() => {
    if (!roomId || !user) return;

    const channel = supabase
      .channel(`bull-room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bull_room_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMessage = payload.new as BullRoomMessage;
          
          // Fast message update - skip if it's our own optimistic message
          queryClient.setQueryData(
            ['bull-room-messages', roomId],
            (oldData: BullRoomMessage[] = []) => {
              // Don't add if we already have this message (from optimistic update)
              const exists = oldData.some(msg => msg.id === newMessage.id);
              if (exists) return oldData;
              
              // Check for duplicate content from same user within last 5 seconds (optimistic update)
              const fiveSecondsAgo = new Date(Date.now() - 5000).toISOString();
              const duplicateContent = oldData.some(msg => 
                msg.content === newMessage.content && 
                msg.user_id === newMessage.user_id &&
                msg.created_at > fiveSecondsAgo
              );
              if (duplicateContent) return oldData;
              
              // Add user data to message for consistency
              const messageWithUser = {
                ...newMessage,
                user: {
                  id: newMessage.user_id,
                  username: newMessage.username,
                }
              };
              
              return [messageWithUser, ...oldData];
            }
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bull_room_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const updatedMessage = payload.new as BullRoomMessage;
          
          // Fast message update
          queryClient.setQueryData(
            ['bull-room-messages', roomId],
            (oldData: BullRoomMessage[] = []) =>
              oldData.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bull_room_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const deletedMessageId = payload.old.id;
          
          // Fast message removal
          queryClient.setQueryData(
            ['bull-room-messages', roomId],
            (oldData: BullRoomMessage[] = []) =>
              oldData.filter(msg => msg.id !== deletedMessageId)
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bull_room_reactions',
        },
        (payload) => {
          const newReaction = payload.new;
          
          // Fast reaction update - only if not our own reaction (optimistic update handles ours)
          queryClient.setQueryData(
            ['bull-room-messages', roomId],
            (oldData: BullRoomMessage[] = []) => {
              return oldData.map(msg => {
                if (msg.id === newReaction.message_id) {
                  const reactions = { ...(msg.reactions || {}) };
                  if (!reactions[newReaction.emoji]) {
                    reactions[newReaction.emoji] = [];
                  }
                  reactions[newReaction.emoji].push(newReaction.user_id);
                  return { ...msg, reactions };
                }
                return msg;
              });
            }
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'bull_room_reactions',
        },
        (payload) => {
          const deletedReaction = payload.old;
          
          // Fast reaction removal
          queryClient.setQueryData(
            ['bull-room-messages', roomId],
            (oldData: BullRoomMessage[] = []) => {
              return oldData.map(msg => {
                if (msg.id === deletedReaction.message_id) {
                  const reactions = { ...(msg.reactions || {}) };
                  if (reactions[deletedReaction.emoji]) {
                    reactions[deletedReaction.emoji] = reactions[deletedReaction.emoji].filter(
                      id => id !== deletedReaction.user_id
                    );
                    if (reactions[deletedReaction.emoji].length === 0) {
                      delete reactions[deletedReaction.emoji];
                    }
                  }
                  return { ...msg, reactions };
                }
                return msg;
              });
            }
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, queryClient]);
}; 