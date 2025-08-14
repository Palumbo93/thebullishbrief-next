# Datafa.st API Integration Design Document

## Problem Statement
Our current Datafa.st implementation uses client-side tracking with `window.datafast.track()`, but Datafa.st documentation shows that **Goals** should be tracked via their API for better accuracy and reliability. We need to migrate from client-side event tracking to server-side goal tracking using the Datafa.st API.

## Goals
- Replace client-side `trackEvent` calls with server-side API goal tracking
- Implement Next.js proxy to bypass adblockers
- Maintain existing analytics functionality (article views, bookmarks, shares, etc.)
- Ensure reliable tracking even when adblockers are present
- Keep the same developer experience with hooks and context

## Non-Goals
- Changing the basic page view tracking (handled by the script tag)
- Modifying the Datafa.st script installation
- Changing the user interface or analytics display

## Architecture

### Current State Analysis
```typescript
// Current client-side approach (problematic)
window.datafast.track('article_view', { articleId, title });

// Target server-side approach (recommended)
POST /api/analytics/goal
{
  "goal": "article_view",
  "properties": { "article_id": "123", "title": "Article Title" }
}
```

### New Architecture

#### 1. API Route Structure
```
/api/analytics/goal - POST endpoint for tracking goals
/api/analytics/visitor - GET endpoint for visitor data (if needed)
```

#### 2. Datafa.st API Integration
- **Base URL**: `https://datafa.st/api/v1/`
- **Authentication**: Bearer token with API key
- **Goal Endpoint**: `POST /api/v1/goal`
- **Visitor Endpoint**: `GET /api/v1/visitor`

#### 3. Next.js Proxy Configuration
```javascript
// next.config.js
{
  source: '/js/script.js',
  destination: 'https://datafa.st/js/script.js',
},
{
  source: '/api/events',
  destination: 'https://datafa.st/api/events',
}
```

### Data Flow

#### 1. Goal Tracking Flow
```
User Action → React Hook → API Route → Datafa.st API → Dashboard
```

#### 2. Proxy Flow
```
Browser → Your Domain (/js/script.js) → Datafa.st CDN
Browser → Your Domain (/api/events) → Datafa.st API
```

## Implementation Plan

### Phase 1: API Route Setup (1-2 hours)
- [ ] Create `/api/analytics/goal` POST endpoint
- [ ] Implement Datafa.st API client service
- [ ] Add environment variable for API key
- [ ] Add error handling and logging

### Phase 2: Next.js Proxy Setup (30 minutes)
- [ ] Update `next.config.js` with proxy rules
- [ ] Update script tag to use proxied URLs
- [ ] Test proxy functionality

### Phase 3: Goal Definitions (1 hour)
- [ ] Define all custom goals based on current events
- [ ] Map existing event names to goal names
- [ ] Document goal schema and parameters

### Phase 4: Hook Migration (1-2 hours)
- [ ] Update `useDatafastAnalytics` hooks to use API
- [ ] Replace client-side tracking calls
- [ ] Maintain backward compatibility during transition

### Phase 5: Testing & Validation (1 hour)
- [ ] Test all goal tracking endpoints
- [ ] Verify proxy functionality
- [ ] Check Datafa.st dashboard for goal data
- [ ] Validate error handling

## Technical Implementation

### 1. Environment Configuration
```env
DATAFAST_API_KEY=df_27c5b70e1e2c01e25b6d59d72c83ecc1a7544695ff61b1ce
DATAFAST_WEBSITE_ID=689dde00a1c832b545b78a9f
DATAFAST_DOMAIN=thebullishbrief-next.vercel.app
```

### 2. API Client Service
```typescript
// src/services/datafastApi.ts
export class DatafastApiService {
  private apiKey: string;
  private baseUrl: string = 'https://datafa.st/api/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async trackGoal(goal: string, properties?: Record<string, any>): Promise<void> {
    // Implementation
  }

  async getVisitor(visitorId: string): Promise<any> {
    // Implementation
  }
}
```

### 3. API Route Implementation
```typescript
// src/app/api/analytics/goal/route.ts
export async function POST(request: Request) {
  // Validate request
  // Call Datafa.st API
  // Return response
}
```

### 4. Updated Hook Interface
```typescript
// src/hooks/useDatafastAnalytics.ts
export const useTrackArticleEngagement = () => {
  return {
    trackBookmark: async (articleId: string, title: string) => {
      await fetch('/api/analytics/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: 'article_bookmark',
          properties: { article_id: articleId, title }
        })
      });
    },
    trackShare: async (articleId: string, title: string, platform: string) => {
      await fetch('/api/analytics/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: 'article_share',
          properties: { article_id: articleId, title, platform }
        })
      });
    }
  };
};
```

## Goal Definitions

### Content Engagement Goals
- `article_bookmark` - When user bookmarks an article
- `article_share` - When user shares an article
- `brief_share` - When user shares a brief
- `brief_action_link_clicked` - When user clicks a Quick link in the BriefActionPanel
- `prompt_copied` - When a user copies a prompt in PromptModal
- `prompt_downloaded` - When a user downloads a prompt in PromptModal

### User Action Goals
- `user_signup` - When user creates account
- `user_login` - When user logs in
- `comment_post` - When user posts a comment
- `search_performed` - When user searches


## Error Handling

### API Error Responses
- **400 Bad Request**: Invalid goal name or properties
- **401 Unauthorized**: Invalid API key
- **429 Rate Limited**: Too many requests
- **500 Server Error**: Datafa.st service issues

### Client Error Handling
- Retry logic for failed requests
- Fallback to client-side tracking if API fails
- Logging for debugging
- Graceful degradation

## Security Considerations

### API Key Security
- Store API key in environment variables only
- Never expose in client-side code
- Use server-side API routes for all goal tracking
- Validate all input data

### Data Privacy
- Sanitize all user data before sending to API
- Respect user privacy preferences
- Log minimal data for debugging
- Follow GDPR compliance

## Performance Considerations

### API Optimization
- Use connection pooling for API requests
- Implement request batching if needed
- Cache responses where appropriate
- Monitor API response times

### Client Performance
- Non-blocking goal tracking (fire and forget)
- Minimal impact on user experience
- Efficient error handling
- Progressive enhancement

## Testing Strategy

### Unit Tests
- API client service methods
- Goal validation logic
- Error handling scenarios
- Hook functionality

### Integration Tests
- End-to-end goal tracking
- Proxy functionality
- API response handling
- Error recovery

### Manual Testing
- Verify goals appear in Datafa.st dashboard
- Test with adblockers enabled
- Validate proxy bypass functionality
- Check error scenarios

## Migration Strategy

### Phase 1: Parallel Implementation
- Keep existing client-side tracking
- Add new server-side tracking
- Compare data accuracy

### Phase 2: Gradual Migration
- Migrate one goal type at a time
- Monitor for issues
- Rollback capability

### Phase 3: Complete Migration
- Remove client-side tracking code
- Clean up unused dependencies
- Update documentation

## Success Metrics

### Technical Metrics
- API response time < 200ms
- Goal tracking success rate > 99%
- Zero client-side tracking errors
- Proxy bypass rate > 95%

### Business Metrics
- Improved goal tracking accuracy
- Better conversion attribution
- Enhanced user journey insights
- Reduced adblocker impact

## Future Enhancements

### Advanced Features
- Goal conversion funnels
- A/B testing integration
- Custom goal analytics
- Revenue attribution

### Integration Opportunities
- Email marketing integration
- CRM system connections
- Marketing automation
- Advanced reporting

## Conclusion

This design provides a comprehensive approach to migrating from client-side to server-side goal tracking with Datafa.st. The implementation will improve tracking accuracy, bypass adblockers, and provide better analytics insights while maintaining a clean developer experience.

The phased approach ensures minimal disruption to existing functionality while providing a clear path to full server-side analytics implementation.
