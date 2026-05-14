-- Migration: Add attendance status and hours worked columns
-- Run this in Neon Console SQL Editor

-- Add new columns to attendance table
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS attendance_status VARCHAR(50),
ADD COLUMN IF NOT EXISTS hours_worked DOUBLE PRECISION;

-- Make check_in_time nullable (for absent/leave cases)
ALTER TABLE attendance 
ALTER COLUMN check_in_time DROP NOT NULL;

-- Update existing records to have default status
UPDATE attendance 
SET attendance_status = CASE 
    WHEN is_present = true THEN 'PRESENT'
    ELSE 'ABSENT'
END
WHERE attendance_status IS NULL;

-- Verify the changes
SELECT 
    id, 
    employee_id, 
    attendance_date, 
    check_in_time, 
    check_out_time, 
    is_present, 
    attendance_status,
    hours_worked,
    notes
FROM attendance
LIMIT 10;
