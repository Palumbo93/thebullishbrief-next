import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, hasSupabaseCredentials } from '../lib/supabase';
import { Tables } from '../lib/database.types';
import { Article as DatabaseArticle, Category, Tag } from '../lib/database.aliases';
import { queryKeys } from '../lib/queryClient';
import { CACHE_TTL } from '../lib/cacheStorage';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from './useToast';

// Extended types for articles with relations
type ArticleWithRelations = any;
type CategoryWithCount = any;
type TagWithCount = any;

export interface Article {
  id: number | string;
  category: string;
  title: string;
  subtitle: string;
  author: string;
  authorAvatar?: string;
  authorSlug?: string;
  time: string;
  date: string;
  image: string;
  views: string;
  tags?: string[];
  featured?: boolean;
  content?: string;
  premium?: boolean;
  slug?: string;
  bookmark_count?: number;
  comment_count?: number;
  featured_color?: string;
}

/**
 * Convert Supabase article to local Article format
 */
const convertSupabaseArticle = (article: ArticleWithRelations): Article => {
  return {
    id: article.id,
    title: article.title,
    subtitle: article.subtitle || '',
    content: article.content,
    author: article.author?.name || 'Unknown Author',
    authorAvatar: article.author?.avatar_url || undefined,
    authorSlug: article.author?.slug || undefined,
    category: article.category?.name || 'Uncategorized',
    image: article.featured_image_url || 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1200',
    views: article.view_count.toLocaleString(),
    time: `${article.reading_time_minutes} min read`,
    date: new Date(article.published_at || article.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    tags: article.tags?.map((tag: any) => tag.name) || [],
    featured: article.featured,
    premium: article.premium,
    slug: article.slug,
    bookmark_count: article.bookmark_count || 0,
    comment_count: article.comment_count || 0,
    featured_color: article.featured_color
  };
};

/**
 * Fetch articles from Supabase with caching
 */
const fetchArticlesFromSupabase = async (): Promise<{
  articles: Article[];
  featuredArticles: Article[];
  categories: CategoryWithCount[];
  tags: TagWithCount[];
}> => {
  if (!hasSupabaseCredentials) {
    throw new Error('Database connection not configured');
  }

  // Fetch articles with related data
  const { data: articlesData, error: articlesError } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      author:authors(*),
      tags:article_tags(
        tag:tags(*)
      )
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (articlesError) throw articlesError;

  // Transform the data to include tags properly
  const transformedArticles: ArticleWithRelations[] = (articlesData || []).map(article => ({
    ...article,
    tags: article.tags?.map((tagRelation: any) => tagRelation.tag).filter(Boolean) || []
  }));

  // Convert to local format
  const convertedArticles = transformedArticles.map(convertSupabaseArticle);
  
  // Separate featured and regular articles
  const featuredArticles = convertedArticles.filter(article => article.featured);
  const articles = convertedArticles.filter(article => !article.featured);

  // Fetch categories
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });

  if (categoriesError) throw categoriesError;

  // Fetch tags
  const { data: tagsData, error: tagsError } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });

  if (tagsError) throw tagsError;

  return {
    articles,
    featuredArticles,
    categories: categoriesData || [],
    tags: tagsData || []
  };
};

/**
 * Hook for fetching all articles with caching
 */
export const useArticles = () => {
  return useQuery({
    queryKey: queryKeys.articles.lists(),
    queryFn: fetchArticlesFromSupabase,
    staleTime: CACHE_TTL.ARTICLES,
    gcTime: CACHE_TTL.ARTICLES * 2,
  });
};

/**
 * Hook for fetching featured articles with caching
 */
export const useFeaturedArticles = () => {
  return useQuery({
    queryKey: queryKeys.articles.featured(),
    queryFn: async () => {
      const data = await fetchArticlesFromSupabase();
      return data.featuredArticles;
    },
    staleTime: CACHE_TTL.FEATURED_ARTICLES,
    gcTime: CACHE_TTL.FEATURED_ARTICLES * 2,
  });
};

/**
 * Hook for fetching articles by category with caching
 */
export const useArticlesByCategory = (category: string) => {
  return useQuery({
    queryKey: queryKeys.articles.list(category),
    queryFn: async () => {
      const data = await fetchArticlesFromSupabase();
      if (category === 'All') {
        return [...data.featuredArticles, ...data.articles];
      }
      return [...data.featuredArticles, ...data.articles].filter(article => article.category === category);
    },
    staleTime: CACHE_TTL.ARTICLES,
    gcTime: CACHE_TTL.ARTICLES * 2,
    enabled: !!category,
  });
};

/**
 * Fetch a single article by slug (server-side function)
 */
export const fetchArticleBySlug = async (slug: string): Promise<Article> => {
  if (!hasSupabaseCredentials) {
    throw new Error('Database connection not configured');
  }

  // Fetch single article with related data
  const { data: articleData, error: articleError } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      author:authors(*),
      tags:article_tags(
        tag:tags(*)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (articleError) {
    if (articleError.code === 'PGRST116') {
      throw new Error(`Article with slug "${slug}" not found`);
    }
    throw articleError;
  }

  // Transform the data to include tags properly
  const transformedArticle: ArticleWithRelations = {
    ...articleData,
    tags: articleData.tags?.map((tagRelation: any) => tagRelation.tag).filter(Boolean) || []
  };

  return convertSupabaseArticle(transformedArticle);
};

/**
 * Hook for fetching a single article by slug with caching
 */
export const useArticleBySlug = (slug: string) => {
  return useQuery({
    queryKey: queryKeys.articles.bySlug(slug),
    queryFn: () => fetchArticleBySlug(slug),
    staleTime: CACHE_TTL.ARTICLES,
    gcTime: CACHE_TTL.ARTICLES * 2,
    enabled: !!slug,
  });
};

/**
 * Hook for fetching categories with caching
 */
export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: async () => {
      const data = await fetchArticlesFromSupabase();
      return data.categories;
    },
    staleTime: CACHE_TTL.CATEGORIES,
    gcTime: CACHE_TTL.CATEGORIES * 2,
  });
};

/**
 * Hook for fetching tags with caching
 */
export const useTags = () => {
  return useQuery({
    queryKey: queryKeys.tags.list(),
    queryFn: async () => {
      const data = await fetchArticlesFromSupabase();
      return data.tags;
    },
    staleTime: CACHE_TTL.TAGS,
    gcTime: CACHE_TTL.TAGS * 2,
  });
};

/**
 * Fetch all article slugs for static generation
 */
export const fetchAllArticleSlugs = async (): Promise<string[]> => {
  if (!hasSupabaseCredentials) {
    throw new Error('Database connection not configured');
  }

  const { data: articlesData, error: articlesError } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published');

  if (articlesError) throw articlesError;

  return (articlesData || []).map(article => article.slug);
};

/**
 * Hook for toggling bookmarks
 */
export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (articleId: string | number) => {
      if (!hasSupabaseCredentials || !articleId) return false;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // First try to get the article by ID to get the UUID
      let articleUuid = String(articleId);
      
      // If articleId looks like a slug (not a UUID), try to get the UUID first
      if (!articleId.toString().includes('-') && articleId.toString().trim() !== '') {
        const { data: articleData, error: articleError } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', String(articleId))
          .single();
        
        if (!articleError && articleData) {
          articleUuid = articleData.id;
        }
      }

      // Check if already bookmarked
      try {
        let { data: existing, error: checkError } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('article_id', articleUuid)
          .limit(1);

        if (checkError) {
          console.error('Error checking existing bookmark:', checkError);
          // If the error is 406, try a different approach
          if (checkError.code === '406') {
            // Try without the limit clause
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('bookmarks')
              .select('id')
              .eq('user_id', user.id)
              .eq('article_id', articleUuid);

            if (fallbackError) {
              console.error('Fallback error checking existing bookmark:', fallbackError);
              return false;
            }

            existing = fallbackData;
          } else {
            return false;
          }
        }

        if (existing && existing.length > 0) {
          // Remove bookmark
          const { error: deleteError } = await supabase
            .from('bookmarks')
            .delete()
            .eq('user_id', user.id)
            .eq('article_id', articleUuid);

          if (deleteError) {
            console.error('Error deleting bookmark:', deleteError);
            return false;
          }
          return false;
        } else {
          // Add bookmark
          const { error: insertError } = await supabase
            .from('bookmarks')
            .insert({
              user_id: user.id,
              article_id: articleUuid
            });

          if (insertError) {
            console.error('Error inserting bookmark:', insertError);
            return false;
          }
          return true;
        }
      } catch (err) {
        console.error('Exception in toggle bookmark:', err);
        return false;
      }
    },
    onMutate: async (articleId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bookmark-status', articleId] });
      
      // Snapshot the previous value
      const previousBookmarkStatus = queryClient.getQueryData(['bookmark-status', articleId]);
      
      // Optimistically update bookmark status
      queryClient.setQueryData(['bookmark-status', articleId], true);
      
      return { previousBookmarkStatus };
    },
    onError: (err, articleId, context) => {
      // Show error toast
      toast.error('Failed to update bookmark. Please try again.');
      
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousBookmarkStatus !== undefined) {
        queryClient.setQueryData(['bookmark-status', articleId], context.previousBookmarkStatus);
      }
    },
    onSuccess: (isBookmarked, articleId) => {
      // Show toast notification
      if (isBookmarked) {
        toast.success('Article added to bookmarks');
      } else {
        toast.success('Article removed from bookmarks');
      }
      
      // Invalidate bookmarks cache
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all });
      // Invalidate specific bookmark status
      queryClient.invalidateQueries({ queryKey: ['bookmark-status', articleId] });
      
      // Optimistically update article bookmark counts
      queryClient.setQueryData(queryKeys.articles.all, (oldData: any) => {
        if (!oldData) return oldData;
        
        // Update bookmark counts in all article lists
        const updateArticleBookmarkCount = (articles: any[]) => {
          return articles.map(article => {
            if (String(article.id) === String(articleId)) {
              return {
                ...article,
                bookmark_count: isBookmarked 
                  ? (article.bookmark_count || 0) + 1 
                  : Math.max((article.bookmark_count || 0) - 1, 0)
              };
            }
            return article;
          });
        };

        return {
          ...oldData,
          articles: updateArticleBookmarkCount(oldData.articles || []),
          featuredArticles: updateArticleBookmarkCount(oldData.featuredArticles || [])
        };
      });

      // Also update individual article queries
      queryClient.setQueryData(queryKeys.articles.detail(articleId), (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          bookmark_count: isBookmarked 
            ? (oldData.bookmark_count || 0) + 1 
            : Math.max((oldData.bookmark_count || 0) - 1, 0)
        };
      });
    },
  });
};

/**
 * Fetch raw article data by slug for metadata generation
 */
export const fetchArticleBySlugForMetadata = async (slug: string): Promise<any> => {
  if (!hasSupabaseCredentials) {
    throw new Error('Database connection not configured');
  }

  // Fetch single article with related data
  const { data: articleData, error: articleError } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      author:authors(*),
      tags:article_tags(
        tag:tags(*)
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (articleError) {
    if (articleError.code === 'PGRST116') {
      throw new Error(`Article with slug "${slug}" not found`);
    }
    throw articleError;
  }

  return articleData;
};

/**
 * Fetch related articles from Supabase
 */
const fetchRelatedArticles = async (currentArticle: Article, limit: number = 3): Promise<Article[]> => {
  if (!hasSupabaseCredentials) {
    throw new Error('Database connection not configured');
  }

  // Get the current article's category and tags
  const currentCategory = currentArticle.category;
  const currentTags = currentArticle.tags || [];
  const currentAuthor = currentArticle.author;

  // Build a query to find related articles
  // Priority: same category + same tags > same category > same author > recent articles
  let { data: relatedArticles, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      author:authors(*),
      tags:article_tags(
        tag:tags(*)
      )
    `)
    .eq('status', 'published')
    .neq('id', currentArticle.id) // Exclude current article
    .order('published_at', { ascending: false })
    .limit(limit * 2); // Get more to filter

  if (error) throw error;

  // Transform the data
  const transformedArticles: ArticleWithRelations[] = (relatedArticles || []).map(article => ({
    ...article,
    tags: article.tags?.map((tagRelation: any) => tagRelation.tag).filter(Boolean) || []
  }));

  const convertedArticles = transformedArticles.map(convertSupabaseArticle);

  // Score articles based on relevance
  const scoredArticles = convertedArticles.map(article => {
    let score = 0;
    
    // Same category gets high score
    if (article.category === currentCategory) {
      score += 10;
    }
    
    // Same tags get medium score
    const commonTags = (article.tags || []).filter(tag => 
      currentTags.includes(tag)
    );
    score += commonTags.length * 5;
    
    // Same author gets low score
    if (article.author === currentAuthor) {
      score += 3;
    }
    
    // Featured articles get bonus
    if (article.featured) {
      score += 2;
    }
    
    return { article, score };
  });

  // Sort by score (highest first) and take top results
  const sortedArticles = scoredArticles
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.article);

  return sortedArticles;
};

/**
 * Hook for fetching related articles
 */
export const useRelatedArticles = (currentArticle: Article | null, limit: number = 3) => {
  return useQuery({
    queryKey: queryKeys.articles.related(currentArticle?.id || '', limit),
    queryFn: () => fetchRelatedArticles(currentArticle!, limit),
    staleTime: CACHE_TTL.ARTICLES,
    gcTime: CACHE_TTL.ARTICLES * 2,
    enabled: !!currentArticle,
  });
};

/**
 * Hook for fetching user bookmarks
 */
export const useBookmarks = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: queryKeys.bookmarks.list(),
    queryFn: async () => {
      if (!hasSupabaseCredentials || !user) {
        return [];
      }

      const { data: bookmarks, error } = await supabase
        .from('bookmarks')
        .select(`
          article_id,
          created_at,
          articles (
            *,
            category:categories(*),
            author:authors(*),
            tags:article_tags(
              tag:tags(*)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Article interface
      const transformedArticles: ArticleWithRelations[] = (bookmarks || [])
        .map(bookmark => bookmark.articles)
        .filter(Boolean)
        .map((article: any) => ({
          ...article,
          tags: article.tags?.map((tagRelation: any) => tagRelation.tag).filter(Boolean) || []
        }));

      return transformedArticles.map(convertSupabaseArticle);
    },
    staleTime: CACHE_TTL.ARTICLES,
    gcTime: CACHE_TTL.ARTICLES * 2,
    enabled: !!user,
  });
};

/**
 * Hook for checking if an article is bookmarked
 */
export const useIsBookmarked = (articleId: string | number | undefined) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['bookmark-status', articleId, user?.id],
    queryFn: async () => {
      if (!hasSupabaseCredentials || !user || !articleId) {
        return false;
      }

      // First try to get the article by ID to get the UUID
      let articleUuid = String(articleId);
      
      // If articleId looks like a slug (not a UUID), try to get the UUID first
      if (!articleId.toString().includes('-') && articleId.toString().trim() !== '') {
        const { data: articleData, error: articleError } = await supabase
          .from('articles')
          .select('id')
          .eq('slug', String(articleId))
          .single();
        
        if (!articleError && articleData) {
          articleUuid = articleData.id;
        }
      }

      try {
        // First try with a simpler query
        const { data, error } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('article_id', articleUuid)
          .limit(1);

        if (error) {
          console.error('Error checking bookmark status:', error);
          // If the error is 406, try a different approach
          if (error.code === '406') {
            // Try without the limit clause
            const { data: fallbackData, error: fallbackError } = await supabase
              .from('bookmarks')
              .select('id')
              .eq('user_id', user.id)
              .eq('article_id', articleUuid);

            if (fallbackError) {
              console.error('Fallback error checking bookmark status:', fallbackError);
              return false;
            }

            return fallbackData && fallbackData.length > 0;
          }
          return false;
        }

        return data && data.length > 0;
      } catch (err) {
        console.error('Exception checking bookmark status:', err);
        return false;
      }
    },
    staleTime: CACHE_TTL.ARTICLES,
    gcTime: CACHE_TTL.ARTICLES * 2,
    enabled: !!user && !!articleId,
  });
};

/**
 * Utility functions for backward compatibility
 */
export const useArticlesUtils = () => {
  const { data, isLoading, error } = useArticles();
  
  const getAllArticles = (): Article[] => {
    if (!data) return [];
    return [...data.featuredArticles, ...data.articles];
  };

  const getFeaturedArticles = (): Article[] => {
    return data?.featuredArticles || [];
  };

  const getArticlesByCategory = (category: string): Article[] => {
    if (!data) return [];
    if (category === 'All') return getAllArticles();
    return getAllArticles().filter(article => article.category === category);
  };

  const getArticleById = (id: number | string): Article | undefined => {
    return getAllArticles().find(article => 
      article.id === id || 
      article.id === Number(id) ||
      article.slug === id
    );
  };

  const getArticleBySlug = (slug: string): Article | undefined => {
    return getAllArticles().find(article => article.slug === slug);
  };

  const getCategories = (): string[] => {
    if (data?.categories && data.categories.length > 0) {
      return ['All', ...data.categories.map(cat => cat.name)];
    }
    // Fallback for database articles
    const allArticles = getAllArticles();
    const categoryNames = Array.from(new Set(allArticles.map(article => article.category)));
    return ['All', ...categoryNames.sort()];
  };

  return {
    articles: data?.articles || [],
    featuredArticles: data?.featuredArticles || [],
    categories: data?.categories || [],
    tags: data?.tags || [],
    loading: isLoading,
    error,
    getAllArticles,
    getFeaturedArticles,
    getArticlesByCategory,
    getArticleById,
    getArticleBySlug,
    getCategories,
  };
}; 

/**
 * Fetch all author slugs for static generation
 */
export const fetchAllAuthorSlugs = async (): Promise<string[]> => {
  if (!hasSupabaseCredentials) {
    throw new Error('Database connection not configured');
  }

  const { data, error } = await supabase
    .from('authors')
    .select('slug')
    .order('name', { ascending: true });

  if (error) throw error;
  return data?.map(author => author.slug) || [];
};

/**
 * Fetch a single author by slug (server-side function)
 */
export const fetchAuthorBySlug = async (slug: string): Promise<any> => {
  if (!hasSupabaseCredentials) {
    throw new Error('Database connection not configured');
  }


  const { data: authorData, error: authorError } = await supabase
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .single();


  if (authorError) {
    if (authorError.code === 'PGRST116') {
      throw new Error(`Author with slug "${slug}" not found`);
    }
    throw authorError;
  }

  return authorData;
};

/**
 * Fetch raw author data by slug for metadata generation
 */
export const fetchAuthorBySlugForMetadata = async (slug: string): Promise<any> => {
  if (!hasSupabaseCredentials) {
    throw new Error('Database connection not configured');
  }

  const { data: authorData, error: authorError } = await supabase
    .from('authors')
    .select('*')
    .eq('slug', slug)
    .single();

  if (authorError) {
    if (authorError.code === 'PGRST116') {
      throw new Error(`Author with slug "${slug}" not found`);
    }
    throw authorError;
  }

  return authorData;
}; 