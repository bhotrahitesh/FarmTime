# Over-The-Air (OTA) Updates Guide - FarmTime Mobile App

Complete guide to deploy updates to your client's app **without requiring APK downloads**.

---

## 🎯 What Are OTA Updates?

**OTA (Over-The-Air) Updates** allow you to push JavaScript/React Native code changes directly to your users' installed apps **without** requiring them to download a new APK from the Play Store or manually.

### ✅ What Can Be Updated via OTA:
- JavaScript code changes
- React Native components
- UI changes
- Bug fixes
- New features (JS-only)
- API endpoint changes
- Business logic

### ❌ What Requires New APK:
- Native code changes (Android/iOS)
- New native dependencies
- Permission changes
- App version/build number changes
- Native module updates

---

## 🚀 How It Works

1. **Client opens app** → App checks for updates
2. **Update available** → App downloads new JS bundle in background
3. **Next app restart** → New code is loaded automatically
4. **Client sees updates** → No manual download needed!

---

## 📋 Current Configuration

Your app is already configured for OTA updates:

**File:** `app.json`
```json
{
  "updates": {
    "enabled": true,
    "checkAutomatically": "ON_LOAD",
    "fallbackToCacheTimeout": 0,
    "url": "https://u.expo.dev/0c2e15f5-f87f-4d55-bb6e-442a7c6b068b"
  },
  "runtimeVersion": "1.0.1"
}
```

**What this means:**
- ✅ Updates are enabled
- ✅ App checks for updates every time it loads
- ✅ Updates download immediately (no timeout)
- ✅ Connected to Expo's update server

---

## 🔄 Deployment Workflow

### Step 1: Make Your Code Changes

Edit your React Native/JavaScript code:
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
# Make your changes to screens, components, etc.
```

### Step 2: Publish Update to Expo

```bash
# Publish update to production channel
eas update --branch production --message "Fixed reports issue"
```

**What happens:**
- Your code is bundled
- Uploaded to Expo's servers
- Made available to all apps on the "production" branch
- Users get the update next time they open the app

### Step 3: Client Gets Update Automatically

**Client's experience:**
1. Opens app (as usual)
2. App checks for updates in background
3. Downloads new code (if available)
4. Next time app restarts → New code is active!

**No manual download needed!** 🎉

---

## 📝 Complete Deployment Steps

### Initial Setup (One-Time Only)

#### 1. Build and Distribute Initial APK

```bash
# Build production APK
eas build --platform android --profile production

# Wait for build to complete (5-15 minutes)
# Download APK and send to client
```

**Client installs this APK once** - This is the only time they need to manually install.

#### 2. Configure Update Channels

Your `eas.json` should have:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      },
      "channel": "production"
    }
  }
}
```

### Regular Updates (Every Time You Make Changes)

#### 1. Make Code Changes

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
# Edit your code
```

#### 2. Test Locally (Optional but Recommended)

```bash
npm start
# Test on your device using Expo Go
```

#### 3. Publish OTA Update

```bash
# Publish to production channel
eas update --branch production --message "Description of changes"
```

**Examples:**
```bash
# Bug fix
eas update --branch production --message "Fixed payment report issue"

# New feature
eas update --branch production --message "Added employee filtering in reports"

# UI improvement
eas update --branch production --message "Improved dashboard layout"
```

#### 4. Verify Update Published

```bash
# List recent updates
eas update:list --branch production
```

You'll see:
```
Updates for branch: production
ID                                   Message                          Created
abc123...                           Fixed payment report issue        2 minutes ago
def456...                           Added employee filtering          1 day ago
```

#### 5. Client Gets Update

**Automatic (Default):**
- Client opens app
- App checks for updates
- Downloads in background
- Applies on next restart

**Manual Check (if you want to force it):**
- Client closes app completely
- Reopens app
- Update downloads and applies

---

## 🎨 Update Strategies

### Strategy 1: Automatic Updates (Current Setup)

**Configuration:**
```json
"checkAutomatically": "ON_LOAD"
```

**Behavior:**
- Checks every time app loads
- Downloads immediately
- Applies on next restart

**Best for:** Most use cases, ensures users always have latest version

### Strategy 2: Manual Updates

**Configuration:**
```json
"checkAutomatically": "ON_ERROR"
```

**Behavior:**
- Only checks when app encounters an error
- User has more control

**Best for:** Apps where stability is critical

### Strategy 3: Background Updates

**Configuration:**
```json
"checkAutomatically": "ON_LOAD",
"fallbackToCacheTimeout": 30000
```

**Behavior:**
- Checks on load
- Waits 30 seconds before falling back
- Smoother experience

---

## 🔔 Notify Users of Updates (Optional)

If you want to show a message when updates are available:

### Create Update Check Component

**File:** `mobile/src/components/UpdateChecker.js`
```javascript
import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import * as Updates from 'expo-updates';

export default function UpdateChecker() {
  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        
        Alert.alert(
          'Update Available',
          'A new version is available. Restart the app to apply updates.',
          [
            { text: 'Later', style: 'cancel' },
            { 
              text: 'Restart Now', 
              onPress: () => Updates.reloadAsync() 
            }
          ]
        );
      }
    } catch (error) {
      console.log('Error checking for updates:', error);
    }
  };

  return null;
}
```

### Add to App.js

```javascript
import UpdateChecker from './src/components/UpdateChecker';

export default function App() {
  return (
    <>
      <UpdateChecker />
      {/* Rest of your app */}
    </>
  );
}
```

---

## 📊 Monitoring Updates

### Check Update Status

```bash
# List all updates
eas update:list --branch production

# View specific update details
eas update:view <update-id>

# Check which users have which version
eas update:list --branch production --limit 10
```

### Update Analytics

Visit Expo Dashboard:
```
https://expo.dev/accounts/hiteshrajbhotra/projects/farmtime/updates
```

You can see:
- How many users have each update
- Download success rate
- Rollback if needed

---

## 🚨 Troubleshooting

### Issue: Client Not Getting Updates

**Solution 1: Check Runtime Version**
```bash
# Ensure runtimeVersion matches between app and updates
# In app.json:
"runtimeVersion": "1.0.1"
```

**Solution 2: Force Update Check**
```bash
# Client should:
1. Close app completely (swipe away from recent apps)
2. Reopen app
3. Wait 10-20 seconds
```

**Solution 3: Check Update Channel**
```bash
# Verify update was published to correct channel
eas update:list --branch production
```

### Issue: Update Failed to Download

**Check:**
1. Client has internet connection
2. Expo servers are up: https://status.expo.dev
3. Update was successfully published

### Issue: App Crashes After Update

**Rollback to Previous Version:**
```bash
# Publish previous working version again
eas update --branch production --message "Rollback to stable version"
```

Or use Expo Dashboard to rollback:
```
https://expo.dev/accounts/hiteshrajbhotra/projects/farmtime/updates
```

---

## 🎯 Best Practices

### 1. Test Before Publishing

```bash
# Test locally first
npm start

# Test on physical device
# Scan QR code with Expo Go
```

### 2. Use Descriptive Messages

```bash
# Good ✅
eas update --branch production --message "Fixed payment report summary calculation"

# Bad ❌
eas update --branch production --message "update"
```

### 3. Publish During Low Usage

- Publish updates when client is least likely to be using app
- Avoid publishing during business hours
- Consider timezone differences

### 4. Keep Track of Changes

Create a changelog file:
```bash
# CHANGELOG.md
## Version 1.0.1 - 2026-05-19
- Fixed payment report remaining amount calculation
- Added employee selection validation
- Improved report download UX

## Version 1.0.0 - 2026-05-17
- Initial release
```

### 5. Version Incrementing

Update version in `app.json` for major changes:
```json
{
  "version": "1.0.1",  // Increment this
  "runtimeVersion": "1.0.1"  // Keep in sync
}
```

---

## 📱 When to Build New APK

You **only** need a new APK when:

1. **Native code changes**
   - Added new native library
   - Changed Android permissions
   - Updated Expo SDK version

2. **Major version updates**
   - Version 1.0.0 → 2.0.0
   - Complete app redesign

3. **Runtime version changes**
   - Changed `runtimeVersion` in app.json

For **everything else**, use OTA updates! 🚀

---

## 🔄 Quick Reference

### Publish Update
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
eas update --branch production --message "Your change description"
```

### Check Updates
```bash
eas update:list --branch production
```

### View Update Details
```bash
eas update:view <update-id>
```

### Rollback
```bash
# Republish previous version
eas update --branch production --message "Rollback"
```

---

## 📞 Client Instructions

Send this to your client:

---

**How to Get App Updates:**

Your FarmTime app automatically checks for updates every time you open it. Here's what happens:

1. **Open the app** as normal
2. App checks for updates in the background
3. If an update is available, it downloads automatically
4. **Close and reopen the app** to see the new features

**No need to download anything manually!**

If you want to force check for updates:
1. Close the app completely (swipe it away from recent apps)
2. Wait 5 seconds
3. Open the app again

---

## ✅ Summary

1. **Initial APK** - Client installs once
2. **Make changes** - Edit your code
3. **Publish update** - `eas update --branch production --message "..."`
4. **Client gets update** - Automatically on next app open
5. **No manual download** - Updates happen seamlessly!

**Your client will never need to download a new APK again** (unless you change native code)! 🎉
