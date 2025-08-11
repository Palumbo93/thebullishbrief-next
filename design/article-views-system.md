# Article Views System Design

## Overview

A sophisticated article view tracking system that provides real-time analytics while maintaining performance and privacy. The system tracks both anonymous and authenticated user views with smart deduplication and efficient caching.

## Goals

- **Real-time view counts** - Immediate feedback when articles are viewed
- **Anonymous support** - Track views from non-authenticated users
- **Spam prevention** - Prevent artificial inflation of view counts
- **Performance** - Fast reads with minimal database impact
- **Privacy-friendly** - No personal data collection for anonymous users
- **Scalable** - Handle high traffic without performance degradation

## Architecture

### Database Layer

#### Current Structure
```sql
-- Existing article_views table
article_views: {
  article_id: string
  user_id: string | null  -- null for anonymous users
  ip_address: inet
  user_agent: string
  referrer: string | null
  reading_time_seconds: number | null
  viewed_at: timestamp
}
```

#### Enhanced Structure
```sql
-- Add to articles table (already exists)
articles: {
  view_count: integer  -- Denormalized count for fast reads
}

-- Triggers for automatic updates
CREATE TRIGGER update_article_view_count
  AFTER INSERT ON article_views
  FOR EACH ROW
  EXECUTE FUNCTION update_article_view_count();

-- Smart deduplication function
CREATE FUNCTION should_count_view(
  p_article_id text,
  p_ip_address inet,
  p_user_id uuid,
  p_time_window interval DEFAULT '1 hour'
) RETURNS boolean;
```

### Frontend Layer

#### View Tracking Hook
```typescript
const useTrackArticleView = (articleId: string) => {
  // Track view on component mount
  // Handle anonymous vs authenticated users
  // Implement smart deduplication
  // Update cache optimistically
}
```

#### Display Hook
```typescript
const useArticleViewCount = (articleId: string) => {
  // Get view_count from articles table (fast)
  // Real-time updates via cache
  // Optimistic updates for immediate feedback
}
```

## Data Flow

### 1. User Visits Article
```
ArticlePage mounts → useTrackArticleView → 
Check deduplication → Insert view → 
Trigger updates view_count → Cache updates
```

### 2. Display View Count
```
ArticleCard/ArticlePage → useArticleViewCount → 
Get from articles.view_count → Display
```

## Implementation Phases

### Phase 1: Core Tracking (1-2 hours)
- [ ] Database triggers and functions
- [ ] Basic view tracking hook
- [ ] Display hook with cache integration
- [ ] Optimistic updates for immediate feedback

### Phase 2: Smart Deduplication (30 mins)
- [ ] IP-based deduplication (1 view per IP per hour)
- [ ] Session-based tracking for better accuracy
- [ ] User-based deduplication for authenticated users
- [ ] Time-based limits and cleanup

### Phase 3: Analytics (Optional)
- [x] ~~Reading time tracking~~ (Removed - too complex, low value)
- [ ] Unique vs total views
- [ ] Admin dashboard for analytics
- [ ] Geographic data (optional)

## Performance Considerations

### Database Optimizations
- **Indexes**: `article_id`, `viewed_at`, `ip_address`
- **Partitioning**: By date if > 1M rows
- **Cleanup**: Daily job to delete old data (30 days)
- **Denormalization**: `view_count` in articles table for fast reads

### Frontend Optimizations
- **Optimistic updates**: View count updates immediately
- **Cache-first**: Read from cache, update in background
- **Debounced tracking**: Batch multiple views
- **Background sync**: Don't block UI for view tracking

## Privacy & Spam Prevention

### Anonymous Users
- **IP-based deduplication**: 1 view per IP per hour
- **No personal data**: Only IP, user agent, referrer
- **Session tracking**: Browser session for better accuracy
- **Privacy compliance**: GDPR-friendly data collection

### Authenticated Users
- **User-based deduplication**: 1 view per user per day
- **Enhanced analytics**: Reading time, engagement metrics
- **Personalized tracking**: Better accuracy with user context

## Efficiency Features

### Smart Caching
```typescript
// Cache view counts for 5 minutes
staleTime: 5 * 60 * 1000,
// Update optimistically
onMutate: () => updateViewCount(articleId, +1)
```

### Batch Operations
```typescript
// Debounce view tracking to prevent spam
const debouncedTrack = useDebounce(trackView, 1000);
```

### Background Sync
```typescript
// Track view in background, don't block UI
useEffect(() => {
  trackView(articleId);
}, [articleId]);
```

## Data Retention & Cleanup

### Retention Policy
- **Individual views**: 30 days (for analytics)
- **Aggregated data**: Keep indefinitely
- **Anonymous data**: Minimal retention, no personal info

### Cleanup Strategy
```sql
-- Daily cleanup job
DELETE FROM article_views 
WHERE viewed_at < NOW() - INTERVAL '30 days';

-- Update aggregated counts
UPDATE articles 
SET view_count = (
  SELECT COUNT(*) 
  FROM article_views 
  WHERE article_views.article_id = articles.id
);
```

## Scalability Considerations

### Database Scaling
- **10K articles × 100 views each = 1M rows** (manageable)
- **Automatic archiving**: Move old data to archive table
- **Summary tables**: Pre-calculated daily/weekly stats
- **Partitioning**: By date if needed for large datasets

### Frontend Scaling
- **Cache invalidation**: Smart cache updates
- **Lazy loading**: Load view counts on demand
- **Background processing**: Non-blocking view tracking

## Security & Privacy

### Data Protection
- **No personal data**: For anonymous users
- **IP anonymization**: Consider hashing IPs
- **Consent management**: Clear privacy policy
- **Data minimization**: Only collect necessary data

### Spam Prevention
- **Rate limiting**: Per IP and per user
- **Bot detection**: User agent analysis
- **Geographic limits**: Prevent bulk views from same region
- **Time-based limits**: Prevent rapid-fire views

## Monitoring & Analytics

### Key Metrics
- **View counts**: Real-time and historical
- **Unique views**: Deduplicated counts
- **Referrer tracking**: Traffic sources

### Admin Dashboard
- **Article performance**: View counts by article
- **Traffic sources**: Referrer analysis
- **System health**: Database performance

## Success Criteria

- [ ] View counts update immediately on page load
- [ ] Anonymous users are tracked without personal data
- [ ] Spam prevention prevents artificial inflation
- [ ] Performance impact is minimal (< 100ms)
- [ ] Privacy compliance for all user types
- [ ] Scalable to 10K+ articles with high traffic

## Future Enhancements

### Advanced Analytics
- **Geographic data**: View counts by location
- **Device tracking**: Mobile vs desktop views
- **Time analysis**: Peak viewing hours
- **Content performance**: Which articles perform best

### Integration Opportunities
- **SEO optimization**: View counts for search ranking
- **Recommendation engine**: Popular articles
- **Advertising**: View-based targeting
- **Content strategy**: Data-driven content decisions

## Technical Debt Considerations

### Database Maintenance
- **Regular cleanup**: Automated data retention
- **Index optimization**: Monitor query performance
- **Partitioning strategy**: Plan for growth
- **Backup strategy**: Protect analytics data

### Code Maintenance
- **Hook abstraction**: Reusable view tracking
- **Cache management**: Efficient invalidation
- **Error handling**: Graceful degradation
- **Testing strategy**: Unit and integration tests

---

*This design provides enterprise-grade view tracking with minimal complexity and maximum performance.* 