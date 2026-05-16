# Render Deployment Guide for FarmTime Backend

This guide explains how to deploy only the backend application to Render, even though your project contains both backend and mobile code.

## Prerequisites

1. GitHub account with your FarmTime repository
2. Render account (sign up at https://render.com)
3. Push your code to GitHub

## Deployment Options

### Option 1: Using render.yaml (Recommended - Infrastructure as Code)

The `render.yaml` file at the project root configures Render to deploy only the backend with Neon database.

**Steps:**

1. **Get Neon Database Credentials:**
   - Go to your Neon dashboard (https://console.neon.tech)
   - Copy your database connection details:
     - Connection string (or host, database name, username, password)

2. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

3. **Connect to Render:**
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - **Before clicking Apply**, you'll be prompted to add environment variables

4. **Configure Environment Variables:**
   Add these required variables:
   - `SPRING_DATASOURCE_URL`: Your Neon JDBC URL (format: `jdbc:postgresql://your-neon-host.neon.tech:5432/your_db?sslmode=require`)
   - `SPRING_DATASOURCE_USERNAME`: Your Neon database username
   - `SPRING_DATASOURCE_PASSWORD`: Your Neon database password
   - `JWT_SECRET`: Generate a secure random string (use `openssl rand -base64 64`)
   - `CORS_ALLOWED_ORIGINS`: Your mobile app URL (e.g., `https://yourdomain.com` or `*` for testing)

5. **Deploy:**
   - Click "Apply" to create the service
   - Render will build and deploy using the `neon` profile

### Option 2: Manual Web Service Setup

If you prefer manual setup:

1. **Prepare Neon Database:**
   - Ensure your Neon database is set up and running
   - Copy your Neon connection details from https://console.neon.tech
   - Note: You're using your existing Neon database, not creating a new one on Render

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
   SPRING_PROFILES_ACTIVE=neon
   SPRING_DATASOURCE_URL=jdbc:postgresql://<your-neon-host>.neon.tech:5432/<your-db-name>?sslmode=require
   SPRING_DATASOURCE_USERNAME=<your-neon-username>
   SPRING_DATASOURCE_PASSWORD=<your-neon-password>
   JWT_SECRET=<generate-a-secure-random-string>
   JWT_EXPIRATION=86400000
   CORS_ALLOWED_ORIGINS=*
   JAVA_OPTS=-Xms256m -Xmx512m
   ```
   
   **Important for Neon:**
   - Always include `?sslmode=require` at the end of the JDBC URL
   - Use the connection string from your Neon dashboard
   - Neon URLs typically look like: `ep-xxx-xxx.us-east-2.aws.neon.tech`

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

### Database Connection (Neon)
Your app uses the `neon` profile which connects to your Neon PostgreSQL database.

Neon connection string format:
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech:5432/database?sslmode=require
```

Convert it to Spring Boot JDBC format:
```
SPRING_DATASOURCE_URL=jdbc:postgresql://ep-xxx-xxx.region.aws.neon.tech:5432/database?sslmode=require
SPRING_DATASOURCE_USERNAME=user
SPRING_DATASOURCE_PASSWORD=password
```

**Critical:** Always include `?sslmode=require` for Neon connections.

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

**Render:**
- **Web Service:** Spins down after 15 minutes of inactivity (first request may take 30-50 seconds)
- **Build Time:** 500 build minutes/month

**Neon (Your Database):**
- Check your Neon plan limits at https://neon.tech/pricing
- Free tier typically includes: 0.5 GB storage, compute hours limits
- Database stays active based on your Neon plan

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
- Ensure `?sslmode=require` is appended to your Neon JDBC URL
- Verify Neon database is active (check Neon dashboard)
- Ensure JDBC URL format: `jdbc:postgresql://ep-xxx.neon.tech:5432/dbname?sslmode=require`
- Verify username and password are correct from Neon dashboard
- Check if your Neon project is in active state (not suspended)

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
