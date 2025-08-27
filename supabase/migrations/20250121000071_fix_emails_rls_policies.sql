-- Fix RLS policies for emails table to allow lead generation inserts

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Anyone can insert emails" ON public.emails;
DROP POLICY IF EXISTS "Admins can view all emails" ON public.emails;

-- Create comprehensive INSERT policy for email collection
CREATE POLICY "Allow email collection from lead generation"
ON public.emails
FOR INSERT 
TO public
WITH CHECK (true);

-- Create comprehensive INSERT policy for authenticated users
CREATE POLICY "Allow authenticated users to insert emails"
ON public.emails
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Create comprehensive SELECT policy for admins
CREATE POLICY "Admins can view all emails"
ON public.emails
FOR SELECT 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.is_admin = true
    )
);

-- Create policy for users to view their own email submissions
CREATE POLICY "Users can view their own email submissions"
ON public.emails
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Create UPDATE policy for admins (for status updates)
CREATE POLICY "Admins can update email records"
ON public.emails
FOR UPDATE 
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.is_admin = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.is_admin = true
    )
);

-- Add comments for clarity
COMMENT ON POLICY "Allow email collection from lead generation" ON public.emails IS 'Allows anonymous users to submit emails through lead generation forms';
COMMENT ON POLICY "Allow authenticated users to insert emails" ON public.emails IS 'Allows authenticated users to submit emails through lead generation forms';
COMMENT ON POLICY "Admins can view all emails" ON public.emails IS 'Allows admin users to view all email submissions for analytics';
COMMENT ON POLICY "Users can view their own email submissions" ON public.emails IS 'Allows users to view their own email submissions';
COMMENT ON POLICY "Admins can update email records" ON public.emails IS 'Allows admins to update email records (e.g., Mailchimp sync status)';
