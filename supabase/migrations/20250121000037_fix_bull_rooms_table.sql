-- Fix bull_rooms table and foreign key constraints
-- This migration ensures the bull_rooms table exists before other tables reference it

-- Create bull_rooms table if it doesn't exist
CREATE TABLE IF NOT EXISTS "public"."bull_rooms" (
    "id" uuid not null default gen_random_uuid(),
    "slug" character varying(50) not null,
    "name" character varying(100) not null,
    "topic" text not null,
    "description" text,
    "banner_photo_url" text,
    "is_active" boolean default true,
    "is_featured" boolean default false,
    "sort_order" integer default 0,
    "message_count" integer default 0,
    "last_activity_at" timestamp with time zone default now(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
);

-- Enable RLS on bull_rooms if not already enabled
ALTER TABLE "public"."bull_rooms" ENABLE ROW LEVEL SECURITY;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS "bull_rooms_pkey" ON public.bull_rooms USING btree (id);
CREATE INDEX IF NOT EXISTS "bull_rooms_slug_key" ON public.bull_rooms USING btree (slug);
CREATE INDEX IF NOT EXISTS "idx_bull_rooms_active" ON public.bull_rooms USING btree (is_active);
CREATE INDEX IF NOT EXISTS "idx_bull_rooms_featured" ON public.bull_rooms USING btree (is_featured);
CREATE INDEX IF NOT EXISTS "idx_bull_rooms_last_activity" ON public.bull_rooms USING btree (last_activity_at);
CREATE INDEX IF NOT EXISTS "idx_bull_rooms_slug" ON public.bull_rooms USING btree (slug);
CREATE INDEX IF NOT EXISTS "idx_bull_rooms_sort_order" ON public.bull_rooms USING btree (sort_order);

-- Add primary key constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bull_rooms_pkey' 
        AND table_name = 'bull_rooms'
    ) THEN
        ALTER TABLE "public"."bull_rooms" ADD CONSTRAINT "bull_rooms_pkey" PRIMARY KEY (id);
    END IF;
END $$;

-- Add unique constraint on slug if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'bull_rooms_slug_key' 
        AND table_name = 'bull_rooms'
    ) THEN
        ALTER TABLE "public"."bull_rooms" ADD CONSTRAINT "bull_rooms_slug_key" UNIQUE (slug);
    END IF;
END $$;

-- Grant permissions if not already granted
GRANT ALL ON "public"."bull_rooms" TO authenticated;
GRANT ALL ON "public"."bull_rooms" TO service_role;
GRANT SELECT ON "public"."bull_rooms" TO anon;

-- Create basic RLS policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'bull_rooms' 
        AND policyname = 'Active bull rooms are viewable by everyone'
    ) THEN
        CREATE POLICY "Active bull rooms are viewable by everyone"
        ON "public"."bull_rooms"
        FOR SELECT
        TO public
        USING (is_active = true);
    END IF;
END $$;

-- Add comment
COMMENT ON TABLE "public"."bull_rooms" IS 'Chat rooms for user discussions and interactions';
