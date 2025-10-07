# SSR Article Content for AI Crawlers - Design Document

## Problem Statement

AI crawlers and search engines cannot read article content because the entire article page is wrapped in client components (`'use client'`), forcing Next.js to serialize content as JavaScript RSC (React Server Component) streaming payloads instead of rendering it as static HTML in the `<body>` tag.

**Current Issues:**
- Article content is buried in JavaScript streaming payloads (`self.__next_f.push([...])`)
- AI crawlers see empty HTML body with only script tags
- Search engines cannot index article content effectively
- Poor SEO performance for article pages
- Reduced discoverability and content visibility

**Value Proposition:**
- Enable AI crawlers to read full article content directly from HTML
- Improve SEO rankings and search visibility
- Maintain all existing interactive features
- Better performance through server-side rendering
- Enhanced accessibility (content available without JavaScript)

## Root Cause Analysis

### 1. Client Component Boundaries
- **`ArticlePage.tsx`**: Marked with `'use client'` directive
- **`ArticlePageClient.tsx`**: Wrapper that fetches data client-side
- **Root Layout Structure**: The `src/app/layout.tsx` wraps ALL page content inside client components:
  ```tsx
  <ClientProviders>    // 'use client'
    <AppContent>       // 'use client' - children prop
      {children}       // ❌ All pages wrapped in client components!
    </AppContent>
  </ClientProviders>
  ```

### 2. Client-Side Data Fetching
- Articles are fetched using client-side hooks (`useArticleBySlugIncludingDrafts`)
- Content rendering happens after client-side hydration
- No server-side content in initial HTML response

### 3. Access Control Architecture
- Authentication checks happen client-side
- Premium content decisions made in browser
- No server-side access control logic

## Solution Architecture

### Phase 1: Server-Side Access Control
Create server-only utilities to determine article access without client-side dependencies.

**New Files:**
- `lib/supabase-server.ts` - Server-side Supabase client with cookie authentication
- `lib/serverAccessControl.ts` - Server-side access control logic

**Key Functions:**
```typescript
export async function determineArticleAccess(article: Article): Promise<{
  renderMode: 'full' | 'preview' | 'blocked';
  reason: string;
  user?: User;
}> {
  // Server-side authentication and subscription checks
  // Returns access decision without client-side hooks
}
```

### Phase 2: True Server Component for Article Content
Convert `ArticlePage.tsx` from client component to pure server component.

**Critical Changes:**
1. ✅ Remove `'use client'` directive
2. ✅ Remove all client-side hooks (`useState`, `useEffect`, `useRouter`, etc.)
3. ✅ Replace with server-side data fetching
4. ✅ Render actual HTML content server-side
5. ✅ Replace `styled-jsx` with inline styles (Server Component compatibility)

**What Gets Rendered Server-Side:**
- Article title and metadata
- Featured image
- Author information and avatar
- Full article HTML content (for accessible articles)
- Preview content with paywall (for premium articles)
- Tags and related content
- All SEO-critical elements

### Phase 3: Client Component Extraction
Extract all interactive features into separate client components that enhance the server-rendered content.

**New Client Components:**
1. **`ArticleInteractiveShell.tsx`** - Mobile header, share functionality, analytics
2. **`ArticleScrollTracker.tsx`** - Scroll detection and desktop banner
3. **`ArticleDesktopBanner.tsx`** - Desktop navigation with actions
4. **`ArticleEnhancements.tsx`** - TOC, related articles, interactive features
5. **`ArticleGradientBackground.tsx`** - Visual enhancements

**Component Architecture:**
```
ArticlePageServer (Server Component ✅)
├─ [Server-rendered HTML content]
├─ ArticleInteractiveShell (Client - interactivity)
├─ ArticleScrollTracker (Client - scroll state)
├─ ArticleEnhancements (Client - TOC/Related)
└─ [More server-rendered content]
```

### Phase 4: Root Layout Restructure
Fix the critical architectural issue in `src/app/layout.tsx`.

**Before:**
```tsx
<ClientProviders>
  <AppContent>
    {children}  // ❌ Everything gets streamed as JavaScript
  </AppContent>
</ClientProviders>
```

**After:**
```tsx
<ClientProviders>
  {children}      // ✅ Server components render as HTML
  <AppContent />  // Client component for modals/toasts only
</ClientProviders>
```

This change allows server components to render as static HTML instead of being serialized as RSC streaming payloads.

### Phase 5: Article Route Updates
Update `src/app/articles/[slug]/page.tsx` to use server-side rendering.

**Key Changes:**
1. Add `determineArticleAccess()` call for server-side access control
2. Replace `ArticlePageClient` with `ArticlePageServer`
3. Pass access result to determine full/preview rendering
4. Update SEO metadata with proper `isAccessibleForFree` flag

## Technical Implementation

### Server-Side Supabase Client
```typescript
// lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Server-side cookie handling
        },
      },
    }
  )
}
```

### Server-Side Access Control
```typescript
// lib/serverAccessControl.ts
export async function determineArticleAccess(article: Article) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if article is premium
  if (!article.premium) {
    return { renderMode: 'full', reason: 'free_article', user }
  }
  
  // Check user subscription status
  if (user) {
    // Check subscription logic
    return { renderMode: 'full', reason: 'subscribed_user', user }
  }
  
  return { renderMode: 'preview', reason: 'premium_content', user: null }
}
```

### Server Component Structure
```typescript
// page-components/ArticlePageServer.tsx
import { determineArticleAccess } from '../lib/serverAccessControl'

interface ArticlePageServerProps {
  article: Article;
  accessResult: AccessResult;
}

export async function ArticlePageServer({ article, accessResult }: ArticlePageServerProps) {
  // Pure server component - no 'use client'
  // Renders actual HTML content
  
  return (
    <main className="article-page-main">
      <h1>{article.title}</h1>
      
      {accessResult.renderMode === 'full' ? (
        <div className="html-content" dangerouslySetInnerHTML={{ __html: article.content }} />
      ) : (
        <div className="preview-content">
          <div dangerouslySetInnerHTML={{ __html: article.preview }} />
          <div className="paywall">
            <p>This article is available to premium subscribers only.</p>
          </div>
        </div>
      )}
      
      {/* Client components for interactivity */}
      <ArticleInteractiveShell article={article} user={accessResult.user} />
      <ArticleEnhancements article={article} />
    </main>
  )
}
```

## Expected Results

### Before vs After HTML Output

**Before (Client-Side Rendering):**
```html
<body>
  <script>self.__next_f.push([1,"..."])</script>
  <script>self.__next_f.push([2,"..."])</script>
  <!-- 50+ streaming payloads with article content buried in JavaScript -->
</body>
```

**After (Server-Side Rendering):**
```html
<body>
  <main class="article-page-main">
    <h1>The Resource Rumble: Commodities Make a Comeback</h1>
    <div class="html-content">
      <p>Commodities have been through a lost decade...</p>
      <h2>Fragile Supply Lines</h2>
      <p>At the core of this potential shift lies supply...</p>
      <!-- Full 7,725-word article rendered as HTML! -->
    </div>
  </main>
  <script>self.__next_f.push([1,"..."])</script>  <!-- Only 1 streaming call -->
</body>
```

### Performance Metrics
- **RSC Streaming Calls**: Reduced from 50+ to 1-2
- **Initial HTML Size**: Increased (content now in HTML)
- **Crawlability**: ✅ Full content visible to AI crawlers
- **SEO**: ✅ Search engines can index article text
- **FCP**: ✅ Faster First Contentful Paint
- **User Experience**: ✅ All interactive features preserved

## Implementation Plan

### Phase 1: Foundation (Day 1)
1. Create `lib/supabase-server.ts`
2. Create `lib/serverAccessControl.ts`
3. Write unit tests for access control logic

### Phase 2: Server Component (Day 2)
1. Create `page-components/ArticlePageServer.tsx`
2. Remove `'use client'` and client-side hooks
3. Implement server-side content rendering
4. Replace styled-jsx with inline styles

### Phase 3: Client Components (Day 3)
1. Extract interactive features to separate components
2. Create `ArticleInteractiveShell.tsx`
3. Create `ArticleScrollTracker.tsx`
4. Create `ArticleEnhancements.tsx`

### Phase 4: Layout Fix (Day 4)
1. Restructure `src/app/layout.tsx`
2. Update `AppContent.tsx` to remove children prop
3. Test server component rendering

### Phase 5: Integration (Day 5)
1. Update `src/app/articles/[slug]/page.tsx`
2. Replace `ArticlePageClient` with `ArticlePageServer`
3. Add server-side access control calls
4. Update metadata generation

### Phase 6: Testing & Validation (Day 6)
1. Test with curl to verify HTML output
2. Validate all interactive features work
3. Test authentication flows
4. Verify SEO metadata
5. Test with AI crawler tools

## Risk Mitigation

### Technical Risks
- **styled-jsx incompatibility**: Replace with inline styles or CSS modules
- **Client hook dependencies**: Extract to separate client components
- **Authentication state**: Use server-side cookie reading

### User Experience Risks
- **Interactive features**: Preserve all existing functionality in client components
- **Loading states**: Implement proper server-side loading handling
- **Error boundaries**: Add server-side error handling

### SEO Risks
- **Metadata accuracy**: Ensure server-side metadata matches content
- **Schema markup**: Update JSON-LD with proper accessibility flags
- **Crawl budget**: Monitor for any negative SEO impacts

## Success Metrics

### Technical Metrics
- [ ] Article content visible in HTML `<body>` tag
- [ ] RSC streaming calls reduced to <5 per page
- [ ] All interactive features preserved
- [ ] Build output shows articles as `●  (SSG)`

### SEO Metrics
- [ ] AI crawlers can extract full article content
- [ ] Google Search Console shows improved indexing
- [ ] Article pages rank higher in search results
- [ ] Increased organic traffic to articles

### User Experience Metrics
- [ ] Faster page load times (FCP improvement)
- [ ] Same interactive functionality
- [ ] Proper authentication flows
- [ ] Mobile experience unchanged

## Future Enhancements

### Short Term (Next Sprint)
- [ ] Apply same SSR pattern to brief pages
- [ ] Add Edge Runtime support for faster response times
- [ ] Implement proper caching strategies

### Long Term (Next Quarter)
- [ ] Server-side rendering for other content pages
- [ ] Advanced personalization with server components
- [ ] Performance monitoring and optimization

## Conclusion

This refactor will transform our article pages from client-rendered JavaScript applications into true server-side rendered HTML pages while preserving all interactive features. The result will be full AI crawler and search engine visibility, leading to improved SEO performance and content discoverability.

The key insight is that the root layout structure was preventing server components from rendering as HTML. By restructuring the layout and extracting client-side features into separate components, we can achieve the best of both worlds: server-side content rendering for crawlers and rich interactivity for users.
