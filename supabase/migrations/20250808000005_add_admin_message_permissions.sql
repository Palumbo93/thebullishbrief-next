-- Add admin permissions for bull room message management
-- This migration allows admins to delete any message regardless of ownership

-- Allow admins to delete any message
CREATE POLICY "Admins can delete any message" ON bull_room_messages
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Allow admins to update any message (for potential future admin editing features)
CREATE POLICY "Admins can update any message" ON bull_room_messages
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Add comment
COMMENT ON POLICY "Admins can delete any message" ON bull_room_messages IS 'Allow admin users to delete any message for moderation purposes';
COMMENT ON POLICY "Admins can update any message" ON bull_room_messages IS 'Allow admin users to update any message for moderation purposes';
