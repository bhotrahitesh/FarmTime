# ✅ Android Simulator Setup - Complete

## What Was Configured

### 1. Automated Setup Script
**File:** `mobile/run-android.sh`

Features:
- ✅ Checks Android SDK installation
- ✅ Verifies ANDROID_HOME environment variable
- ✅ Lists available Android Virtual Devices (AVDs)
- ✅ Allows selection of AVD if multiple exist
- ✅ Starts the selected emulator
- ✅ Waits for emulator to fully boot
- ✅ Installs npm dependencies if needed
- ✅ Launches the app automatically

**Usage:**
```bash
cd mobile
./run-android.sh
```

### 2. API Configuration Update
**File:** `mobile/src/services/api.js`

Changes:
- ✅ Added platform detection using React Native's `Platform` API
- ✅ Automatically uses correct API URL:
  - **iOS Simulator:** `http://localhost:8080/api`
  - **Android Emulator:** `http://10.0.2.2:8080/api`
- ✅ No manual configuration needed!

### 3. Documentation Created

#### Main Documentation
- **ANDROID_SETUP.md** - Complete Android setup guide with:
  - Prerequisites and installation steps
  - Environment variable configuration
  - AVD creation (GUI and CLI methods)
  - Multiple ways to run the emulator
  - Comprehensive troubleshooting section
  - Useful ADB commands

#### Quick References
- **mobile/ANDROID_QUICK_START.md** - Quick reference for daily use
- **START_APP.md** - Updated with Android emulator section
- **mobile/.env.example** - Updated with platform-specific notes

### 4. Updated Main Documentation
**File:** `START_APP.md`

Added:
- ✅ Android Emulator Setup section (Step 6)
- ✅ Two setup options: Automated script vs Manual
- ✅ Android-specific troubleshooting
- ✅ Updated daily usage workflow
- ✅ Environment variable setup instructions

---

## 🚀 How to Use

### First Time Setup

1. **Install Android Studio:**
   - Download from https://developer.android.com/studio
   - Install all recommended components

2. **Set Environment Variables:**
   Add to `~/.zshrc`:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```
   
   Apply:
   ```bash
   source ~/.zshrc
   ```

3. **Create AVD:**
   - Open Android Studio
   - Tools > Device Manager
   - Create Virtual Device
   - Select device (e.g., Pixel 5)
   - Download system image (e.g., API 33)
   - Finish

4. **Run the App:**
   ```bash
   cd mobile
   ./run-android.sh
   ```

### Daily Usage

**Terminal 1 - Backend:**
```bash
cd backend
./run.sh
```

**Terminal 2 - Android App:**
```bash
cd mobile
./run-android.sh
```

---

## 🎯 What's Different from iOS?

| Aspect | iOS | Android |
|--------|-----|---------|
| **API URL** | `localhost:8080` | `10.0.2.2:8080` |
| **Setup** | Xcode required | Android Studio required |
| **Emulator Command** | `expo start --ios` | `expo start --android` |
| **Auto-configured** | ✅ Yes | ✅ Yes (now!) |

---

## 📋 Verification Checklist

Run these commands to verify your setup:

```bash
# 1. Check ANDROID_HOME
echo $ANDROID_HOME
# Expected: /Users/YOUR_USERNAME/Library/Android/sdk

# 2. Check emulator command
which emulator
# Expected: /Users/YOUR_USERNAME/Library/Android/sdk/emulator/emulator

# 3. Check adb command
which adb
# Expected: /Users/YOUR_USERNAME/Library/Android/sdk/platform-tools/adb

# 4. List AVDs
emulator -list-avds
# Expected: List of your AVD names (e.g., Pixel_5_API_33)

# 5. Check if emulator can start
emulator -avd YOUR_AVD_NAME &
# Expected: Emulator window opens

# 6. Check device connection
adb devices
# Expected: emulator-5554   device

# 7. Run the app
cd mobile
./run-android.sh
# Expected: App installs and runs on emulator
```

---

## 🔧 Troubleshooting Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| `ANDROID_HOME not set` | `export ANDROID_HOME=$HOME/Library/Android/sdk` |
| `emulator: command not found` | Add `$ANDROID_HOME/emulator` to PATH |
| `No AVDs found` | Create one in Android Studio Device Manager |
| `Can't connect to backend` | Already fixed! Uses `10.0.2.2:8080` |
| `Emulator won't start` | Check Android Studio > Tools > SDK Manager |
| `App won't install` | Run `adb kill-server && adb start-server` |

---

## 📚 Documentation Files

1. **ANDROID_SETUP.md** - Complete setup guide
2. **mobile/ANDROID_QUICK_START.md** - Quick reference
3. **START_APP.md** - Main startup guide (updated)
4. **mobile/run-android.sh** - Automated setup script

---

## 💡 Key Features

### Automatic Platform Detection
The app now automatically detects whether it's running on iOS or Android and uses the correct API URL. No manual configuration needed!

### One-Command Setup
```bash
./run-android.sh
```
This single command handles everything from checking your setup to launching the app.

### Comprehensive Error Handling
The script provides clear error messages and instructions if something goes wrong.

### Multiple Setup Methods
Choose between:
- Automated script (easiest)
- npm commands (standard)
- Manual emulator + expo (advanced)

---

## 🎉 You're All Set!

Your FarmTime app is now ready to run on Android emulator with:
- ✅ Automated setup script
- ✅ Platform-aware API configuration
- ✅ Comprehensive documentation
- ✅ Troubleshooting guides

**Next Steps:**
1. Make sure backend is running: `cd backend && ./run.sh`
2. Run Android app: `cd mobile && ./run-android.sh`
3. Login with username: `admin`, password: `admin123`

---

**Questions?** Check:
- [ANDROID_SETUP.md](ANDROID_SETUP.md) for detailed guide
- [START_APP.md](START_APP.md) for general startup
- [mobile/ANDROID_QUICK_START.md](mobile/ANDROID_QUICK_START.md) for quick reference
