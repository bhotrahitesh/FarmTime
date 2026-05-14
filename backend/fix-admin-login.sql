-- Quick Fix: Enable existing admin user to login
-- Run this in Neon Console if you can't login

-- Update existing admin user to be approved Super Admin
UPDATE admins 
SET is_approved = true, 
    role = 'SUPER_ADMIN',
    approved_at = CURRENT_TIMESTAMP
WHERE username = 'admin';

-- Verify the change
SELECT id, username, name, role, is_approved, is_active 
FROM admins 
WHERE username = 'admin';

-- If you have other existing admins that should be approved:
-- UPDATE admins 
-- SET is_approved = true, 
--     role = 'ADMIN',
--     approved_at = CURRENT_TIMESTAMP
-- WHERE username IN ('other_username1', 'other_username2');
