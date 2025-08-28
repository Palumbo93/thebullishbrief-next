-- Add author_id field to emails table for author-specific email signups

ALTER TABLE "public"."emails" 
ADD COLUMN "author_id" uuid REFERENCES "public"."authors"("id") ON DELETE CASCADE;

-- Add comment to document the purpose
COMMENT ON COLUMN "public"."emails"."author_id" IS 'Reference to author for author-specific newsletter signups. Mutually exclusive with brief_id.';

-- Add index for performance
CREATE INDEX IF NOT EXISTS "emails_author_id_idx" ON "public"."emails" ("author_id");
