import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

/**
 * Hook for managing typing indicators in real-time chat
 */
export const useTypingIndicator = (roomId: string) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Send typing status
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!user || !roomId) return;

    // Get username from user profile first, fallback to auth metadata, then to 'Anonymous'
    const username = user.profile?.username || user.user_metadata?.username || 'Anonymous';

    supabase.channel(`typing-${roomId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        user_id: user.id,
        username: username,
        is_typing: isTyping,
        room_id: roomId,
      },
    });
  }, [user, roomId]);

  // Start typing
  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingStatus(true);
    }
  }, [isTyping, sendTypingStatus]);

  // Stop typing
  const stopTyping = useCallback(() => {
    if (isTyping) {
      setIsTyping(false);
      sendTypingStatus(false);
    }
  }, [isTyping, sendTypingStatus]);

  // Listen for typing events
  useEffect(() => {
    if (!roomId || !user) return;

    const channel = supabase.channel(`typing-${roomId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        const { user_id, username, is_typing } = payload.payload;
        
        if (user_id === user?.id) return; // Don't show own typing

        setTypingUsers(prev => {
          if (is_typing) {
            // Add user to typing list
            if (!prev.includes(username)) {
              return [...prev, username];
            }
          } else {
            // Remove user from typing list
            return prev.filter(name => name !== username);
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, user?.id]);

  // Auto-stop typing after 3 seconds of inactivity
  useEffect(() => {
    if (!isTyping) return;

    const timeout = setTimeout(() => {
      stopTyping();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [isTyping, stopTyping]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
    isTyping,
  };
}; 