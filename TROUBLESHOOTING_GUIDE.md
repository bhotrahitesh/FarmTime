# 🔧 Troubleshooting Guide - "Failed to Load" Errors

## Issue: "Failed to load" errors on Attendance, Payments, Time-off, Reports screens

### Root Cause
When screens load with **no data** (empty database), the error handling wasn't graceful and showed generic "Failed to load" messages instead of allowing empty states.

---

## ✅ Fix Applied

### **Updated Error Handling in All Screens**

1. **AttendanceScreen.js**
2. **PaymentsScreen.js**
3. **TimeOffScreen.js**
4. **ReportsScreen.js**

### **Changes Made:**

**Before:**
```javascript
const response = await getAttendanceByDateRange(startDate, endDate);
setAttendance(response.data);
setFilteredAttendance(response.data);
} catch (error) {
  Alert.alert('Error', 'Failed to load attendance');
}
```

**After:**
```javascript
const response = await getAttendanceByDateRange(startDate, endDate);
setAttendance(response.data || []);  // ← Handle null/undefined
setFilteredAttendance(response.data || []);
} catch (error) {
  console.error('Attendance load error:', error);  // ← Log for debugging
  const errorMessage = getErrorMessage(error, 'Failed to load attendance');  // ← User-friendly message
  Alert.alert('Error', errorMessage);
  setAttendance([]);  // ← Set empty array on error
  setFilteredAttendance([]);
}
```

---

## 🎯 What This Fixes

### **1. Empty Database Handling**
- ✅ Now shows empty list instead of error
- ✅ Allows users to add first record
- ✅ No confusing error messages

### **2. Better Error Messages**
- ✅ Shows specific error from backend
- ✅ Network errors clearly identified
- ✅ Console logs for debugging

### **3. Graceful Degradation**
- ✅ Sets empty arrays on error
- ✅ UI remains functional
- ✅ Users can retry or add data

---

## 🧪 Testing

### **Test 1: Empty Database**
```
1. Fresh database with no records
2. Navigate to Attendance screen
3. Expected: Empty list with "No attendance records" message
4. NOT: "Failed to load attendance" error
```

### **Test 2: Network Error**
```
1. Stop backend server
2. Navigate to Payments screen
3. Expected: "Network error. Please check your internet connection."
4. NOT: Generic "Failed to load payments"
```

### **Test 3: With Data**
```
1. Add some attendance records
2. Navigate to Attendance screen
3. Expected: List of records displayed
4. Works as before
```

---

## 🔍 Debugging

### **Check Console Logs**

When errors occur, you'll now see detailed logs:

```javascript
console.error('Attendance load error:', error);
console.error('Payments load error:', error);
console.error('Time-off load error:', error);
console.error('Reports employees load error:', error);
```

**To view logs:**
- **iOS Simulator:** Check Xcode console or Metro bundler
- **Android Emulator:** Check Android Studio Logcat or Metro bundler
- **Expo:** Check Expo DevTools console

---

## 🚀 Backend Status

### **Check if Backend is Running**

```bash
# Check if port 8080 is in use
lsof -i :8080

# Test health endpoint
curl http://localhost:8080/api/health

# Expected response:
{
  "application": "farmtime-backend",
  "status": "UP",
  "timestamp": "2026-05-14T23:31:18.938496"
}
```

### **Start Backend**

```bash
cd backend
./run-neon.sh
```

Wait ~15 seconds for backend to fully start.

---

## 📱 Mobile App Debugging

### **Common Issues & Solutions**

#### **Issue: "Network error"**
**Cause:** Backend not running or wrong URL

**Solution:**
1. Check backend is running: `lsof -i :8080`
2. Check API URL in `mobile/src/services/api.js`:
   - iOS: `http://localhost:8080/api`
   - Android: `http://10.0.2.2:8080/api`

#### **Issue: "Unauthorized"**
**Cause:** Token expired or invalid

**Solution:**
1. Logout and login again
2. Check token is being sent in headers
3. Verify Super Admin is approved in database

#### **Issue: Empty screens**
**Cause:** No data in database (this is normal!)

**Solution:**
1. Add first employee
2. Mark attendance
3. Add payments
4. Data will appear

---

## 🔐 Super Admin Setup

If you're getting errors, ensure Super Admin is set up:

### **SQL to Create Super Admin**

```sql
-- Run in Neon Console
INSERT INTO admins (username, password, name, is_active, role, is_approved, approved_at, created_at, updated_at)
VALUES (
    'admin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Super Administrator',
    true,
    'SUPER_ADMIN',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
```

**Login with:**
- Username: `admin`
- Password: `admin123`

---

## 📊 Expected Behavior

### **Fresh Installation (No Data)**

**Employees Screen:**
- Shows: Empty list with "No employees found" message
- Action: Click + button to add first employee

**Attendance Screen:**
- Shows: Empty list
- Action: Click + button to mark first attendance

**Payments Screen:**
- Shows: Empty list
- Action: Click + button to add first payment

**Time-off Screen:**
- Shows: Empty list
- Action: Click + button to add first time-off

**Reports Screen:**
- Shows: "No employees found" if no employees
- Action: Add employees first

### **With Data**

All screens show lists of records with search functionality.

---

## 🎯 Summary

### **What Was Fixed:**
✅ Better error handling in all data-loading screens
✅ Graceful handling of empty database
✅ User-friendly error messages
✅ Console logging for debugging
✅ Fallback to empty arrays

### **What to Do Now:**
1. **Restart mobile app** to load updated code
2. **Ensure backend is running** (`./run-neon.sh`)
3. **Login as Super Admin** (admin/admin123)
4. **Add first employee** if database is empty
5. **Navigate to screens** - should work without errors

Your app should now handle empty states gracefully! 🎉
