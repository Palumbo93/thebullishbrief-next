-- Migration: Remove description field from tags table
-- This migration removes the description column from the tags table

-- Check if the description column exists and remove it
DO $$ 
BEGIN
    -- Remove description column if it exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tags' 
        AND column_name = 'description'
    ) THEN
        ALTER TABLE tags DROP COLUMN description;
        RAISE NOTICE 'Removed description column from tags table';
    ELSE
        RAISE NOTICE 'Description column does not exist in tags table';
    END IF;
END $$;

-- Update any views or functions that might reference the description column
-- (This is a placeholder for any future views that might reference the description field) 