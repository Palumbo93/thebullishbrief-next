# Caching System Documentation

## Overview

The Bullish Brief implements a comprehensive multi-layer caching system designed for optimal performance and user experience in production environments.

## Architecture

### 1. React Query (TanStack Query) - Primary Cache Layer
- **Purpose**: Server state management and intelligent caching
- **Features**:
  - Stale-while-revalidate pattern
  - Background refetching
  - Optimistic updates
  - Automatic retry logic
  - Cache invalidation

### 2. Local Storage Cache - Persistent Cache Layer
- **Purpose**: Offline support and persistent data storage
- **Features**:
  - TTL-based expiration
  - Version compatibility checking
  - Automatic cleanup of expired entries
  - Size management

### 3. Memory Cache - In-Session Cache Layer
- **Purpose**: Fastest access for current session
- **Features**:
  - Instant access to frequently used data
  - Automatic garbage collection
  - Shared across components

## Cache Configuration

### React Query Configuration
```typescript
// From src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      gcTime: 10 * 60 * 1000,          // 10 minutes
      retry: (failureCount, error) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
  },
});
```

### Cache TTL Settings
```typescript
// From src/lib/cacheStorage.ts
export const CACHE_TTL = {
  ARTICLES: 30 * 60 * 1000,           // 30 minutes
  FEATURED_ARTICLES: 15 * 60 * 1000,  // 15 minutes
  CATEGORIES: 60 * 60 * 1000,         // 1 hour
  TAGS: 60 * 60 * 1000,               // 1 hour
  USER_PROFILE: 5 * 60 * 1000,        // 5 minutes
  APP_SETTINGS: 24 * 60 * 60 * 1000,  // 24 hours
};
```

## Usage Examples

### Fetching Articles with Caching
```typescript
import { useArticles, useFeaturedArticles, useArticleBySlug } from '../hooks/useArticles';

// Fetch all articles
const { data, isLoading, error } = useArticles();

// Fetch featured articles only
const { data: featuredArticles } = useFeaturedArticles();

// Fetch single article by slug
const { data: article } = useArticleBySlug('article-slug');
```

### Category-based Filtering
```typescript
import { useArticlesByCategory } from '../hooks/useArticles';

const { data: articles } = useArticlesByCategory('Bitcoin');
```

### Mutations with Cache Invalidation
```typescript
import { useTrackArticleView, useToggleBookmark } from '../hooks/useArticles';

const trackView = useTrackArticleView();
const toggleBookmark = useToggleBookmark();

// Track article view
trackView.mutate({ articleId: '123', readingTimeSeconds: 120 });

// Toggle bookmark
toggleBookmark.mutate('123');
```

## Cache Keys Structure

```typescript
export const queryKeys = {
  articles: {
    all: ['articles'],
    lists: () => [...queryKeys.articles.all, 'list'],
    list: (filters: string) => [...queryKeys.articles.lists(), { filters }],
    details: () => [...queryKeys.articles.all, 'detail'],
    detail: (id: string | number) => [...queryKeys.articles.details(), id],
    bySlug: (slug: string) => [...queryKeys.articles.details(), 'slug', slug],
    featured: () => [...queryKeys.articles.all, 'featured'],
  },
  categories: {
    all: ['categories'],
    list: () => [...queryKeys.categories.all, 'list'],
  },
  tags: {
    all: ['tags'],
    list: () => [...queryKeys.tags.all, 'list'],
  },
  bookmarks: {
    all: ['bookmarks'],
    list: () => [...queryKeys.bookmarks.all, 'list'],
    detail: (articleId: string | number) => [...queryKeys.bookmarks.all, 'detail', articleId],
  },
  views: {
    all: ['views'],
    detail: (articleId: string | number) => [...queryKeys.views.all, 'detail', articleId],
  },
};
```

## Performance Benefits

### 1. Reduced API Calls
- Articles are cached for 30 minutes
- Featured articles refresh every 15 minutes
- Categories and tags cache for 1 hour
- User-specific data (bookmarks, views) invalidate immediately on changes

### 2. Improved User Experience
- Instant navigation between articles
- No loading states for cached data
- Background updates keep data fresh
- Offline support for previously viewed content

### 3. SEO Benefits
- Faster page loads improve Core Web Vitals
- Reduced server load
- Better crawlability with faster response times

## Production Considerations

### 1. Cache Size Management
- Local storage has ~5-10MB limit
- Automatic cleanup of expired entries
- Size monitoring in development

### 2. Cache Invalidation Strategy
- Time-based expiration (TTL)
- Event-based invalidation (mutations)
- Manual invalidation for admin updates

### 3. Error Handling
- Graceful fallback to fresh data on cache errors
- Retry logic for failed requests
- User feedback for cache issues

### 4. Monitoring
- Cache hit/miss ratios
- Storage usage
- Performance metrics

## Development Tools

### Cache Manager Component
Available in development mode (`import.meta.env.DEV`):
- View cache size and availability
- Clear expired cache entries
- Clear all cache data
- Real-time cache statistics

### Debug Information
```typescript
// Check cache availability
const isAvailable = cacheStorage.isAvailable();

// Get cache size
const size = cacheStorage.getSize();

// Clear expired entries
cacheStorage.clearExpired();
```

## Migration from Old System

The new caching system replaces the old `useArticles` hook with:

1. **useArticles()** - Fetch all articles with caching
2. **useFeaturedArticles()** - Fetch only featured articles
3. **useArticlesByCategory(category)** - Fetch articles by category
4. **useArticleBySlug(slug)** - Fetch single article by slug
5. **useCategories()** - Fetch categories
6. **useTags()** - Fetch tags

### Backward Compatibility
The `useArticlesUtils()` hook provides backward compatibility functions:
- `getAllArticles()`
- `getFeaturedArticles()`
- `getArticlesByCategory(category)`
- `getArticleById(id)`
- `getArticleBySlug(slug)`
- `getCategories()`

## Best Practices

### 1. Use Specific Hooks
```typescript
// ✅ Good - Only fetch what you need
const { data: featuredArticles } = useFeaturedArticles();

// ❌ Avoid - Fetching everything when you only need featured
const { data } = useArticles();
const featuredArticles = data?.featuredArticles;
```

### 2. Handle Loading States
```typescript
const { data, isLoading, error } = useArticleBySlug(slug);

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <NotFound />;
```

### 3. Optimistic Updates
```typescript
const toggleBookmark = useToggleBookmark();

// Optimistically update UI
const handleBookmark = (articleId: string) => {
  // Update UI immediately
  setBookmarked(!bookmarked);
  
  // Sync with server
  toggleBookmark.mutate(articleId, {
    onError: () => {
      // Revert on error
      setBookmarked(bookmarked);
    }
  });
};
```

### 4. Cache Invalidation
```typescript
const queryClient = useQueryClient();

// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: queryKeys.articles.all });

// Invalidate related queries
queryClient.invalidateQueries({ queryKey: queryKeys.articles.lists() });
```

## Troubleshooting

### Common Issues

1. **Cache Not Working**
   - Check if localStorage is available
   - Verify cache TTL settings
   - Check for cache version mismatches

2. **Stale Data**
   - Verify staleTime configuration
   - Check cache invalidation logic
   - Ensure proper query key structure

3. **Memory Leaks**
   - Monitor cache size in development
   - Check gcTime settings
   - Verify cleanup logic

### Debug Commands
```typescript
// Clear all cache
queryClient.clear();
cacheStorage.clear();

// Check cache status
console.log('Cache size:', cacheStorage.getSize());
console.log('Cache available:', cacheStorage.isAvailable());

// View cached data
console.log('Query cache:', queryClient.getQueryCache().getAll());
```

## Future Enhancements

1. **Service Worker Integration**
   - Offline-first caching
   - Background sync
   - Push notifications

2. **Redis Integration**
   - Server-side caching
   - Shared cache across users
   - Advanced cache strategies

3. **Analytics Integration**
   - Cache performance metrics
   - User behavior tracking
   - A/B testing support

4. **Advanced Caching Strategies**
   - Predictive prefetching
   - Intelligent cache warming
   - Dynamic TTL based on usage patterns 