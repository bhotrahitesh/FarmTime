---
description: Deploy mobile app updates via OTA (no APK download required)
---

# Deploy Mobile App Update (OTA)

Push updates to your client's app without requiring them to download a new APK.

## Prerequisites
- EAS CLI installed (`npm install -g eas-cli`)
- Logged into Expo account
- Client has the production APK installed

## Steps

### 1. Navigate to Mobile Directory
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
```

### 2. Test Your Changes Locally (Recommended)
// turbo
```bash
npm start
```
Test on your device using Expo Go to ensure changes work correctly.

### 3. Publish OTA Update to Production
```bash
eas update --branch production --message "Fixed payment report and employee selection"
```

**What this does:**
- Bundles your JavaScript code
- Uploads to Expo's servers
- Makes it available to all production users
- Users get update next time they open the app

### 4. Verify Update Published
```bash
eas update:list --branch production --limit 5
```

Check that your update appears in the list with the correct message.

### 5. Notify Client (Optional)

Send a message to your client:
```
Hi! I've pushed an update to the FarmTime app with the following improvements:
- Fixed payment report format
- Added employee selection validation
- Improved report download experience

The update will automatically download when you next open the app. 
Just close and reopen the app to see the changes.

No need to download anything manually!
```

## Update Timeline

- **Immediate:** Update is published to Expo servers
- **1-2 minutes:** Update becomes available
- **Next app open:** Client's app checks for update
- **Background download:** Update downloads automatically
- **Next restart:** Update is applied

## Rollback (If Needed)

If something goes wrong, rollback to previous version:

```bash
# Option 1: Republish previous working code
eas update --branch production --message "Rollback to stable version"

# Option 2: Use Expo Dashboard
# Visit: https://expo.dev/accounts/hiteshrajbhotra/projects/farmtime/updates
# Click on previous update and "Republish"
```

## When to Build New APK Instead

Build a new APK only if you:
- Changed native code or dependencies
- Updated Expo SDK version
- Modified Android permissions
- Changed app version significantly

For JavaScript/React Native changes, always use OTA updates!

## Troubleshooting

### Client not getting update?

**Ask client to:**
1. Close app completely (swipe away from recent apps)
2. Wait 5 seconds
3. Reopen app
4. Wait 10-20 seconds for download
5. Close and reopen again

### Check update status:
```bash
eas update:view <update-id>
```

## Notes
- Updates are automatic - no client action needed
- Updates apply on next app restart
- Client keeps using old version until they restart
- No data loss during updates
- Updates work even on slow internet
