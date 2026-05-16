# HikariCP Configuration for Neon Database

## IMPORTANT: Manual Configuration Required

The HikariCP connection pool settings added to `application.properties` will **NOT** automatically apply to the Neon profile because Spring Boot profile-specific properties override base properties.

## What You Need to Do

Add the following HikariCP configuration to your `application-neon.properties` file:

```properties
# HikariCP Connection Pool Configuration for Neon
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=600000
spring.datasource.hikari.connection-test-query=SELECT 1
spring.datasource.hikari.leak-detection-threshold=60000
```

## Where to Add It

Open `backend/src/main/resources/application-neon.properties` and add the above configuration after the datasource configuration section.

Your file should look like this:

```properties
# Neon Database Configuration
# This file contains Neon production database credentials
# DO NOT COMMIT THIS FILE TO GIT

# Server Configuration
server.port=8080
spring.application.name=farmtime-backend

# PostgreSQL Database Configuration - Neon
spring.datasource.url=jdbc:postgresql://ep-icy-leaf-aq41m2ep-pooler.c-8.us-east-1.aws.neon.tech:5432/farmtime_db?sslmode=require
spring.datasource.username=neondb_owner
spring.datasource.password=npg_l1QfnyUt6Thw
spring.datasource.driver-class-name=org.postgresql.Driver

# HikariCP Connection Pool Configuration for Neon
spring.datasource.hikari.minimum-idle=1
spring.datasource.hikari.maximum-pool-size=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=600000
spring.datasource.hikari.connection-test-query=SELECT 1
spring.datasource.hikari.leak-detection-threshold=60000

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=false
spring.jpa.properties.hibernate.jdbc.time_zone=Asia/Kolkata

# JWT Configuration
jwt.secret=farmtime-secret-key-for-jwt-token-generation-change-this-in-production
jwt.expiration=86400000

# CORS Configuration
cors.allowed.origins=*

# Scheduled Tasks
spring.task.scheduling.pool.size=2

# Data Retention Configuration (in months)
data.retention.months=2
data.cleanup.cron=0 0 2 * * ?

# Timezone Configuration
spring.jackson.time-zone=Asia/Kolkata
spring.jackson.date-format=yyyy-MM-dd

# Logging - Less verbose for production
logging.level.com.farmtime=INFO
logging.level.org.springframework.security=WARN
```

## Why This Matters

### Without HikariCP Configuration:
- Uses default connection pool settings
- Slower database connections
- Less efficient connection reuse
- Longer cold start times

### With HikariCP Configuration:
- **Optimized for Neon's connection pooler**
- Faster database connections
- Better connection reuse
- Reduced cold start impact
- Automatic connection validation

## Configuration Explained

| Setting | Value | Purpose |
|---------|-------|---------|
| `minimum-idle` | 1 | Keep at least 1 connection ready (saves memory on free tier) |
| `maximum-pool-size` | 5 | Max 5 connections (good for free tier limits) |
| `connection-timeout` | 20000 | 20 seconds to get connection (handles Neon latency) |
| `idle-timeout` | 300000 | 5 minutes before closing idle connections |
| `max-lifetime` | 600000 | 10 minutes max connection lifetime |
| `connection-test-query` | SELECT 1 | Validates connections are alive |
| `leak-detection-threshold` | 60000 | Detects connection leaks after 60 seconds |

## Neon-Specific Optimizations

Neon uses connection pooling, so these settings are optimized for:
1. **Neon's pooler endpoint** (already in your URL)
2. **Free tier limits** (small pool size)
3. **Network latency** (longer timeouts)
4. **Connection validation** (handles Neon's serverless nature)

## After Adding Configuration

1. **Save the file** (but don't commit - it's gitignored)
2. **Redeploy to Render:**
   ```bash
   git add backend/src/main/resources/application.properties
   git commit -m "Add HikariCP configuration"
   git push origin main
   ```
3. **Update Render environment variables** if needed
4. **Test the connection:**
   ```bash
   curl https://farmtime-backend-xzj0.onrender.com/api/health/database/ping
   ```

## Verification

After deployment, check the logs in Render dashboard. You should see:
```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
```

This confirms HikariCP is active with your configuration.

## Alternative: Use Common Configuration File

If you want to avoid duplicating configuration, you can create a common properties file:

1. Create `application-common.properties`:
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

2. In `application-neon.properties`, add:
```properties
spring.profiles.include=common
```

However, the direct approach (adding to each profile) is simpler and more explicit.
