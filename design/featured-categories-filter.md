# Featured Categories Filter for Publication Header

## Problem Statement

The current PublicationHeader displays all categories in the CategoryList component, which can create visual clutter and cognitive overload for users navigating the site. The header navigation should focus on the most important categories to provide a cleaner, more focused user experience.

**Key Issues:**
- All categories are displayed regardless of importance or frequency of use
- Header navigation can become crowded with too many category options
- No way to highlight the most important categories for users
- Database already has a `featured: boolean` field that isn't being utilized

**Goal:** Modify the CategoryList component when used in PublicationHeader to only display categories marked as `featured: true`, creating a cleaner and more focused navigation experience.

## Design Solution

### Data Flow Changes
- Modify the category filtering logic in Layout.tsx to only pass featured categories to PublicationHeader
- Preserve the existing CategoryList component interface to maintain backward compatibility
- Ensure the database `featured` field is properly utilized in the useCategories hook

### Component Architecture
- **Option A**: Filter categories in Layout.tsx before passing to PublicationHeader
- **Option B**: Add a `showFeaturedOnly` prop to CategoryList component
- **Option C**: Create a new `FeaturedCategoryList` component specifically for the header

**Recommended Approach**: Option A - Filter in Layout.tsx as it's the simplest and most direct solution.

### Database Integration
- Leverage the existing `featured: boolean` field in the categories table
- Ensure the useCategories hook includes the featured field in its response
- Maintain sort_order for proper category ordering

### User Experience
- Cleaner header navigation with fewer, more relevant categories
- Focused experience highlighting the most important content areas
- Maintain existing hover states and interaction patterns
- Preserve mobile responsiveness

## Implementation Plan

### Phase 1: Data Layer Updates
1. Verify the useCategories hook returns the `featured` field
2. Update the category filtering logic in Layout.tsx
3. Test that featured categories are properly identified

### Phase 2: UI Integration
1. Modify the category mapping in Layout.tsx to filter for `featured: true`
2. Update TypeScript interfaces if needed to include the featured property
3. Ensure proper fallback behavior if no featured categories exist

### Phase 3: Testing & Validation
1. Test the header displays only featured categories
2. Verify existing CategoryList functionality in other locations remains unchanged
3. Test responsive behavior across device sizes
4. Validate category links and navigation still work correctly

## Technical Implementation

### Files to Modify:
- `src/components/Layout.tsx` - Add filtering logic for featured categories
- `src/hooks/useArticles.ts` - Ensure featured field is included in category data
- Type definitions may need updates to include featured property in interfaces

### Code Changes:
```typescript
// In Layout.tsx, modify the categories prop:
categories={categoriesData?.filter(category => category.featured).map(category => ({
  id: category.id,
  name: category.name,
  slug: category.slug
})) || []}
```

### Backward Compatibility:
- CategoryList component remains unchanged and can still display all categories when used elsewhere
- Other usages of CategoryList (if any) are unaffected
- Database schema already supports the featured field

## Success Criteria

- PublicationHeader displays only categories where `featured: true`
- Header navigation appears cleaner and less cluttered
- Category links and navigation continue to work as expected
- Responsive design is maintained across all device sizes
- No breaking changes to existing CategoryList functionality
- Performance impact is minimal (filtering is lightweight)

## Risk Mitigation

- **No Featured Categories**: Implement fallback to show all categories if no featured categories exist
- **Database Issues**: Ensure proper error handling if featured field is missing
- **Admin Interface**: Consider how admins will manage which categories are featured (future enhancement)
