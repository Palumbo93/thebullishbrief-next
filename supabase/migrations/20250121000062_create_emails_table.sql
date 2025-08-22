-- Create emails table to track all email entries
CREATE TABLE public.emails (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    created_date timestamp with time zone DEFAULT now()
);

-- Create index for email lookups
CREATE INDEX idx_emails_email ON public.emails (email);
CREATE INDEX idx_emails_created_date ON public.emails (created_date);

-- Add RLS policies
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all emails
CREATE POLICY "Admins can view all emails" ON public.emails
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.user_roles ur ON up.id = ur.user_id
            JOIN public.roles r ON ur.role_id = r.id
            WHERE up.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Allow anyone to insert emails (for tracking purposes)
CREATE POLICY "Anyone can insert emails" ON public.emails
    FOR INSERT WITH CHECK (true);

-- Add comment
COMMENT ON TABLE public.emails IS 'Tracks all email addresses entered in the system for analytics and debugging purposes';
