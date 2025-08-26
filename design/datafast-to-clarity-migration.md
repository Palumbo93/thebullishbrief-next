# Datafast to Microsoft Clarity Migration Design Document

## Problem Statement

We want to remove Datafast entirely from our application and migrate all analytics tracking to Microsoft Clarity. This will simplify our analytics stack, reduce third-party dependencies, and leverage Clarity's superior UX insights capabilities while maintaining the ability to track key user interactions and conversions.

## Goals

- **Remove Datafast**: Completely eliminate Datafast analytics from the codebase
- **Migrate Event Tracking**: Maintain tracking of all current events using Microsoft Clarity
- **Preserve Privacy**: Continue cookie-free analytics approach
- **Maintain UX Insights**: Keep existing heatmaps and session recordings
- **Simplify Stack**: Reduce to single analytics provider
- **No Data Loss**: Ensure continuity of analytics data during transition

## Non-Goals

- Maintaining historical data correlation between Datafast and Clarity
- Adding new analytics features beyond current capabilities
- Implementing real-time analytics dashboard
- Migrating to a different analytics platform (other than Clarity)

## Current State Analysis

### Datafast Events Currently Tracked

| Category | Events | Usage |
|----------|--------|-------|
| Content Engagement | `article_view`, `article_bookmark`, `article_share` | Article interactions |
| Brief Engagement | `brief_view`, `brief_bookmark`, `brief_share`, `brief_action_link_clicked` | Brief-specific tracking |
| User Actions | `user_signup`, `user_login`, `comment_post` | Authentication and engagement |
| Search | `search_performed` | Search functionality |
| Scroll Behavior | `brief_scrolled_half_way`, `popup_viewed`, `page_scroll_started` | Engagement depth |
| Video Interactions | `video_clicked`, `video_modal_opened`, `video_modal_closed` | Video engagement |
| Prompts | `prompt_copied`, `prompt_downloaded` | AI Vault interactions |
| CTAs | `cta_button_clicked` | Conversion tracking |

### Current Datafast Infrastructure

**Files to Remove:**
- `src/services/datafast.ts` - Core Datafast service
- `src/services/datafastApi.ts` - API integration
- `src/contexts/DatafastContext.tsx` - React context
- `src/hooks/useDatafastAnalytics.ts` - Analytics hooks
- `src/app/api/analytics/goal/route.ts` - Goal tracking API
- Layout script tag for Datafast

**Components Using Datafast:**
- 18 component files importing and using Datafast tracking
- All page components tracking page views
- CTA components tracking button clicks
- Video components tracking interactions

## Target Architecture

### Microsoft Clarity Enhanced Configuration

**Current Configuration:**
```javascript
// Cookie-free, heatmaps only
clarity('set', 'cookies', false);
clarity('set', 'track', false);
```

**New Configuration:**
```javascript
// Enable full event tracking while maintaining privacy
clarity('set', 'cookies', false);  // Keep cookie-free
// Remove 'track', false to enable Smart Events and custom events
```

### Event Mapping Strategy

| Datafast Event | Clarity Implementation | Method |
|----------------|----------------------|---------|
| `page_view` | Automatic page tracking | Built-in |
| `article_view` | Custom event | `clarity('event', 'article_view')` |
| `article_bookmark` | Smart Event + Custom | Auto-detect + manual |
| `article_share` | Smart Event | Auto-detect sharing |
| `user_signup` | Smart Event | Auto-detect form submission |
| `user_login` | Smart Event | Auto-detect form submission |
| `search_performed` | Custom event | `clarity('event', 'search')` |
| `brief_scrolled_half_way` | Custom event | `clarity('event', 'scroll_50')` |
| `video_clicked` | Smart Event + Custom | Auto-detect + custom properties |
| `cta_button_clicked` | Smart Event | Auto-detect button clicks |

### New Service Architecture

```typescript
// New Clarity service structure
src/services/clarity.ts           // Core Clarity service
src/contexts/ClarityContext.tsx   // React context for Clarity
src/hooks/useClarityAnalytics.ts  // Analytics hooks
```

## Implementation Plan

### Phase 1: Clarity Enhancement (Day 1)
1. **Update Clarity Configuration**
   - Remove `clarity('set', 'track', false)` to enable events
   - Configure Smart Events for automatic detection
   - Test event tracking in Clarity dashboard

2. **Create Clarity Service**
   - New `src/services/clarity.ts` with event tracking methods
   - Type definitions for Clarity events
   - Error handling and fallbacks

3. **Create Clarity Context**
   - React context provider for Clarity analytics
   - Hook-based API similar to current Datafast hooks
   - Maintain same developer experience

### Phase 2: Migration (Day 1-2)
1. **Replace Datafast Imports**
   - Update all components to use new Clarity hooks
   - Maintain same function signatures where possible
   - Add custom event tracking where Smart Events insufficient

2. **Remove Datafast Infrastructure**
   - Delete Datafast service files
   - Remove API routes
   - Clean up dependencies

3. **Update Layout**
   - Remove Datafast script tag
   - Update Clarity configuration
   - Test script loading

### Phase 3: Testing & Validation (Day 2)
1. **Event Verification**
   - Verify all events appear in Clarity dashboard
   - Test Smart Event detection
   - Validate custom event tracking

2. **Privacy Compliance**
   - Confirm no cookies are set
   - Verify GDPR compliance maintained
   - Update privacy policy if needed

## Technical Implementation

### 1. Enhanced Clarity Service

```typescript
// src/services/clarity.ts
declare global {
  interface Window {
    clarity: (action: string, ...args: any[]) => void;
  }
}

export class ClarityService {
  private isInitialized: boolean = false;

  initialize(): void {
    if (typeof window !== 'undefined' && window.clarity) {
      this.isInitialized = true;
    }
  }

  // Custom event tracking
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    if (!this.isInitialized || typeof window === 'undefined') return;
    
    if (window.clarity) {
      // Use Smart Events where possible, custom events otherwise
      window.clarity('event', eventName);
      
      // Store properties in session data if needed
      if (properties) {
        window.clarity('identify', properties);
      }
    }
  }

  // Specific tracking methods
  trackArticleView(articleId: string, title: string, author?: string): void {
    this.trackEvent('article_view', {
      content_type: 'article',
      content_id: articleId,
      content_title: title,
      author: author,
    });
  }

  // ... other tracking methods
}

export const clarityService = new ClarityService();
```

### 2. Migration Context

```typescript
// src/contexts/ClarityContext.tsx
interface ClarityContextType {
  trackPageView: (path: string, title?: string) => void;
  trackEvent: (eventName: string, properties?: Record<string, any>) => void;
  trackArticleView: (articleId: string, title: string, author?: string) => void;
  // ... same interface as DatafastContext for easy migration
}
```

### 3. Smart Events Configuration

```typescript
// Update layout.tsx Clarity configuration
<script type="text/javascript"
  dangerouslySetInnerHTML={{
    __html: `
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/bull-room')) {
        (function(c,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          
          // Configure for full tracking while maintaining privacy
          c[a]('set', 'cookies', false);
          // Enable Smart Events by removing track: false
        })(window, document, "clarity", "script", "t0h9wf1q4x");
      }
    `
  }}
/>
```

## File Changes Required

### Files to Delete
- `src/services/datafast.ts`
- `src/services/datafastApi.ts`
- `src/contexts/DatafastContext.tsx`
- `src/hooks/useDatafastAnalytics.ts`
- `src/app/api/analytics/goal/route.ts`

### Files to Create
- `src/services/clarity.ts`
- `src/contexts/ClarityContext.tsx`
- `src/hooks/useClarityAnalytics.ts`

### Files to Update
- `src/app/layout.tsx` - Update Clarity configuration
- `src/components/ClientProviders.tsx` - Replace Datafast provider
- All 18 component files using Datafast - Update imports and calls

## Privacy & Compliance

### Maintained Privacy Features
- **Cookie-Free**: Continue with `clarity('set', 'cookies', false)`
- **GDPR Compliant**: No personal data collection without consent
- **Anonymous Tracking**: Session-based analytics only

### Enhanced Privacy with Clarity
- **Smart Events**: Automatic detection reduces manual event tracking
- **Session Recordings**: Visual insights without invasive tracking
- **Data Minimization**: Only collect necessary interaction data

## Benefits of Migration

### Simplified Stack
- **Single Analytics Provider**: Reduce complexity and maintenance
- **Unified Dashboard**: All insights in one place
- **Reduced Dependencies**: Fewer third-party scripts and services

### Enhanced Insights
- **Visual Analytics**: Heatmaps and session recordings
- **Smart Detection**: Automatic event detection
- **Better UX Understanding**: See exactly how users interact

### Performance Benefits
- **Fewer Scripts**: Remove Datafast script loading
- **Reduced API Calls**: No more server-side goal tracking
- **Simplified Codebase**: Less analytics infrastructure

## Migration Strategy

### Data Continuity
- **Parallel Tracking**: Brief overlap period for data validation
- **Event Mapping**: Ensure all current events are tracked in Clarity
- **Dashboard Setup**: Configure Clarity dashboard for same insights

### Rollback Plan
- **Keep Datafast Code**: In separate branch until migration validated
- **Quick Revert**: Ability to restore Datafast if issues arise
- **Data Backup**: Export current Datafast data before migration

## Success Criteria

### Technical Success
- ✅ All Datafast events successfully tracked in Clarity
- ✅ No cookies set (privacy maintained)
- ✅ No performance degradation
- ✅ All components successfully migrated

### Business Success
- ✅ Continued visibility into user behavior
- ✅ Enhanced UX insights from heatmaps/recordings
- ✅ Simplified analytics workflow
- ✅ Maintained conversion tracking

## Testing Plan

### Event Tracking Verification
1. **Smart Events Testing**: Verify automatic detection works
2. **Custom Events Testing**: Test manual event tracking
3. **Dashboard Validation**: Confirm events appear in Clarity
4. **Cross-Browser Testing**: Ensure compatibility

### Privacy Compliance Testing
1. **Cookie Verification**: Confirm no cookies set
2. **GDPR Compliance**: Verify continued compliance
3. **Data Collection Audit**: Review what data is collected

### Performance Testing
1. **Page Load Impact**: Measure any performance changes
2. **Script Loading**: Verify async loading works properly
3. **Error Monitoring**: Check for JavaScript errors

## Timeline

- **Day 1 Morning**: Create Clarity service and context
- **Day 1 Afternoon**: Update Clarity configuration and test
- **Day 2 Morning**: Migrate all components
- **Day 2 Afternoon**: Remove Datafast code and test

**Total Estimated Time**: 2 days

## Maintenance

### Ongoing Tasks
- **Weekly**: Review Clarity dashboard for insights
- **Monthly**: Validate event tracking accuracy
- **Quarterly**: Privacy compliance review

### Monitoring
- **Event Volume**: Ensure events are being tracked
- **Performance**: Monitor page load impact
- **Errors**: Watch for Clarity-related issues

---

**Migration Complexity**: Medium  
**Privacy Impact**: None (improved)  
**Performance Impact**: Positive (fewer scripts)  
**Maintenance Reduction**: Significant  
**UX Insights**: Enhanced
