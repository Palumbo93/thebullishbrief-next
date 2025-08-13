import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface UserPreferences {
  investorType?: string;
  experience?: string;
  riskTolerance?: string;
  interests?: string[];
  country?: string;
  onboardingCompleted?: boolean;
  completedAt?: string;
}

/**
 * Hook for fetching user preferences from the database
 * Provides loading states, error handling, and caching
 */
export const useUserPreferences = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-preferences', user?.id],
    queryFn: async (): Promise<UserPreferences | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user preferences:', error);
        throw new Error(`Failed to fetch user preferences: ${error.message}`);
      }

      return data?.preferences || null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
