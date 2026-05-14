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
- **Android Emulator**: Press `a` (see Android Setup below if emulator isn't running)
- **Physical Device**: Scan QR code with Expo Go app

#### 🤖 Android Emulator Setup (First Time)

If you don't have an Android emulator set up yet:

**Option 1: Automated Script (Recommended)**
```bash
cd mobile
./run-android.sh
```

This script will:
- Check if Android SDK is installed
- List available emulators
- Start the selected emulator
- Launch the app automatically

**Option 2: Manual Setup**

1. **Install Android Studio** from https://developer.android.com/studio

2. **Set up environment variables** - Add to `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

3. **Apply changes**:
```bash
source ~/.zshrc
```

4. **Create an Android Virtual Device (AVD)**:
   - Open Android Studio
   - Go to **Tools > Device Manager**
   - Click **Create Virtual Device**
   - Select a device (e.g., **Pixel 5**)
   - Download a system image (e.g., **API 33 - Android 13**)
   - Click **Finish**

5. **Start the emulator**:
```bash
# List available emulators
emulator -list-avds

# Start an emulator (replace with your AVD name)
emulator -avd Pixel_5_API_33 &
```

6. **Run the app**:
```bash
cd mobile
npm run android
```

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

### Android emulator not starting

**Problem**: ANDROID_HOME not set or emulator not found

**Solution**:
```bash
# Check if ANDROID_HOME is set
echo $ANDROID_HOME

# If empty, add to ~/.zshrc:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

# Reload shell
source ~/.zshrc
```

### No Android Virtual Devices (AVDs)

**Problem**: No emulators created

**Solution**: Use the automated script or create one manually:
```bash
# Automated
cd mobile
./run-android.sh

# Manual - Open Android Studio > Tools > Device Manager > Create Virtual Device
```

### Expo can't find Android emulator

**Problem**: Emulator running but Expo doesn't detect it

**Solution**:
```bash
# Check if emulator is detected
adb devices

# If no devices, restart adb
adb kill-server
adb start-server

# Then press 'a' in Expo terminal
```

---

## 📝 Daily Usage

After initial setup, you only need:

**Terminal 1 - Backend:**
```bash
cd backend
./run.sh
```

**Terminal 2 - Mobile:**

*For iOS:*
```bash
cd mobile
npm start
# Press 'i' when ready
```

*For Android (Quick Start):*
```bash
cd mobile
./run-android.sh
# Automatically starts emulator and app
```

*For Android (Manual):*
```bash
# Terminal 2a - Start emulator
emulator -avd Pixel_5_API_33 &

# Terminal 2b - Start app
cd mobile
npm start
# Press 'a' when ready
```

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
