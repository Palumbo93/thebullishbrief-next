import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useConfirm } from './useConfirm';
import { supabase } from '../lib/supabase';
import { useToast } from './useToast';

/**
 * Hook for admin-specific bull room actions
 * Provides admin delete, mute user, and bulk delete functionality
 */
export const useAdminBullRoomActions = (roomId?: string) => {
  const { user, hasRole } = useAuth();
  const confirm = useConfirm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [mutedUsers, setMutedUsers] = useState<Set<string>>(new Set());
  
  const isAdmin = hasRole('admin');

  // Load muted users on mount and set up real-time subscription
  useEffect(() => {
    if (!isAdmin) return;

    const loadMutedUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('user_restrictions')
          .select('user_id')
          .eq('restriction_type', 'muted')
          .or('expires_at.is.null,expires_at.gt.now()'); // Active restrictions only

        if (!error && data) {
          setMutedUsers(new Set(data.map(r => r.user_id)));
        }
      } catch (error) {
        console.error('Error loading muted users:', error);
      }
    };

    loadMutedUsers();

    // Subscribe to restriction changes
    const channel = supabase
      .channel('admin-user-restrictions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_restrictions',
          filter: 'restriction_type=eq.muted',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newRestriction = payload.new;
            setMutedUsers(prev => new Set([...prev, newRestriction.user_id]));
          } else if (payload.eventType === 'DELETE') {
            const deletedRestriction = payload.old;
            setMutedUsers(prev => {
              const newSet = new Set(prev);
              newSet.delete(deletedRestriction.user_id);
              return newSet;
            });
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [isAdmin]);

  // Admin delete message (bypasses ownership check)
  const adminDeleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('bull_room_messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        throw new Error(`Failed to delete message: ${error.message}`);
      }
    },
    onSuccess: (_, messageId) => {
      // Remove from all relevant caches
      queryClient.setQueryData(
        ['bull-room-messages', roomId],
        (oldData: any[] = []) => oldData.filter(msg => msg.id !== messageId)
      );
      
      // Remove from infinite scroll cache
      const batchSizes = [10, 50]; // Common batch sizes
      batchSizes.forEach(batchSize => {
        queryClient.setQueryData(
          ['bull-room-messages-infinite', roomId, batchSize],
          (oldData: any) => {
            if (!oldData?.pages?.length) return oldData;
            
            const newPages = oldData.pages.map((page: any[]) =>
              page.filter(msg => msg.id !== messageId)
            );
            
            return {
              ...oldData,
              pages: newPages,
            };
          }
        );
      });
      
      toast.success('Message deleted');
    },
    onError: (error) => {
      console.error('Admin delete message error:', error);
      toast.error('Failed to delete message');
    }
  });

  // Mute user
  const muteUserMutation = useMutation({
    mutationFn: async ({ 
      userId, 
      reason, 
      duration 
    }: { 
      userId: string; 
      reason?: string; 
      duration?: number; // hours, null for permanent
    }) => {
      const expires_at = duration ? 
        new Date(Date.now() + duration * 60 * 60 * 1000).toISOString() : 
        null;

      const { error } = await supabase
        .from('user_restrictions')
        .insert({
          user_id: userId,
          restriction_type: 'muted',
          restricted_by: user?.id,
          reason: reason || 'Admin action',
          expires_at
        });

      if (error) {
        throw new Error(`Failed to mute user: ${error.message}`);
      }
    },
    onSuccess: (_, { duration }) => {
      const durationText = duration ? `for ${duration} hours` : 'permanently';
      toast.success(`User muted ${durationText}`);
    },
    onError: (error) => {
      console.error('Mute user error:', error);
      toast.error('Failed to mute user');
    }
  });

  // Unmute user
  const unmuteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('user_restrictions')
        .delete()
        .eq('user_id', userId)
        .eq('restriction_type', 'muted');

      if (error) {
        throw new Error(`Failed to unmute user: ${error.message}`);
      }
    },
    onSuccess: () => {
      toast.success('User unmuted');
    },
    onError: (error) => {
      console.error('Unmute user error:', error);
      toast.error('Failed to unmute user');
    }
  });

  // Delete all messages from user
  const deleteAllUserMessagesMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('bull_room_messages')
        .delete()
        .eq('user_id', userId)
        .eq('room_id', roomId);

      if (error) {
        throw new Error(`Failed to delete user messages: ${error.message}`);
      }
    },
    onSuccess: (_, userId) => {
      // Invalidate all message caches to refresh the view
      queryClient.invalidateQueries({ queryKey: ['bull-room-messages'] });
      toast.success('All user messages deleted');
    },
    onError: (error) => {
      console.error('Delete all user messages error:', error);
      toast.error('Failed to delete user messages');
    }
  });

  // Check if user is muted
  const checkUserMuted = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('user_has_restriction', {
          p_user_id: userId,
          p_restriction_type: 'muted'
        });

      if (error) {
        console.error('Error checking user restriction:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in checkUserMuted:', error);
      return false;
    }
  };

  // Admin delete message handler
  const handleAdminDeleteMessage = (
    messageId: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    if (!isAdmin || !roomId) {
      onError?.(new Error('Admin access required'));
      return;
    }

    confirm.danger(
      'Admin Delete Message',
      'Are you sure you want to delete this message? This action cannot be undone.',
      async () => {
        adminDeleteMessageMutation.mutate(messageId, {
          onSuccess: () => onSuccess?.(),
          onError: (error) => onError?.(error)
        });
      }
    );
  };

  // Mute user handler
  const handleMuteUser = (
    userId: string,
    username: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    if (!isAdmin) {
      onError?.(new Error('Admin access required'));
      return;
    }

    confirm.danger(
      'Mute User',
      `Are you sure you want to mute ${username}? They will not be able to send messages.`,
      async () => {
        muteUserMutation.mutate(
          { userId, reason: 'Admin moderation action' },
          {
            onSuccess: () => onSuccess?.(),
            onError: (error) => onError?.(error)
          }
        );
      }
    );
  };

  // Unmute user handler
  const handleUnmuteUser = (
    userId: string,
    username: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    if (!isAdmin) {
      onError?.(new Error('Admin access required'));
      return;
    }

    confirm.danger(
      'Unmute User',
      `Are you sure you want to unmute ${username}? They will be able to send messages again.`,
      async () => {
        unmuteUserMutation.mutate(userId, {
          onSuccess: () => onSuccess?.(),
          onError: (error) => onError?.(error)
        });
      }
    );
  };

  // Toggle mute/unmute based on current state
  const handleToggleMute = (
    userId: string,
    username: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    const isMuted = mutedUsers.has(userId);
    if (isMuted) {
      handleUnmuteUser(userId, username, onSuccess, onError);
    } else {
      handleMuteUser(userId, username, onSuccess, onError);
    }
  };

  // Delete all user messages handler
  const handleDeleteAllUserMessages = (
    userId: string,
    username: string,
    onSuccess?: () => void,
    onError?: (error: Error) => void
  ) => {
    if (!isAdmin || !roomId) {
      onError?.(new Error('Admin access required'));
      return;
    }

    confirm.danger(
      'Delete All User Messages',
      `Are you sure you want to delete ALL messages from ${username}? This action cannot be undone.`,
      async () => {
        deleteAllUserMessagesMutation.mutate(userId, {
          onSuccess: () => onSuccess?.(),
          onError: (error) => onError?.(error)
        });
      }
    );
  };

  return {
    // State
    isAdmin,
    mutedUsers,
    isUserMuted: (userId: string) => mutedUsers.has(userId),
    
    // Actions
    handleAdminDeleteMessage,
    handleMuteUser,
    handleUnmuteUser,
    handleToggleMute,
    handleDeleteAllUserMessages,
    checkUserMuted,
    
    // Loading states
    isAdminDeleting: adminDeleteMessageMutation.isPending,
    isMuting: muteUserMutation.isPending,
    isUnmuting: unmuteUserMutation.isPending,
    isDeletingAllUserMessages: deleteAllUserMessagesMutation.isPending,
    
    // Any action loading
    isAdminActionLoading: 
      adminDeleteMessageMutation.isPending || 
      muteUserMutation.isPending || 
      unmuteUserMutation.isPending ||
      deleteAllUserMessagesMutation.isPending
  };
};
