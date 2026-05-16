# Keep-Alive Setup Guide

This guide explains how to prevent your Render free tier service from spinning down due to inactivity.

## Problem

Render's free tier spins down services after 15 minutes of inactivity, causing:
- 30-60 second cold start delays
- Poor user experience on first login
- Timeout errors

## Solutions

### Option 1: GitHub Actions (Recommended - Free)

**Pros:**
- Completely free for public repositories
- No additional infrastructure needed
- Runs automatically

**Setup:**
1. The workflow file is already created at `.github/workflows/keep-alive.yml`
2. Push this file to your GitHub repository
3. Enable GitHub Actions in your repository settings
4. The workflow will automatically ping your server every 10 minutes

**Verify it's working:**
- Go to your GitHub repository
- Click on "Actions" tab
- You should see "Keep Render Service Alive" workflow running

### Option 2: Local Keep-Alive Script

**Pros:**
- Simple to run
- Good for development/testing

**Cons:**
- Requires your computer to be running 24/7

**Setup:**
1. Install Node.js if not already installed
2. Install axios: `npm install axios`
3. Run the script: `node keep-alive.js`

### Option 3: Render Cron Job (Free)

**Pros:**
- Native Render solution
- Reliable

**Setup:**
1. Go to your Render dashboard
2. Create a new "Cron Job" service
3. Set the schedule: `*/10 * * * *` (every 10 minutes)
4. Set the command: `curl https://farmtime-backend-xzj0.onrender.com/api/health/ping`

### Option 4: UptimeRobot (Free)

**Pros:**
- Free monitoring service
- Provides uptime statistics
- Email alerts

**Setup:**
1. Sign up at https://uptimerobot.com (free)
2. Add a new monitor:
   - Monitor Type: HTTP(s)
   - URL: `https://farmtime-backend-xzj0.onrender.com/api/health/ping`
   - Monitoring Interval: 5 minutes (free tier)
3. Save the monitor

## Important Notes

### Render Free Tier Limits
- **750 hours per month** of runtime
- Running 24/7 = ~720 hours/month (within limit)
- Multiple services share this limit

### Best Practices
1. **Use the `/api/health/ping` endpoint** - it's lightweight and doesn't query the database
2. **Don't ping too frequently** - Every 10 minutes is optimal
3. **Monitor your usage** - Check Render dashboard for hours used

### Alternative: Upgrade to Paid Plan
If you need guaranteed uptime without cold starts:
- Render Starter Plan: $7/month
- No cold starts
- Better performance
- More resources

## Testing

Test if your server is responding:
```bash
curl https://farmtime-backend-xzj0.onrender.com/api/health/ping
```

Expected response:
```json
{
  "status": "alive",
  "timestamp": "2024-01-01T12:00:00"
}
```

## Troubleshooting

### GitHub Actions not running
- Check if Actions are enabled in repository settings
- Verify the workflow file is in `.github/workflows/` directory
- Check the Actions tab for error logs

### Server still spinning down
- Verify the keep-alive service is running
- Check if you're hitting Render's 750 hour/month limit
- Ensure the ping endpoint is accessible

### High response times
- First ping after cold start will be slow (30-60s)
- Subsequent pings should be fast (<500ms)
- This is normal behavior for free tier

## Monitoring

Check your server status:
```bash
# Quick ping
curl https://farmtime-backend-xzj0.onrender.com/api/health/ping

# Detailed health check
curl https://farmtime-backend-xzj0.onrender.com/api/health

# Database health
curl https://farmtime-backend-xzj0.onrender.com/api/health/database/ping
```
