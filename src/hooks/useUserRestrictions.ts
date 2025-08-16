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

  // Check current user restrictions on mount
  const checkUserRestrictions = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .rpc('user_has_restriction', {
          p_user_id: user.id,
          p_restriction_type: 'muted'
        });

      if (error) {
        console.error('Error checking user restrictions:', error);
      } else {
        setIsMuted(data || false);
      }

      // Also fetch full restrictions list for detailed info
      const { data: fullRestrictions, error: restrictionsError } = await supabase
        .from('user_restrictions')
        .select('*')
        .eq('user_id', user.id)
        .or('expires_at.is.null,expires_at.gt.now()'); // Active restrictions only

      if (!restrictionsError) {
        setRestrictions(fullRestrictions || []);
      }
    } catch (error) {
      console.error('Error in checkUserRestrictions:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Set up real-time subscription for restriction changes
  useEffect(() => {
    if (!user?.id) return;

    // Initial check
    checkUserRestrictions();

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
          console.log('User restriction change:', payload);
          
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
  }, [user?.id, checkUserRestrictions, toast]);

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
