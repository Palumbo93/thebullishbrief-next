-- Allow public access to draft articles for preview functionality
-- This enables draft articles to be viewed without authentication
-- which is useful for preview links and development purposes

CREATE POLICY "Draft articles are viewable by everyone for preview"
ON "public"."articles"
AS PERMISSIVE
FOR SELECT
TO public
USING ((status = 'draft'::text));
