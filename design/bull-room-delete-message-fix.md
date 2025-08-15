# Bull Room Delete Message Fix - Design Document

## Problem Statement

When a user deletes a message in a Bull Room, the deleted message remains visible to all users in the chat area instead of disappearing. This creates a poor user experience where deleted content continues to be displayed, which could be confusing and potentially problematic for content moderation.

**Current Issue:**
- Deleted message does not disappear from users or participants chat area
- No real-time update when messages are deleted
- UI doesn't reflect the deletion state properly

## Root Cause Analysis

Based on the existing Bull Room implementation, the issue likely stems from:

1. **Missing Real-time DELETE Event Handler**: The real-time subscription may not be properly handling DELETE events from the database
2. **Cache Invalidation**: The React Query cache may not be properly updated when messages are deleted
3. **UI State Management**: The UI components may not be properly reflecting the deletion state

## Solution Design

### Phase 1: Real-time Delete Event Handling

#### 1.1 Verify Real-time Subscription
Ensure the `useBullRoomRealtime` hook properly handles DELETE events:

```typescript
// In useBullRoomRealtime.ts
.on(
  'postgres_changes',
  {
    event: 'DELETE',
    schema: 'public',
    table: 'bull_room_messages',
    filter: `room_id=eq.${roomId}`,
  },
  (payload) => {
    const deletedMessageId = payload.old.id;
    
    // Remove message from cache
    queryClient.setQueryData(
      ['bull-room-messages', roomId],
      (oldData: BullRoomMessage[] = []) =>
        oldData.filter(msg => msg.id !== deletedMessageId)
    );
  }
)
```

#### 1.2 Optimistic Updates
Implement optimistic updates in the delete mutation to immediately remove the message from the UI:

```typescript
// In useDeleteMessage hook
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (messageId: string) => messageService.deleteMessage(messageId),
    onMutate: async (messageId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bull-room-messages'] });

      // Snapshot the previous value
      const previousMessages = queryClient.getQueryData(['bull-room-messages']);

      // Optimistically update to remove the message
      queryClient.setQueryData(
        ['bull-room-messages'],
        (oldData: BullRoomMessage[] = []) =>
          oldData.filter(msg => msg.id !== messageId)
      );

      // Return a context object with the snapshotted value
      return { previousMessages };
    },
    onError: (err, messageId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousMessages) {
        queryClient.setQueryData(['bull-room-messages'], context.previousMessages);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['bull-room-messages'] });
    },
  });
};
```

### Phase 2: UI State Management

#### 2.1 Message Component Deletion State
Update the message components to properly handle deletion:

```typescript
// In Message component
const Message = ({ message, onDelete }: { message: BullRoomMessage; onDelete: (id: string) => void }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteMessage = useDeleteMessage();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMessage.mutateAsync(message.id);
      onDelete(message.id);
    } catch (error) {
      console.error('Failed to delete message:', error);
      // Show error toast
    } finally {
      setIsDeleting(false);
    }
  };

  // Show loading state while deleting
  if (isDeleting) {
    return <MessageSkeleton />;
  }

  return (
    <div className="message-container">
      {/* Message content */}
      <button onClick={handleDelete} disabled={isDeleting}>
        {isDeleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
};
```

#### 2.2 Chat Area Message Filtering
Ensure the ChatArea component properly filters out deleted messages:

```typescript
// In ChatArea component
const ChatArea = ({ roomId }: { roomId: string }) => {
  const { data: messages = [], isLoading } = useBullRoomMessages(roomId);
  
  // Filter out any messages that might still be in cache but are deleted
  const validMessages = messages.filter(message => message && message.id);

  return (
    <div className="chat-area">
      {validMessages.map(message => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
};
```

### Phase 3: Database Verification

#### 3.1 RLS Policy Verification
Ensure the delete policy is properly configured:

```sql
-- Verify this policy exists and is working
CREATE POLICY "Users can delete their own messages" ON bull_room_messages
    FOR DELETE USING (auth.uid() = user_id);
```

#### 3.2 Trigger Verification
Check if there are any triggers that might interfere with deletion:

```sql
-- Verify no triggers are preventing deletion
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'bull_room_messages';
```

### Phase 4: Testing & Validation

#### 4.1 Manual Testing Scenarios
1. **Single User Deletion**: User deletes their own message
2. **Multi-User Deletion**: Verify other users see the message disappear
3. **Real-time Deletion**: Test deletion while other users are actively viewing
4. **Network Interruption**: Test deletion during network issues
5. **Permission Testing**: Verify users can only delete their own messages

#### 4.2 Automated Testing
```typescript
// Test for delete functionality
describe('Bull Room Message Deletion', () => {
  it('should remove message from all users when deleted', async () => {
    // Create a message
    const message = await createMessage(testMessageData);
    
    // Verify message appears for all users
    const messages1 = await getMessages(roomId);
    expect(messages1).toContainEqual(message);
    
    // Delete the message
    await deleteMessage(message.id);
    
    // Verify message is removed for all users
    const messages2 = await getMessages(roomId);
    expect(messages2).not.toContainEqual(message);
  });

  it('should handle real-time deletion updates', async () => {
    // Set up real-time subscription
    const realtimeMessages: BullRoomMessage[] = [];
    const subscription = supabase
      .channel('test-channel')
      .on('postgres_changes', { event: 'DELETE', table: 'bull_room_messages' }, 
          (payload) => realtimeMessages.push(payload.old))
      .subscribe();

    // Delete a message
    await deleteMessage(testMessageId);
    
    // Verify real-time event was received
    expect(realtimeMessages).toHaveLength(1);
    expect(realtimeMessages[0].id).toBe(testMessageId);
  });
});
```

## Implementation Plan

### Step 1: Investigation (Day 1)
1. Review current real-time subscription implementation
2. Check database RLS policies and triggers
3. Verify React Query cache management
4. Test current deletion flow manually

### Step 2: Fix Real-time Handling (Day 2)
1. Update `useBullRoomRealtime` hook to properly handle DELETE events
2. Implement optimistic updates in delete mutation
3. Add proper error handling and rollback

### Step 3: UI Improvements (Day 3)
1. Update message components to handle deletion state
2. Add loading states during deletion
3. Improve error messaging for failed deletions

### Step 4: Testing (Day 4)
1. Manual testing of all deletion scenarios
2. Automated testing for real-time functionality
3. Cross-browser testing
4. Performance testing with large message volumes

### Step 5: Deployment & Monitoring (Day 5)
1. Deploy changes to staging environment
2. Monitor real-time events and performance
3. Gather user feedback
4. Deploy to production

## Success Criteria

1. **Immediate UI Update**: Deleted messages disappear immediately from all users' screens
2. **Real-time Consistency**: All connected users see the deletion within 500ms
3. **Error Handling**: Failed deletions are properly handled with user feedback
4. **Performance**: Deletion doesn't impact chat performance
5. **Security**: Users can only delete their own messages

## Risk Mitigation

1. **Data Loss**: Implement proper backup and recovery procedures
2. **Performance Impact**: Monitor real-time event volume and optimize if needed
3. **User Experience**: Provide clear feedback during deletion process
4. **Security**: Ensure proper authentication and authorization checks

## Monitoring & Metrics

1. **Deletion Success Rate**: Track successful vs failed deletions
2. **Real-time Event Latency**: Monitor time between deletion and UI update
3. **Error Rates**: Track deletion-related errors
4. **User Feedback**: Monitor user reports of deletion issues

This focused approach will ensure that message deletion works reliably and provides a smooth user experience across all Bull Room participants.
