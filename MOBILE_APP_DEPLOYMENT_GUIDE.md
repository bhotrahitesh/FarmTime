# Mobile App Deployment Guide - Expo & EAS

## 📱 Two Types of Deployment

### 1. OTA Update (Over-The-Air) - No APK Download Required
**Use when:** Code changes only (UI, logic, bug fixes)
**Users get update:** Automatically when they open the app
**Time:** ~2-5 minutes

### 2. New APK Build - Requires APK Download
**Use when:** Native dependencies changed, version upgrade, major release
**Users get update:** Must download and install new APK
**Time:** ~10-20 minutes

---

## 🚀 OTA Update Deployment (Recommended for Most Changes)

### Quick Command:
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
npx eas-cli update --branch production --message "Your update description"
```

### Step-by-Step:

1. **Navigate to mobile directory:**
   ```bash
   cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
   ```

2. **Deploy to production:**
   ```bash
   npx eas-cli update --branch production --message "Bug fixes and improvements"
   ```

3. **Deploy to preview (for testing):**
   ```bash
   npx eas-cli update --branch preview --message "Testing new features"
   ```

4. **Auto message (uses git commit):**
   ```bash
   npx eas-cli update --branch production --auto
   ```

### What Happens:
```
✓ Exports app bundle
✓ Uploads to Expo servers
✓ Publishes update
✓ Users get update on next app open
```

### Example Output:
```
Branch             production
Runtime version    1.0.1
Platform           android, ios
Update group ID    d16b3aea-d36e-43ca-bf2e-7d64a66ee277
Android update ID  019e5838-d14f-74cb-a877-56f8dc00b3ad
iOS update ID      019e5838-d14f-7468-b5ab-793e5bd7f9b9
Message            Bug fixes and improvements
```

### When to Use OTA:
✅ UI changes (screens, components, styling)
✅ Business logic updates
✅ Bug fixes
✅ API endpoint changes
✅ Text/content updates
✅ Added new screens
✅ Modified existing features

### When NOT to Use OTA:
❌ Added new native dependencies
❌ Changed app.json configuration
❌ Updated Expo SDK version
❌ Changed native Android/iOS code
❌ Modified build settings

---

## 📦 New APK Build Deployment

### Quick Command:
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
npx eas-cli build --platform android --profile production
```

### Step-by-Step:

1. **Navigate to mobile directory:**
   ```bash
   cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
   ```

2. **Start production build:**
   ```bash
   npx eas-cli build --platform android --profile production
   ```

3. **Wait for build to complete** (10-20 minutes)
   - Terminal will show build progress
   - You'll get a build URL

4. **Download APK:**
   - Click the download link in terminal
   - Or visit: https://expo.dev/accounts/hiteshrajbhotra/projects/farmtime/builds
   - Click on latest build → Download APK

### Build Profiles:

#### Production (Release Build):
```bash
npx eas-cli build --platform android --profile production
```
- Optimized for performance
- Smaller file size
- For end users

#### Preview (Testing Build):
```bash
npx eas-cli build --platform android --profile preview
```
- For internal testing
- Quick build
- Same as production but on preview channel

#### Development (Debug Build):
```bash
npx eas-cli build --platform android --profile development
```
- For development/debugging
- Larger file size
- Includes dev tools

### Example Output:
```
✔ Build started, it may take a few minutes to complete.
Build details: https://expo.dev/accounts/hiteshrajbhotra/projects/farmtime/builds/abc123

⠋ Waiting for build to complete...
✔ Build finished!

APK: https://expo.dev/artifacts/eas/abc123.apk
```

### When to Build New APK:
✅ First time deployment
✅ Added new native packages (e.g., camera, location)
✅ Updated Expo SDK version
✅ Changed app version in app.json
✅ Modified native Android configuration
✅ Changed app permissions
✅ Updated app icon or splash screen
✅ Changed package name or bundle identifier

---

## 🔍 Check Build Status

### List all builds:
```bash
npx eas-cli build:list
```

### Get latest APK download link:
```bash
npx eas-cli build:list --platform android --status finished --limit 1
```

**Or get direct download URL:**
```bash
npx eas-cli build:list --platform android --status finished --limit 1 --json | grep -o '"artifacts":{"buildUrl":"[^"]*"' | grep -o 'https://[^"]*'
```

**Simpler approach - View in browser:**
```bash
# This opens the builds page in your browser
open https://expo.dev/accounts/hiteshrajbhotra/projects/farmtime/builds
```

### View specific build:
```bash
npx eas-cli build:view [BUILD_ID]
```

### Check who's logged in:
```bash
npx eas-cli whoami
```

---

## 📊 Version Management

### Update Version in app.json:

```json
{
  "expo": {
    "version": "1.0.1",  // User-facing version
    "android": {
      "versionCode": 3   // Internal build number (increment each build)
    },
    "runtimeVersion": "1.0.1"  // For OTA updates
  }
}
```

**Rules:**
- `version`: Semantic versioning (1.0.0, 1.0.1, 1.1.0, 2.0.0)
- `versionCode`: Integer, increment by 1 for each build
- `runtimeVersion`: Must match for OTA updates to work

### Version Update Example:

**Bug fix:**
```json
"version": "1.0.1" → "1.0.2"
"versionCode": 2 → 3
```

**New feature:**
```json
"version": "1.0.2" → "1.1.0"
"versionCode": 3 → 4
```

**Major release:**
```json
"version": "1.1.0" → "2.0.0"
"versionCode": 4 → 5
```

---

## 🎯 Deployment Workflow

### For Regular Updates (Most Common):

1. **Make code changes**
2. **Test locally:**
   ```bash
   npm start
   ```
3. **Deploy OTA update:**
   ```bash
   npx eas-cli update --branch production --message "Fixed payment report bug"
   ```
4. **Users get update automatically**

### For Major Updates (With Native Changes):

1. **Make code changes**
2. **Update version in app.json:**
   ```json
   "version": "1.1.0",
   "versionCode": 4
   ```
3. **Build new APK:**
   ```bash
   npx eas-cli build --platform android --profile production
   ```
4. **Wait for build to complete**
5. **Download APK**
6. **Distribute to users** (WhatsApp, email, etc.)
7. **Users must install new APK**

---

## 🔧 Configuration Files

### app.json
Main configuration file:
```json
{
  "expo": {
    "name": "FarmTime",
    "slug": "farmtime",
    "version": "1.0.0",
    "owner": "hiteshrajbhotra",
    "runtimeVersion": "1.0.1",
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_LOAD"
    }
  }
}
```

### eas.json
Build profiles configuration:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      },
      "channel": "production"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "channel": "preview"
    }
  }
}
```

---

## 📱 User Experience

### OTA Update:
```
1. User opens app
2. App checks for updates
3. Downloads update in background
4. Shows "Update available" or auto-applies
5. User sees new features immediately
```

### APK Update:
```
1. You send APK file to users
2. Users download APK
3. Users install APK (may need to allow unknown sources)
4. Users open updated app
```

---

## 🚨 Common Issues & Solutions

### Issue: "Runtime version mismatch"
**Solution:** Ensure `runtimeVersion` in app.json matches between builds
```json
"runtimeVersion": "1.0.1"  // Must be same for OTA to work
```

### Issue: "Build failed"
**Solution:** Check build logs in EAS dashboard
```bash
npx eas-cli build:list
# Click on failed build to see logs
```

### Issue: "Update not appearing for users"
**Solution:** 
- Check branch name matches (production vs preview)
- Verify `updates.enabled: true` in app.json
- Ask users to force close and reopen app

### Issue: "APK not installing on phone"
**Solution:**
- Enable "Install from unknown sources" in Android settings
- Check if APK is for correct architecture (ARM vs x86)

---

## 📋 Quick Reference

### Most Common Commands:

```bash
# Deploy OTA update
npx eas-cli update --branch production --message "Update description"

# Build new APK
npx eas-cli build --platform android --profile production

# Get latest APK download link
npx eas-cli build:list --platform android --status finished --limit 1

# Check build status
npx eas-cli build:list

# Check who's logged in
npx eas-cli whoami

# View project info
npx eas-cli project:info

# Open builds page in browser
open https://expo.dev/accounts/hiteshrajbhotra/projects/farmtime/builds
```

### Dashboard URLs:

- **Project Dashboard:** https://expo.dev/accounts/hiteshrajbhotra/projects/farmtime
- **Builds:** https://expo.dev/accounts/hiteshrajbhotra/projects/farmtime/builds
- **Updates:** https://expo.dev/accounts/hiteshrajbhotra/projects/farmtime/updates

---

## ✅ Deployment Checklist

### Before OTA Update:
- [ ] Code changes tested locally
- [ ] No native dependency changes
- [ ] Update message prepared
- [ ] Correct branch selected (production/preview)

### Before APK Build:
- [ ] Version number updated in app.json
- [ ] Version code incremented
- [ ] All changes tested
- [ ] Build profile selected (production/preview)
- [ ] Ready to wait 10-20 minutes

### After Deployment:
- [ ] Verify update appears in dashboard
- [ ] Test on actual device
- [ ] Inform users if APK update
- [ ] Monitor for issues

---

## 🎓 Best Practices

1. **Use OTA for most updates** - Faster and automatic for users
2. **Increment version code** - Always for new APK builds
3. **Test before deploying** - Run locally first
4. **Use meaningful messages** - Helps track what changed
5. **Keep runtime version consistent** - For OTA compatibility
6. **Use preview for testing** - Before production deployment
7. **Document major changes** - In update messages
8. **Monitor dashboard** - Check for errors after deployment

---

## 📞 Support

- **EAS Documentation:** https://docs.expo.dev/eas/
- **Expo Forums:** https://forums.expo.dev/
- **Project Dashboard:** https://expo.dev/accounts/hiteshrajbhotra/projects/farmtime

---

## 🔄 Update History

Track your deployments:

| Date | Type | Version | Message | Branch |
|------|------|---------|---------|--------|
| 2026-05-24 | OTA | 1.0.1 | Payment report enhancement | production |
| 2026-05-XX | APK | 1.0.0 | Initial release | production |

---

**Remember:** 
- OTA = Quick updates, no APK download
- APK = Full rebuild, users must install
- Choose based on what you changed!
