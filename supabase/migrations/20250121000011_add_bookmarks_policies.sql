-- Enable RLS on bookmarks table
ALTER TABLE "public"."bookmarks" ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own bookmarks
CREATE POLICY "Users can view their own bookmarks"
ON "public"."bookmarks"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their own bookmarks
CREATE POLICY "Users can create their own bookmarks"
ON "public"."bookmarks"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to delete their own bookmarks
CREATE POLICY "Users can delete their own bookmarks"
ON "public"."bookmarks"
AS PERMISSIVE
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Allow authenticated users to update their own bookmarks
CREATE POLICY "Users can update their own bookmarks"
ON "public"."bookmarks"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id); 