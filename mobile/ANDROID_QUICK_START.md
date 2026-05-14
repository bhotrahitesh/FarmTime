# 🤖 Android Quick Start - FarmTime Mobile

## ⚡ Fastest Way to Run on Android

```bash
cd mobile
./run-android.sh
```

That's it! The script handles everything automatically.

---

## 📋 What You Need First

1. **Android Studio** - Download from https://developer.android.com/studio
2. **Environment Variables** - Add to `~/.zshrc`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

3. **Create an AVD** (Android Virtual Device):
   - Open Android Studio
   - Tools > Device Manager
   - Create Virtual Device
   - Select Pixel 5 + API 33

---

## 🎯 Three Ways to Run

### 1. Automated (Recommended)
```bash
./run-android.sh
```

### 2. Manual with npm
```bash
# Start emulator first
emulator -avd Pixel_5_API_33 &

# Then run app
npm run android
```

### 3. Step by Step
```bash
# 1. List emulators
emulator -list-avds

# 2. Start one
emulator -avd YOUR_AVD_NAME &

# 3. Wait for boot
adb wait-for-device

# 4. Run app
npm start
# Press 'a' when ready
```

---

## 🔧 Common Issues

### "ANDROID_HOME is not set"
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
source ~/.zshrc
```

### "No AVDs found"
Create one in Android Studio: Tools > Device Manager > Create Virtual Device

### "Can't connect to backend"
The app is already configured! It uses `http://10.0.2.2:8080/api` for Android.

Just make sure your backend is running:
```bash
cd ../backend
./run.sh
```

---

## 📱 Daily Workflow

**Terminal 1 - Backend:**
```bash
cd backend
./run.sh
```

**Terminal 2 - Android:**
```bash
cd mobile
./run-android.sh
```

---

## 💡 Pro Tips

- Keep emulator running between restarts (faster)
- Use `Ctrl+M` in emulator to open dev menu
- Enable hot reload for instant updates
- Check `adb logcat` for detailed logs

---

## 📚 More Help

- Full guide: [../ANDROID_SETUP.md](../ANDROID_SETUP.md)
- General setup: [../START_APP.md](../START_APP.md)
- Troubleshooting: See ANDROID_SETUP.md

---

**Need help?** Run `./run-android.sh` and follow the prompts!
