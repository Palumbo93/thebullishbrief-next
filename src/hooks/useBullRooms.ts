import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { BullRoom } from '../lib/database.aliases';
import { useUserPreferences } from './useUserPreferences';
import { isRoomVisibleToUser } from '../utils/preferenceMapping';

/**
 * Hook for fetching Bull Rooms from the database with preference-based filtering
 * Provides loading states, error handling, and caching
 * Filters rooms based on user preferences:
 * - 'general' room is always available
 * - Other rooms are only shown if they match user preferences
 */
export const useBullRooms = () => {
  const { data: userPreferences } = useUserPreferences();

  return useQuery({
    queryKey: ['bull-rooms', userPreferences],
    queryFn: async (): Promise<BullRoom[]> => {
      const { data, error } = await supabase
        .from('bull_rooms')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching bull rooms:', error);
        throw new Error(`Failed to fetch bull rooms: ${error.message}`);
      }

      const allRooms = data || [];
      
      // Filter rooms based on user preferences
      const filteredRooms = allRooms.filter(room => 
        isRoomVisibleToUser(room.slug, userPreferences)
      );

      return filteredRooms;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for fetching a single Bull Room by slug
 */
export const useBullRoom = (slug: string) => {
  return useQuery({
    queryKey: ['bull-room', slug],
    queryFn: async (): Promise<BullRoom | null> => {
      const { data, error } = await supabase
        .from('bull_rooms')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching bull room:', error);
        throw new Error(`Failed to fetch bull room: ${error.message}`);
      }

      return data;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}; 