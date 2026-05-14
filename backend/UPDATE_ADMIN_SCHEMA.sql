-- ============================================
-- Admin Access Control System - Schema Update
-- ============================================

-- Add new columns to admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'PENDING';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS approved_by BIGINT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Update existing admin user to SUPER_ADMIN with approval
UPDATE admins 
SET role = 'SUPER_ADMIN', 
    is_approved = true, 
    approved_at = CURRENT_TIMESTAMP
WHERE username = 'admin';

-- If you have other existing admins that should be approved, run:
-- UPDATE admins 
-- SET is_approved = true, 
--     role = 'ADMIN',
--     approved_at = CURRENT_TIMESTAMP
-- WHERE username IN ('username1', 'username2');

-- Verify the changes
SELECT id, username, name, role, is_approved, is_active, created_at 
FROM admins 
ORDER BY created_at;
