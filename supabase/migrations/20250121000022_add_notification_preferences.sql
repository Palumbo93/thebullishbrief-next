-- Add notification_preferences column to user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN notification_preferences jsonb DEFAULT '{}'::jsonb;

-- Add index for notification_preferences for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_notification_preferences 
ON public.user_profiles USING gin (notification_preferences);

-- Add comment for documentation
COMMENT ON COLUMN public.user_profiles.notification_preferences IS 'User notification preferences stored as JSONB'; 