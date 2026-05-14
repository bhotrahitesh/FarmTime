# Neon Database Setup Guide

## Configuration Complete ✅

Your FarmTime backend is now configured to connect to Neon database.

### Connection Details
- **Host**: `ep-icy-leaf-aq41m2ep-pooler.c-8.us-east-1.aws.neon.tech`
- **Database**: `farmtime_db`
- **Username**: `neondb_owner`
- **Configuration File**: `src/main/resources/application-neon.properties`

## How to Run

### Option 1: Using the Helper Script
```bash
./run-neon.sh
```

### Option 2: Using Maven Directly
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=neon
```

### Option 3: Using IntelliJ IDEA
1. Open Run/Debug Configurations
2. Add VM options: `-Dspring.profiles.active=neon`
3. Run the application

## First Time Setup

On first run, the application will automatically:
1. Connect to your Neon database
2. Create all tables (admins, employees, attendance, payments, time_off)
3. Set up indexes and constraints
4. Insert a default admin user

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change this password immediately after first login!**

## Testing Database Connection

### Quick Test (Automated)
```bash
# Start the backend first
./run-neon.sh

# In a new terminal, run the test script
./test-neon-connection.sh
```

This will automatically test:
- ✅ Backend health
- ✅ Database connection
- ✅ Database ping/response time
- ✅ Table creation and statistics

### Manual Testing

#### 1. Basic Health Check
```bash
curl http://localhost:8080/api/health
```

Expected response:
```json
{
  "status": "UP",
  "application": "farmtime-backend",
  "timestamp": "2026-05-14T18:04:35",
  "timezone": "Asia/Kolkata"
}
```

#### 2. Database Connection Details
```bash
curl http://localhost:8080/api/health/database
```

This returns:
- Database product name and version
- Connection URL (password masked)
- List of created tables
- Current database time
- Full PostgreSQL version

#### 3. Quick Database Ping
```bash
curl http://localhost:8080/api/health/database/ping
```

Returns connection status and response time in milliseconds.

#### 4. Table Statistics
```bash
curl http://localhost:8080/api/health/database/stats
```

Shows row counts for all tables:
- admins
- employees
- attendance
- payments
- time_off

### Browser Testing

Open in your browser:
- http://localhost:8080/api/health
- http://localhost:8080/api/health/database
- http://localhost:8080/api/health/database/ping
- http://localhost:8080/api/health/database/stats

## Switching Between Databases

### Local PostgreSQL (Development)
```bash
./run.sh
# or
./mvnw spring-boot:run
```

### Neon Database (Production/Testing)
```bash
./run-neon.sh
# or
./mvnw spring-boot:run -Dspring-boot.run.profiles=neon
```

## Verify Connection

After starting the application, check the logs for:
```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
```

This confirms successful connection to Neon database.

## Database Management

### Access Neon Console
Visit: https://console.neon.tech

### Connect via psql
```bash
psql "postgresql://neondb_owner:npg_l1QfnyUt6Thw@ep-icy-leaf-aq41m2ep-pooler.c-8.us-east-1.aws.neon.tech/farmtime_db?sslmode=require"
```

### View Tables
```sql
\dt
```

### Check Data
```sql
SELECT * FROM admins;
SELECT * FROM employees;
```

## Important Notes

- ✅ Credentials are stored in `application-neon.properties`
- ✅ This file is added to `.gitignore` (won't be committed to Git)
- ✅ SSL is enabled and required for Neon connections
- ✅ Timezone is set to `Asia/Kolkata`
- ✅ Auto-schema creation is enabled (`ddl-auto=update`)

## Troubleshooting

### Connection Failed
- Check if Neon database is active (free tier may pause after inactivity)
- Verify credentials in `application-neon.properties`
- Ensure SSL mode is set to `require`

### Tables Not Created
- Check `spring.jpa.hibernate.ddl-auto=update` in config
- Review application logs for errors
- Manually run SQL scripts if needed

## Next Steps

1. Start the backend: `./run-neon.sh`
2. Verify tables are created in Neon console
3. Test API endpoints
4. Update mobile app to point to your backend URL
5. Change default admin password

## Security Reminders

- 🔒 Never commit `application-neon.properties` to Git
- 🔒 Change default admin password
- 🔒 Use environment variables for production deployment
- 🔒 Rotate database credentials periodically
