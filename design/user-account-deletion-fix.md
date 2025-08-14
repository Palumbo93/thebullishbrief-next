# User Account Deletion Fix

## Problem Statement

When users attempt to delete their accounts, the system fails with a "Database error deleting user" error. This occurs because several database tables have `user_id` columns that reference user data but lack proper foreign key constraints with `ON DELETE CASCADE` behavior.

### Current Issues

1. **Missing Foreign Key Constraints**: Tables like `bookmarks`, `article_views`, and potentially others have `user_id` columns without proper foreign key constraints to `auth.users` or `user_profiles`.

2. **Orphaned Records**: When a user is deleted from `auth.users`, related records in these tables remain orphaned, causing database integrity issues. Analytics data (views) should be preserved with `user_id` set to NULL.

3. **Cascade Deletion Not Working**: The current cascade deletion only works for tables with proper foreign key constraints (like `user_profiles`, `article_comments`, `bull_room_messages`, `bull_room_reactions`). Analytics data should be preserved with `user_id` set to NULL.

## Solution Design

### 1. Add Missing Foreign Key Constraints

We need to add foreign key constraints to the following tables:

- `bookmarks.user_id` → `user_profiles.id` (ON DELETE CASCADE)
- `article_views.user_id` → `user_profiles.id` (ON DELETE SET NULL)
- `brief_views.user_id` → `user_profiles.id` (ON DELETE SET NULL)

### 2. Database Migration Strategy

Create a new migration that:

1. Adds the missing foreign key constraints
2. Handles existing orphaned records:
   - Delete orphaned bookmarks (user-specific data)
   - Set orphaned view records to NULL (preserve analytics data)
3. Ensures data integrity before adding constraints

### 3. Edge Function Enhancement

Update the delete-user Edge Function to:

1. Add better error handling and logging
2. Provide more specific error messages
3. Add a cleanup step for any remaining orphaned records

## Implementation Plan

### Phase 1: Database Schema Fix
1. Create migration to add missing foreign key constraints
2. Handle existing orphaned data
3. Test the migration in development

### Phase 2: Edge Function Enhancement
1. Improve error handling in the delete-user function
2. Add comprehensive logging
3. Test the enhanced function

### Phase 3: Testing and Validation
1. Test user deletion with various data scenarios
2. Verify cascade deletion works correctly
3. Ensure no orphaned records remain

## Technical Details

### Tables Requiring Foreign Key Constraints

```sql
-- Bookmarks table
ALTER TABLE bookmarks 
ADD CONSTRAINT bookmarks_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Article views table  
ALTER TABLE article_views
ADD CONSTRAINT article_views_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Brief views table
ALTER TABLE brief_views
ADD CONSTRAINT brief_views_user_id_fkey
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
```

### Handling Existing Orphaned Data

Before adding constraints, we need to clean up existing orphaned records:

```sql
-- Delete orphaned bookmarks
DELETE FROM bookmarks 
WHERE user_id NOT IN (SELECT id FROM user_profiles);

-- Set orphaned article views to NULL (preserve analytics data)
UPDATE article_views 
SET user_id = NULL 
WHERE user_id NOT IN (SELECT id FROM user_profiles);

-- Set orphaned brief views to NULL (preserve analytics data)
UPDATE brief_views 
SET user_id = NULL 
WHERE user_id NOT IN (SELECT id FROM user_profiles);
```

## Success Criteria

1. ✅ User account deletion completes successfully without database errors
2. ✅ All user-related data is properly cascaded and deleted
3. ✅ No orphaned records remain in the database
4. ✅ The system maintains referential integrity
5. ✅ Edge Function provides clear error messages if issues occur

## Risk Assessment

**Low Risk**: This is a schema fix that adds constraints to ensure data integrity. The main risk is handling existing orphaned data, which we'll address by cleaning it up before adding constraints.

**Rollback Plan**: If issues occur, we can:
1. Drop the foreign key constraints
2. Revert the migration
3. Investigate and fix any data issues before retrying

## Testing Strategy

1. **Unit Tests**: Test the migration on a copy of production data
2. **Integration Tests**: Test user deletion with various data scenarios
3. **Manual Testing**: Test the complete user deletion flow in development
4. **Data Validation**: Verify no orphaned records remain after deletion

## Implementation Summary

### ✅ Completed Fixes

1. **Database Schema Fix**:
   - Added missing foreign key constraints for `bookmarks`, `article_views`, and `brief_views`
   - Implemented proper cascade behavior (DELETE for user data, SET NULL for analytics)
   - Cleaned up existing orphaned data

2. **Bull Rooms Table Fix**:
   - Ensured `bull_rooms` table exists before foreign key constraints are created
   - Fixed migration order issue that was causing "relation bull_rooms does not exist" errors
   - Added proper table structure with indexes, constraints, and RLS policies

3. **Edge Function Enhancement**:
   - Improved error handling and logging
   - Added more specific error messages
   - Enhanced debugging capabilities

### 🎯 Root Cause Resolution

The original error "Database error deleting user" was caused by:
1. **Missing foreign key constraints** on user-related tables
2. **Migration order issues** where `bull_rooms` table didn't exist when referenced
3. **Orphaned data** that couldn't be properly cleaned up during user deletion

The fix ensures proper referential integrity and cascade behavior, allowing user account deletion to complete successfully while preserving important analytics data.
