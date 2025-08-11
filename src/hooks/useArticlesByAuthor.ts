import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Article } from '../services/database';

interface UseArticlesByAuthorReturn {
  articles: Article[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to fetch articles by author ID
 */
export const useArticlesByAuthor = (authorId: string): UseArticlesByAuthorReturn => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      if (!authorId) {
        setError('No author ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('articles')
          .select(`
            *,
            category:categories(*)
          `)
          .eq('author_id', authorId)
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (supabaseError) {
          setError('Failed to fetch articles');
          setArticles([]);
        } else {
          setArticles(data || []);
        }
      } catch (err) {
        setError('Failed to fetch articles');
        setArticles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [authorId]);

  return { articles, isLoading, error };
}; 