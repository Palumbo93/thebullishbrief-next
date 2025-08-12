import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { BullRoom } from '../lib/database.aliases';

/**
 * Hook for fetching all Bull Rooms (including inactive ones for admin)
 */
export const useAdminBullRooms = () => {
  return useQuery({
    queryKey: ['admin-bull-rooms'],
    queryFn: async (): Promise<BullRoom[]> => {
      const { data, error } = await supabase
        .from('bull_rooms')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw new Error(`Failed to fetch bull rooms: ${error.message}`);
      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook for creating a new Bull Room
 */
export const useCreateBullRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (room: Omit<BullRoom, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('bull_rooms')
        .insert(room)
        .select()
        .single();

      if (error) throw new Error(`Failed to create bull room: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bull-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['bull-rooms'] });
    },
  });
};

/**
 * Hook for updating an existing Bull Room
 */
export const useUpdateBullRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<BullRoom> & { id: string }) => {
      const { data, error } = await supabase
        .from('bull_rooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(`Failed to update bull room: ${error.message}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bull-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['bull-rooms'] });
    },
  });
};

/**
 * Hook for deleting a Bull Room
 */
export const useDeleteBullRoom = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bull_rooms')
        .delete()
        .eq('id', id);

      if (error) throw new Error(`Failed to delete bull room: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-bull-rooms'] });
      queryClient.invalidateQueries({ queryKey: ['bull-rooms'] });
    },
  });
};
