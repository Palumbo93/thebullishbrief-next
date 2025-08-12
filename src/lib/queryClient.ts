import { QueryClient } from '@tanstack/react-query';

/**
 * Server-side QueryClient configuration for SSR
 * This configuration is optimized for server-side rendering
 */
export const createServerQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Disable refetching during SSR
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      // Set very short stale time for SSR
      staleTime: 0,
      // Set very short cache time for SSR
      gcTime: 0,
      // Disable retries during SSR
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

/**
 * Client-side QueryClient configuration for browser
 * This configuration is optimized for client-side usage
 */
export const createClientQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      // Time before data is considered stale (5 minutes)
      staleTime: 5 * 60 * 1000,
      
      // Time before inactive queries are garbage collected (10 minutes)
      gcTime: 10 * 60 * 1000,
      
      // Retry failed requests up to 3 times with exponential backoff
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (good for keeping data fresh)
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      
      // Retry delay for mutations
      retryDelay: 1000,
    },
  },
});

// Legacy export for backward compatibility
export const queryClient = createClientQueryClient();

/**
 * Query keys for consistent caching
 */
export const queryKeys = {
  articles: {
    all: ['articles'] as const,
    lists: () => [...queryKeys.articles.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.articles.lists(), { filters }] as const,
    details: () => [...queryKeys.articles.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.articles.details(), id] as const,
    bySlug: (slug: string) => [...queryKeys.articles.details(), 'slug', slug] as const,
    featured: () => [...queryKeys.articles.all, 'featured'] as const,
    related: (articleId: string | number, limit: number) => [...queryKeys.articles.all, 'related', articleId, limit] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: () => [...queryKeys.categories.all, 'list'] as const,
  },
  tags: {
    all: ['tags'] as const,
    list: () => [...queryKeys.tags.all, 'list'] as const,
  },
  bookmarks: {
    all: ['bookmarks'] as const,
    list: () => [...queryKeys.bookmarks.all, 'list'] as const,
    detail: (articleId: string | number) => [...queryKeys.bookmarks.all, 'detail', articleId] as const,
  },
  views: {
    all: ['views'] as const,
    detail: (articleId: string | number) => [...queryKeys.views.all, 'detail', articleId] as const,
  },
  briefs: {
    all: ['briefs'] as const,
    lists: () => [...queryKeys.briefs.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.briefs.lists(), { filters }] as const,
    details: () => [...queryKeys.briefs.all, 'detail'] as const,
    detail: (id: string | number) => [...queryKeys.briefs.details(), id] as const,
    bySlug: (slug: string) => [...queryKeys.briefs.details(), 'slug', slug] as const,
    featured: () => [...queryKeys.briefs.all, 'featured'] as const,
  },
}; 