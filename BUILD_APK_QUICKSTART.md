# Quick Start: Build APK in 5 Minutes

## Fastest Way to Get Your APK

### Step 1: Install EAS CLI (One-time setup)
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
*Don't have an account? Create one at https://expo.dev/signup (free)*

### Step 3: Navigate to Mobile Directory
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
```

### Step 4: Build Your APK
```bash
eas build --platform android --profile preview
```

**What happens next:**
1. ✅ Code uploads to Expo servers
2. ✅ APK builds in cloud (5-15 minutes)
3. ✅ You get download link

### Step 5: Download & Install

1. **Get the link** - Terminal shows: `https://expo.dev/artifacts/...`
2. **Download APK** - Click link or visit https://expo.dev/accounts/[your-account]/builds
3. **Transfer to phone** - USB, email, or direct download on phone
4. **Install** - Tap APK file (enable "Install from Unknown Sources" if needed)

---

## That's It! 🎉

Your app is now installed on your Android device.

---

## Alternative: Build Production APK

For a production-ready build:
```bash
eas build --platform android --profile production
```

---

## Need Help?

See full guide: `mobile/BUILD_APK_GUIDE.md`

---

## Common First-Time Issues

### "eas: command not found"
```bash
npm install -g eas-cli
```

### "Not logged in"
```bash
eas login
```

### "App not installed" on Android
- Enable "Install from Unknown Sources" in Settings
- Uninstall any existing version first

---

## Check Build Status

```bash
eas build:list
```

Or visit: https://expo.dev/accounts/[your-account]/builds

---

## Next Build (After First Time)

Just run:
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
eas build --platform android --profile preview
```

Much faster since you're already set up!
