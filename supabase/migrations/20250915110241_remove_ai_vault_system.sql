-- Remove AI Vault system completely from the database
-- This migration drops all AI prompt related tables and functionality

-- Drop tables in dependency order (foreign keys first)
DROP TABLE IF EXISTS "public"."prompt_fields" CASCADE;
DROP TABLE IF EXISTS "public"."ai_prompts" CASCADE;
DROP TABLE IF EXISTS "public"."ai_prompt_categories" CASCADE;

-- Add comment for documentation
COMMENT ON SCHEMA "public" IS 'Public schema - AI Vault system completely removed';
