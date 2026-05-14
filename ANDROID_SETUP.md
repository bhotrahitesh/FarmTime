# Android Emulator Setup Guide - FarmTime

Complete guide to set up and run FarmTime on Android emulator.

---

## 🚀 Quick Start (Automated)

If you already have Android Studio installed:

```bash
cd mobile
./run-android.sh
```

This script handles everything automatically!

---

## 📋 Prerequisites

### 1. Install Android Studio

Download from: https://developer.android.com/studio

**Installation Steps:**
1. Download Android Studio for macOS
2. Open the `.dmg` file
3. Drag Android Studio to Applications
4. Launch Android Studio
5. Follow the setup wizard (install all recommended components)

### 2. Set Up Environment Variables

Add these lines to your `~/.zshrc` file:

```bash
# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

**Apply changes:**
```bash
source ~/.zshrc
```

**Verify installation:**
```bash
echo $ANDROID_HOME
# Should output: /Users/YOUR_USERNAME/Library/Android/sdk

which adb
# Should output: /Users/YOUR_USERNAME/Library/Android/sdk/platform-tools/adb

which emulator
# Should output: /Users/YOUR_USERNAME/Library/Android/sdk/emulator/emulator
```

---

## 📱 Create Android Virtual Device (AVD)

### Using Android Studio (Recommended)

1. **Open Android Studio**
2. **Open Device Manager:**
   - Click **More Actions** (three dots) on welcome screen
   - Select **Virtual Device Manager**
   - OR: Go to **Tools > Device Manager**

3. **Create New Device:**
   - Click **Create Virtual Device**
   - Select a device definition (recommended: **Pixel 5** or **Pixel 6**)
   - Click **Next**

4. **Download System Image:**
   - Select a system image (recommended: **API 33 - Android 13** or **API 34 - Android 14**)
   - Click **Download** if not already downloaded
   - Wait for download to complete
   - Click **Next**

5. **Configure AVD:**
   - Name: `Pixel_5_API_33` (or your choice)
   - Startup orientation: Portrait
   - Click **Show Advanced Settings** (optional):
     - RAM: 2048 MB or higher
     - Internal Storage: 2048 MB or higher
   - Click **Finish**

### Using Command Line (Advanced)

```bash
# List available system images
sdkmanager --list | grep system-images

# Download a system image (if needed)
sdkmanager "system-images;android-33;google_apis;arm64-v8a"

# Create AVD
avdmanager create avd -n Pixel_5_API_33 \
  -k "system-images;android-33;google_apis;arm64-v8a" \
  -d "pixel_5"
```

---

## 🎮 Running the Emulator

### Method 1: Automated Script (Easiest)

```bash
cd mobile
./run-android.sh
```

The script will:
- ✅ Check Android SDK installation
- ✅ List available AVDs
- ✅ Start selected emulator
- ✅ Wait for emulator to boot
- ✅ Install dependencies (if needed)
- ✅ Launch the app

### Method 2: Manual Start

**List available emulators:**
```bash
emulator -list-avds
```

**Start an emulator:**
```bash
# Replace with your AVD name
emulator -avd Pixel_5_API_33 &
```

**Wait for boot (in another terminal):**
```bash
adb wait-for-device
```

**Run the app:**
```bash
cd mobile
npm install  # First time only
npm run android
```

### Method 3: Android Studio

1. Open Android Studio
2. Go to **Tools > Device Manager**
3. Click the **Play** button next to your AVD
4. Wait for emulator to start
5. In terminal:
```bash
cd mobile
npm run android
```

---

## 🔧 Troubleshooting

### Issue: `ANDROID_HOME is not set`

**Solution:**
```bash
# Check current value
echo $ANDROID_HOME

# If empty, add to ~/.zshrc:
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools

# Reload
source ~/.zshrc
```

### Issue: `emulator: command not found`

**Solution:**
```bash
# Add emulator to PATH in ~/.zshrc:
export PATH=$PATH:$ANDROID_HOME/emulator

# Reload
source ~/.zshrc

# Verify
which emulator
```

### Issue: `No AVDs found`

**Solution:**
```bash
# List AVDs
emulator -list-avds

# If empty, create one using Android Studio or:
cd mobile
./run-android.sh
# Follow the prompts
```

### Issue: Emulator starts but app doesn't install

**Solution:**
```bash
# Check if device is detected
adb devices

# Should show something like:
# emulator-5554   device

# If not showing, restart adb:
adb kill-server
adb start-server

# Try again
npm run android
```

### Issue: `Error: spawn emulator ENOENT`

**Solution:**
```bash
# Make sure emulator is in PATH
export PATH=$PATH:$ANDROID_HOME/emulator

# NOT this (wrong path):
# export PATH=$PATH:$ANDROID_HOME/tools/emulator
```

### Issue: Emulator is slow

**Solutions:**
1. **Enable Hardware Acceleration:**
   - Android Studio > Tools > SDK Manager > SDK Tools
   - Check "Intel x86 Emulator Accelerator (HAXM installer)"
   - Install

2. **Increase AVD RAM:**
   - Device Manager > Edit AVD > Show Advanced Settings
   - Increase RAM to 2048 MB or more

3. **Use ARM64 image on Apple Silicon Macs:**
   - When creating AVD, select ARM64 system image
   - Much faster on M1/M2/M3 Macs

### Issue: App shows "Unable to connect to server"

**Solution:**

The Android emulator uses a special IP to access localhost.

Edit `mobile/src/services/api.js`:

```javascript
// For Android emulator, use:
const API_URL = 'http://10.0.2.2:8080/api';

// NOT localhost:
// const API_URL = 'http://localhost:8080/api';  // ❌ Won't work on Android
```

**Or use environment-based configuration:**

```javascript
import { Platform } from 'react-native';

const API_URL = Platform.OS === 'android' 
  ? 'http://10.0.2.2:8080/api'  // Android emulator
  : 'http://localhost:8080/api'; // iOS simulator
```

---

## 📊 Useful Commands

```bash
# List all AVDs
emulator -list-avds

# Start specific AVD
emulator -avd AVD_NAME &

# List connected devices
adb devices

# Check device properties
adb shell getprop

# Restart adb
adb kill-server && adb start-server

# Install app manually
adb install path/to/app.apk

# View device logs
adb logcat

# Clear app data
adb shell pm clear com.farmtime.mobile

# Uninstall app
adb uninstall com.farmtime.mobile
```

---

## 🎯 Complete Workflow

**First Time Setup:**

1. Install Android Studio
2. Set up environment variables
3. Create an AVD
4. Run `./run-android.sh`

**Daily Usage:**

```bash
# Terminal 1 - Backend
cd backend
./run.sh

# Terminal 2 - Android App
cd mobile
./run-android.sh
```

**That's it!** 🎉

---

## 💡 Tips

1. **Keep emulator running** between app restarts for faster development
2. **Use Expo Go app** on physical device for even faster testing
3. **Enable hot reload** in Expo for instant updates
4. **Use Android Studio Logcat** for detailed debugging
5. **Take emulator snapshots** to boot faster next time

---

## 📚 Additional Resources

- [Android Studio Download](https://developer.android.com/studio)
- [Android Emulator Documentation](https://developer.android.com/studio/run/emulator)
- [Expo Android Setup](https://docs.expo.dev/workflow/android-studio-emulator/)
- [React Native Android Setup](https://reactnative.dev/docs/environment-setup)

---

## ✅ Verification Checklist

- [ ] Android Studio installed
- [ ] ANDROID_HOME environment variable set
- [ ] `emulator` command works
- [ ] `adb` command works
- [ ] At least one AVD created
- [ ] Emulator starts successfully
- [ ] `adb devices` shows emulator
- [ ] App installs and runs
- [ ] App connects to backend (check API URL)

---

**Need help?** Check the main [START_APP.md](START_APP.md) or [SETUP_GUIDE.md](SETUP_GUIDE.md)
