# Build APK Using Expo Website (No CLI Required)

This guide shows you how to build your Android APK using only your web browser - no command line needed!

---

## Method: Expo Build Service (Classic Build)

### Step 1: Create Expo Account

1. Go to https://expo.dev/signup
2. Sign up with email or GitHub
3. Verify your email

### Step 2: Install Expo CLI Locally (Required for Upload)

Even though we'll use the browser, we need to upload the project first:

```bash
# Install Expo CLI
npm install -g expo-cli

# Or use npx (no installation needed)
npx expo-cli --version
```

### Step 3: Login to Expo

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
expo login
```

Enter your Expo credentials.

### Step 4: Publish Your Project

This uploads your code to Expo servers:

```bash
expo publish
```

**What this does:**
- Uploads your JavaScript bundle to Expo
- Makes it available for building
- Creates a project on your Expo account

### Step 5: Build APK via Browser

#### Option A: Using Expo Website Dashboard

1. **Go to Expo Dashboard:**
   - Visit https://expo.dev
   - Click **"Sign In"** (top right)
   - Login with your credentials

2. **Find Your Project:**
   - You should see **"farmtime-mobile"** in your projects list
   - Click on it

3. **Start Build:**
   - Click **"Builds"** tab (left sidebar)
   - Click **"Create a build"**
   - Select **"Android"**
   - Choose **"APK"** (not AAB)
   - Click **"Build"**

4. **Wait for Build:**
   - Build status shows in dashboard
   - Takes 5-15 minutes
   - You'll get email when complete

5. **Download APK:**
   - Click **"Download"** button when ready
   - Save APK file to your computer

#### Option B: Using expo.dev/builds (Direct Link)

1. Go to https://expo.dev/accounts/[your-username]/projects/farmtime-mobile/builds
2. Click **"New Build"**
3. Select **Android → APK**
4. Click **"Build"**
5. Download when complete

---

## Alternative: EAS Build via Browser

EAS is the newer, recommended way. Here's how to use it via browser:

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
eas login
```

### Step 3: Configure Project

```bash
eas build:configure
```

This creates `eas.json` (already created for you).

### Step 4: Start Build

```bash
eas build --platform android --profile preview
```

### Step 5: Monitor Build in Browser

1. After starting build, you'll get a link like:
   ```
   https://expo.dev/accounts/[username]/projects/farmtime-mobile/builds/[build-id]
   ```

2. **Open this link in browser** to:
   - Watch build progress in real-time
   - See build logs
   - Download APK when complete

3. **Or visit:** https://expo.dev/accounts/[your-username]/builds
   - See all your builds
   - Download any completed build
   - View build history

---

## Easiest Method: Expo Snack (For Quick Testing)

For quick testing without building APK:

### Step 1: Create Expo Snack

1. Go to https://snack.expo.dev
2. Click **"Sign In"** (use your Expo account)
3. Create new Snack

### Step 2: Upload Your Code

**Option A: Import from GitHub**
1. Push your code to GitHub first
2. In Snack, click **"Import"**
3. Enter your GitHub repo URL
4. Snack imports your project

**Option B: Manual Upload**
1. Copy your `App.js` content
2. Paste into Snack editor
3. Upload other files via file browser

### Step 3: Test on Your Phone

1. Install **Expo Go** app on your Android phone
   - Download from Play Store: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Open Expo Go app

3. Scan QR code shown in Snack

4. App runs on your phone instantly!

**Note:** This doesn't create an APK, but lets you test quickly.

---

## Complete Browser-Based Workflow

### Initial Setup (One Time)

```bash
# 1. Install Expo CLI
npm install -g expo-cli

# 2. Navigate to project
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile

# 3. Login
expo login

# 4. Publish project
expo publish
```

### Build APK (Every Time You Need New APK)

1. **Update code** (if needed)

2. **Publish changes:**
   ```bash
   expo publish
   ```

3. **Go to browser:**
   - Visit https://expo.dev
   - Navigate to your project
   - Go to **Builds** tab
   - Click **"Create a build"**
   - Select **Android → APK**
   - Click **"Build"**

4. **Monitor in browser:**
   - Watch build progress
   - Get email notification when done
   - Download APK

5. **Install on phone:**
   - Transfer APK to phone
   - Install and test

---

## Using Expo Go App (No APK Needed)

For development and testing, you don't need to build APK:

### Step 1: Install Expo Go

On your Android phone:
1. Open Play Store
2. Search **"Expo Go"**
3. Install the app

### Step 2: Start Development Server

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
expo start
```

### Step 3: Scan QR Code

1. Terminal shows QR code
2. Open Expo Go app on phone
3. Tap **"Scan QR Code"**
4. Scan the QR code
5. App loads on your phone!

**Benefits:**
- ✅ No APK build needed
- ✅ Instant updates
- ✅ Perfect for development
- ✅ Works over WiFi

**Limitations:**
- ❌ Requires Expo Go app
- ❌ Can't share with non-developers
- ❌ Needs development server running

---

## Comparison of Methods

| Method | Build Time | Requires CLI | Shareable | Best For |
|--------|-----------|--------------|-----------|----------|
| **EAS Build (Browser)** | 5-15 min | Initial setup only | ✅ Yes | Production APK |
| **Classic Build (Browser)** | 5-15 min | Initial setup only | ✅ Yes | Production APK |
| **Expo Go** | Instant | Yes (for server) | ❌ No | Development |
| **Expo Snack** | Instant | No | ❌ No | Quick testing |

---

## Recommended Workflow

### For Development/Testing
```bash
# Start dev server
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
expo start

# Scan QR with Expo Go app
# Test changes instantly
```

### For Production APK
```bash
# 1. Publish latest code
expo publish

# 2. Go to browser
# Visit: https://expo.dev/accounts/[username]/projects/farmtime-mobile/builds

# 3. Click "Create a build" → Android → APK → Build

# 4. Download APK when ready

# 5. Install on devices
```

---

## Step-by-Step: First Time Build via Browser

### Complete Walkthrough

**1. Install and Setup (Terminal)**
```bash
npm install -g expo-cli
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
expo login
expo publish
```

**2. Build via Browser**
- Open browser: https://expo.dev
- Sign in
- Click on **"farmtime-mobile"** project
- Click **"Builds"** (left sidebar)
- Click **"Create a build"**
- Platform: **Android**
- Build type: **APK**
- Click **"Build"**

**3. Wait and Monitor**
- Build progress shows in browser
- Refresh page to see updates
- Email notification when complete
- Usually takes 5-15 minutes

**4. Download**
- Click **"Download"** button
- Save APK file
- File name: `farmtime-mobile-xxx.apk`

**5. Install on Phone**
- Transfer APK to phone (USB, email, cloud)
- Open file on phone
- Tap to install
- Enable "Unknown Sources" if prompted
- Tap "Install"
- Tap "Open" to launch

---

## Troubleshooting Browser Builds

### Issue: Project Not Showing in Dashboard
**Solution:**
```bash
expo publish
```
This uploads your project to Expo.

### Issue: Build Fails
**Check:**
1. Go to build page in browser
2. Click **"View Logs"**
3. Read error messages
4. Common fixes:
   - Update `app.json` with correct package name
   - Ensure all dependencies are installed
   - Check for syntax errors

### Issue: Can't Download APK
**Solution:**
- Check your email for download link
- Visit builds page: https://expo.dev/accounts/[username]/builds
- Click on completed build
- Click "Download" button

### Issue: "Build Queued" for Long Time
**Solution:**
- Free tier may have queue times
- Wait patiently (usually starts within 5 minutes)
- Check status in browser dashboard

---

## Managing Builds in Browser

### View All Builds
https://expo.dev/accounts/[your-username]/builds

### View Project Builds
https://expo.dev/accounts/[your-username]/projects/farmtime-mobile/builds

### Build Actions (in browser)
- **Download** - Get APK file
- **View Logs** - See build details
- **Rebuild** - Create new build with same settings
- **Delete** - Remove old builds

---

## Publishing Updates (Without New APK)

If you're using Expo Go or published APK with OTA updates:

### Update via Browser

1. **Make code changes**

2. **Publish update:**
   ```bash
   expo publish
   ```

3. **View in browser:**
   - Go to https://expo.dev/accounts/[username]/projects/farmtime-mobile
   - Click **"Updates"** tab
   - See published versions
   - View update history

4. **Users get update:**
   - Next time they open app
   - Automatic download
   - No new APK needed

**Note:** This only works for JavaScript changes, not native code changes.

---

## Browser Dashboard Features

### What You Can Do in Browser

1. **Builds Tab**
   - Create new builds
   - Download APKs
   - View build history
   - Check build logs

2. **Updates Tab**
   - See published updates
   - View update history
   - Manage OTA updates

3. **Settings Tab**
   - Configure project
   - Manage secrets
   - Set up credentials

4. **Analytics Tab** (if enabled)
   - View app usage
   - Monitor crashes
   - Track performance

---

## Quick Reference

### Essential URLs

- **Expo Dashboard:** https://expo.dev
- **Your Projects:** https://expo.dev/accounts/[username]/projects
- **Builds:** https://expo.dev/accounts/[username]/builds
- **Expo Go Download:** https://expo.dev/go

### Essential Commands

```bash
# Login
expo login

# Publish project
expo publish

# Start dev server
expo start

# Build via CLI (triggers browser monitoring)
eas build --platform android --profile preview
```

---

## Next Steps

1. **Choose your method:**
   - Quick testing → Use Expo Go
   - Production APK → Use browser build

2. **Follow the steps above**

3. **Download and install APK**

4. **Test on your device**

5. **Share with team** (send download link)

---

**Ready to build! 🚀**

The browser-based approach is perfect if you prefer visual interfaces over command line.
