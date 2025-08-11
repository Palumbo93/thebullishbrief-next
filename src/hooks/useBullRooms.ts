import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { BullRoom } from '../lib/database.types';

/**
 * Hook for fetching Bull Rooms from the database
 * Provides loading states, error handling, and caching
 */
export const useBullRooms = () => {
  return useQuery({
    queryKey: ['bull-rooms'],
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

      return data || [];
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