-- ============================================
-- FIX: Update existing admin to be Super Admin
-- ============================================

-- Option 1: If you have an 'admin' user that can't login
-- Delete it and we'll create a new one via the app
DELETE FROM admins WHERE username = 'admin';

-- Option 2: Update the 'superadmin' user (created via register) to be Super Admin
UPDATE admins 
SET role = 'SUPER_ADMIN',
    is_approved = true,
    approved_at = CURRENT_TIMESTAMP
WHERE username = 'superadmin';

-- Verify
SELECT id, username, name, role, is_approved, is_active FROM admins;

-- ============================================
-- After running this:
-- Login with username: superadmin, password: admin123
-- ============================================
