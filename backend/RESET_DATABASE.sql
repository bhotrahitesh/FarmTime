-- ============================================
-- RESET DATABASE - Clean Start with Access Control
-- ============================================
-- WARNING: This will DELETE ALL DATA!
-- Run this in Neon Console SQL Editor

-- Step 1: Delete all existing data
DELETE FROM time_off;
DELETE FROM payments;
DELETE FROM attendance;
DELETE FROM employees;
DELETE FROM admins;

-- Step 2: Add access control columns (if they don't exist)
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'PENDING';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS approved_by BIGINT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Step 3: Create Super Admin user
-- Password: admin123 (BCrypt encrypted)
INSERT INTO admins (username, password, name, is_active, role, is_approved, approved_at, created_at, updated_at)
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',  -- Password: admin123
    'Super Administrator',
    true,
    'SUPER_ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Step 4: Verify the admin user was created
SELECT id, username, name, role, is_approved, is_active, created_at 
FROM admins;

-- ============================================
-- Expected Output:
-- username: admin
-- name: Super Administrator
-- role: SUPER_ADMIN
-- is_approved: true
-- is_active: true
-- ============================================

-- After running this:
-- 1. Restart your backend
-- 2. Login with username: admin, password: admin123
-- 3. You should see "Super Admin" badge and "Admin Management" button
