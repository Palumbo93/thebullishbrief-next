# Briefs System Design

## Problem Statement

We need to create a briefs system that allows users to access and view brief content similar to articles, but with specific brief-related features. Briefs should have their own database tables, views tracking, and a dedicated page component that blends the functionality of ArticlePage.tsx with the design elements from sonic-strategy.tsx.

## Goals

- **Dynamic Brief Pages**: Create a BriefPage component that can display any brief content dynamically
- **View Tracking**: Implement brief_views table identical to article_views for analytics
- **Database Structure**: Create briefs table with all required fields
- **Admin Management**: Allow creation and management of briefs through admin interface
- **SEO Optimization**: Proper slug-based routing and meta tags
- **Performance**: Efficient caching and loading similar to articles

## Database Design

### Article Views System Analysis

Before implementing brief views, let's analyze how article views are managed to create a 1:1 replication:

#### Article Views Table Structure
```sql
CREATE TABLE article_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id) ON DELETE CASCADE,
  user_id uuid,
  ip_address inet,
  user_agent text,
  referrer text,
  viewed_at timestamptz DEFAULT now()
);
```

#### Article Views Indexes
```sql
CREATE INDEX idx_article_views_article_id ON article_views USING btree (article_id);
CREATE INDEX idx_article_views_viewed_at ON article_views USING btree (viewed_at DESC);
```

#### Article Views RLS Policies
```sql
-- Anyone can create article views
CREATE POLICY "Anyone can create article views"
  ON article_views
  AS permissive
  FOR insert
  TO public
  WITH CHECK (true);

-- Users can view their own article views
CREATE POLICY "Users can view their own article views"
  ON article_views
  AS permissive
  FOR select
  TO authenticated
  USING (auth.uid() = user_id);
```

#### Article Views Triggers and Functions
```sql
-- Function to update article view count
CREATE OR REPLACE FUNCTION update_article_view_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE articles 
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = NEW.article_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update view counts
CREATE TRIGGER update_article_view_count_trigger
  AFTER INSERT ON article_views
  FOR EACH ROW
  EXECUTE FUNCTION update_article_view_count();

-- Function to check if view should be counted (deduplication)
CREATE OR REPLACE FUNCTION should_count_view(
  p_article_id text,
  p_ip_address text,
  p_user_id text DEFAULT NULL,
  p_time_window interval DEFAULT '1 hour'
) RETURNS boolean AS $$
DECLARE
  existing_view_count integer;
BEGIN
  -- Check for existing view within time window for anonymous users
  SELECT COUNT(*) INTO existing_view_count
  FROM article_views
  WHERE article_id = p_article_id
    AND ip_address = p_ip_address::inet
    AND viewed_at > NOW() - p_time_window;
  
  -- If user is authenticated, also check user-based deduplication
  IF p_user_id IS NOT NULL AND p_user_id != '' THEN
    SELECT COUNT(*) INTO existing_view_count
    FROM article_views
    WHERE article_id = p_article_id
      AND user_id = p_user_id::uuid
      AND viewed_at > NOW() - INTERVAL '24 hours';
  END IF;
  
  -- Return true if no existing view found
  RETURN existing_view_count = 0;
END;
$$ LANGUAGE plpgsql;
```

#### Article Views Frontend Implementation

The article views system uses a sophisticated hook-based approach:

**useTrackArticleView Hook Features:**
- Client-side deduplication (5-second cooldown per article)
- Server-side deduplication (1 hour per IP, 24 hours per user)
- Optimistic cache updates
- Error handling and retry logic
- Support for both UUID and slug-based article IDs

**useArticleViewCount Hook Features:**
- Cached view count queries
- Support for both UUID and slug lookups
- 5-minute stale time, 10-minute garbage collection
- Fallback to 0 if query fails

**Key Implementation Details:**
1. **Deduplication Strategy**: Multiple layers (client-side, IP-based, user-based)
2. **Cache Management**: Optimistic updates with React Query
3. **Error Handling**: Graceful degradation on tracking failures
4. **Performance**: Minimal database impact with efficient queries
5. **Privacy**: IP-based tracking for anonymous users, user-based for authenticated

### Briefs Table
```sql
CREATE TABLE briefs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  subtitle text,
  content text NOT NULL,
  sponsored boolean DEFAULT false,
  disclaimer text,
  featured_image_url text,
  featured_image_alt text,
  reading_time_minutes integer DEFAULT 5,
  status text DEFAULT 'draft',
  view_count integer DEFAULT 0,
  video_url text,
  show_cta boolean DEFAULT false,
  tickers jsonb,
  widget_code text,
  investor_deck_url text,
  featured boolean DEFAULT false,
  company_name text,
  company_logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

**Additional Brief Fields:**
- `video_url`: Optional video URL for embedded video content
- `show_cta`: Boolean flag to control CTA (Call-to-Action) display
- `tickers`: JSONB array of ticker pairs (e.g., `[{"CSE":"SONC"},{"OTC":"SONCF"}]`)
- `widget_code`: Optional custom widget/embed code
- `investor_deck_url`: Optional URL to investor deck PDF/document
- `featured`: Boolean flag to mark the featured brief (only one should be featured)
- `company_name`: Company name for the brief
- `company_logo_url`: URL to the company logo

### Brief Views Table (1:1 Replication of article_views)
```sql
CREATE TABLE brief_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brief_id uuid REFERENCES briefs(id) ON DELETE CASCADE,
  user_id uuid,
  ip_address inet,
  user_agent text,
  referrer text,
  viewed_at timestamptz DEFAULT now()
);
```

### Brief Views Indexes (Identical to article_views)
```sql
CREATE INDEX idx_brief_views_brief_id ON brief_views USING btree (brief_id);
CREATE INDEX idx_brief_views_viewed_at ON brief_views USING btree (viewed_at DESC);
```

### Brief Views RLS Policies (Identical to article_views)
```sql
-- Anyone can create brief views
CREATE POLICY "Anyone can create brief views"
  ON brief_views
  AS permissive
  FOR insert
  TO public
  WITH CHECK (true);

-- Users can view their own brief views
CREATE POLICY "Users can view their own brief views"
  ON brief_views
  AS permissive
  FOR select
  TO authenticated
  USING (auth.uid() = user_id);
```

### Brief Views Triggers and Functions (1:1 Replication)
```sql
-- Function to update brief view count (identical to article version)
CREATE OR REPLACE FUNCTION update_brief_view_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE briefs 
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = NEW.brief_id;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update view counts
CREATE TRIGGER update_brief_view_count_trigger
  AFTER INSERT ON brief_views
  FOR EACH ROW
  EXECUTE FUNCTION update_brief_view_count();

-- Function to check if brief view should be counted (deduplication)
CREATE OR REPLACE FUNCTION should_count_brief_view(
  p_brief_id text,
  p_ip_address text,
  p_user_id text DEFAULT NULL,
  p_time_window interval DEFAULT '1 hour'
) RETURNS boolean AS $$
DECLARE
  existing_view_count integer;
BEGIN
  -- Check for existing view within time window for anonymous users
  SELECT COUNT(*) INTO existing_view_count
  FROM brief_views
  WHERE brief_id = p_brief_id
    AND ip_address = p_ip_address::inet
    AND viewed_at > NOW() - p_time_window;
  
  -- If user is authenticated, also check user-based deduplication
  IF p_user_id IS NOT NULL AND p_user_id != '' THEN
    SELECT COUNT(*) INTO existing_view_count
    FROM brief_views
    WHERE brief_id = p_brief_id
      AND user_id = p_user_id::uuid
      AND viewed_at > NOW() - INTERVAL '24 hours';
  END IF;
  
  -- Return true if no existing view found
  RETURN existing_view_count = 0;
END;
$$ LANGUAGE plpgsql;
```

## Frontend Architecture

### 1. Database Types
Update `src/lib/database.types.ts` to include briefs and brief_views tables.

### 2. Hooks Structure
Create `src/hooks/useBriefs.ts` with:
- `useFeaturedBrief()` - Fetch the latest featured brief only
- `useBriefBySlug(slug)` - Fetch single brief
- `useBriefViews(briefId)` - Track brief views (1:1 replication of useArticleViews)
- `useBriefViewCount(briefId)` - Get view count (1:1 replication of useArticleViewCount)

**Note:** No briefs list page - only individual brief pages and featured brief display in SearchPage

#### Brief Views Hooks (1:1 Replication of Article Views)

**useTrackBriefView Hook:**
- Identical functionality to `useTrackArticleView`
- Client-side deduplication (5-second cooldown per brief)
- Server-side deduplication (1 hour per IP, 24 hours per user)
- Optimistic cache updates with React Query
- Support for both UUID and slug-based brief IDs
- Error handling and retry logic

**useBriefViewCount Hook:**
- Identical functionality to `useArticleViewCount`
- Cached view count queries
- Support for both UUID and slug lookups
- 5-minute stale time, 10-minute garbage collection
- Fallback to 0 if query fails

**Implementation Details:**
- Copy `useArticleViews.ts` to `useBriefViews.ts`
- Replace all `article` references with `brief`
- Replace all `article_views` references with `brief_views`
- Replace all `articles` table references with `briefs`
- Update query keys to use brief-specific keys
- Maintain identical deduplication and caching strategies

### 3. BriefPage Component
Create `src/pages/BriefPage.tsx` that:
- **Base Structure**: Similar to ArticlePage.tsx with article-like layout
- **Dynamic Action Panel**: Integrates BriefsActionPanel.tsx as a sidebar
- **Video Integration**: Embedded video popup functionality
- **CTA Management**: Dynamic CTA sections based on `show_cta` flag
- **Ticker Display**: Dynamic ticker widgets from BriefsActionPanel
- **Custom Widgets**: Support for embedded widget code
- **Investor Deck**: Optional investor deck links
- **View Tracking**: Track brief views like articles
- **SEO Optimization**: Proper meta tags and structured data

### 4. Admin Interface
Add brief management to AdminPage.tsx:
- Brief creation/editing modal
- Brief management with status control
- Featured brief selection (only one can be featured)
- View count analytics
- No briefs list page - briefs are accessed via individual URLs only

## Implementation Phases

### Phase 1: Database Setup (1 hour)
- [ ] Create briefs table migration
- [ ] Create brief_views table migration
- [ ] Add triggers and functions
- [ ] Update database types
- [ ] Add RLS policies

### Phase 2: Core Hooks (1 hour)
- [ ] Create useFeaturedBrief hook (fetch latest featured brief only)
- [ ] Create useBriefBySlug hook
- [ ] Create useBriefViews hook (similar to useArticleViews)
- [ ] Create useBriefViewCount hook
- [ ] Update SearchPage to display featured brief card

### Phase 3: BriefPage Component (2.5 hours)
- [ ] Create BriefPage.tsx component with ArticlePage-like structure
- [ ] Integrate BriefsActionPanel.tsx as dynamic sidebar
- [ ] Add video popup functionality for embedded videos
- [ ] Implement dynamic CTA sections based on `show_cta` flag
- [ ] Add ticker widget integration from BriefsActionPanel
- [ ] Add custom widget rendering support
- [ ] Add investor deck link functionality
- [ ] Add sponsored content and disclaimer handling
- [ ] Implement view tracking
- [ ] Add proper routing and SEO meta tags

### Phase 4: Admin Integration (1 hour)
- [ ] Add brief management to AdminPage
- [ ] Create BriefCreateModal
- [ ] Create BriefEditModal
- [ ] Add featured brief selection (only one can be featured)
- [ ] Add brief management dashboard (no public list)

### Phase 5: Testing & Polish (30 mins)
- [ ] Test view tracking
- [ ] Test admin functionality
- [ ] Verify SEO and meta tags
- [ ] Performance testing

## Component Design

### BriefPage.tsx Structure
```typescript
interface BriefPageProps {
  briefId: number | string;
  onBack: () => void;
  onCreateAccountClick?: () => void;
}

export const BriefPage: React.FC<BriefPageProps> = ({ 
  briefId, 
  onBack, 
  onCreateAccountClick 
}) => {
  // Base structure similar to ArticlePage.tsx
  // - Article-like layout with header, content, footer
  // - Dynamic BriefsActionPanel as sidebar
  // - Video popup integration (if video_url present)
  // - Dynamic CTA sections (if show_cta is true)
  // - Ticker widgets from BriefsActionPanel
  // - Custom widget rendering (if widget_code present)
  // - Investor deck links (if investor_deck_url present)
  // - View tracking for briefs
}
```

### BriefPage Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                    Header (Article-like)                    │
├────────────────────────────────┬───────────────────────────┤
│                                │                            │
│        Content Area            │    BriefsActionPanel       │
│     (Article-like layout)      │      (Dynamic Sidebar)     │
│                                │                            │
│  - Title & Subtitle            │  - CTA Buttons             │
│  - Author/Meta Info            │  - Table of Contents       │
│  - Featured Image              │  - Ticker Widgets          │
│  - Content                     │  - Custom Widgets          │
│  - Video (if present)          │  - Investor Deck Links     │
│  - Custom Widgets (if present) │                            │
│  - Disclaimer                  │                            │
│                                │                            │
├─────────────────────────────────┴───────────────────────────┤
│                    Footer (Article-like)                    │
└─────────────────────────────────────────────────────────────┘
* Note: Dont show View Count On Brief Page
```

### Brief-Specific Components

**Dynamic BriefsActionPanel Integration:**
```typescript
interface BriefsActionPanelProps {
  brief: Brief;
  onCreateAccountClick?: () => void;
  tickerWidget?: React.ReactNode;
  sections?: TOCItem[];
  onSectionClick?: (sectionId: string) => void;
}
```

**VideoPopup Component:**
```typescript
interface VideoPopupProps {
  videoUrl: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}
```

**Dynamic CTABanner Component:**
```typescript
interface CTABannerProps {
  show: boolean;
  onCreateAccountClick?: () => void;
  variant?: 'primary' | 'secondary';
  position?: 'top' | 'bottom';
}
```

**CustomWidget Component:**
```typescript
interface CustomWidgetProps {
  widgetCode: string;
  title?: string;
  position?: 'sidebar' | 'content';
}
```

**TickerWidget Component:**
```typescript
interface TickerWidgetProps {
  tickers: Array<{[exchange: string]: string}>;
  // Example: [{"CSE":"SONC"},{"OTC":"SONCF"}]
  position?: 'sidebar' | 'content';
}
```

### Key Features
1. **Article-like Layout**: Base structure similar to ArticlePage.tsx
2. **Dynamic Action Panel**: BriefsActionPanel.tsx as responsive sidebar
3. **Video Popup Integration**: Modal video player for embedded content
4. **Dynamic CTA Sections**: Configurable call-to-action display
5. **Ticker Widgets**: Stock ticker display from BriefsActionPanel
6. **Custom Widget Support**: Embedded widget code rendering
7. **Investor Deck Links**: Optional investor deck document links
8. **Sponsored Content**: Special styling for sponsored briefs
9. **Disclaimer Support**: Display disclaimers when present
10. **Featured Brief Display**: Latest featured brief shown in SearchPage
11. **View Tracking**: Track brief views like articles (but don't display count)
12. **SEO Optimized**: Proper meta tags and structured data
13. **Responsive Design**: Mobile-friendly layout with collapsible sidebar
14. **Performance**: Efficient loading and caching
15. **No List Page**: Briefs accessed via individual URLs only

## Database Policies

### RLS Policies for Briefs
```sql
-- Briefs are viewable by everyone when published
CREATE POLICY "Published briefs are viewable by everyone"
  ON briefs
  FOR SELECT
  TO public
  USING (status = 'published');

-- Briefs are manageable by content managers
CREATE POLICY "Briefs are manageable by content managers"
  ON briefs
  FOR ALL
  TO authenticated
  USING (user_has_permission(auth.uid(), 'briefs', 'read') OR 
         user_has_permission(auth.uid(), 'briefs', 'update') OR 
         user_has_permission(auth.uid(), 'briefs', 'delete'))
  WITH CHECK (user_has_permission(auth.uid(), 'briefs', 'create') OR 
              user_has_permission(auth.uid(), 'briefs', 'update'));
```

### RLS Policies for Brief Views (1:1 Replication of Article Views)
```sql
-- Anyone can create brief views
CREATE POLICY "Anyone can create brief views"
  ON brief_views
  AS permissive
  FOR insert
  TO public
  WITH CHECK (true);

-- Users can view their own brief views
CREATE POLICY "Users can view their own brief views"
  ON brief_views
  AS permissive
  FOR select
  TO authenticated
  USING (auth.uid() = user_id);
```

**Note:** These policies are identical to the article_views policies, ensuring the same security model and access patterns.

## Success Criteria

- [ ] Briefs can be created and managed through admin interface
- [ ] BriefPage displays any brief content dynamically
- [ ] Featured brief displays in SearchPage as a brief card
- [ ] View tracking works for briefs (identical to articles)
- [ ] Sponsored content is properly displayed
- [ ] Disclaimers show when present
- [ ] SEO meta tags are properly set
- [ ] Performance is equivalent to ArticlePage
- [ ] Mobile responsive design
- [ ] Proper error handling and loading states
- [ ] No briefs list page - briefs accessed via individual URLs only

## Future Enhancements

### Analytics Dashboard
- Brief performance metrics
- View count trends
- Sponsored content analytics

### Content Features
- Brief categories/tags
- Related briefs
- Brief comments system
- Brief bookmarks

### Integration Opportunities
- Newsletter integration
- Social media sharing
- Email marketing campaigns
- A/B testing for brief content

## Technical Considerations

### Performance
- Efficient caching strategy
- Optimistic updates for view counts
- Lazy loading for images
- Minimal database queries

### Security
- Proper RLS policies
- Input validation
- XSS prevention for content
- Rate limiting for view tracking

### SEO
- Proper meta tags
- Structured data
- Open Graph tags
- Twitter Card support

### Accessibility
- Proper heading structure
- Alt text for images
- Keyboard navigation
- Screen reader support

---

*This design provides a complete briefs system that integrates seamlessly with the existing articles infrastructure while adding brief-specific features.* 