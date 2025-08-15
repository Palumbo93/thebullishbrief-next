import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { BullRoomMessage } from '../types/bullRoom.types';

// Function to fetch user profile data
const fetchUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .rpc('get_user_profile_public', { user_id: userId });
    
    if (!error && data && data.length > 0) {
      return data[0];
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
  }
  return null;
};

/**
 * Hook for real-time Bull Room messaging using Supabase Broadcast
 */
export const useBullRoomRealtime = (roomId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Track subscription status
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!roomId || !user) {
      setIsSubscribed(false);
      return;
    }

    
    // Set auth for Realtime Authorization (required for Broadcast)
    // Get the current session and set the auth token
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        supabase.realtime.setAuth(session.access_token);
      }
    });
    
    const channel = supabase
      .channel(`bull-room:${roomId}`, {
        config: { private: true }, // Private channel for Broadcast
      })
      .on('presence', { event: 'sync' }, () => {
        // Presence sync event
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        // Presence join event
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        // Presence leave event
      })
      // Listen for broadcast events from both tables
      .on('broadcast', { event: 'INSERT' }, async (payload: any) => {
        
        const table = payload.payload?.table;
        const record = payload.payload?.record;
        
        if (!table || !record) {
          console.warn('⚠️ Invalid INSERT payload:', payload);
          return;
        }
        
        // Handle messages
        if (table === 'bull_room_messages') {
          const newMessage = record as BullRoomMessage;
          
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
                  profile_image: null // Will be populated by the service
                }
              };
              
              return [messageWithUser, ...oldData];
            }
          );
          
          // Fetch user profile data and update the message
          const userProfile = await fetchUserProfile(newMessage.user_id);
          if (userProfile) {
            queryClient.setQueryData(
              ['bull-room-messages', roomId],
              (oldData: BullRoomMessage[] = []) => {
                return oldData.map(msg => 
                  msg.id === newMessage.id 
                    ? {
                        ...msg,
                        user: {
                          ...msg.user,
                          profile_image: userProfile.profile_image
                        }
                      }
                    : msg
                );
              }
            );
          }
        }
        
        // Handle reactions
        else if (table === 'bull_room_reactions') {
          
          // Validate payload
          if (!record.message_id || !record.user_id || !record.emoji) {
            console.warn('⚠️ Invalid reaction INSERT payload:', payload);
            return;
          }
          
          const newReaction = record;
          
          // Skip if this is our own reaction (optimistic update already handled it)
          if (newReaction.user_id === user?.id) {
            return;
          }
          
          
          // Fast reaction update for other users' reactions
          queryClient.setQueryData(
            ['bull-room-messages', roomId],
            (oldData: BullRoomMessage[] = []) => {
              return oldData.map(msg => {
                if (msg.id === newReaction.message_id) {
                  const reactions = { ...(msg.reactions || {}) };
                  if (!reactions[newReaction.emoji]) {
                    reactions[newReaction.emoji] = [];
                  }
                  // Only add if not already present (prevent duplicates)
                  if (!reactions[newReaction.emoji].includes(newReaction.user_id)) {
                    reactions[newReaction.emoji].push(newReaction.user_id);
                  }
                  return { ...msg, reactions };
                }
                return msg;
              });
            }
          );
        }
      })
      .on('broadcast', { event: 'UPDATE' }, (payload: any) => {
        
        const table = payload.payload?.table;
        const record = payload.payload?.record;
        
        if (!table || !record) {
          console.warn('⚠️ Invalid UPDATE payload:', payload);
          return;
        }
        
        // Handle message updates
        if (table === 'bull_room_messages') {
          const updatedMessage = record as BullRoomMessage;
          
          // Fast message update
          queryClient.setQueryData(
            ['bull-room-messages', roomId],
            (oldData: BullRoomMessage[] = []) =>
              oldData.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg)
          );
        }
        
        // Handle reaction updates (if needed)
        else if (table === 'bull_room_reactions') {
          // Add reaction update logic here if needed
        }
      })
      .on('broadcast', { event: 'DELETE' }, (payload: any) => {
        
        const table = payload.payload?.table;
        const oldRecord = payload.payload?.old_record;
        
        if (!table || !oldRecord) {
          console.warn('⚠️ Invalid DELETE payload:', payload);
          return;
        }
        
        // Handle message deletions
        if (table === 'bull_room_messages') {
          const deletedMessageId = oldRecord.id;
          
          if (!deletedMessageId) {
            console.warn('⚠️ DELETE broadcast missing old_record.id:', payload);
            return;
          }
          
          // Fast message removal
          queryClient.setQueryData(
            ['bull-room-messages', roomId],
            (oldData: BullRoomMessage[] = []) => {
              const filtered = oldData.filter(msg => msg.id !== deletedMessageId);
              return filtered;
            }
          );
        }
        
        // Handle reaction deletions
        else if (table === 'bull_room_reactions') {
          
          // For DELETE events, we get the full old record with Broadcast!
          const deletedReaction = oldRecord;
          if (!deletedReaction.id) {
            console.warn('⚠️ DELETE broadcast missing old_record:', payload);
            return;
          }
          
          
          // Since we have the full old record, we can directly remove the reaction
          queryClient.setQueryData(
            ['bull-room-messages', roomId],
            (oldData: BullRoomMessage[] = []) => {
              return oldData.map(msg => {
                if (msg.id === deletedReaction.message_id) {
                  const reactions = { ...(msg.reactions || {}) };
                  
                  if (reactions[deletedReaction.emoji]) {
                    const beforeCount = reactions[deletedReaction.emoji].length;
                    reactions[deletedReaction.emoji] = reactions[deletedReaction.emoji].filter(
                      id => id !== deletedReaction.user_id
                    );
                    const afterCount = reactions[deletedReaction.emoji].length;
                    
                    if (reactions[deletedReaction.emoji].length === 0) {
                      delete reactions[deletedReaction.emoji];
                    }
                  } else {
                  }
                  
                  return { ...msg, reactions };
                }
                return msg;
              });
            }
          );
        }
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsSubscribed(true);
          
          
        } else if (status === 'CHANNEL_ERROR') {
          setIsSubscribed(false);
        } else if (status === 'TIMED_OUT') {
          setIsSubscribed(false);
        } else if (status === 'CLOSED') {
          setIsSubscribed(false);
        } else {
          setIsSubscribed(false);
        }
      });

    return () => {
      setIsSubscribed(false);
      supabase.removeChannel(channel);
    };
  }, [roomId, user?.id]);
}; 