#!/usr/bin/env node

/**
 * Keep-Alive Script for Render Free Tier
 * 
 * This script pings your Render service every 10 minutes to prevent it from spinning down.
 * 
 * IMPORTANT: Render's free tier has a 750 hour/month limit. This script will keep your
 * service running 24/7, which uses ~720 hours/month, staying within the limit.
 * 
 * Usage:
 * 1. Install dependencies: npm install axios
 * 2. Run locally: node keep-alive.js
 * 3. Or deploy to a free service like:
 *    - Render Cron Job (recommended)
 *    - GitHub Actions (scheduled workflow)
 *    - Vercel Cron
 *    - Railway Cron
 */

const axios = require('axios');

const SERVER_URL = 'https://farmtime-backend-xzj0.onrender.com/api/health/ping';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes

async function pingServer() {
  const timestamp = new Date().toISOString();
  
  try {
    console.log(`[${timestamp}] Pinging server...`);
    const startTime = Date.now();
    
    const response = await axios.get(SERVER_URL, {
      timeout: 30000, // 30 second timeout
    });
    
    const responseTime = Date.now() - startTime;
    console.log(`[${timestamp}] ✓ Server is alive! Response time: ${responseTime}ms`);
    console.log(`[${timestamp}] Response:`, response.data);
    
  } catch (error) {
    console.error(`[${timestamp}] ✗ Failed to ping server:`, error.message);
    
    if (error.code === 'ECONNABORTED') {
      console.error(`[${timestamp}] Server is likely cold starting. This is normal.`);
    }
  }
}

// Run immediately on start
pingServer();

// Then run every 10 minutes
setInterval(pingServer, PING_INTERVAL);

console.log('Keep-alive script started. Pinging server every 10 minutes...');
console.log('Press Ctrl+C to stop.');
