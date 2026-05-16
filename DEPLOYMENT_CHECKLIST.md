# Deployment Checklist - Login Performance Fixes

## ⚠️ CRITICAL: Do This First!

### Step 1: Update application-neon.properties

The HikariCP configuration was added to `application.properties` and `application-prod.properties`, but **you must manually add it to `application-neon.properties`** because:

- Spring Boot profile-specific properties **override** base properties
- `application-neon.properties` is gitignored (contains credentials)
- Without this, the optimization won't work on Render!

**Action Required:**

```bash
# Open the file
nano backend/src/main/resources/application-neon.properties
```

**Add these lines after the datasource configuration:**

```properties
# HikariCP Connection Pool Configuration
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=600000
spring.datasource.hikari.connection-test-query=SELECT 1
spring.datasource.hikari.leak-detection-threshold=60000
```

**Save and exit:** Ctrl+O, Enter, Ctrl+X

📖 **See `backend/NEON_HIKARI_CONFIG.md` for complete example**

---

## Deployment Steps

### ✅ Step 1: Update Neon Configuration
- [ ] Open `backend/src/main/resources/application-neon.properties`
- [ ] Add HikariCP configuration (see above)
- [ ] Save the file
- [ ] Verify the configuration is correct

### ✅ Step 2: Deploy Backend
```bash
cd backend
git add .
git commit -m "Add database connection pool optimization"
git push origin main
```
- [ ] Push changes to GitHub
- [ ] Wait for Render to redeploy (~5 minutes)
- [ ] Check Render logs for "HikariPool-1 - Starting..."

### ✅ Step 3: Test Mobile App Locally
```bash
cd mobile
npx expo start
```
- [ ] Test login on iOS/Android
- [ ] Verify 60-second timeout works
- [ ] Check error messages are clear

### ✅ Step 4: Setup Keep-Alive

**Option A: GitHub Actions (Recommended)**
```bash
git add .github/workflows/keep-alive.yml
git commit -m "Add keep-alive workflow"
git push origin main
```
- [ ] Push workflow file
- [ ] Enable GitHub Actions in repository settings
- [ ] Verify workflow runs in Actions tab

**Option B: UptimeRobot**
- [ ] Sign up at https://uptimerobot.com
- [ ] Add monitor: `https://farmtime-backend-xzj0.onrender.com/api/health/ping`
- [ ] Set interval: 5 minutes

**Option C: Local Script**
```bash
npm install axios
node keep-alive.js
```
- [ ] Install dependencies
- [ ] Run script (keep terminal open)

---

## Verification

### ✅ Test Backend Deployment
```bash
# Test health endpoint
curl https://farmtime-backend-xzj0.onrender.com/api/health/ping

# Expected response:
# {"status":"alive","timestamp":"2024-01-01T12:00:00"}
```

### ✅ Test Database Connection
```bash
# Test database health
curl https://farmtime-backend-xzj0.onrender.com/api/health/database/ping

# Expected response time: < 500ms (after warm-up)
```

### ✅ Test Login Performance

**Without Keep-Alive:**
- [ ] Wait 20 minutes for server to spin down
- [ ] Try logging in
- [ ] Should take 30-45 seconds (improved from 60-90s)
- [ ] No timeout errors

**With Keep-Alive:**
- [ ] Wait 20 minutes (server should stay warm)
- [ ] Try logging in
- [ ] Should take 1-2 seconds
- [ ] Consistent performance

---

## Troubleshooting

### ❌ Login still slow (60+ seconds)

**Check if HikariCP is configured in Neon properties:**
```bash
# View Render logs
# Look for: "HikariPool-1 - Starting..."
# If missing, you forgot to update application-neon.properties!
```

**Fix:**
1. Update `application-neon.properties` with HikariCP config
2. Redeploy to Render
3. Test again

### ❌ Timeout errors

**Check mobile app timeout:**
- File: `mobile/src/services/api.js`
- Should have: `timeout: 60000`

**Check server response:**
```bash
curl -w "\nTime: %{time_total}s\n" https://farmtime-backend-xzj0.onrender.com/api/health/ping
```

### ❌ Keep-alive not working

**GitHub Actions:**
- Check if Actions are enabled in repository settings
- View Actions tab for errors
- Verify workflow file is in `.github/workflows/`

**UptimeRobot:**
- Check if monitor is active
- Verify URL is correct
- Check monitor logs

---

## Success Criteria

✅ **Backend:**
- HikariCP configuration in `application-neon.properties`
- Render deployment successful
- Health endpoint responds in < 500ms
- Database ping responds in < 500ms

✅ **Mobile App:**
- 60-second timeout configured
- Timeout error message shows correctly
- Login works without errors

✅ **Keep-Alive:**
- Server stays warm (no cold starts)
- Login time consistently 1-2 seconds
- No timeout errors

✅ **Overall:**
- Login time: 1-2 seconds (with keep-alive)
- Login time: 30-45 seconds (without keep-alive, first login)
- Clear error messages
- Good user experience

---

## Files Modified

### Backend:
- ✅ `backend/src/main/resources/application.properties` (committed)
- ✅ `backend/src/main/resources/application-prod.properties` (committed)
- ⚠️ `backend/src/main/resources/application-neon.properties` (manual update required)

### Mobile:
- ✅ `mobile/src/services/api.js` (committed)
- ✅ `mobile/src/screens/LoginScreen.js` (committed)

### Keep-Alive:
- ✅ `.github/workflows/keep-alive.yml` (committed)
- ✅ `keep-alive.js` (committed)

### Documentation:
- ✅ `LOGIN_PERFORMANCE_FIXES.md`
- ✅ `KEEP_ALIVE_SETUP.md`
- ✅ `backend/NEON_HIKARI_CONFIG.md`
- ✅ `DEPLOYMENT_CHECKLIST.md` (this file)

---

## Next Steps

1. **Complete Step 1** (update application-neon.properties) - **CRITICAL!**
2. Deploy backend changes
3. Test mobile app
4. Setup keep-alive
5. Verify performance improvements
6. Monitor for a few days
7. Consider upgrading to paid plan if needed

---

## Questions?

- See `LOGIN_PERFORMANCE_FIXES.md` for detailed explanations
- See `KEEP_ALIVE_SETUP.md` for keep-alive options
- See `backend/NEON_HIKARI_CONFIG.md` for Neon configuration details
