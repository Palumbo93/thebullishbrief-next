# Bull Room Unauthenticated Access Fix

## Problem Statement

When unauthenticated users visit the bull-room page, they receive multiple 400 Bad Request errors from the `get_user_profile_public` RPC function calls. This function requires authentication, but the application is attempting to call it for every message's user ID, even when the user is not signed in.

The errors occur in the `BullRoomMessageService.getMessages()` method, which fetches user profile data for all message authors using the `get_user_profile_public` RPC function. This function is designed to only work for authenticated users, but the service doesn't check authentication status before making these calls.

## Root Cause Analysis

1. **Authentication Check Missing**: The `BullRoomMessageService.getMessages()` method doesn't verify if the user is authenticated before calling `get_user_profile_public`
2. **RPC Function Security**: The `get_user_profile_public` function explicitly requires authentication (as seen in the migration file)
3. **Service Layer Design**: The service layer doesn't have access to authentication context to make conditional decisions

## Solution Design

### Approach 1: Conditional Profile Fetching (Recommended)

Modify the `BullRoomMessageService` to conditionally fetch user profiles based on authentication status.

**Pros:**
- Maintains security by not exposing sensitive profile data to unauthenticated users
- Provides graceful degradation for unauthenticated users
- Keeps the existing authenticated user experience intact

**Cons:**
- Requires passing authentication context to the service layer

### Approach 2: Create Public Profile Function

Create a new RPC function that returns only public profile data (username, profile_image) without requiring authentication.

**Pros:**
- Allows unauthenticated users to see basic profile information
- Maintains separation of concerns

**Cons:**
- Requires database migration
- May expose more data than intended for unauthenticated users

### Approach 3: Handle Errors Gracefully

Catch the 400 errors and provide fallback data for unauthenticated users.

**Pros:**
- Minimal code changes
- Quick implementation

**Cons:**
- Still makes unnecessary API calls
- Poor user experience with error logs

## Recommended Solution: Approach 1

### Implementation Plan

1. **Modify Service Interface**: Update `BullRoomMessageService` to accept an optional `isAuthenticated` parameter
2. **Conditional Profile Fetching**: Only call `get_user_profile_public` when user is authenticated
3. **Fallback Data**: Provide basic user information (username from message) for unauthenticated users
4. **Update Hook**: Modify `useBullRoomMessages` to pass authentication status to the service

### Code Changes

#### 1. Update BullRoomMessageService

```typescript
// Add isAuthenticated parameter to getMessages method
async getMessages(roomId: string, limit = 50, offset = 0, isAuthenticated = false): Promise<BullRoomMessage[]> {
  // ... existing message fetching code ...

  // Only fetch user profiles if authenticated
  const userProfilesMap = new Map<string, any>();
  
  if (isAuthenticated && userIds.length > 0) {
    for (const userId of userIds) {
      try {
        const { data: profileData, error: profileError } = await supabase
          .rpc('get_user_profile_public', { user_id: userId });
        
        if (!profileError && profileData && profileData.length > 0) {
          userProfilesMap.set(userId, profileData[0]);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
  }

  // ... rest of the method ...
}
```

#### 2. Update useBullRoomMessages Hook

```typescript
export const useBullRoomMessages = (roomId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['bull-room-messages', roomId],
    queryFn: () => messageService.getMessages(roomId, 50, 0, !!user),
    enabled: !!roomId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
```

#### 3. Update Other Service Methods

Apply the same pattern to `createMessage` and `updateMessage` methods.

### Testing Strategy

1. **Unauthenticated User Test**: Verify no RPC calls are made when user is not signed in
2. **Authenticated User Test**: Verify profile data is still fetched correctly
3. **Error Handling Test**: Ensure graceful handling if RPC calls fail
4. **Performance Test**: Verify no unnecessary API calls are made

### Migration Strategy

1. **Phase 1**: Implement the conditional profile fetching
2. **Phase 2**: Test with both authenticated and unauthenticated users
3. **Phase 3**: Deploy and monitor for any issues
4. **Phase 4**: Clean up any unused code or functions

## Success Criteria

- [ ] No 400 errors when unauthenticated users visit bull-room page
- [ ] Authenticated users still see full profile information
- [ ] Unauthenticated users see basic user information (username)
- [ ] No performance degradation for authenticated users
- [ ] Clean error logs without unnecessary failed API calls

## Future Considerations

- Consider implementing a public profile view for unauthenticated users if business requirements change
- Monitor user engagement to see if unauthenticated users need more profile information
- Consider caching profile data to reduce API calls for frequently viewed profiles


