-- Create admin room for administrator communication
-- This room is only visible to users with admin privileges

INSERT INTO bull_rooms (
    slug,
    name,
    topic,
    description,
    is_active,
    is_featured,
    sort_order,
    rules,
    created_at,
    updated_at
) VALUES (
    'admin',
    'Admin',
    'Internal admin discussions and moderation',
    'Private channel for administrators to coordinate moderation, discuss platform management, and handle administrative tasks.',
    true,
    false,
    1, -- High sort order to appear at top of list
    '[
        {
            "title": "Admin Only",
            "description": "This room is restricted to administrators only. All discussions should remain confidential."
        },
        {
            "title": "Professional Conduct",
            "description": "Maintain professional standards in all communications and decisions."
        },
        {
            "title": "User Privacy",
            "description": "Respect user privacy when discussing moderation actions or user-related issues."
        }
    ]'::JSONB,
    NOW(),
    NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Add comment for documentation
COMMENT ON TABLE bull_rooms IS 'Bull Room channels including the admin-only room for administrators';
