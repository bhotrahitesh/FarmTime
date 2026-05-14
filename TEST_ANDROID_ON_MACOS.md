# 🤖 How to Test Android UI on macOS

## ⚡ Quick Start (Automated)

I've already created an automated script for you!

```bash
# Terminal 1 - Start Backend
cd backend
./run.sh

# Terminal 2 - Start Android
cd mobile
./run-android.sh
```

**That's it!** The script handles everything automatically.

---

## 📋 First Time Setup (One-Time Only)

### Step 1: Install Android Studio

1. **Download Android Studio:**
   - Visit: https://developer.android.com/studio
   - Click **Download Android Studio for Mac**
   - Choose **Mac with Apple chip** or **Mac with Intel chip**

2. **Install:**
   - Open the downloaded `.dmg` file
   - Drag **Android Studio** to **Applications** folder
   - Launch Android Studio from Applications

3. **Complete Setup Wizard:**
   - Click **Next** through the welcome screens
   - Choose **Standard** installation
   - Accept licenses
   - Wait for SDK components to download (~2-3 GB)

### Step 2: Set Up Environment Variables

Open Terminal and run:

```bash
# Open your shell configuration file
nano ~/.zshrc
```

Add these lines at the end:

```bash
# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

**Save and exit:**
- Press `Ctrl + X`
- Press `Y` to confirm
- Press `Enter`

**Apply changes:**
```bash
source ~/.zshrc
```

**Verify:**
```bash
echo $ANDROID_HOME
# Should output: /Users/YOUR_USERNAME/Library/Android/sdk
```

### Step 3: Create Android Virtual Device (AVD)

1. **Open Android Studio**

2. **Open Device Manager:**
   - Click the **More Actions** menu (three vertical dots) on welcome screen
   - Select **Virtual Device Manager**
   - OR: Click **Tools** → **Device Manager** if you have a project open

3. **Create Virtual Device:**
   - Click **Create Virtual Device** button
   - Select a device (recommended: **Pixel 5** or **Pixel 6**)
   - Click **Next**

4. **Download System Image:**
   - Select **Tiramisu** (API Level 33) or **UpsideDownCake** (API Level 34)
   - Click **Download** next to the system image
   - Wait for download to complete
   - Click **Next**

5. **Configure AVD:**
   - Name: `Pixel_5_API_33` (or your choice)
   - Click **Show Advanced Settings** (optional):
     - RAM: 2048 MB or higher
     - Internal Storage: 2048 MB or higher
   - Click **Finish**

### Step 4: Verify Setup

```bash
cd mobile
./check-android-setup.sh
```

This will check:
- ✅ ANDROID_HOME is set
- ✅ Android SDK is installed
- ✅ Emulator command is available
- ✅ ADB is working
- ✅ AVDs are created

---

## 🚀 Running Android UI (Daily Use)

Once setup is complete, use this workflow:

### Method 1: Automated (Recommended)

```bash
# Terminal 1 - Backend
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/backend
./run.sh

# Terminal 2 - Android (new terminal)
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
./run-android.sh
```

The script will:
1. Check your Android setup
2. List available emulators
3. Start the selected emulator
4. Wait for it to boot
5. Install dependencies if needed
6. Launch the app

### Method 2: Manual Control

```bash
# Terminal 1 - Backend
cd backend
./run.sh

# Terminal 2 - Start Emulator
emulator -list-avds                    # List available emulators
emulator -avd Pixel_5_API_33 &         # Start emulator (replace with your AVD name)

# Terminal 3 - Run App
cd mobile
npm install                            # First time only
npm run android                        # Launch app on emulator
```

### Method 3: Using Expo CLI

```bash
# Terminal 1 - Backend
cd backend
./run.sh

# Terminal 2 - Start Emulator (if not running)
emulator -avd Pixel_5_API_33 &

# Terminal 3 - Expo
cd mobile
npm start                              # Start Expo
# Press 'a' when ready
```

---

## 🔍 Verification Commands

```bash
# Check if ANDROID_HOME is set
echo $ANDROID_HOME

# Check if emulator command works
which emulator

# Check if adb works
which adb
adb version

# List available AVDs
emulator -list-avds

# Check if emulator is running
adb devices

# Check backend is running
curl http://localhost:8080/api/auth/login
```

---

## 🧪 Testing the App

### 1. Start Backend
```bash
cd backend
./run.sh
```

Wait for: `Started FarmTimeApplication in X.XXX seconds`

### 2. Start Android Emulator
```bash
cd mobile
./run-android.sh
```

### 3. Login to App
- **Username:** `admin`
- **Password:** `admin123`

### 4. Test Features

**Employee Management:**
- Add a new employee
- View employee list
- Edit employee details
- Deactivate employee

**Attendance Tracking:**
- Mark attendance for today
- View attendance history
- Edit attendance records

**Payment Management:**
- Record a payment
- View payment history
- Track salary, advances, bonuses

**Time Off:**
- Add time off request
- View time off calendar

---

## 🎮 Emulator Controls

### Keyboard Shortcuts
- **Cmd + M** - Open React Native dev menu
- **Cmd + R** - Reload app
- **Cmd + D** - Open debug menu

### Emulator Toolbar
- **Power button** - Lock/unlock screen
- **Volume** - Adjust volume
- **Rotate** - Change orientation
- **Home** - Go to home screen
- **Back** - Navigate back
- **Overview** - Recent apps

### Developer Menu (Cmd + M)
- **Reload** - Refresh the app
- **Debug** - Open debugger
- **Enable Hot Reloading** - Auto-reload on changes
- **Enable Live Reload** - Full reload on changes
- **Toggle Inspector** - Inspect UI elements

---

## 🔧 Troubleshooting

### Issue: "ANDROID_HOME is not set"

**Solution:**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
source ~/.zshrc
```

### Issue: "emulator: command not found"

**Solution:**
```bash
# Check if Android SDK is installed
ls ~/Library/Android/sdk

# If exists, add to PATH
export PATH=$PATH:$HOME/Library/Android/sdk/emulator
source ~/.zshrc
```

### Issue: "No AVDs found"

**Solution:**
```bash
# List AVDs
emulator -list-avds

# If empty, create one in Android Studio:
# Tools → Device Manager → Create Virtual Device
```

### Issue: Emulator starts but app doesn't install

**Solution:**
```bash
# Check if device is detected
adb devices

# Should show: emulator-5554   device

# If not showing, restart adb
adb kill-server
adb start-server

# Try again
npm run android
```

### Issue: "Unable to connect to server"

**Solution:**

The app is already configured to use `http://10.0.2.2:8080/api` for Android.

Just verify backend is running:
```bash
# Check backend
curl http://localhost:8080/api/auth/login

# Should return JSON with status 405
```

### Issue: Emulator is very slow

**Solutions:**

1. **Enable Hardware Acceleration (Intel Mac):**
   ```bash
   # Install HAXM
   # Android Studio → Tools → SDK Manager → SDK Tools
   # Check "Intel x86 Emulator Accelerator (HAXM)"
   ```

2. **Use ARM64 image (Apple Silicon Mac M1/M2/M3):**
   - When creating AVD, select **arm64-v8a** system image
   - Much faster on Apple Silicon

3. **Increase RAM:**
   - Edit AVD in Device Manager
   - Show Advanced Settings
   - Increase RAM to 2048 MB or more

4. **Close other apps:**
   - Emulator needs resources
   - Close unnecessary applications

### Issue: "Expo Go not installed"

**Solution:**
```bash
# The app will install automatically
# Just wait for the build to complete

# Or manually install Expo Go from Play Store in emulator
```

### Issue: Port 8080 already in use

**Solution:**
```bash
# Find what's using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or change backend port in application.properties
```

---

## 📊 Testing Checklist

### Setup Verification
- [ ] Android Studio installed
- [ ] ANDROID_HOME set (`echo $ANDROID_HOME`)
- [ ] Emulator command works (`which emulator`)
- [ ] ADB works (`adb version`)
- [ ] At least one AVD created (`emulator -list-avds`)
- [ ] Backend running (`curl http://localhost:8080`)

### App Testing
- [ ] Emulator starts successfully
- [ ] App installs on emulator
- [ ] Login screen appears
- [ ] Can login with admin credentials
- [ ] Can navigate between screens
- [ ] Can add employee
- [ ] Can mark attendance
- [ ] Can record payment
- [ ] Data persists after app reload

### Performance Testing
- [ ] App loads quickly
- [ ] Navigation is smooth
- [ ] No crashes or errors
- [ ] API calls work correctly
- [ ] Data displays properly

---

## 🎯 Quick Reference

### Start Everything
```bash
# Terminal 1
cd backend && ./run.sh

# Terminal 2
cd mobile && ./run-android.sh
```

### Useful Commands
```bash
# List emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_5_API_33 &

# Check connected devices
adb devices

# Restart adb
adb kill-server && adb start-server

# Clear app data
adb shell pm clear com.farmtime.mobile

# Uninstall app
adb uninstall com.farmtime.mobile

# View logs
adb logcat | grep FarmTime

# Take screenshot
adb shell screencap /sdcard/screenshot.png
adb pull /sdcard/screenshot.png

# Install APK manually
adb install path/to/app.apk
```

---

## 💡 Pro Tips

1. **Keep emulator running** between tests for faster iteration

2. **Use hot reload** - Changes appear instantly without rebuild

3. **Enable Fast Boot:**
   - Edit AVD → Show Advanced Settings
   - Boot option: **Quick Boot**
   - Saves emulator state for faster startup

4. **Take snapshots:**
   - Emulator toolbar → More (three dots) → Snapshots
   - Save state and restore quickly

5. **Use physical device** for better performance:
   - Enable USB debugging on Android phone
   - Connect via USB
   - Run `npm run android`

6. **Debug with Chrome DevTools:**
   - Press `Cmd + M` in emulator
   - Select "Debug"
   - Opens Chrome debugger

7. **Check logs in real-time:**
   ```bash
   adb logcat | grep -i farmtime
   ```

---

## 📱 Testing on Physical Android Device

1. **Enable Developer Options:**
   - Settings → About Phone
   - Tap "Build Number" 7 times

2. **Enable USB Debugging:**
   - Settings → Developer Options
   - Enable "USB Debugging"

3. **Connect Device:**
   - Connect phone via USB
   - Allow USB debugging on phone

4. **Verify Connection:**
   ```bash
   adb devices
   # Should show your device
   ```

5. **Run App:**
   ```bash
   cd mobile
   npm run android
   ```

**Note:** Update API URL in `src/services/api.js` to your computer's IP address for physical device testing.

---

## 🎓 Learning Resources

- **Android Studio:** https://developer.android.com/studio
- **Android Emulator:** https://developer.android.com/studio/run/emulator
- **Expo Android:** https://docs.expo.dev/workflow/android-studio-emulator/
- **React Native Debugging:** https://reactnative.dev/docs/debugging
- **ADB Commands:** https://developer.android.com/studio/command-line/adb

---

## 📚 Related Documentation

- **[ANDROID_SETUP.md](ANDROID_SETUP.md)** - Complete Android setup guide
- **[ANDROID_QUICK_START.md](mobile/ANDROID_QUICK_START.md)** - Quick reference
- **[START_APP.md](START_APP.md)** - General startup guide
- **[RUN_UI_MACOS.md](RUN_UI_MACOS.md)** - All UI options on macOS

---

## ✅ Success Criteria

You'll know everything is working when:

1. ✅ Backend starts without errors
2. ✅ Emulator launches successfully
3. ✅ App installs on emulator
4. ✅ Login screen appears
5. ✅ Can login with admin credentials
6. ✅ All screens are accessible
7. ✅ Data operations work (add, edit, delete)
8. ✅ No network errors

---

**Ready to test?** Run:

```bash
# Terminal 1
cd backend && ./run.sh

# Terminal 2
cd mobile && ./run-android.sh
```

**Happy Testing! 🚀**
