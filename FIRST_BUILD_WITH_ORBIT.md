# Your First APK Build with Expo Orbit - Quick Start

You've installed Expo Orbit! Here's how to build your first APK in minutes.

---

## Step 1: Setup (One Time - 2 minutes)

### Install EAS CLI
```bash
npm install -g eas-cli
```

### Login and Configure
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
eas login
```

Enter your Expo credentials (or create account at https://expo.dev/signup)

---

## Step 2: Launch Expo Orbit

### Open the App
1. Press `Cmd + Space`
2. Type "Expo Orbit"
3. Press Enter

**Or:**
- Look for Expo icon in your menu bar (top right)
- Click it

### Sign In
1. Click the Expo Orbit menu bar icon
2. Click "Sign In"
3. Use same credentials as Step 1

---

## Step 3: Build Your APK (Two Ways)

### Option A: Using Orbit (Visual)

1. **Click Expo Orbit icon** in menu bar
2. **Find "farmtime-mobile"** in projects list
3. **Click "Build"** button
4. **Select:**
   - Platform: **Android**
   - Profile: **Preview**
   - Type: **APK**
5. **Click "Start Build"**

### Option B: Using Terminal (Orbit Monitors)

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
eas build --platform android --profile preview
```

Orbit will automatically show the build progress!

---

## Step 4: Wait for Build (5-15 minutes)

### What Happens:
- ⏳ Code uploads to Expo servers
- 🔨 APK builds in the cloud
- 📦 Build appears in Orbit
- 🔔 You get notification when done

### Monitor Progress:
- Click Orbit icon to see status
- Progress bar shows build stage
- Estimated time remaining

---

## Step 5: Download APK

### When Build Completes:

**You'll see a notification:**
- Click the notification
- APK downloads to your Downloads folder

**Or manually download:**
1. Click Expo Orbit icon
2. Click "Builds"
3. Find your completed build
4. Click "Download"

**File location:**
```
~/Downloads/farmtime-mobile-xxx.apk
```

---

## Step 6: Install on Android Phone

### Transfer APK to Phone:

**Option A: USB Transfer**
1. Connect phone to Mac via USB
2. Open Android File Transfer (install if needed)
3. Copy APK to phone's Downloads folder

**Option B: AirDrop/Email**
1. Email APK to yourself
2. Open email on phone
3. Download attachment

**Option C: Cloud Storage**
1. Upload to Google Drive/Dropbox
2. Download on phone

### Install APK:

1. **On your phone**, open file manager
2. Navigate to Downloads
3. Tap the APK file
4. **If prompted:** Enable "Install from Unknown Sources"
   - Settings → Security → Unknown Sources → Enable
5. Tap "Install"
6. Tap "Open" to launch app

---

## Step 7: Test Your App! 🎉

Your FarmTime app is now installed and will connect to:
```
https://farmtime-backend-xzj0.onrender.com/api
```

Test all features:
- ✅ Login
- ✅ Employee management
- ✅ Attendance tracking
- ✅ Payment records
- ✅ Reports

---

## Quick Commands Reference

### Build New APK
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
eas build --platform android --profile preview
```

### Start Development Server
```bash
npm start
```

### Check Build Status
```bash
eas build:list
```

---

## Troubleshooting

### Orbit Not Showing Projects?
1. Make sure you're signed in
2. Run: `eas build:configure`
3. Refresh Orbit (Cmd + R)

### Build Failed?
1. Click build in Orbit
2. Click "View Logs"
3. Check error message
4. Common fix: Update `app.json` version

### Can't Install APK on Phone?
1. Enable "Unknown Sources" in Settings
2. Uninstall any existing version
3. Try downloading again

---

## What's Next?

### For Development Testing:
Instead of building APK every time, use Expo Go:

1. **Install Expo Go** on phone (Play Store)
2. **Start dev server:**
   ```bash
   npm start
   ```
3. **Scan QR code** with Expo Go
4. **Instant updates** - no rebuild needed!

### For Production:
Build with production profile:
```bash
eas build --platform android --profile production
```

### For Sharing with Team:
After build completes:
1. Click build in Orbit
2. Click "Copy Link"
3. Share link with team
4. They download and install

---

## Summary

✅ **Installed:** Expo Orbit  
✅ **Setup:** EAS CLI and login  
✅ **Build:** APK via Orbit or terminal  
✅ **Download:** Automatic from Orbit  
✅ **Install:** On your Android device  
✅ **Test:** App connects to production backend  

**Total time:** ~20 minutes (including build wait time)

---

## Your Workflow Going Forward

**Daily Development:**
```bash
npm start  # Use Expo Go for instant testing
```

**Weekly/Monthly Releases:**
```bash
eas build --platform android --profile preview  # Build APK
# Download from Orbit
# Share with team
```

**Production Releases:**
```bash
eas build --platform android --profile production
# Upload to Play Store or distribute directly
```

---

**You're all set! 🚀**

Expo Orbit makes the whole process visual and easy to manage.
