# Fix "EMFILE: too many open files" Error

This error occurs because macOS has a low default limit for open files. Here are solutions:

## 🚀 Quick Fix (Recommended)

### Option 1: Install Watchman (Best Solution)

Watchman is a file watching service that handles this better:

```bash
brew install watchman
```

Then run:
```bash
./start.sh
```

The script will automatically use watchman if installed.

---

### Option 2: Increase System Limits Temporarily

Run this in your terminal **before** starting the app:

```bash
ulimit -n 65536
```

Then start the app:
```bash
npx expo start --clear
```

---

## 🔧 Permanent Fix (Optional)

To permanently increase the file limit on macOS:

### Step 1: Increase launchctl limits

```bash
sudo launchctl limit maxfiles 65536 200000
```

### Step 2: Create a plist file

```bash
sudo nano /Library/LaunchDaemons/limit.maxfiles.plist
```

Paste this content:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxfiles</string>
      <string>65536</string>
      <string>200000</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>ServiceIPC</key>
    <false/>
  </dict>
</plist>
```

Save (Ctrl+O, Enter, Ctrl+X) and load it:

```bash
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

### Step 3: Restart your Mac

After restart, verify:
```bash
launchctl limit maxfiles
```

Should show: `maxfiles    65536          200000`

---

## ✅ Easiest Solution Right Now

Just run these two commands:

```bash
# Install watchman (one-time)
brew install watchman

# Start the app
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
./start.sh
```

The updated `start.sh` script handles everything automatically! 🎉
