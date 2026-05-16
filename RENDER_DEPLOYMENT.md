# Render Deployment Guide for FarmTime Backend

This guide explains how to deploy only the backend application to Render, even though your project contains both backend and mobile code.

## Prerequisites

1. GitHub account with your FarmTime repository
2. Render account (sign up at https://render.com)
3. Push your code to GitHub

## Deployment Options

### Option 1: Using render.yaml (Recommended - Infrastructure as Code)

The `render.yaml` file at the project root configures Render to deploy only the backend.

**Steps:**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Connect to Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Click "Apply" to create services

3. **Configure Environment Variables:**
   After deployment, go to your service settings and add:
   - `CORS_ALLOWED_ORIGINS`: Your mobile app URL (e.g., `https://yourdomain.com` or `*` for testing)

4. **Database Setup:**
   Render will automatically create a PostgreSQL database and connect it to your app.

### Option 2: Manual Web Service Setup

If you prefer manual setup:

1. **Create PostgreSQL Database:**
   - Dashboard → "New +" → "PostgreSQL"
   - Name: `farmtime-db`
   - Plan: Free
   - Click "Create Database"
   - Copy the "Internal Database URL"

2. **Create Web Service:**
   - Dashboard → "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** `farmtime-backend`
     - **Region:** Singapore (or closest to you)
     - **Branch:** `main`
     - **Runtime:** Docker
     - **Dockerfile Path:** `./backend/Dockerfile`
     - **Docker Context:** `./backend`
     - **Plan:** Free

3. **Environment Variables:**
   Add these in the "Environment" section:
   ```
   SPRING_PROFILES_ACTIVE=prod
   SPRING_DATASOURCE_URL=<paste-internal-database-url>
   SPRING_DATASOURCE_USERNAME=<from-database-credentials>
   SPRING_DATASOURCE_PASSWORD=<from-database-credentials>
   JWT_SECRET=<generate-a-secure-random-string>
   JWT_EXPIRATION=86400000
   CORS_ALLOWED_ORIGINS=*
   JAVA_OPTS=-Xms256m -Xmx512m
   ```

4. **Health Check:**
   - Path: `/api/health`

5. **Deploy:**
   Click "Create Web Service"

## Important Configuration Notes

### Docker Context
The key to deploying only the backend is setting:
- **Dockerfile Path:** `./backend/Dockerfile`
- **Docker Context:** `./backend`

This tells Render to:
1. Use the Dockerfile in the backend directory
2. Build only from the backend directory (ignoring mobile code)

### Database Connection
Render provides an "Internal Database URL" in this format:
```
postgresql://user:password@host:5432/database
```

Convert it to Spring Boot format:
```
SPRING_DATASOURCE_URL=jdbc:postgresql://host:5432/database
SPRING_DATASOURCE_USERNAME=user
SPRING_DATASOURCE_PASSWORD=password
```

### CORS Configuration
Update `CORS_ALLOWED_ORIGINS` with your mobile app's domain or IP addresses:
- For testing: `*` (allows all origins)
- For production: `https://yourdomain.com,https://app.yourdomain.com`

### JWT Secret
Generate a secure random string (at least 256 bits):
```bash
openssl rand -base64 64
```

## Monitoring Your Deployment

1. **Logs:** Dashboard → Your Service → "Logs" tab
2. **Metrics:** Dashboard → Your Service → "Metrics" tab
3. **Health Check:** Visit `https://your-app.onrender.com/api/health`

## Testing the Deployment

Once deployed, test your API:

```bash
# Health check
curl https://your-app-name.onrender.com/api/health

# Login (example)
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

## Updating Your Mobile App

Update your mobile app's API base URL to point to Render:

In `mobile/src/config.js` (or wherever you store API config):
```javascript
export const API_BASE_URL = 'https://your-app-name.onrender.com';
```

## Free Tier Limitations

- **Web Service:** Spins down after 15 minutes of inactivity (first request may take 30-50 seconds)
- **Database:** 1GB storage, 97 hours/month runtime
- **Build Time:** 500 build minutes/month

## Troubleshooting

### Build Fails
- Check logs in Render dashboard
- Verify Dockerfile path is `./backend/Dockerfile`
- Verify Docker context is `./backend`

### App Crashes on Startup
- Check environment variables are set correctly
- Verify database connection string format
- Check logs for specific errors

### Database Connection Issues
- Use "Internal Database URL" (not External)
- Ensure JDBC URL format: `jdbc:postgresql://...`
- Verify username and password are correct

### CORS Errors
- Update `CORS_ALLOWED_ORIGINS` environment variable
- Include protocol (http/https) in origins
- For development, temporarily use `*`

## Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure proper `CORS_ALLOWED_ORIGINS`
- [ ] Set `spring.jpa.hibernate.ddl-auto=validate` in production
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set up database backups
- [ ] Configure logging levels appropriately
- [ ] Test all API endpoints
- [ ] Update mobile app with production URL

## Cost Optimization

To avoid service spin-down on free tier:
- Upgrade to paid plan ($7/month for always-on)
- Or use a cron job to ping your health endpoint every 10 minutes

## Support

- Render Docs: https://render.com/docs
- Render Community: https://community.render.com
