-- Add missing RLS policies for article_tags table
-- Allow authenticated users to insert article-tag relationships
CREATE POLICY "Authenticated users can create article tags"
ON "public"."article_tags"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to delete article-tag relationships
CREATE POLICY "Authenticated users can delete article tags"
ON "public"."article_tags"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (true); 