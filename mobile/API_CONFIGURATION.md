# API Configuration Guide

## Current Setup

Your mobile app is now configured to use the **production backend** on Render by default.

**Production URL:** `https://farmtime-backend-xzj0.onrender.com/api`

## Switching Between Production and Local

### Use Production (Default)
In `src/services/api.js`:
```javascript
const USE_LOCAL_API = false;  // ✅ Currently set
```

### Use Local Backend for Testing
In `src/services/api.js`:
```javascript
const USE_LOCAL_API = true;  // Switch to local
```

## Local API URLs by Platform

When `USE_LOCAL_API = true`, the app automatically uses the correct local URL:

| Platform | URL | Notes |
|----------|-----|-------|
| **iOS Simulator** | `http://localhost:8080/api` | Works directly |
| **Android Emulator** | `http://10.0.2.2:8080/api` | Special alias for host machine |
| **Physical Device** | `http://YOUR_IP:8080/api` | Requires manual update |

### For Physical Device Testing

1. Find your computer's IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet "
   
   # Look for something like: 192.168.1.xxx
   ```

2. Update `getLocalApiUrl()` in `src/services/api.js`:
   ```javascript
   const getLocalApiUrl = () => {
     if (Platform.OS === 'android') {
       return 'http://10.0.2.2:8080/api';
     }
     // For physical device, use your computer's IP
     return 'http://192.168.1.xxx:8080/api';  // Update with your IP
   };
   ```

## Quick Switch Commands

### Switch to Production
```bash
# Edit src/services/api.js
# Set: const USE_LOCAL_API = false;
```

### Switch to Local
```bash
# Edit src/services/api.js
# Set: const USE_LOCAL_API = true;

# Make sure backend is running locally:
cd ../backend
./mvnw spring-boot:run
```

## Testing Connection

### Test Production API
```bash
curl https://farmtime-backend-xzj0.onrender.com/api/health
```

Expected response:
```json
{
  "status": "UP"
}
```

### Test Local API
```bash
curl http://localhost:8080/api/health
```

## Common Issues

### Issue: "Network Error" in Production Mode
**Solution:**
- Check if Render service is running (may take 30-50 seconds on first request after inactivity)
- Verify URL is correct: `https://farmtime-backend-xzj0.onrender.com/api`
- Check internet connection

### Issue: "Network Error" in Local Mode
**Solution:**
- Ensure backend is running: `cd backend && ./mvnw spring-boot:run`
- Check correct URL for your platform (iOS vs Android)
- For physical device, verify IP address is correct

### Issue: CORS Errors
**Solution:**
- Ensure backend CORS is configured to allow your origin
- Check backend logs for CORS-related errors

## Environment-Based Configuration (Advanced)

For more advanced setups, you can use environment variables:

1. Install `react-native-dotenv`:
   ```bash
   npm install react-native-dotenv
   ```

2. Create `.env` file:
   ```
   API_URL=https://farmtime-backend-xzj0.onrender.com/api
   ```

3. Create `.env.local` file:
   ```
   API_URL=http://localhost:8080/api
   ```

4. Update `src/services/api.js`:
   ```javascript
   import { API_URL } from '@env';
   const API_BASE_URL = API_URL;
   ```

## Best Practices

1. **Default to Production**: Keep `USE_LOCAL_API = false` in committed code
2. **Local Testing**: Only change to `true` temporarily for local development
3. **Don't Commit Local Changes**: Add to `.gitignore` if needed
4. **Document Changes**: Update this file if you change the production URL

## Current Status

✅ **Production Mode Active**
- URL: `https://farmtime-backend-xzj0.onrender.com/api`
- Backend: Deployed on Render
- Database: Neon PostgreSQL

🔄 **To Switch to Local**:
1. Open `src/services/api.js`
2. Change line 8: `const USE_LOCAL_API = true;`
3. Start local backend: `cd backend && ./mvnw spring-boot:run`
4. Restart mobile app: `npm start`
