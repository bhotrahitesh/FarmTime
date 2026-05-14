# 🔐 Access Control System - FarmTime

Complete admin approval and role-based access control system to prevent unauthorized access to your farm data.

## 🎯 Problem Solved

**Before**: Any user who registered could immediately access all farm data  
**After**: All new registrations require Super Admin approval before accessing the system

---

## 🏗️ System Architecture

### **Three Admin Roles**

1. **SUPER_ADMIN** 
   - Full system access
   - Can approve/reject new admin registrations
   - Can activate/deactivate admins
   - Can change admin roles
   - Cannot be deactivated by themselves

2. **ADMIN**
   - Full access to farm data (employees, attendance, payments, time-off)
   - Cannot manage other admins
   - Requires Super Admin approval

3. **PENDING**
   - Newly registered users
   - Cannot login until approved
   - Awaiting Super Admin review

---

## 🔄 User Flow

### **New User Registration**
```
1. User registers → Account created with PENDING role
2. User tries to login → Blocked with "Pending Approval" message
3. Super Admin reviews → Approves as ADMIN or SUPER_ADMIN
4. User can now login → Full access granted
```

### **Super Admin Workflow**
```
1. Login to app
2. Home screen shows "Admin Management" button (Super Admin only)
3. View pending registrations
4. Approve (as Admin or Super Admin) or Reject
5. Manage existing admins (activate/deactivate)
```

---

## 📱 Features Implemented

### **Backend (Java/Spring Boot)**

#### **1. Updated Admin Model**
- Added `role` field (SUPER_ADMIN, ADMIN, PENDING)
- Added `isApproved` boolean
- Added `approvedBy` and `approvedAt` tracking

#### **2. Enhanced Authentication**
- Login blocks unapproved users
- Login blocks deactivated users
- Returns user role in login response

#### **3. Admin Management Controller**
New endpoints for Super Admins:
- `GET /api/admin-management/admins` - Get all admins
- `GET /api/admin-management/admins/pending` - Get pending approvals
- `POST /api/admin-management/admins/{id}/approve` - Approve admin
- `DELETE /api/admin-management/admins/{id}/reject` - Reject/delete admin
- `PUT /api/admin-management/admins/{id}/activate` - Activate admin
- `PUT /api/admin-management/admins/{id}/deactivate` - Deactivate admin
- `PUT /api/admin-management/admins/{id}/role` - Change admin role

### **Mobile App (React Native)**

#### **1. Admin Management Screen**
- View pending registrations with count badge
- View all admins with their roles and status
- Approve/reject pending admins
- Activate/deactivate existing admins
- Beautiful UI with role-based color coding
- Pull-to-refresh functionality

#### **2. Enhanced Login**
- Shows specific error messages for:
  - Pending approval
  - Deactivated account
  - Invalid credentials
- Stores user role for access control

#### **3. Role-Based UI**
- Super Admin sees "Admin Management" button on home
- Shows "Super Admin" badge in header
- Personalized welcome message

---

## 🗄️ Database Changes

### **New Columns in `admins` Table**
```sql
role VARCHAR(50) NOT NULL DEFAULT 'PENDING'
is_approved BOOLEAN NOT NULL DEFAULT false
approved_by BIGINT
approved_at TIMESTAMP
```

### **Migration Script**
Run `UPDATE_ADMIN_SCHEMA.sql` to:
1. Add new columns
2. Update existing 'admin' user to SUPER_ADMIN
3. Approve existing 'admin' user

---

## 🚀 Setup Instructions

### **Step 1: Update Database Schema**

**Option A: Automatic (Hibernate)**
```bash
# Start backend - Hibernate will auto-create columns
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/backend
./run-neon.sh
```

**Option B: Manual (SQL)**
```bash
# Run the migration script in Neon console
# File: UPDATE_ADMIN_SCHEMA.sql
```

### **Step 2: Verify Super Admin**
```sql
-- Check if admin user is Super Admin
SELECT username, role, is_approved, is_active 
FROM admins 
WHERE username = 'admin';

-- Should show:
-- username: admin
-- role: SUPER_ADMIN
-- is_approved: true
-- is_active: true
```

### **Step 3: Test the System**

1. **Register a new user**
   - Open mobile app
   - Click "Register"
   - Fill in details
   - See message: "Pending approval by super admin"

2. **Try to login with new user**
   - Should be blocked
   - Message: "Your account is pending approval"

3. **Login as Super Admin**
   - Username: `admin`
   - Password: `admin123` (or your changed password)

4. **Approve the new user**
   - Click "Admin Management" button
   - See pending user in list
   - Click "Approve"
   - Choose "Admin" or "Super Admin"

5. **New user can now login**
   - Login with new credentials
   - Full access granted

---

## 🔒 Security Features

### **1. Approval Required**
- All new registrations start as PENDING
- Cannot login until approved by Super Admin
- Prevents unauthorized access

### **2. Role-Based Access**
- Super Admin: Full control
- Admin: Data access only
- Pending: No access

### **3. Deactivation**
- Super Admin can deactivate any admin
- Deactivated admins cannot login
- Can be reactivated later

### **4. Self-Protection**
- Super Admin cannot deactivate themselves
- Super Admin cannot change their own role
- Prevents accidental lockout

### **5. Audit Trail**
- Tracks who approved each admin
- Records approval timestamp
- Maintains registration date

---

## 📊 API Endpoints

### **Authentication (Public)**
```
POST /api/auth/register
- Creates account with PENDING role
- Requires approval before login

POST /api/auth/login
- Blocks unapproved users
- Blocks deactivated users
- Returns role in response
```

### **Admin Management (Super Admin Only)**
```
GET /api/admin-management/admins
- Returns all admins with details

GET /api/admin-management/admins/pending
- Returns only pending approvals

POST /api/admin-management/admins/{id}/approve
Body: { "role": "ADMIN" or "SUPER_ADMIN" }
- Approves user with specified role

DELETE /api/admin-management/admins/{id}/reject
- Deletes pending registration

PUT /api/admin-management/admins/{id}/activate
- Activates deactivated admin

PUT /api/admin-management/admins/{id}/deactivate
- Deactivates active admin

PUT /api/admin-management/admins/{id}/role
Body: { "role": "ADMIN" or "SUPER_ADMIN" }
- Changes admin role
```

---

## 🎨 UI Components

### **Admin Management Screen**
- **Tabs**: Pending / All Admins
- **Pending Tab**: Shows unapproved registrations
- **All Admins Tab**: Shows all users with status
- **Color Coding**:
  - 🔴 SUPER_ADMIN (Red)
  - 🟢 ADMIN (Green)
  - 🟠 PENDING (Orange)
  - ⚫ INACTIVE (Gray)

### **Home Screen Updates**
- Shows "Admin Management" button (Super Admin only)
- Displays "Super Admin" badge
- Personalized welcome message

---

## 🧪 Testing Scenarios

### **Test 1: New Registration**
```
1. Register new user "testuser"
2. Try to login → Should be blocked
3. Login as admin
4. Go to Admin Management
5. See "testuser" in Pending (1)
6. Approve as Admin
7. Login as testuser → Success
```

### **Test 2: Deactivation**
```
1. Login as Super Admin
2. Go to Admin Management → All Admins
3. Find an admin
4. Click "Deactivate"
5. Logout
6. Try to login as that admin → Blocked
7. Login as Super Admin
8. Reactivate the admin
```

### **Test 3: Role Change**
```
1. Approve user as ADMIN
2. Later promote to SUPER_ADMIN
3. User gets admin management access
```

---

## 📋 Default Credentials

**Super Admin Account**
- Username: `admin`
- Password: `admin123` (change immediately!)
- Role: SUPER_ADMIN
- Status: Approved & Active

---

## ⚠️ Important Notes

1. **First Time Setup**
   - Run `UPDATE_ADMIN_SCHEMA.sql` to update existing database
   - Ensures 'admin' user is Super Admin

2. **Production Deployment**
   - Change default admin password immediately
   - Consider adding email notifications for approvals
   - Set up monitoring for pending approvals

3. **Multiple Super Admins**
   - You can have multiple Super Admins
   - Approve trusted users as SUPER_ADMIN
   - They can then approve others

4. **Data Access**
   - Only approved admins can see farm data
   - Pending users have zero access
   - Deactivated users are locked out

---

## 🔄 Workflow Diagram

```
┌─────────────────┐
│  User Registers │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PENDING Role   │
│  isApproved=false│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Try to Login    │
│ ❌ BLOCKED      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Super Admin     │
│ Reviews Request │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Approve │ │Reject  │
│        │ │Delete  │
└───┬────┘ └────────┘
    │
    ▼
┌─────────────────┐
│ ADMIN/SUPER_ADMIN│
│ isApproved=true │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ ✅ Can Login    │
│ Full Access     │
└─────────────────┘
```

---

## 🎉 Benefits

✅ **Prevents unauthorized access** - Only approved users can login  
✅ **Centralized control** - Super Admin manages all access  
✅ **Audit trail** - Track who approved whom and when  
✅ **Flexible roles** - Promote users as needed  
✅ **Reversible** - Deactivate and reactivate users  
✅ **Self-protecting** - Super Admins can't lock themselves out  
✅ **User-friendly** - Clear error messages for blocked users  

---

## 📞 Support

If you need to:
- **Reset a Super Admin password**: Use forgot password feature
- **Manually approve a user**: Run SQL update on `admins` table
- **Create additional Super Admin**: Approve user with SUPER_ADMIN role

Your farm data is now secure with proper access control! 🎉
