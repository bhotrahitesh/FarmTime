# ✅ Android Studio Installed - Next Steps

## 📊 Current Status

✅ Android Studio installed  
✅ Android SDK found at: `~/Library/Android/sdk`  
✅ Environment variables added to `~/.zshrc`  
⚠️ Need to create Android Virtual Device (AVD)  

---

## 🎯 Step 1: Reload Your Terminal

**Option A: Close and reopen your terminal** (recommended)

**Option B: Run this command in your current terminal:**
```bash
source ~/.zshrc
```

---

## 🎯 Step 2: Verify Setup

After reloading, run:

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
./check-android-setup.sh
```

You should see:
- ✅ ANDROID_HOME is set
- ✅ Emulator command found
- ✅ ADB found
- ⚠️ No AVDs found (we'll fix this next)

---

## 🎯 Step 3: Create Android Virtual Device (AVD)

### Method 1: Using Android Studio (Easiest)

1. **Open Android Studio**

2. **Open Device Manager:**
   - On welcome screen: Click **More Actions** (⋮) → **Virtual Device Manager**
   - OR if you have a project open: **Tools** → **Device Manager**

3. **Create Virtual Device:**
   - Click **Create Virtual Device** button
   - Select **Phone** category
   - Choose **Pixel 5** or **Pixel 6** (recommended)
   - Click **Next**

4. **Download System Image:**
   - Select **Tiramisu** (API Level 33) - Recommended
   - Click **Download** next to it (if not already downloaded)
   - Wait for download to complete (~1-2 GB)
   - Click **Next**

5. **Configure AVD:**
   - AVD Name: `Pixel_5_API_33` (or leave default)
   - Startup orientation: Portrait
   - Click **Finish**

6. **Done!** You should see your AVD in the Device Manager

### Method 2: Verify AVD was created

After creating the AVD, verify it:

```bash
emulator -list-avds
```

Should show your AVD name (e.g., `Pixel_5_API_33`)

---

## 🎯 Step 4: Run the App!

Now you're ready to run the Android app:

### Terminal 1 - Start Backend
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/backend
./run.sh
```

Wait for: `Started FarmTimeApplication in X.XXX seconds`

### Terminal 2 - Start Android App
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
./run-android.sh
```

The script will:
1. ✅ Check your setup
2. ✅ List your AVDs
3. ✅ Start the emulator
4. ✅ Wait for it to boot
5. ✅ Install the app
6. ✅ Launch it!

---

## 🎉 Success!

When the app opens:
- **Username:** `admin`
- **Password:** `admin123`

---

## 🔧 Troubleshooting

### If emulator command still not found after reloading:

```bash
# Manually export for current session
export PATH=$PATH:$HOME/Library/Android/sdk/emulator:$HOME/Library/Android/sdk/platform-tools

# Then try again
emulator -list-avds
```

### If you get "No AVDs found":

You need to create one in Android Studio (see Step 3 above)

### If backend won't start:

Make sure PostgreSQL is running:
```bash
brew services start postgresql@14
```

---

## 📋 Quick Checklist

- [ ] Terminal reloaded (close/reopen OR `source ~/.zshrc`)
- [ ] Run `./check-android-setup.sh` - most checks pass
- [ ] AVD created in Android Studio
- [ ] `emulator -list-avds` shows your AVD
- [ ] Backend started (`cd backend && ./run.sh`)
- [ ] Android app started (`cd mobile && ./run-android.sh`)
- [ ] App opens and you can login

---

## 🚀 You're Almost There!

**Current Step:** Create an AVD in Android Studio (Step 3)

**After that:** Run `./run-android.sh` and you're done! 🎉

---

**Need help?** Check:
- [TEST_ANDROID_ON_MACOS.md](TEST_ANDROID_ON_MACOS.md) - Detailed testing guide
- [ANDROID_SETUP.md](ANDROID_SETUP.md) - Complete setup guide
