# 📋 Error Messages - Quick Reference

## Common Error Scenarios & Messages

### **Employee Management**

#### Duplicate Phone Number
```
❌ Action: Add employee with existing phone number
✅ Message: "This mobile number is already registered with employee: Rajesh Kumar"
```

#### Missing Required Fields
```
❌ Action: Submit form without name
✅ Message: "Employee name is required"

❌ Action: Submit form without phone
✅ Message: "Mobile number is required"

❌ Action: Submit form without joining date
✅ Message: "Joining date is required"
```

#### Invalid Input
```
❌ Action: Enter 5-digit phone number
✅ Message: "Mobile number must be at least 10 digits"

❌ Action: Enter negative salary
✅ Message: "Monthly salary cannot be negative"
```

#### Not Found
```
❌ Action: Access deleted employee
✅ Message: "Employee not found with ID: 123"
```

---

### **Attendance Management**

#### Duplicate Attendance
```
❌ Action: Mark attendance twice for same employee on same date
✅ Message: "Attendance for Rajesh Kumar has already been marked for 2026-05-14. Please update the existing record instead."
```

#### Future Date
```
❌ Action: Mark attendance for tomorrow
✅ Message: "Cannot mark attendance for future dates"
```

#### Missing Employee
```
❌ Action: Submit without selecting employee
✅ Message: "Employee is required"
```

#### Missing Date
```
❌ Action: Submit without date
✅ Message: "Attendance date is required"
```

---

### **Payment Management**

#### Not Found
```
❌ Action: Access non-existent payment
✅ Message: "Payment record not found with ID: 456"
```

#### Invalid Amount
```
❌ Action: Enter negative payment amount
✅ Message: "Payment amount cannot be negative"
```

---

### **Time Off Management**

#### Invalid Date Range
```
❌ Action: End date before start date
✅ Message: "End date must be after start date"
```

#### Not Found
```
❌ Action: Access deleted time off record
✅ Message: "Time off record not found with ID: 789"
```

---

### **Network & System Errors**

#### No Internet
```
❌ Scenario: Device offline
✅ Message: "Network error. Please check your internet connection."
```

#### Server Down
```
❌ Scenario: Backend not responding
✅ Message: "Server error. Please try again later."
```

#### Database Error
```
❌ Scenario: Database connection issue
✅ Message: "A database error occurred. Please try again."
```

---

### **Authentication Errors**

#### Invalid Credentials
```
❌ Action: Wrong username/password
✅ Message: "Invalid username or password"
```

#### Pending Approval
```
❌ Action: Login with unapproved account
✅ Message: "Your account is pending approval. Please contact the super admin."
```

#### Account Deactivated
```
❌ Action: Login with deactivated account
✅ Message: "Your account has been deactivated. Please contact the super admin."
```

#### Duplicate Username
```
❌ Action: Register with existing username
✅ Message: "Username already exists"
```

---

## 🎯 Error Message Patterns

### **Pattern 1: Duplicate Resource**
```
"This [field] is already registered with [entity]: [name]"

Examples:
- "This mobile number is already registered with employee: John Doe"
- "This username is already registered"
```

### **Pattern 2: Required Field**
```
"[Field name] is required"

Examples:
- "Employee name is required"
- "Mobile number is required"
- "Attendance date is required"
```

### **Pattern 3: Invalid Input**
```
"[Field name] [constraint description]"

Examples:
- "Mobile number must be at least 10 digits"
- "Monthly salary cannot be negative"
- "Cannot mark attendance for future dates"
```

### **Pattern 4: Not Found**
```
"[Entity] not found with ID: [id]"

Examples:
- "Employee not found with ID: 123"
- "Attendance record not found with ID: 456"
- "Payment record not found with ID: 789"
```

### **Pattern 5: Already Exists**
```
"[Action] for [entity] has already been [done] for [context]. [Suggestion]."

Examples:
- "Attendance for Rajesh Kumar has already been marked for 2026-05-14. Please update the existing record instead."
```

---

## 🧪 How to Test

### **1. Test Duplicate Phone Number**
```bash
# Step 1: Add first employee
POST /api/employees
{
  "name": "John Doe",
  "phoneNumber": "9876543210",
  "monthlySalary": 15000,
  "joiningDate": "2026-01-01"
}

# Step 2: Try to add another with same phone
POST /api/employees
{
  "name": "Jane Smith",
  "phoneNumber": "9876543210",  # Same number
  "monthlySalary": 18000,
  "joiningDate": "2026-01-15"
}

# Expected Response (409 Conflict):
{
  "message": "This mobile number is already registered with employee: John Doe",
  "error": "DUPLICATE_RESOURCE",
  "status": 409
}
```

### **2. Test Duplicate Attendance**
```bash
# Step 1: Mark attendance
POST /api/attendance
{
  "employeeId": 1,
  "attendanceDate": "2026-05-14",
  "checkInTime": "09:00:00",
  "checkOutTime": "18:00:00",
  "isPresent": true
}

# Step 2: Try to mark again
POST /api/attendance
{
  "employeeId": 1,
  "attendanceDate": "2026-05-14",  # Same date
  "checkInTime": "09:30:00",
  "checkOutTime": "18:30:00",
  "isPresent": true
}

# Expected Response (409 Conflict):
{
  "message": "Attendance for John Doe has already been marked for 2026-05-14. Please update the existing record instead.",
  "error": "DUPLICATE_RESOURCE",
  "status": 409
}
```

### **3. Test Validation**
```bash
# Test missing name
POST /api/employees
{
  "phoneNumber": "9876543210",
  "monthlySalary": 15000
}

# Expected Response (400 Bad Request):
{
  "message": "Employee name is required",
  "error": "VALIDATION_ERROR",
  "status": 400
}
```

---

## 📱 Mobile App Display

### **Alert Format**
```javascript
Alert.alert(
  'Error',  // Title
  'This mobile number is already registered with employee: John Doe'  // Message
);
```

### **Visual Example**
```
┌─────────────────────────────────────┐
│              Error                   │
├─────────────────────────────────────┤
│                                      │
│  This mobile number is already       │
│  registered with employee:           │
│  John Doe                            │
│                                      │
├─────────────────────────────────────┤
│                  [OK]                │
└─────────────────────────────────────┘
```

---

## ✅ Checklist for Testing

- [ ] Test duplicate phone number
- [ ] Test duplicate attendance
- [ ] Test missing required fields
- [ ] Test invalid phone number length
- [ ] Test negative salary
- [ ] Test future date attendance
- [ ] Test network error (turn off wifi)
- [ ] Test server error (stop backend)
- [ ] Test not found errors
- [ ] Test authentication errors

---

## 🎉 Result

Users now see **clear, actionable error messages** instead of generic "Error occurred" messages!

**Before:**
- ❌ "Error occurred"
- ❌ "Failed to add employee"
- ❌ "Something went wrong"

**After:**
- ✅ "This mobile number is already registered with employee: John Doe"
- ✅ "Attendance for Rajesh Kumar has already been marked for 2026-05-14. Please update the existing record instead."
- ✅ "Mobile number must be at least 10 digits"
