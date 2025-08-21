# Admin Bull Room Access - Design Document

## Problem Statement

Currently, admins are treated the same as regular users when it comes to Bull Room access - they only see rooms that match their personal preferences. However, admins need broader access to:

1. **Monitor all active rooms** for moderation purposes
2. **Access admin-only channels** for internal communication
3. **Override preference-based filtering** to see the full room ecosystem

This creates a gap where admins cannot effectively moderate or manage the Bull Room system they're responsible for overseeing.

## Requirements

### Functional Requirements
- Admins should have access to all active Bull Rooms regardless of their personal preferences
- Create an "Admin" room that is only visible to users with admin privileges
- Maintain existing preference-based filtering for non-admin users
- Admin room should be clearly identifiable in the room list
- Admin room should have appropriate moderation tools and permissions

### Non-Functional Requirements
- Performance: Admin access checks should be efficient and not impact room loading times
- Security: Admin-only rooms must be properly secured at the database level
- Maintainability: Changes should integrate cleanly with existing preference mapping system
- Type Safety: All changes should maintain TypeScript type safety

## Architecture

### Current System Flow
```
useBullRooms() → fetch all active rooms → filter by isRoomVisibleToUser() → return filtered rooms
```

### Proposed System Flow
```
useBullRooms() → fetch all active rooms → 
  if (user.isAdmin) → return all rooms + admin rooms
  else → filter by isRoomVisibleToUser() → return filtered rooms
```

### Database Schema Changes
No database schema changes required - we can use the existing `bull_rooms` table with:
- A new admin room with `slug: 'admin'`
- Existing RLS policies already support admin access via `is_admin` field

### Code Changes

#### 1. Update `isRoomVisibleToUser()` function
Add admin access logic to the preference mapping utility:

```typescript
export const isRoomVisibleToUser = (
  roomSlug: string, 
  preferences: any, 
  isAdmin?: boolean
): boolean => {
  // Admins can see all rooms
  if (isAdmin) {
    return true;
  }
  
  // General room is always visible to non-admins
  if (roomSlug === 'general') {
    return true;
  }
  
  // Admin room is only visible to admins
  if (roomSlug === 'admin') {
    return false;
  }
  
  // Existing preference-based logic...
};
```

#### 2. Update `useBullRooms()` hook
Integrate admin status from AuthContext:

```typescript
export const useBullRooms = () => {
  const { data: userPreferences } = useUserPreferences();
  const { user } = useAuth(); // Add auth context
  
  return useQuery({
    queryKey: ['bull-rooms', userPreferences, user?.isAdmin],
    queryFn: async (): Promise<BullRoom[]> => {
      const { data, error } = await supabase
        .from('bull_rooms')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) {
        console.error('Error fetching bull rooms:', error);
        throw new Error(`Failed to fetch bull rooms: ${error.message}`);
      }

      const allRooms = data || [];
      
      // Filter rooms based on user preferences and admin status
      const filteredRooms = allRooms.filter(room => 
        isRoomVisibleToUser(room.slug, userPreferences, user?.isAdmin)
      );

      return filteredRooms;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
```

#### 3. Create Admin Room
Add a database migration or manual insert to create the admin room:

```sql
INSERT INTO bull_rooms (
  slug, name, topic, description, is_active, is_featured, sort_order
) VALUES (
  'admin', 
  'Admin', 
  'Internal admin discussions and moderation',
  'Private channel for administrators to coordinate moderation and discuss platform management',
  true, 
  false, 
  1 -- High sort order to appear at top
) ON CONFLICT (slug) DO NOTHING;
```

## Implementation Plan

### Phase 1: Core Logic (30 minutes)
1. Update `isRoomVisibleToUser()` function in `preferenceMapping.ts`
2. Update `useBullRooms()` hook to include admin status
3. Test with existing rooms

### Phase 2: Admin Room Creation (15 minutes)
1. Create admin room in database (manual SQL or migration)
2. Verify admin room appears for admin users only
3. Test non-admin users cannot see admin room

### Phase 3: Testing & Validation (15 minutes)
1. Test admin user sees all rooms including admin room
2. Test non-admin user sees only preference-matched rooms
3. Verify room filtering performance is maintained
4. Test edge cases (no preferences, invalid admin status)

## Success Criteria

1. ✅ Admin users can see all active Bull Rooms regardless of preferences
2. ✅ Admin users can see the admin-only room
3. ✅ Non-admin users continue to see only preference-matched rooms
4. ✅ Non-admin users cannot see the admin room
5. ✅ Performance impact is minimal
6. ✅ Type safety is maintained
7. ✅ Existing functionality for regular users is unchanged

## Technical Considerations

### Performance
- Admin status check adds minimal overhead to room filtering
- Query key includes admin status to ensure proper cache invalidation
- No additional database queries required

### Security
- Admin room visibility is enforced at the application level
- Database RLS policies already provide admin access controls
- Admin status comes from secure AuthContext

### Maintainability
- Changes are localized to preference mapping and room fetching logic
- Existing patterns and conventions are maintained
- Clear separation between admin and user access logic

### Type Safety
- `isRoomVisibleToUser` function signature updated with optional `isAdmin` parameter
- Hook dependencies properly typed
- No breaking changes to existing type definitions

## Future Considerations

### Enhanced Admin Features
- Admin room could have special UI indicators
- Admin users could have enhanced moderation tools in all rooms
- Admin room could support admin-specific message types or commands

### Granular Permissions
- Could extend to support different admin roles (moderator, super-admin, etc.)
- Room-specific admin permissions
- Time-based admin access

### Audit Trail
- Track admin access to rooms for security purposes
- Log admin actions in rooms for accountability


