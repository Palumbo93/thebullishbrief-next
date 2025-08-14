-- Test script for user deletion migration
-- Run this in your Supabase SQL editor to verify the constraints work

-- 1. Check existing foreign key constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND (tc.table_name IN ('bookmarks', 'article_views', 'brief_views')
         OR ccu.table_name = 'user_profiles')
ORDER BY tc.table_name, tc.constraint_name;

-- 2. Check for any remaining orphaned records
SELECT 'bookmarks' as table_name, COUNT(*) as orphaned_count
FROM bookmarks 
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM user_profiles)
UNION ALL
SELECT 'article_views' as table_name, COUNT(*) as orphaned_count
FROM article_views 
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM user_profiles)
UNION ALL
SELECT 'brief_views' as table_name, COUNT(*) as orphaned_count
FROM brief_views 
WHERE user_id IS NOT NULL 
  AND user_id NOT IN (SELECT id FROM user_profiles);

-- 3. Test the cascade behavior (run this with a test user)
-- First, create a test user profile
-- INSERT INTO user_profiles (id, email, full_name) VALUES ('test-user-id', 'test@example.com', 'Test User');

-- Then test the constraints by deleting the user
-- DELETE FROM user_profiles WHERE id = 'test-user-id';

-- Verify that:
-- - bookmarks are deleted (CASCADE)
-- - article_views and brief_views have user_id set to NULL (SET NULL)
