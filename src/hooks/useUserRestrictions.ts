import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from './useToast';

/**
 * Hook for managing user restrictions with real-time updates
 * Listens for mute/unmute events and provides current restriction status
 */
export const useUserRestrictions = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [restrictions, setRestrictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [lastErrorTime, setLastErrorTime] = useState<number | null>(null);

  // Check current user restrictions with retry logic
  const checkUserRestrictions = useCallback(async (skipRetryLogic: boolean = false) => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    // Implement exponential backoff to prevent spam
    if (!skipRetryLogic && lastErrorTime) {
      const timeSinceLastError = Date.now() - lastErrorTime;
      const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
      
      if (timeSinceLastError < backoffTime) {
        setTimeout(() => checkUserRestrictions(true), backoffTime - timeSinceLastError);
        return;
      }
    }

    try {
      const { data, error } = await supabase
        .rpc('user_has_restriction', {
          p_user_id: user.id,
          p_restriction_type: 'muted'
        });

      if (error) {
        throw error;
      }
      
      setIsMuted(data || false);

      // Also fetch full restrictions list for detailed info
      const { data: fullRestrictions, error: restrictionsError } = await supabase
        .from('user_restrictions')
        .select('*')
        .eq('user_id', user.id)
        .or('expires_at.is.null,expires_at.gt.now()'); // Active restrictions only

      if (restrictionsError) {
        throw restrictionsError;
      }
      
      setRestrictions(fullRestrictions || []);
      
      // Reset retry count on success
      setRetryCount(0);
      setLastErrorTime(null);
    } catch (error) {
      console.error('Error in checkUserRestrictions:', error);
      
      // Update retry logic
      setRetryCount(prev => prev + 1);
      setLastErrorTime(Date.now());
      
      // Don't retry indefinitely - stop after 5 attempts
      if (retryCount >= 5) {
        console.error('Max retries reached for user restrictions check. Giving up.');
        setLoading(false);
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, retryCount, lastErrorTime]);

  // Initial check on user change
  useEffect(() => {
    if (!user?.id) return;
    checkUserRestrictions();
  }, [user?.id]); // Only depend on user.id

  // Set up real-time subscription for restriction changes
  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to restriction changes
    const channel = supabase
      .channel('user-restrictions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_restrictions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {          
          if (payload.eventType === 'INSERT') {
            const newRestriction = payload.new;
            if (newRestriction.restriction_type === 'muted') {
              setIsMuted(true);
              toast.error('You have been muted by an administrator');
            }
            setRestrictions(prev => [...prev, newRestriction]);
          } 
          else if (payload.eventType === 'DELETE') {
            const deletedRestriction = payload.old;
            if (deletedRestriction.restriction_type === 'muted') {
              setIsMuted(false);
              toast.success('You have been unmuted');
            }
            setRestrictions(prev => 
              prev.filter(r => r.id !== deletedRestriction.id)
            );
          }
          else if (payload.eventType === 'UPDATE') {
            const updatedRestriction = payload.new;
            setRestrictions(prev => 
              prev.map(r => r.id === updatedRestriction.id ? updatedRestriction : r)
            );
            
            // Check if mute status changed due to expiration
            if (updatedRestriction.restriction_type === 'muted') {
              const isExpired = updatedRestriction.expires_at && 
                new Date(updatedRestriction.expires_at) <= new Date();
              setIsMuted(!isExpired);
            }
          }
        }
      )
      .subscribe();

    // Also listen to generic notifications (for cross-tab updates)
    const handleNotification = (payload: any) => {
      try {
        const data = JSON.parse(payload.payload);
        if (data.user_id === user.id && data.restriction_type === 'muted') {
          if (data.type === 'INSERT') {
            setIsMuted(true);
            toast.error('You have been muted by an administrator');
          } else if (data.type === 'DELETE') {
            setIsMuted(false);
            toast.success('You have been unmuted');
          }
        }
      } catch (error) {
        console.error('Error parsing restriction notification:', error);
      }
    };

    // Subscribe to PostgreSQL notifications
    const notificationChannel = supabase
      .channel('user_restriction_notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_restrictions' }, handleNotification)
      .subscribe();

    return () => {
      channel.unsubscribe();
      notificationChannel.unsubscribe();
    };
  }, [user?.id, toast]); // Removed checkUserRestrictions to prevent infinite re-runs

  // Helper to get active mute restriction details
  const getMuteDetails = useCallback(() => {
    const muteRestriction = restrictions.find(r => 
      r.restriction_type === 'muted' && 
      (!r.expires_at || new Date(r.expires_at) > new Date())
    );
    
    return muteRestriction ? {
      reason: muteRestriction.reason,
      expiresAt: muteRestriction.expires_at,
      restrictedBy: muteRestriction.restricted_by,
      createdAt: muteRestriction.created_at
    } : null;
  }, [restrictions]);

  return {
    isMuted,
    restrictions,
    loading,
    getMuteDetails,
    refreshRestrictions: checkUserRestrictions
  };
};
