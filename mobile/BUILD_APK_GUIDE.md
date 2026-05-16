# Generate APK for FarmTime Mobile App

This guide shows you how to build an APK file that you can install on Android devices.

## Prerequisites

- Node.js and npm installed
- Expo account (free at https://expo.dev)
- Your mobile app code ready

---

## Method 1: EAS Build (Recommended - Cloud Build)

This method builds your APK in the cloud, no Android Studio required!

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

Enter your Expo credentials (or create account at https://expo.dev/signup)

### Step 3: Configure EAS Build

Navigate to your mobile directory:
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
```

Initialize EAS:
```bash
eas build:configure
```

This creates `eas.json` configuration file.

### Step 4: Update eas.json for APK Build

The file should look like this (it will be auto-generated):
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Step 5: Build APK

For preview/testing build:
```bash
eas build --platform android --profile preview
```

For production build:
```bash
eas build --platform android --profile production
```

**What happens:**
1. Code is uploaded to Expo servers
2. APK is built in the cloud (takes 5-15 minutes)
3. You get a download link when complete

### Step 6: Download APK

After build completes:
1. You'll see a URL in terminal: `https://expo.dev/artifacts/...`
2. Click the link or visit https://expo.dev/accounts/[your-account]/builds
3. Download the APK file
4. Transfer to your Android device

### Step 7: Install on Android Device

**Option A: Direct Download on Phone**
1. Open the download link on your Android phone
2. Download the APK
3. Tap to install (may need to enable "Install from Unknown Sources")

**Option B: Transfer from Computer**
1. Connect phone via USB
2. Copy APK to phone's Downloads folder
3. Open file manager on phone
4. Tap APK file to install

---

## Method 2: Local Build with Expo (Development Build)

This creates a development APK for quick testing.

### Step 1: Install Dependencies

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
npm install
```

### Step 2: Build Development APK

```bash
npx expo export:android
```

This creates an APK in the `android/app/build/outputs/apk/` directory.

**Note:** This method requires Android Studio and Android SDK installed.

---

## Method 3: Using Android Studio (Full Control)

For complete control over the build process.

### Prerequisites

1. **Install Android Studio**: https://developer.android.com/studio
2. **Install Java JDK 17**: Required for React Native 0.73

### Step 1: Generate Android Project

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
npx expo prebuild --platform android
```

This creates the `android` folder with native Android project.

### Step 2: Update Gradle Properties

Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=true
```

### Step 3: Build APK

```bash
cd android
./gradlew assembleRelease
```

**APK Location:**
```
android/app/build/outputs/apk/release/app-release.apk
```

### Step 4: Sign APK (Optional but Recommended)

For production, you should sign your APK:

1. **Generate Keystore:**
```bash
keytool -genkeypair -v -storetype PKCS12 -keystore farmtime-release.keystore -alias farmtime -keyalg RSA -keysize 2048 -validity 10000
```

2. **Update android/app/build.gradle:**
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('farmtime-release.keystore')
            storePassword 'your-password'
            keyAlias 'farmtime'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            ...
        }
    }
}
```

3. **Build Signed APK:**
```bash
./gradlew assembleRelease
```

---

## Comparison of Methods

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| **EAS Build** | ✅ No setup needed<br>✅ Cloud-based<br>✅ Easy | ❌ Requires internet<br>❌ Build time 5-15 min | Quick testing, production |
| **Expo Export** | ✅ Fast<br>✅ Local | ❌ Development only<br>❌ Requires Android SDK | Quick local testing |
| **Android Studio** | ✅ Full control<br>✅ Offline | ❌ Complex setup<br>❌ Requires Android Studio | Advanced customization |

---

## Recommended: EAS Build Quick Start

**For most users, use EAS Build:**

```bash
# 1. Install EAS CLI (one time)
npm install -g eas-cli

# 2. Login to Expo
eas login

# 3. Navigate to mobile directory
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile

# 4. Configure EAS
eas build:configure

# 5. Build APK
eas build --platform android --profile preview

# 6. Wait for build to complete (5-15 minutes)
# 7. Download APK from provided link
# 8. Install on your Android device
```

---

## Installing APK on Android Device

### Enable Installation from Unknown Sources

**Android 8.0+:**
1. Go to **Settings** → **Apps & notifications**
2. Tap **Advanced** → **Special app access**
3. Tap **Install unknown apps**
4. Select your browser or file manager
5. Enable **Allow from this source**

**Android 7.0 and below:**
1. Go to **Settings** → **Security**
2. Enable **Unknown sources**

### Install APK

1. Transfer APK to phone (USB, email, or download)
2. Open file manager
3. Navigate to APK location
4. Tap APK file
5. Tap **Install**
6. Tap **Open** to launch app

---

## Troubleshooting

### Issue: "eas: command not found"
**Solution:**
```bash
npm install -g eas-cli
# Or
npx eas-cli login
```

### Issue: Build Fails with "Invalid credentials"
**Solution:**
- Run `eas login` again
- Verify credentials at https://expo.dev

### Issue: "App not installed" on Android
**Solution:**
- Uninstall any existing version first
- Check if "Install from Unknown Sources" is enabled
- Ensure APK is not corrupted (re-download)

### Issue: Build Takes Too Long
**Solution:**
- EAS Build typically takes 5-15 minutes
- Check build status: https://expo.dev/accounts/[your-account]/builds
- Free tier may have queue times

### Issue: "INSTALL_FAILED_UPDATE_INCOMPATIBLE"
**Solution:**
- Uninstall the existing app first
- Or change the package name in `app.json`

---

## App Configuration

Your app is configured in `app.json`:

```json
{
  "expo": {
    "name": "FarmTime",
    "slug": "farmtime-mobile",
    "version": "1.0.0",
    "android": {
      "package": "com.farmtime.mobile"
    }
  }
}
```

**To update:**
- **App Name:** Change `"name"`
- **Version:** Change `"version"` (e.g., "1.0.1")
- **Package ID:** Change `"android.package"` (must be unique)

---

## Building for Production

### Checklist Before Production Build

- [ ] Test app thoroughly
- [ ] Update version in `app.json`
- [ ] Verify API URL is set to production
- [ ] Add app icon (see below)
- [ ] Add splash screen (see below)
- [ ] Sign APK with release keystore
- [ ] Test on multiple devices

### Adding App Icon

1. Create icon image (1024x1024 PNG)
2. Add to `app.json`:
```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4CAF50"
      }
    }
  }
}
```

### Adding Splash Screen

1. Create splash image (1242x2436 PNG)
2. Add to `app.json`:
```json
{
  "expo": {
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4CAF50"
    }
  }
}
```

---

## Publishing to Google Play Store (Optional)

If you want to publish to Play Store:

1. **Create Google Play Developer Account** ($25 one-time fee)
2. **Build AAB instead of APK:**
   ```bash
   eas build --platform android --profile production
   ```
   (AAB is required for Play Store)

3. **Upload to Play Store Console**
4. **Fill in app details, screenshots, etc.**
5. **Submit for review**

---

## Next Steps After Building APK

1. **Test on Multiple Devices**
   - Different Android versions
   - Different screen sizes
   - Different network conditions

2. **Share with Team**
   - Send APK link to team members
   - Get feedback before production

3. **Monitor Performance**
   - Check for crashes
   - Monitor API response times
   - Gather user feedback

4. **Plan Updates**
   - Increment version number
   - Rebuild and redistribute

---

## Quick Reference Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure EAS
eas build:configure

# Build Preview APK
eas build --platform android --profile preview

# Build Production APK
eas build --platform android --profile production

# Check build status
eas build:list

# View build logs
eas build:view [build-id]
```

---

## Support Resources

- **Expo Docs:** https://docs.expo.dev/build/setup/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **React Native Docs:** https://reactnative.dev/docs/signed-apk-android
- **Expo Forums:** https://forums.expo.dev/

---

**Ready to build your APK! 🚀**

Start with EAS Build for the easiest experience.
