# Session Expiration Error Message - Test Guide

## Test Scenarios

### ✅ Test 1: Wrong Username or Password (Login Page)
**Expected Behavior:** Should show "Invalid username or password"

**Steps:**
1. Open the app
2. Enter wrong username or wrong password
3. Click Login

**Expected Result:**
- ❌ Error message: **"Invalid username or password"**
- Status: 401 Unauthorized
- This is handled by `/api/auth/login` endpoint

---

### ✅ Test 2: Session Expired (While Using App)
**Expected Behavior:** Should show "Your session has expired. Please login again."

**Steps:**
1. Login successfully with correct credentials
2. Keep the app idle for more than 24 hours (or wait for JWT token to expire)
   - Current JWT expiration: 86400000ms = 24 hours (configured in `application-aws.properties`)
3. Try to perform any action (e.g., view employees, add attendance, etc.)

**Expected Result:**
- ❌ Error message: **"Your session has expired. Please login again."**
- Status: 401 Unauthorized
- This is handled by `JwtAuthenticationEntryPoint`

---

### ✅ Test 3: Quick Test for Session Expiration (Recommended)
**To test without waiting 24 hours:**

1. **Temporarily reduce JWT expiration time:**
   - Edit `backend/src/main/resources/application-aws.properties`
   - Change: `jwt.expiration=${JWT_EXPIRATION:60000}` (1 minute instead of 24 hours)
   - Restart backend

2. **Test flow:**
   - Login to the app
   - Wait for 2 minutes
   - Try to perform any action (view employees, add attendance, etc.)

3. **Expected Result:**
   - ❌ Error message: **"Your session has expired. Please login again."**

4. **Restore original setting:**
   - Change back to: `jwt.expiration=${JWT_EXPIRATION:86400000}`
   - Restart backend

---

### ✅ Test 4: Invalid Token
**Expected Behavior:** Should show "Your session has expired. Please login again."

**Steps:**
1. Login successfully
2. Manually modify the token in AsyncStorage (for advanced testing)
3. Try to perform any action

**Expected Result:**
- ❌ Error message: **"Your session has expired. Please login again."**
- Status: 401 Unauthorized

---

## Summary of Error Messages

| Scenario | HTTP Status | Error Message |
|----------|-------------|---------------|
| Wrong username/password | 401 | "Invalid username or password" |
| Session expired | 401 | "Your session has expired. Please login again." |
| Invalid token | 401 | "Your session has expired. Please login again." |
| No permission (403) | 403 | "You do not have permission to perform this action." |
| Account pending approval | 403 | "Your account is pending approval. Please contact the super admin." |
| Account deactivated | 403 | "Your account has been deactivated. Please contact the super admin." |

---

## Quick Test Command

To quickly test session expiration, temporarily change JWT expiration:

```bash
# Edit the properties file
# Change jwt.expiration to 60000 (1 minute)

# Restart backend
# Then login and wait 2 minutes before trying any action
```

**Remember to change it back to 86400000 (24 hours) after testing!**
