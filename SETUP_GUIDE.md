# FarmTime - Complete Setup Guide

Step-by-step guide to get FarmTime up and running.

## Prerequisites Installation

### 1. Install Java 17
**macOS**:
```bash
brew install openjdk@17
```

**Windows**: Download from [Oracle](https://www.oracle.com/java/technologies/downloads/)

**Linux**:
```bash
sudo apt install openjdk-17-jdk
```

Verify:
```bash
java -version
```

### 2. Install PostgreSQL
**macOS**:
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Windows**: Download from [PostgreSQL.org](https://www.postgresql.org/download/)

**Linux**:
```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 3. Install Node.js
**macOS**:
```bash
brew install node
```

**Windows/Linux**: Download from [nodejs.org](https://nodejs.org/)

Verify:
```bash
node -v
npm -v
```

### 4. Install Expo CLI
```bash
npm install -g expo-cli
```

## Backend Setup (Detailed)

### Step 1: Create Database
```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE farmtime_db;

# Create user (optional)
CREATE USER farmtime_user WITH PASSWORD 'farmtime_password';
GRANT ALL PRIVILEGES ON DATABASE farmtime_db TO farmtime_user;

# Exit
\q
```

### Step 2: Configure Backend
Edit `backend/src/main/resources/application.properties`:

```properties
# Update these values
spring.datasource.url=jdbc:postgresql://localhost:5432/farmtime_db
spring.datasource.username=postgres
spring.datasource.password=your_actual_password

# Change JWT secret for production
jwt.secret=your-very-long-and-secure-secret-key-here
```

### Step 3: Build Backend
```bash
cd backend
mvn clean install
```

If you don't have Maven installed:
**macOS**: `brew install maven`
**Linux**: `sudo apt install maven`
**Windows**: Download from [maven.apache.org](https://maven.apache.org/)

### Step 4: Run Backend
```bash
mvn spring-boot:run
```

You should see:
```
Started FarmTimeApplication in X.XXX seconds
```

Backend is now running on `http://localhost:8080`

### Step 5: Create Admin Account
Open a new terminal:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "name": "Farm Admin"
  }'
```

You should see:
```json
{"message":"Admin registered successfully","username":"admin"}
```

### Step 6: Test Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

You should receive a JWT token.

## Mobile App Setup (Detailed)

### Step 1: Install Dependencies
```bash
cd mobile
npm install
```

This will take a few minutes.

### Step 2: Configure API URL

Find your computer's IP address:

**macOS/Linux**:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows**:
```bash
ipconfig
```

Look for IPv4 Address (e.g., 192.168.1.100)

Edit `mobile/src/services/api.js`:

```javascript
// For iOS Simulator
const API_BASE_URL = 'http://localhost:8080/api';

// For Android Emulator
const API_BASE_URL = 'http://10.0.2.2:8080/api';

// For Physical Device (replace with your IP)
const API_BASE_URL = 'http://192.168.1.100:8080/api';
```

### Step 3: Start Expo
```bash
npm start
```

This will open Expo DevTools in your browser.

### Step 4: Run on Device

**Option A: iOS Simulator** (macOS only)
- Press `i` in terminal
- Or click "Run on iOS simulator" in Expo DevTools

**Option B: Android Emulator**
- Install Android Studio
- Create an AVD (Android Virtual Device)
- Press `a` in terminal
- Or click "Run on Android emulator" in Expo DevTools

**Option C: Physical Device**
1. Install "Expo Go" app from App Store/Play Store
2. Scan QR code shown in terminal/browser
3. App will load on your device

### Step 5: Login
- Username: `admin`
- Password: `admin123`

## Testing the Application

### 1. Add an Employee
- Go to "Employees" tab
- Click the green "+" button
- Fill in details:
  - Name: John Doe
  - Phone: 9876543210
  - Address: Farm Location
  - Monthly Salary: 15000
  - Joining Date: Select today
- Click "Add Employee"

### 2. Mark Attendance
- Go to "Attendance" tab
- Click the green "+" button
- Select employee: John Doe
- Select date: Today
- Set check-in time: 09:00 AM
- Set check-out time: 05:00 PM
- Toggle "Present" to ON
- Click "Mark Attendance"

### 3. Add Payment
- Go to "Payments" tab
- Click the green "+" button
- Select employee: John Doe
- Select type: SALARY
- Enter amount: 15000
- Select date: Today
- Add description: "Monthly salary"
- Click "Add Payment"

### 4. Add Time Off
- Go to "Time Off" tab
- Click the green "+" button
- Select employee: John Doe
- Select type: CASUAL_LEAVE
- Select start date: Tomorrow
- Select end date: Day after tomorrow
- Add reason: "Personal work"
- Click "Add Time Off"

## Troubleshooting

### Backend Issues

**Problem**: Database connection failed
```
Solution: 
1. Check PostgreSQL is running: brew services list
2. Verify credentials in application.properties
3. Test connection: psql -U postgres -d farmtime_db
```

**Problem**: Port 8080 already in use
```
Solution: Change port in application.properties:
server.port=8081
```

**Problem**: Maven build fails
```
Solution:
1. Check Java version: java -version (should be 17+)
2. Clear Maven cache: mvn clean
3. Delete target folder and rebuild
```

### Mobile App Issues

**Problem**: Cannot connect to backend
```
Solution:
1. Verify backend is running: curl http://localhost:8080/api/auth/login
2. Check API URL in src/services/api.js
3. For physical device, use computer's IP address
4. Ensure firewall allows port 8080
```

**Problem**: Expo won't start
```
Solution:
1. Clear cache: expo start -c
2. Delete node_modules: rm -rf node_modules && npm install
3. Update Expo: npm install expo@latest
```

**Problem**: App crashes on startup
```
Solution:
1. Check console for errors
2. Verify all dependencies installed: npm install
3. Clear Expo cache: expo start -c
```

**Problem**: Physical device can't connect
```
Solution:
1. Ensure device and computer on same WiFi
2. Use computer's IP address in API_BASE_URL
3. Disable VPN if active
4. Check firewall settings
```

## Production Deployment

### Backend Deployment

1. **Update Configuration**:
   - Change database URL to production database
   - Update JWT secret key
   - Set `spring.jpa.hibernate.ddl-auto=validate`

2. **Build JAR**:
   ```bash
   mvn clean package -DskipTests
   ```

3. **Deploy**:
   ```bash
   java -jar target/farmtime-backend-1.0.0.jar
   ```

4. **Use Process Manager** (recommended):
   ```bash
   # Using systemd or PM2
   pm2 start "java -jar farmtime-backend-1.0.0.jar" --name farmtime-backend
   ```

### Mobile App Deployment

1. **Update API URL** to production server

2. **Build for Android**:
   ```bash
   expo build:android
   ```

3. **Build for iOS**:
   ```bash
   expo build:ios
   ```

4. **Publish to Stores**:
   - Google Play Store (Android)
   - Apple App Store (iOS)

## Security Recommendations

1. **Change Default Credentials**: Update admin password after first login
2. **Update JWT Secret**: Use a strong, random secret key
3. **Enable HTTPS**: Use SSL/TLS in production
4. **Firewall**: Restrict database access
5. **Regular Backups**: Backup PostgreSQL database daily
6. **Update Dependencies**: Keep all packages up to date

## Support

If you encounter issues not covered here:
1. Check application logs
2. Verify all prerequisites are installed
3. Ensure versions match requirements
4. Contact development team

## Next Steps

- Customize the app for your specific needs
- Add more employees
- Start tracking daily operations
- Monitor the automatic data cleanup (runs at 2 AM daily)
- Consider adding backup procedures
