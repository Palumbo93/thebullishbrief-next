# Show Featured Media Control for Briefs

## Problem Statement

We need to add a `show_featured_media` boolean field to the brief table that allows administrators to control whether the FeaturedMedia component (videos, images) is displayed on the Brief Page. This will give content managers granular control over whether featured media appears for specific briefs, allowing them to hide it when needed without removing the actual media URLs.

## Current State Analysis

### Brief Table Structure
The briefs table currently has these media-related fields:
- `featured_image_url` - URL for featured image
- `featured_image_alt` - Alt text for featured image  
- `video_url` - URL for featured video
- `featured_video_thumbnail` - Thumbnail for featured video
- `feature_featured_video` - Boolean controlling video position (header vs action panel)

### FeaturedMedia Component Usage
The FeaturedMedia component is used in two places in BriefPage:
1. **Mobile Position** (line 438-447): Displays below headline, above info bar
2. **Desktop Position** (line 529-539): Currently hidden (`display: 'none'`)

The component shows:
- Featured video with thumbnail and play button (when `featureFeaturedVideo=true` and `videoUrl` exists)
- Featured image (when no video or `featureFeaturedVideo=false` and `featuredImageUrl` exists)
- Nothing (returns null when no media available)

## Proposed Solution

### 1. Database Schema Changes
Add a new boolean column to the briefs table:
```sql
ALTER TABLE public.briefs 
ADD COLUMN show_featured_media BOOLEAN NOT NULL DEFAULT true;
```

**Default Value Rationale**: Setting default to `true` ensures existing briefs continue to show featured media, maintaining backward compatibility.

### 2. Component Logic Updates
Modify the FeaturedMedia usage in BriefPage to check the new field:

```tsx
// Only render FeaturedMedia if show_featured_media is true
{brief?.show_featured_media && (
  <FeaturedMedia
    featureFeaturedVideo={brief?.feature_featured_video}
    videoUrl={brief?.video_url || undefined}
    videoThumbnail={brief?.featured_video_thumbnail || undefined}
    featuredImageUrl={brief?.featured_image_url || undefined}
    title={brief?.title || undefined}
    onVideoClick={handleVideoClick}
  />
)}
```

### 3. Admin Interface Updates
Update the brief creation/editing interfaces to include the new field:
- Add checkbox control in BriefCreateModal
- Add checkbox control in BriefEditModal
- Label: "Show Featured Media"
- Help text: "Display featured video or image on the brief page"

## Implementation Plan

### Phase 1: Database Migration
1. Create migration file to add `show_featured_media` column
2. Set default value to `true` for backward compatibility
3. Add appropriate comment for documentation

### Phase 2: Frontend Updates
1. Update BriefPage component to conditionally render FeaturedMedia
2. Verify TypeScript types are automatically updated from database schema
3. Update admin interfaces to manage the new field

### Phase 3: Testing
1. Test with briefs that have featured images
2. Test with briefs that have featured videos
3. Test with briefs that have both
4. Test with briefs that have neither
5. Verify admin interface works correctly

## Technical Considerations

### TypeScript Types
The Brief type is automatically generated from the database schema via `src/lib/database.types.ts`, so no manual type updates should be needed.

### Backward Compatibility
- Default value of `true` ensures existing briefs continue working
- No breaking changes to existing functionality
- Admin interfaces will show new field for future brief management

### Performance Impact
- Minimal: Only adds one boolean check to existing render logic
- No additional database queries needed
- No impact on bundle size

## Edge Cases

1. **Brief with `show_featured_media=false` but video in action panel**: The action panel video display is controlled by `feature_featured_video=false`, which is independent of this new field. This is correct behavior.

2. **Brief with media URLs but `show_featured_media=false`**: Media URLs remain in database but FeaturedMedia component doesn't render. This allows toggling without data loss.

3. **Brief with `show_featured_media=true` but no media URLs**: FeaturedMedia component already handles this by returning null when no media is available.

## Success Criteria

1. ✅ New `show_featured_media` column added to briefs table
2. ✅ FeaturedMedia component only renders when `show_featured_media=true`
3. ✅ Admin interfaces allow managing the new field
4. ✅ Existing briefs continue to work (backward compatibility)
5. ✅ No performance degradation
6. ✅ All edge cases handled appropriately

## Files to Modify

1. `supabase/migrations/[timestamp]_add_show_featured_media_to_briefs.sql` - New migration
2. `src/page-components/BriefPage.tsx` - Update FeaturedMedia conditional rendering
3. `src/components/admin/BriefCreateModal.tsx` - Add new field to creation form
4. `src/components/admin/BriefEditModal.tsx` - Add new field to editing form

## Future Considerations

This implementation provides a foundation for more granular media control. Future enhancements could include:
- Separate controls for mobile vs desktop display
- Conditional display based on user authentication status
- A/B testing capabilities for media presentation
