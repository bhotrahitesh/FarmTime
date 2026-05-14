# 🔧 Manual Fix Required - Add Database Columns

## Problem
The new columns (`role`, `is_approved`, `approved_by`, `approved_at`) don't exist in your Neon database yet.

## Solution: Run SQL in Neon Console

### **Step 1: Open Neon Console**
1. Go to https://console.neon.tech
2. Select your `farmtime_db` database
3. Click on "SQL Editor" or "Query" tab

### **Step 2: Run This SQL**

Copy and paste this entire SQL script:

```sql
-- Add new columns for access control
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'PENDING';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS approved_by BIGINT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Update existing admin user to be Super Admin
UPDATE admins 
SET role = 'SUPER_ADMIN', 
    is_approved = true, 
    approved_at = CURRENT_TIMESTAMP
WHERE username = 'admin';

-- Verify the changes
SELECT id, username, name, role, is_approved, is_active, created_at 
FROM admins;
```

### **Step 3: Verify**
You should see output showing the admin user with:
- `role`: SUPER_ADMIN
- `is_approved`: true

### **Step 4: Restart Backend**
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/backend
./run-neon.sh
```

### **Step 5: Try Login**
Now you should be able to login to the mobile app!

---

## Why This Happened

Hibernate's `ddl-auto=update` doesn't always work reliably for adding new columns, especially with default values and NOT NULL constraints. Manual SQL is more reliable.

---

## Alternative: Temporarily Use validate mode

If you want Hibernate to NOT try to modify the schema, change in `application-neon.properties`:

```properties
spring.jpa.hibernate.ddl-auto=validate
```

But you MUST run the SQL manually first.
