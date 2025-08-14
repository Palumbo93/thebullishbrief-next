-- Fix broken foreign key constraints
-- This migration drops and recreates foreign key constraints that were created before their referenced tables existed

-- Drop the broken foreign key constraint on bull_room_messages.room_id
ALTER TABLE bull_room_messages 
DROP CONSTRAINT IF EXISTS bull_room_messages_room_id_fkey;

-- Recreate the foreign key constraint properly
ALTER TABLE bull_room_messages 
ADD CONSTRAINT bull_room_messages_room_id_fkey 
FOREIGN KEY (room_id) REFERENCES bull_rooms(id) ON DELETE CASCADE;

-- Add the missing foreign key constraint for bookmarks.user_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bookmarks_user_id_fkey' 
        AND table_name = 'bookmarks'
    ) THEN
        ALTER TABLE bookmarks 
        ADD CONSTRAINT bookmarks_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add the missing foreign key constraint for article_views.user_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'article_views_user_id_fkey' 
        AND table_name = 'article_views'
    ) THEN
        ALTER TABLE article_views 
        ADD CONSTRAINT article_views_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add the missing foreign key constraint for brief_views.user_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'brief_views_user_id_fkey' 
        AND table_name = 'brief_views'
    ) THEN
        ALTER TABLE brief_views 
        ADD CONSTRAINT brief_views_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add comments explaining the constraints
COMMENT ON CONSTRAINT bull_room_messages_room_id_fkey ON bull_room_messages IS 'Cascade delete messages when bull room is deleted';
COMMENT ON CONSTRAINT bookmarks_user_id_fkey ON bookmarks IS 'Cascade delete user bookmarks when user is deleted';
COMMENT ON CONSTRAINT article_views_user_id_fkey ON article_views IS 'Set user_id to NULL to preserve analytics data when user is deleted';
COMMENT ON CONSTRAINT brief_views_user_id_fkey ON brief_views IS 'Set user_id to NULL to preserve analytics data when user is deleted';
