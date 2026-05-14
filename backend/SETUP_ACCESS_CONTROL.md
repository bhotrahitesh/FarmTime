# 🚀 Quick Setup - Access Control System

## Step-by-Step Setup Guide

### **Step 1: Update Database Schema**

The new access control system requires additional columns in the `admins` table.

**Option A: Let Hibernate Auto-Create (Recommended)**
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/backend
./run-neon.sh
```

Hibernate will automatically add the new columns when it detects the model changes.

**Option B: Run SQL Manually**

Open Neon Console (https://console.neon.tech) and run:

```sql
-- Add new columns
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'PENDING';
ALTER TABLE admins ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS approved_by BIGINT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP;

-- Make existing admin a Super Admin
UPDATE admins 
SET role = 'SUPER_ADMIN', 
    is_approved = true, 
    approved_at = CURRENT_TIMESTAMP
WHERE username = 'admin';

-- Verify
SELECT id, username, name, role, is_approved, is_active FROM admins;
```

### **Step 2: Restart Backend**

```bash
# Stop current backend (Ctrl+C)
# Then restart
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/backend
./run-neon.sh
```

### **Step 3: Reload Mobile App**

In the terminal where your mobile app is running:
- Press **`r`** to reload

Or restart:
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
npx expo start --clear
```

### **Step 4: Test the System**

1. **Login as Super Admin**
   - Username: `admin`
   - Password: `admin123` (or your changed password)
   - You should see "Super Admin" badge
   - You should see "Admin Management" button

2. **Test Registration Flow**
   - Logout
   - Click "Register"
   - Create test account
   - Try to login → Should be blocked
   - Login as admin
   - Click "Admin Management"
   - Approve the test user
   - Login as test user → Success!

---

## ✅ Verification Checklist

- [ ] Database columns added
- [ ] 'admin' user is SUPER_ADMIN
- [ ] Backend restarted successfully
- [ ] Mobile app reloaded
- [ ] Can login as admin
- [ ] See "Admin Management" button
- [ ] Can register new user
- [ ] New user blocked until approved
- [ ] Can approve new user
- [ ] Approved user can login

---

## 🐛 Troubleshooting

### **Issue: "Column does not exist" error**
**Solution**: Run the SQL migration script manually in Neon console

### **Issue: Admin user can't login**
**Solution**: Run this SQL to fix:
```sql
UPDATE admins 
SET is_approved = true, role = 'SUPER_ADMIN' 
WHERE username = 'admin';
```

### **Issue: "Admin Management" button not showing**
**Solution**: 
1. Logout and login again
2. Check that role is saved: Look in AsyncStorage
3. Verify backend returns role in login response

### **Issue: App shows black screen after reload**
**Solution**: 
1. Stop the app completely
2. Run: `npx expo start --clear`
3. Reload on device

---

## 📝 Quick Reference

**Super Admin Default Credentials**
- Username: `admin`
- Password: `admin123`

**Admin Management Access**
- Only SUPER_ADMIN role can access
- Button appears on Home screen
- Located below main menu cards

**New User Registration**
- All new users start as PENDING
- Cannot login until approved
- Super Admin must approve

---

## 🎯 Next Steps

1. ✅ Complete setup above
2. ✅ Test the approval workflow
3. ✅ Change default admin password
4. ✅ Create additional admins as needed
5. ✅ Read ACCESS_CONTROL_SYSTEM.md for full documentation

Your access control system is ready! 🎉
