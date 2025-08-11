import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Author } from '../services/database';

interface UseAuthorBySlugReturn {
  author: Author | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch author data by slug
 */
export const useAuthorBySlug = (slug: string): UseAuthorBySlugReturn => {
  const [author, setAuthor] = useState<Author | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuthor = async () => {
      if (!slug) {
        setError('No author slug provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('authors')
          .select('*')
          .eq('slug', slug)
          .single();

        if (supabaseError) {
          if (supabaseError.code === 'PGRST116') {
            // No rows returned
            setError('Author not found');
          } else {
            setError('Failed to fetch author');
          }
          setAuthor(null);
        } else {
          setAuthor(data);
        }
      } catch (err) {
        setError('Failed to fetch author');
        setAuthor(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthor();
  }, [slug]);

  return { author, isLoading, error };
}; 