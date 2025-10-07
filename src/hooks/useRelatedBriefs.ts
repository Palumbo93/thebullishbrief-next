import { useQuery } from '@tanstack/react-query';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '../lib/database.types';

/**
 * Hook to fetch related briefs by company name
 * @param companyName - Company name to search for
 * @param currentBriefId - Current brief ID to exclude from results
 * @param limit - Maximum number of related briefs to return (default: 3)
 */
export function useRelatedBriefs(companyName: string | undefined, currentBriefId: string | undefined, limit: number = 3) {
  return useQuery({
    queryKey: ['relatedBriefs', companyName, currentBriefId],
    queryFn: async () => {
      if (!companyName) {
        return [];
      }

      const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('briefs')
        .select('id, title, slug, published_at, created_at, reading_time_minutes, featured_image_url')
        .eq('company_name', companyName)
        .neq('id', currentBriefId || '')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching related briefs:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!companyName && !!currentBriefId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

