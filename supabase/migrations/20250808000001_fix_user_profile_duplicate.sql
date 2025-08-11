-- Fix duplicate user profile creation issue
-- This migration addresses the "duplicate key value violates unique constraint user_profiles_pkey" error

-- Drop existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Update the create_user_profile function to be more robust
CREATE OR REPLACE FUNCTION public.create_user_profile()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
    -- Check if user profile already exists to prevent duplicate key violations
    IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = new.id) THEN
        RAISE NOTICE 'User profile already exists for user %', new.email;
        RETURN new;
    END IF;
    
    -- Insert new user profile
    insert into public.user_profiles (
        id,
        email,
        username,
        email_verified,
        subscription_tier,
        newsletter_subscribed,
        preferences
    ) values (
        new.id,
        new.email,
        coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
        new.email_confirmed_at is not null,
        'free',
        true,
        '{"onboardingCompleted": false}'::jsonb
    );
    
    RAISE NOTICE 'Created user profile for user %', new.email;
    return new;
exception
    when unique_violation then
        -- If we still get a unique violation, try with a modified username
        RAISE NOTICE 'Username conflict detected for user %, trying with modified username', new.email;
        insert into public.user_profiles (
            id,
            email,
            username,
            email_verified,
            subscription_tier,
            newsletter_subscribed,
            preferences
        ) values (
            new.id,
            new.email,
            coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)) || '_' || substr(md5(random()::text), 1, 4),
            new.email_confirmed_at is not null,
            'free',
            true,
            '{"onboardingCompleted": false}'::jsonb
        );
        return new;
    when others then
        -- Log any other errors but don't fail the transaction
        RAISE WARNING 'Error creating user profile for user %: %', new.email, SQLERRM;
        return new;
end;
$function$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();

-- Add comment explaining the fix
COMMENT ON FUNCTION public.create_user_profile() IS 
'Creates user profile on auth user creation. Includes checks to prevent duplicate key violations and handles username conflicts gracefully.';
