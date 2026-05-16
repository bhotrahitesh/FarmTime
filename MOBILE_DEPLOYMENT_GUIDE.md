# Mobile App Deployment Guide

## Overview

Your mobile app changes (login performance fixes) are **JavaScript-only**, so you can deploy them via **Over-The-Air (OTA) updates** without requiring users to reinstall the app.

## Deployment Options

### Option 1: OTA Update (Recommended) ✅
**Best for:** Existing users who already have the app installed
- Updates happen automatically
- No app store submission needed
- Users get updates within 24 hours

### Option 2: New Build
**Best for:** First-time deployment or major version changes
- Creates new APK/IPA files
- Requires distribution to users
- Needed if users don't have the app yet

---

## Option 1: Deploy OTA Update (For Existing Users)

### Step 1: Install expo-updates

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile

npx expo install expo-updates
```

### Step 2: Publish the Update

```bash
# Login to Expo (if not already logged in)
npx expo login

# Publish update to production channel
eas update --branch production --message "Login performance improvements: Added 60s timeout and better error handling"
```

### Step 3: Verify Update

```bash
# Check update status
eas update:list --branch production
```

### What Happens Next?

1. **Update is published** to Expo's CDN
2. **Users open the app** → App checks for updates
3. **Update downloads** in background (small, ~few KB)
4. **Next app restart** → New version loads
5. **Timeline:** Users get update within 1-24 hours

---

## Option 2: Build New APK (For New Users)

### Step 1: Build Production APK

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile

# Build production APK
eas build --platform android --profile production
```

This will:
- Build the app on Expo's servers
- Create a production-ready APK
- Take ~10-15 minutes

### Step 2: Download the APK

After build completes:
```bash
# Download the APK
eas build:download --platform android --profile production
```

Or download from the Expo dashboard:
- Go to https://expo.dev
- Navigate to your project
- Click "Builds"
- Download the APK

### Step 3: Distribute to Users

**Option A: Direct Distribution**
- Send APK file to users via email/messaging
- Users install manually (requires "Install from unknown sources")

**Option B: Internal Distribution**
- Upload to Google Drive/Dropbox
- Share link with users

**Option C: Play Store (Future)**
- Submit to Google Play Store
- Requires developer account ($25 one-time fee)

---

## iOS Deployment (If Needed)

### Build iOS App

```bash
# Build for iOS
eas build --platform ios --profile production
```

**Note:** iOS requires:
- Apple Developer Account ($99/year)
- Mac for testing
- TestFlight or App Store for distribution

---

## Quick Deployment (Recommended Path)

Since your backend is already deployed and you have existing users:

### 1. Install expo-updates
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
npx expo install expo-updates
```

### 2. Publish OTA Update
```bash
npx expo login
eas update --branch production --message "Login performance improvements"
```

### 3. Done! ✅
Users will get the update automatically within 24 hours.

---

## Verification Steps

### Test the Update Locally First

```bash
# Start development server
npx expo start

# Test on Android
npx expo run:android

# Test login functionality:
# 1. Try logging in
# 2. Verify 60-second timeout works
# 3. Check error messages are clear
```

### After Publishing Update

```bash
# Check update was published
eas update:list --branch production

# Expected output:
# Branch: production
# Update ID: xxxxx
# Message: Login performance improvements
# Created: [timestamp]
```

---

## Troubleshooting

### "eas: command not found"

Install EAS CLI:
```bash
npm install -g eas-cli
```

### "Not logged in to Expo"

```bash
npx expo login
# Enter your Expo credentials
```

### "No updates available"

Check if expo-updates is installed:
```bash
npx expo install expo-updates
```

### Build fails

Clean and rebuild:
```bash
cd android
./gradlew clean
cd ..
npx expo run:android
```

---

## What Changed in This Update?

### Files Modified:
1. **`mobile/src/services/api.js`**
   - Added 60-second timeout for API calls
   - Handles Render cold starts better

2. **`mobile/src/screens/LoginScreen.js`**
   - Added timeout-specific error message
   - Better user feedback during cold starts

3. **`mobile/android/build.gradle`**
   - Fixed build tools version (34.0.0 → 33.0.1)
   - Resolved build issues

4. **`mobile/app.json`**
   - Added updates configuration
   - Enabled OTA updates

5. **`mobile/eas.json`**
   - Added update channels
   - Configured production/preview channels

### User-Facing Changes:
- ✅ Longer timeout (60s) prevents premature errors
- ✅ Clear error message if server is cold starting
- ✅ Better login experience overall

---

## Cost Breakdown

### Free Tier (Current)
- **Expo Updates:** Free (unlimited)
- **EAS Build:** 30 builds/month free
- **Total:** $0/month

### If You Need More
- **EAS Production:** $29/month
  - Unlimited builds
  - Priority support
  - Team collaboration

---

## Timeline

### OTA Update Timeline:
- **Publish update:** 1 minute
- **Users get update:** 1-24 hours (automatic)
- **Total time:** ~1 day for all users

### New Build Timeline:
- **Build APK:** 10-15 minutes
- **Download:** 1 minute
- **Distribute to users:** Manual
- **Users install:** Manual
- **Total time:** Depends on distribution method

---

## Recommended Next Steps

1. ✅ **Install expo-updates** (Step 1 above)
2. ✅ **Publish OTA update** (Step 2 above)
3. ✅ **Verify update published** (Step 3 above)
4. ⏳ **Wait 24 hours** for users to get update
5. ✅ **Monitor user feedback**
6. 🎯 **Consider Play Store submission** for future updates

---

## Future Deployments

For future updates:

```bash
# Simple one-command deployment
cd mobile
eas update --branch production --message "Your update message"
```

That's it! Users get updates automatically.

---

## Support

If you encounter issues:
1. Check Expo documentation: https://docs.expo.dev
2. Check EAS documentation: https://docs.expo.dev/eas/
3. Check build logs in Expo dashboard
4. Review error messages carefully
