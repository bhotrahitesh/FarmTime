# Using Expo Orbit to Build and Manage Your APK

Expo Orbit is a macOS menu bar app that makes it super easy to build, download, and manage your Expo apps!

---

## What is Expo Orbit?

Expo Orbit is a native macOS app that:
- ✅ Lives in your menu bar
- ✅ Shows all your Expo projects
- ✅ Lets you start builds with one click
- ✅ Downloads APKs automatically
- ✅ Manages development servers
- ✅ Installs apps on simulators/emulators

---

## Getting Started with Expo Orbit

### Step 1: Launch Expo Orbit

You've already installed it! Now:

1. **Open Expo Orbit:**
   - Press `Cmd + Space` (Spotlight)
   - Type "Expo Orbit"
   - Press Enter

2. **Or find it in Applications:**
   - Open Finder → Applications
   - Double-click "Expo Orbit"

3. **Menu Bar Icon:**
   - Look for the Expo icon in your menu bar (top right)
   - Click it to open the menu

### Step 2: Sign In to Expo

1. Click the Expo Orbit icon in menu bar
2. Click **"Sign In"**
3. Enter your Expo credentials
4. You'll see your projects appear

---

## Building APK with Expo Orbit

### Method 1: Start Build from Orbit

1. **Open Expo Orbit** (click menu bar icon)

2. **Find Your Project:**
   - Your projects appear in the list
   - Look for **"farmtime-mobile"**

3. **Start Build:**
   - Hover over your project
   - Click **"Build"** button
   - Select **"Android"**
   - Choose **"APK"** (not AAB)
   - Click **"Start Build"**

4. **Monitor Progress:**
   - Build status shows in Orbit
   - Notification when complete
   - Click to download APK

### Method 2: Start Build from Terminal, Monitor in Orbit

1. **Start build from terminal:**
   ```bash
   cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
   eas build --platform android --profile preview
   ```

2. **Watch in Orbit:**
   - Build automatically appears in Orbit
   - Real-time progress updates
   - Click notification to download when done

---

## Using Expo Orbit Features

### 1. Launch Development Server

**From Orbit:**
1. Click Expo Orbit icon
2. Find **"farmtime-mobile"**
3. Click **"Start"** or **"Dev"**
4. Development server starts
5. QR code appears

**On Your Phone:**
1. Open Expo Go app
2. Scan QR code from Orbit
3. App loads instantly

### 2. Download Builds

**When build completes:**
1. Orbit shows notification
2. Click notification
3. APK downloads to your Downloads folder
4. Or click **"Download"** in Orbit menu

**View all builds:**
1. Click Expo Orbit icon
2. Click **"Builds"**
3. See all your builds
4. Download any previous build

### 3. Install on Emulator

**If you have Android Emulator running:**
1. Build completes in Orbit
2. Click **"Install on Emulator"**
3. APK installs automatically
4. App launches on emulator

### 4. Launch Simulators/Emulators

**From Orbit:**
1. Click Expo Orbit icon
2. Click **"Devices"**
3. See available simulators/emulators
4. Click to launch

---

## Complete Workflow with Expo Orbit

### First Time Setup

**1. Install EAS CLI (if not already):**
```bash
npm install -g eas-cli
```

**2. Configure your project:**
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
eas login
eas build:configure
```

**3. Open Expo Orbit:**
- Launch from Applications
- Sign in with same Expo account
- Your project appears automatically

### Building APK

**Option A: Using Orbit UI**
1. Click Expo Orbit icon
2. Find "farmtime-mobile"
3. Click "Build" → Android → APK
4. Wait for notification
5. Download APK

**Option B: Using Terminal + Orbit**
1. Terminal:
   ```bash
   cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
   eas build --platform android --profile preview
   ```
2. Orbit shows build progress automatically
3. Click notification to download when done

### Development Testing

**1. Start dev server from Orbit:**
- Click Orbit icon
- Click "Start" on farmtime-mobile
- QR code appears

**2. Or start from terminal:**
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
npm start
```
- Orbit detects server automatically
- Shows in Orbit menu

**3. Test on phone:**
- Open Expo Go app
- Scan QR code
- App runs with live reload

---

## Expo Orbit Menu Overview

### Main Menu Items

**Projects Section:**
- Lists all your Expo projects
- Shows running dev servers
- Quick actions for each project

**Builds Section:**
- Recent builds
- Build status
- Download buttons

**Devices Section:**
- iOS Simulators
- Android Emulators
- Launch/manage devices

**Settings:**
- Account settings
- Preferences
- Notifications

---

## Keyboard Shortcuts in Orbit

| Action | Shortcut |
|--------|----------|
| Open Orbit | Click menu bar icon |
| Refresh Projects | `Cmd + R` |
| Open Settings | `Cmd + ,` |

---

## Advantages of Using Expo Orbit

### vs Command Line
- ✅ Visual interface
- ✅ One-click builds
- ✅ Automatic notifications
- ✅ Easy download management
- ✅ No need to remember commands

### vs Browser Dashboard
- ✅ Native macOS app
- ✅ Faster access (menu bar)
- ✅ Desktop notifications
- ✅ Automatic downloads
- ✅ Local dev server management

### Best of Both Worlds
- Use Orbit for quick actions
- Use terminal for advanced options
- Use browser for detailed logs
- All sync automatically!

---

## Common Tasks with Expo Orbit

### Task 1: Build Production APK

1. Click Orbit icon
2. Find farmtime-mobile
3. Click "Build"
4. Select: Android → Production → APK
5. Wait for notification
6. Download and share

### Task 2: Quick Testing

1. Click Orbit icon
2. Click "Start" on farmtime-mobile
3. Scan QR with Expo Go
4. Test changes instantly

### Task 3: Download Previous Build

1. Click Orbit icon
2. Click "Builds"
3. Find the build you want
4. Click "Download"
5. APK saves to Downloads

### Task 4: Check Build Status

1. Click Orbit icon
2. See build progress in real-time
3. Notification when complete
4. Click to view details

---

## Troubleshooting Expo Orbit

### Issue: Projects Not Showing

**Solution:**
1. Make sure you're signed in
2. Click "Refresh" in Orbit
3. Or publish project:
   ```bash
   cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
   eas build:configure
   ```

### Issue: Can't Start Build

**Solution:**
1. Ensure EAS CLI is installed:
   ```bash
   npm install -g eas-cli
   ```
2. Login via terminal:
   ```bash
   eas login
   ```
3. Refresh Orbit

### Issue: Build Not Downloading

**Solution:**
1. Check Downloads folder
2. Click build in Orbit → "Download" again
3. Or download from browser: https://expo.dev/accounts/[username]/builds

### Issue: Orbit Not Detecting Dev Server

**Solution:**
1. Restart dev server:
   ```bash
   npm start
   ```
2. Refresh Orbit (Cmd + R)
3. Check project is in correct directory

---

## Integration with Your Workflow

### Current Setup

Your FarmTime app is configured with:
- ✅ Production API: `https://farmtime-backend-xzj0.onrender.com/api`
- ✅ EAS Build configured (`eas.json`)
- ✅ Ready for Orbit

### Recommended Workflow

**For Development:**
1. Open Orbit
2. Click "Start" on farmtime-mobile
3. Scan QR with Expo Go
4. Make changes in VS Code
5. See updates instantly on phone

**For Production APK:**
1. Open Orbit
2. Click "Build" → Android → Preview → APK
3. Wait for notification (5-15 min)
4. Download APK
5. Install on devices

**For Sharing:**
1. Build completes in Orbit
2. Click "Copy Link"
3. Share link with team
4. They download and install

---

## Expo Orbit + Terminal Commands

You can use both together!

### Start Build in Terminal, Monitor in Orbit

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile

# Start build
eas build --platform android --profile preview

# Orbit automatically shows progress
# Click notification in Orbit when done
```

### Start Dev Server in Terminal, Manage in Orbit

```bash
# Start server
npm start

# Orbit detects it automatically
# Use Orbit to:
# - See QR code
# - Stop/restart server
# - Open in browser
```

---

## Quick Reference

### Essential Orbit Actions

| Action | How To |
|--------|--------|
| **Open Orbit** | Click menu bar icon |
| **Start Build** | Click project → Build → Android → APK |
| **Download APK** | Click notification or Builds → Download |
| **Start Dev Server** | Click project → Start |
| **View QR Code** | Start dev server, QR appears |
| **Refresh Projects** | Cmd + R in Orbit |
| **Open Settings** | Orbit menu → Preferences |

### Essential Terminal Commands

```bash
# Navigate to project
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile

# Start dev server
npm start

# Build APK
eas build --platform android --profile preview

# Login
eas login

# Check build status
eas build:list
```

---

## Tips for Using Expo Orbit

1. **Keep Orbit Running:**
   - Lives in menu bar
   - Minimal resource usage
   - Always ready when you need it

2. **Enable Notifications:**
   - Get alerts when builds complete
   - Don't miss important updates
   - Settings → Notifications

3. **Use Quick Actions:**
   - Right-click projects for more options
   - Keyboard shortcuts for common tasks
   - Faster than opening browser

4. **Combine with Terminal:**
   - Use terminal for complex commands
   - Use Orbit for monitoring
   - Best of both worlds

5. **Organize Projects:**
   - Star favorite projects
   - Hide inactive projects
   - Keep workspace clean

---

## Next Steps

1. **Open Expo Orbit** (already installed!)
2. **Sign in** with your Expo account
3. **Start a build** for farmtime-mobile
4. **Download APK** when ready
5. **Install on your phone** and test!

---

## Resources

- **Expo Orbit Docs:** https://docs.expo.dev/build/orbit/
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Your Builds:** https://expo.dev/accounts/[username]/builds

---

**Expo Orbit makes building APKs super easy! 🚀**

Just click, wait, and download. No complex commands needed!
