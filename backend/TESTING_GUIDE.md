# 🧪 Neon Database Connection Testing Guide

This guide will help you verify that your FarmTime backend is successfully connected to the Neon PostgreSQL database.

## Quick Start

### Step 1: Start the Backend with Neon Profile
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/backend
./run-neon.sh
```

Wait for the backend to start. You should see:
```
Started FarmTimeApplication in X.XXX seconds
```

### Step 2: Run Automated Tests
Open a **new terminal** and run:
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/backend
./test-neon-connection.sh
```

This will test:
- ✅ Backend health
- ✅ Database connection
- ✅ Database ping/response time
- ✅ Table creation and row counts

### Step 3: Visual Testing (Optional)
Open `test-connection.html` in your browser:
```bash
open test-connection.html
```

Click "🚀 Run All Tests" to see visual results.

---

## Manual Testing Methods

### Method 1: Command Line (curl)

#### Test 1: Basic Health Check
```bash
curl http://localhost:8080/api/health
```

**Expected Output:**
```json
{
  "status": "UP",
  "application": "farmtime-backend",
  "timestamp": "2026-05-14T18:04:35",
  "timezone": "Asia/Kolkata"
}
```

#### Test 2: Database Connection Details
```bash
curl http://localhost:8080/api/health/database
```

**What to Look For:**
- `"status": "CONNECTED"` ✅
- `"databaseProductName": "PostgreSQL"`
- `"tables": ["admins", "employees", "attendance", "payments", "time_off"]`
- `"tableCount": 5`

#### Test 3: Database Ping
```bash
curl http://localhost:8080/api/health/database/ping
```

**Expected Output:**
```json
{
  "status": "UP",
  "responseTimeMs": 50,
  "timestamp": "2026-05-14T18:04:35"
}
```

#### Test 4: Table Statistics
```bash
curl http://localhost:8080/api/health/database/stats
```

**Expected Output:**
```json
{
  "status": "SUCCESS",
  "tableCounts": {
    "admins": 1,
    "employees": 0,
    "attendance": 0,
    "payments": 0,
    "time_off": 0
  },
  "timestamp": "2026-05-14T18:04:35"
}
```

### Method 2: Browser

Open these URLs in your browser:

1. **Health Check**
   - http://localhost:8080/api/health

2. **Database Connection**
   - http://localhost:8080/api/health/database

3. **Database Ping**
   - http://localhost:8080/api/health/database/ping

4. **Table Statistics**
   - http://localhost:8080/api/health/database/stats

### Method 3: Visual Test Page

Open `test-connection.html` in your browser for an interactive testing interface.

---

## What Each Test Checks

### 1. Health Check (`/api/health`)
- ✅ Backend is running
- ✅ Application name is correct
- ✅ Timezone is set to Asia/Kolkata
- ✅ Server is responding

### 2. Database Connection (`/api/health/database`)
- ✅ Connection to Neon database established
- ✅ PostgreSQL version information
- ✅ All 5 tables are created
- ✅ Database timezone is correct
- ✅ Connection pool is working

### 3. Database Ping (`/api/health/database/ping`)
- ✅ Database responds quickly
- ✅ Connection is valid
- ✅ Response time is acceptable (< 500ms)

### 4. Table Statistics (`/api/health/database/stats`)
- ✅ All tables exist and are accessible
- ✅ Default admin user is created (admins count = 1)
- ✅ Tables are ready for data

---

## Troubleshooting

### ❌ "Connection refused" or "Failed to connect"

**Problem:** Backend is not running

**Solution:**
```bash
./run-neon.sh
```

### ❌ "status": "ERROR" in database test

**Problem:** Database credentials are incorrect or Neon database is paused

**Solutions:**
1. Check credentials in `application-neon.properties`
2. Verify Neon database is active at https://console.neon.tech
3. Check if free tier database is paused (wake it up in Neon console)

### ❌ Tables not created (tableCount = 0)

**Problem:** Hibernate didn't create tables

**Solutions:**
1. Check `spring.jpa.hibernate.ddl-auto=update` in config
2. Look for errors in backend logs
3. Manually run SQL scripts from the setup guide

### ❌ Response time > 1000ms

**Problem:** Slow connection to Neon

**Possible Causes:**
- Free tier database in cold start (first request is slow)
- Network latency to Neon region
- Connection pooling not configured

**Solution:** Wait a few seconds and test again. First connection is usually slower.

### ❌ CORS errors in browser

**Problem:** CORS not configured for browser testing

**Solution:** Use curl or the test script instead, or update CORS settings in application-neon.properties

---

## Success Criteria

Your Neon database connection is working correctly if:

- ✅ Health check returns `"status": "UP"`
- ✅ Database test returns `"status": "CONNECTED"`
- ✅ Database ping returns `"status": "UP"`
- ✅ Table stats shows `"tableCount": 5`
- ✅ Admins table has 1 row (default admin)
- ✅ Response time is < 500ms

---

## Next Steps After Successful Connection

1. **Test the default admin login:**
   ```bash
   curl -X POST http://localhost:8080/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"admin","password":"admin123"}'
   ```

2. **Create a test employee:**
   ```bash
   # First get the JWT token from login response
   # Then use it to create an employee
   ```

3. **Update mobile app** to point to your backend URL

4. **Change default admin password** immediately

5. **Deploy to production** when ready

---

## Monitoring in Neon Console

Visit https://console.neon.tech to:
- View active connections
- Monitor query performance
- Check database size
- View logs
- Manage backups

---

## Support

If tests fail:
1. Check backend logs for detailed error messages
2. Verify Neon database is active
3. Ensure credentials match in `application-neon.properties`
4. Check network connectivity
5. Review the NEON_SETUP.md guide
