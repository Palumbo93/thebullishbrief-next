# ExploreWidget Panel Design Document

## Problem Statement

The application needs an ExploreWidget panel in the Layout.tsx sidebar that provides quick access to search functionality, featured content, trending topics, and popular authors. This panel should be:

- Always visible (not expandable/collapsible)
- Condensed versions of existing search page components
- Integrated with the existing search page functionality
- Consistent with the current design system

## Requirements

### Functional Requirements
1. **Search Bar**: Compact search input that navigates to `/search` page
2. **Sponsored Brief**: Condensed version of FeaturedBriefCard
3. **Topic Flex List**: Horizontal scrollable list of trending topics
4. **Author List**: Vertical list of popular authors with avatars
5. **Navigation Integration**: All elements should navigate to `/search` page with appropriate parameters

### Technical Requirements
1. **Layout Integration**: Fit into the existing sidebar grid layout
2. **Responsive Design**: Work on desktop and tablet (hidden on mobile)
3. **Performance**: Use existing hooks and data fetching
4. **State Management**: Integrate with existing search state management
5. **Navigation**: Seamless integration with React Router

## Design Approach

### Layout Structure
```
┌─────────────────────────────────────┐
│ Search Bar (Compact)                │
├─────────────────────────────────────┤
│ Sponsored Brief (Condensed)         │
├─────────────────────────────────────┤
│ Trending Topics (Horizontal Scroll) │
├─────────────────────────────────────┤
│ Popular Authors (Vertical List)     │
└─────────────────────────────────────┘
```

### Component Architecture
1. **ExploreWidget**: Main container component
2. **CompactSearchBar**: Condensed search input
3. **CondensedBriefCard**: Simplified brief display
4. **TopicFlexList**: Horizontal scrollable topics
5. **AuthorList**: Vertical author list with avatars

### State Management
- Search query handling
- Navigation to search page
- Integration with existing search state
- Loading states for data fetching

### Navigation Flow
- Search input → `/search?q={query}`
- Topic clicks → `/search?tags={tag}`
- Author clicks → `/search?author={author}`
- Brief clicks → `/briefs/{slug}`

## Implementation Plan

### Phase 1: Core Components
1. Create `ExploreWidget` component
2. Create `CompactSearchBar` component
3. Create `CondensedBriefCard` component
4. Create `TopicFlexList` component
5. Create `AuthorList` component

### Phase 2: Layout Integration
1. Add ExploreWidget to Layout.tsx sidebar
2. Update grid layout to accommodate fixed-width panel
3. Add responsive behavior (hidden on mobile)
4. Test integration with existing navigation

### Phase 3: Data Integration
1. Integrate with existing hooks (`useArticles`, `useTags`, `useFeaturedBrief`)
2. Add loading states
3. Implement navigation handlers
4. Add error handling

### Phase 4: Polish & Testing
1. Test responsive design
2. Verify navigation flows
3. Add keyboard navigation
4. Test with different data states

## Technical Considerations

### Layout Integration
- Fixed width: 280px (same as article comments sidebar)
- Grid layout: `grid-template-columns: 80px 1fr 280px`
- Responsive: Hidden on mobile, visible on tablet/desktop
- Position: Right sidebar, always visible

### Component Design
- **CompactSearchBar**: Minimal search input with icon
- **CondensedBriefCard**: Simplified brief display (title, company, tickers only)
- **TopicFlexList**: Horizontal scroll with compact topic chips
- **AuthorList**: Vertical list with avatars and names

### Data Fetching
- Reuse existing hooks: `useFeaturedBrief`, `useTags`, `useArticles`
- Implement proper loading states
- Handle empty states gracefully
- Cache data appropriately

### Navigation
- All interactions navigate to `/search` page
- Preserve existing search functionality
- Support URL parameters for filtering
- Maintain browser history

## Success Metrics
- ExploreWidget displays correctly in sidebar
- All navigation flows work as expected
- Responsive design works on all devices
- Performance meets acceptable standards
- Integration with existing search functionality is seamless

## Implementation Details

### ExploreWidget Component Structure
```typescript
interface ExploreWidgetProps {
  onCreateAccountClick?: () => void;
  onArticleSelect?: (articleId: number | string, articleTitle: string) => void;
}

const ExploreWidget: React.FC<ExploreWidgetProps> = ({
  onCreateAccountClick,
  onArticleSelect
}) => {
  // Data fetching hooks
  const { data: brief } = useFeaturedBrief();
  const { data: tags } = useTags();
  const { data: articlesData } = useArticles();
  
  // Navigation handlers
  const navigate = useNavigate();
  
  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };
  
  const handleTopicClick = (tag: string) => {
    navigate(`/search?tags=${encodeURIComponent(tag)}`);
  };
  
  const handleAuthorClick = (author: string) => {
    navigate(`/search?author=${encodeURIComponent(author)}`);
  };
  
  return (
    <div className="explore-widget">
      <CompactSearchBar onSearch={handleSearch} />
      <CondensedBriefCard brief={brief} />
      <TopicFlexList tags={tags} onTopicClick={handleTopicClick} />
      <AuthorList authors={authors} onAuthorClick={handleAuthorClick} />
    </div>
  );
};
```

### Layout Integration
```typescript
// In Layout.tsx
const [exploreWidgetVisible] = React.useState(true); // Always visible

// Update grid template
const gridTemplateColumns = exploreWidgetVisible && actualCurrentLocation !== 'article' 
  ? '80px 1fr 280px' 
  : '80px 1fr 0px';

// Add ExploreWidget to sidebar
{actualCurrentLocation !== 'article' && (
  <aside className="explore-sidebar">
    <ExploreWidget 
      onCreateAccountClick={onCreateAccountClick}
      onArticleSelect={onArticleSelect}
    />
  </aside>
)}
```

### CSS Integration
```css
.explore-sidebar {
  border-left: 0.5px solid var(--color-border-primary);
  background: var(--color-bg-primary);
  overflow-y: auto;
  padding: var(--space-4);
}

.explore-widget {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  height: 100%;
}

/* Responsive */
@media (max-width: 768px) {
  .explore-sidebar {
    display: none;
  }
}
```
