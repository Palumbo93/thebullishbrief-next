import { useQuery } from '@tanstack/react-query';
import { supabase, hasSupabaseCredentials } from '../lib/supabase';
import { Brief } from '../lib/database.aliases';
import { queryKeys } from '../lib/queryClient';
import { CACHE_TTL } from '../lib/cacheStorage';

/**
 * Convert Supabase brief to local Brief format
 */
const convertSupabaseBrief = (brief: Brief): Brief & { date: string } => {
  return {
    ...brief,
    // Ensure all fields are properly typed
    tickers: brief.tickers || null,
    view_count: brief.view_count || 0,
    reading_time_minutes: brief.reading_time_minutes || 5,
    featured: brief.featured || false,
    sponsored: brief.sponsored || false,
    show_cta: brief.show_cta || false,
    company_name: brief.company_name || null,
    company_logo_url: brief.company_logo_url || null,
    // Add formatted date
    date: new Date((brief as any).published_at || brief.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
  };
};

/**
 * Fetch the latest featured brief from Supabase
 */
const fetchFeaturedBrief = async (): Promise<Brief | null> => {
  if (!hasSupabaseCredentials) {
    throw new Error('Database connection not configured');
  }

  const { data: briefData, error: briefError } = await supabase
    .from('briefs')
    .select('*')
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (briefError) {
    if (briefError.code === 'PGRST116') {
      // No featured brief found
      return null;
    }
    throw briefError;
  }

  return convertSupabaseBrief(briefData);
};

/**
 * Fetch a single brief by slug from Supabase
 */
const fetchBriefBySlug = async (slug: string): Promise<Brief> => {
  if (!hasSupabaseCredentials) {
    throw new Error('Database connection not configured');
  }

  const { data: briefData, error: briefError } = await supabase
    .from('briefs')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (briefError) {
    if (briefError.code === 'PGRST116') {
      throw new Error(`Brief with slug "${slug}" not found`);
    }
    throw briefError;
  }

  return convertSupabaseBrief(briefData);
};

/**
 * Fetch a single brief by slug including drafts (for admin/preview use)
 */
const fetchBriefBySlugIncludingDrafts = async (slug: string): Promise<Brief> => {
  if (!hasSupabaseCredentials) {
    throw new Error('Database connection not configured');
  }

  const { data: briefData, error: briefError } = await supabase
    .from('briefs')
    .select('*')
    .eq('slug', slug)
    .in('status', ['published', 'draft'])
    .single();

  if (briefError) {
    if (briefError.code === 'PGRST116') {
      throw new Error(`Brief with slug "${slug}" not found`);
    }
    throw briefError;
  }

  return convertSupabaseBrief(briefData);
};

/**
 * Fetch raw brief data by slug for metadata generation
 */
export const fetchBriefBySlugForMetadata = async (slug: string): Promise<any> => {
  if (!hasSupabaseCredentials) {
    throw new Error('Database connection not configured');
  }

  const { data: briefData, error: briefError } = await supabase
    .from('briefs')
    .select('*')
    .eq('slug', slug)
    .in('status', ['published', 'draft'])
    .single();

  if (briefError) {
    if (briefError.code === 'PGRST116') {
      throw new Error(`Brief with slug "${slug}" not found`);
    }
    throw briefError;
  }

  return briefData;
};

/**
 * Hook for fetching the latest featured brief
 */
export const useFeaturedBrief = () => {
  return useQuery({
    queryKey: queryKeys.briefs.featured(),
    queryFn: fetchFeaturedBrief,
    staleTime: CACHE_TTL.FEATURED_ARTICLES, // Use same cache as featured articles
    gcTime: CACHE_TTL.FEATURED_ARTICLES * 2,
  });
};

/**
 * Hook for fetching a single brief by slug
 */
export const useBriefBySlug = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.briefs.detail(slug),
    queryFn: () => fetchBriefBySlug(slug),
    staleTime: CACHE_TTL.ARTICLES, // Use same cache as articles
    gcTime: CACHE_TTL.ARTICLES * 2,
    enabled: !!slug && slug.trim() !== '',
  });
};

/**
 * Hook for fetching a single brief by slug including drafts
 */
export const useBriefBySlugIncludingDrafts = (slug: string) => {
  return useQuery({
    queryKey: ['briefs', 'detailWithDrafts', slug],
    queryFn: () => fetchBriefBySlugIncludingDrafts(slug),
    staleTime: CACHE_TTL.ARTICLES, // Use same cache as articles
    gcTime: CACHE_TTL.ARTICLES * 2,
    enabled: !!slug && slug.trim() !== '',
  });
};

/**
 * Hook for fetching all briefs (for admin use only)
 */
export const useAllBriefs = () => {
  return useQuery({
    queryKey: queryKeys.briefs.all,
    queryFn: async () => {
      if (!hasSupabaseCredentials) {
        throw new Error('Database connection not configured');
      }

      const { data: briefsData, error: briefsError } = await supabase
        .from('briefs')
        .select('*')
        .order('created_at', { ascending: false });

      if (briefsError) throw briefsError;

      return (briefsData || []).map(convertSupabaseBrief);
    },
    staleTime: CACHE_TTL.ARTICLES,
    gcTime: CACHE_TTL.ARTICLES * 2,
  });
};

/**
 * Fetch all brief slugs for static generation
 */
export const fetchAllBriefSlugs = async (): Promise<string[]> => {
  if (!hasSupabaseCredentials) {
    throw new Error('Database connection not configured');
  }

  const { data: briefsData, error: briefsError } = await supabase
    .from('briefs')
    .select('slug')
    .in('status', ['published', 'draft']);

  if (briefsError) throw briefsError;

  return (briefsData || []).map(brief => brief.slug);
}; 