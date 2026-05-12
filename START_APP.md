# Quick Start Guide - FarmTime

## ⚠️ Important: Java Version Issue Fixed

Your system has **Java 24** as default, but this project requires **Java 17**. 
I've created a script that automatically uses Java 17.

---

## 🚀 Starting the Application

### Step 1: Start PostgreSQL Database

```bash
# macOS (Homebrew)
brew services start postgresql@14

# Or check if it's already running
brew services list
```

### Step 2: Create Database (First Time Only)

```bash
# Connect to PostgreSQL
psql postgres

# Create database
CREATE DATABASE farmtime_db;

# Create user (if using custom credentials)
CREATE USER admin WITH PASSWORD 'admin';
GRANT ALL PRIVILEGES ON DATABASE farmtime_db TO admin;

# Exit
\q
```

### Step 3: Start Backend

**Open Terminal 1** in the project root:

```bash
cd backend
./run.sh
```

This script automatically uses Java 17 and starts the backend.

Wait for:
```
Started FarmTimeApplication in X.XXX seconds
```

Backend is now running on **http://localhost:8080** ✅

### Step 4: Create Admin User (First Time Only)

**Open Terminal 2**:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "name": "Farm Admin"
  }'
```

Expected response:
```json
{"message":"Admin registered successfully","username":"admin"}
```

### Step 5: Start Mobile App

**Keep Terminal 1 running**, open **Terminal 3**:

```bash
cd mobile
npm install  # First time only
npm start
```

### Step 6: Run on Device

When Expo DevTools opens:

- **iOS Simulator**: Press `i`
- **Android Emulator**: Press `a`
- **Physical Device**: Scan QR code with Expo Go app

### Step 7: Login

- **Username**: `admin`
- **Password**: `admin123`

---

## 🔧 Troubleshooting

### Backend won't compile

**Problem**: Java version mismatch

**Solution**: Always use the `./run.sh` script instead of `mvn spring-boot:run`

### Database connection error

**Problem**: PostgreSQL not running or wrong credentials

**Solution**:
```bash
# Check PostgreSQL status
brew services list

# Verify credentials in backend/src/main/resources/application.properties
# Make sure username and password match your PostgreSQL setup
```

### Port 8080 already in use

**Solution**:
```bash
# Find what's using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### Mobile app can't connect

**Problem**: Wrong API URL

**Solution**: Edit `mobile/src/services/api.js`:
- iOS Simulator: `http://localhost:8080/api`
- Android Emulator: `http://10.0.2.2:8080/api`
- Physical Device: `http://YOUR_IP:8080/api` (find IP with `ifconfig`)

---

## 📝 Daily Usage

After initial setup, you only need:

**Terminal 1 - Backend:**
```bash
cd backend
./run.sh
```

**Terminal 2 - Mobile:**
```bash
cd mobile
npm start
```

Then press `i` or `a` to launch!

---

## 🛑 Stopping the App

- **Backend**: Press `Ctrl+C` in Terminal 1
- **Mobile**: Press `Ctrl+C` in Terminal 2
- **PostgreSQL** (optional): `brew services stop postgresql@14`

---

## ℹ️ Additional Info

- **Backend logs**: Check Terminal 1 for API requests and errors
- **Mobile logs**: Check Terminal 2 or device console
- **Database**: Use `psql farmtime_db` to query database directly
- **API Documentation**: See `README.md` for all endpoints

---

## 🎯 Next Steps

1. ✅ Start backend with `./run.sh`
2. ✅ Create admin user (first time)
3. ✅ Start mobile app with `npm start`
4. ✅ Login and start managing your farm!

**Data Cleanup**: The system automatically deletes records older than 2 months at 2:00 AM daily.
