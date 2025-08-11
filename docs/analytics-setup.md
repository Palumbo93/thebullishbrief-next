# Google Analytics Setup Documentation

## Overview

This document describes the comprehensive Google Tag Manager (GTM) analytics implementation for The Bullish Brief. The system provides robust tracking across the entire application while maintaining privacy compliance and performance.

## Architecture

### Core Components

#### 1. Analytics Service (`src/services/analytics.ts`)
- **GTM Integration**: Handles all dataLayer interactions
- **Privacy Compliance**: Checks user consent before tracking
- **Event Methods**: Comprehensive tracking for all user actions
- **Development Support**: Debug logging in development mode

#### 2. Analytics Context (`src/contexts/AnalyticsContext.tsx`)
- **React Context Provider**: App-wide analytics access
- **Hook Interface**: Clean API for components
- **Type Safety**: Full TypeScript support

#### 3. Custom Hooks (`src/hooks/useAnalytics.ts`)
- **Specialized Hooks**: Domain-specific tracking functions
- **Automatic Tracking**: Page views, navigation, etc.
- **Easy Integration**: Simple hook usage in components

## Events Being Tracked

### Page Views
```typescript
// Automatic tracking on route changes
useTrackPageView();
```

### Article Engagement
```typescript
const { trackView, trackBookmark, trackShare } = useTrackArticleEngagement();

// Track article view
trackView(articleId, title, author);

// Track bookmark
trackBookmark(articleId, title);

// Track share
trackShare(articleId, title, platform);
```

### Brief Engagement
```typescript
const { trackView, trackBookmark, trackShare } = useTrackBriefEngagement();

// Track brief view
trackView(briefId, title);

// Track bookmark
trackBookmark(briefId, title);

// Track share
trackShare(briefId, title, platform);
```

### User Authentication
```typescript
const { trackSignup, trackLogin } = useTrackAuthEvents();

// Track signup
trackSignup('email');

// Track login
trackLogin('email');
```

### Search & Navigation
```typescript
const { trackSearch } = useTrackSearch();
const { trackNavigation } = useTrackNavigation();

// Track search
trackSearch(query, resultsCount);

// Track navigation
trackNavigation(from, to);
```

### Error Tracking
```typescript
const { trackError } = useTrackErrors();

// Track errors
trackError(error, context);
```

## Event Schema

### Page View Event
```typescript
{
  event: 'page_view',
  page_path: string,
  page_title: string,
  page_location: string
}
```

### Article Events
```typescript
// Article View
{
  event: 'article_view',
  content_type: 'article',
  content_id: string,
  content_title: string,
  author: string
}

// Article Bookmark
{
  event: 'article_bookmark',
  content_type: 'article',
  content_id: string,
  content_title: string
}

// Article Share
{
  event: 'article_share',
  content_type: 'article',
  content_id: string,
  content_title: string,
  share_platform: string
}
```

### Brief Events
```typescript
// Brief View
{
  event: 'brief_view',
  content_type: 'brief',
  content_id: string,
  content_title: string
}

// Brief Bookmark
{
  event: 'brief_bookmark',
  content_type: 'brief',
  content_id: string,
  content_title: string
}

// Brief Share
{
  event: 'brief_share',
  content_type: 'brief',
  content_id: string,
  content_title: string,
  share_platform: string
}
```

### User Events
```typescript
// User Signup
{
  event: 'user_signup',
  signup_method: string
}

// User Login
{
  event: 'user_login',
  login_method: string
}
```

### Search Events
```typescript
{
  event: 'search',
  search_term: string,
  results_count: number
}
```

### Navigation Events
```typescript
{
  event: 'navigation',
  from_page: string,
  to_page: string
}
```

### Error Events
```typescript
{
  event: 'error',
  error_message: string,
  error_stack: string,
  error_context: string
}
```

## Privacy & Compliance

### GDPR Compliance
- **Consent Management**: Only tracks after user consent
- **Data Minimization**: Only collects necessary data
- **Transparency**: Clear privacy policy integration
- **User Rights**: Support for data deletion requests

### Consent Integration
```typescript
// Checks existing cookie consent
const consent = localStorage.getItem('cookie-consent');
const analyticsEnabled = consent === 'accepted';
```

### Data Collection
- **Page Views**: URL, title, referrer
- **User Events**: Clicks, form submissions, engagement
- **Content Interaction**: Article reads, brief views, comments
- **User Properties**: Authentication status, preferences

## Performance Considerations

### Loading Strategy
- **Async Loading**: Non-blocking script loading
- **Lazy Initialization**: Only initialize after consent
- **Bundle Optimization**: Minimal impact on bundle size
- **Caching**: Efficient data transmission

### Monitoring
- **Error Tracking**: Monitor analytics failures
- **Performance Metrics**: Track analytics impact
- **Debug Mode**: Development environment logging

## Integration Points

### GTM Configuration
```html
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KK9MF7D7');</script>
<!-- End Google Tag Manager -->

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KK9MF7D7"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
```

### App Integration
```typescript
// src/App.tsx
<AnalyticsProvider gtmId="GTM-KK9MF7D7">
  <AppContent />
</AnalyticsProvider>
```

### Component Integration
```typescript
// Automatic page view tracking
useTrackPageView();

// Article engagement tracking
const { trackView, trackBookmark, trackShare } = useTrackArticleEngagement();

// Search tracking
const { trackSearch } = useTrackSearch();
```

## Testing

### Development Testing
```javascript
// In browser console
window.testAnalytics()
```

### Test Events
- Page views
- Article engagement (view, bookmark, share)
- Brief engagement (view, bookmark, share)
- User authentication (signup, login)
- Search queries
- Navigation events
- Error tracking

## GTM Configuration Guide

### 1. Create GA4 Property
1. Go to [Google Analytics](https://analytics.google.com/)
2. Create new GA4 property
3. Note the Measurement ID (G-XXXXXXXXXX)

### 2. Configure GTM Tags
1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Select your container (GTM-KK9MF7D7)
3. Create new tag for GA4 Configuration
4. Set trigger to "All Pages"

### 3. Set Up Custom Events
1. Create tags for each custom event type
2. Configure triggers based on dataLayer events
3. Map custom parameters to GA4 custom dimensions

### 4. Enhanced E-commerce (Optional)
1. Configure product impressions
2. Set up purchase tracking
3. Map content engagement to e-commerce events

## Custom Dimensions & Metrics

### Recommended Custom Dimensions
- `content_type` (article, brief, page)
- `content_id` (UUID of content)
- `content_title` (Title of content)
- `author` (Author name)
- `share_platform` (Platform used for sharing)
- `user_type` (anonymous, authenticated)
- `signup_method` (email, social)
- `login_method` (email, social)

### Recommended Custom Metrics
- `engagement_time_msec` (Time spent on content)
- `results_count` (Search results count)
- `error_count` (Error frequency)

## Troubleshooting

### Common Issues

#### Events Not Appearing in GA4
1. Check GTM container is published
2. Verify GA4 property is linked to GTM
3. Check dataLayer in browser console
4. Verify consent is granted

#### Performance Issues
1. Check script loading in Network tab
2. Verify async loading is working
3. Check bundle size impact
4. Monitor console for errors

#### Privacy Compliance
1. Verify consent checking logic
2. Test with consent denied
3. Check data minimization
4. Verify GDPR compliance

### Debug Mode
```typescript
// Development logging
if (import.meta.env.DEV) {
  console.log('Analytics event:', data);
}
```

## Future Enhancements

### Advanced Analytics
- **A/B Testing**: Integration with GA4 experiments
- **Audience Segmentation**: Custom audience creation
- **Predictive Analytics**: User behavior prediction
- **Real-time Alerts**: Anomaly detection

### Integration Opportunities
- **Supabase Analytics**: Database event correlation
- **Email Analytics**: Campaign performance tracking
- **Social Media**: Cross-platform attribution
- **CRM Integration**: Lead tracking and scoring

## Maintenance

### Regular Tasks
1. **Monitor Event Volume**: Check for unusual spikes
2. **Review Custom Events**: Ensure all events are firing
3. **Update Privacy Policy**: Keep compliance current
4. **Performance Monitoring**: Track analytics impact

### Updates
1. **GTM Updates**: Keep container configuration current
2. **GA4 Updates**: Monitor for new features
3. **Privacy Updates**: Stay compliant with regulations
4. **Code Updates**: Maintain analytics code quality

## Support

For questions or issues with the analytics implementation:
1. Check browser console for errors
2. Verify GTM container configuration
3. Test with `window.testAnalytics()`
4. Review this documentation
5. Check privacy compliance status

---

**Last Updated**: January 21, 2025  
**Version**: 1.0  
**GTM Container**: GTM-KK9MF7D7  
**Status**: ✅ Production Ready
