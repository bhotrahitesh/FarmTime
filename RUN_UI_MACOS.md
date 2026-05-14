# 🖥️ How to Run UI on macOS

## ⚡ Fastest Method: iOS Simulator

### Step 1: Install Xcode (if not already installed)
- Open **App Store**
- Search for **Xcode**
- Click **Install** (it's free, but large ~12GB)
- Wait for installation to complete

### Step 2: Start Backend
```bash
cd backend
./run.sh
```

Wait for: `Started FarmTimeApplication in X.XXX seconds`

### Step 3: Start Mobile App
Open a **new terminal** and run:
```bash
cd mobile

# First time only - install dependencies
npm install

# Start the app
npm start
```

### Step 4: Launch iOS Simulator
When Expo DevTools opens in the terminal, press **`i`**

The iOS Simulator will open automatically and install the app.

### Step 5: Login
- **Username:** `admin`
- **Password:** `admin123`

---

## 🎯 Complete Workflow

```bash
# Terminal 1 - Backend
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/backend
./run.sh

# Terminal 2 - Mobile App (new terminal window)
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
npm start
# Press 'i' when ready
```

---

## 🤖 Alternative: Android Emulator

If you prefer Android or don't have Xcode:

```bash
# Terminal 1 - Backend
cd backend
./run.sh

# Terminal 2 - Android
cd mobile
./run-android.sh
```

**Note:** Requires Android Studio. See [ANDROID_SETUP.md](ANDROID_SETUP.md) for setup.

---

## 🌐 Alternative: Web Browser

You can also run it in a web browser:

```bash
cd mobile
npm start
# Press 'w' for web
```

---

## 🔧 Troubleshooting

### "Expo command not found"
```bash
npm install -g expo-cli
```

### "Cannot connect to backend"
Make sure backend is running on port 8080:
```bash
# Check if backend is running
curl http://localhost:8080/api/auth/login
```

### "iOS Simulator won't open"
```bash
# Open Xcode first, then try again
open -a Xcode
# Go to Xcode > Open Developer Tool > Simulator
```

### Port 8080 already in use
```bash
# Find what's using it
lsof -i :8080

# Kill the process
kill -9 <PID>
```

---

## 📊 Quick Reference

| Method | Command | Requirements |
|--------|---------|--------------|
| **iOS Simulator** | `npm start` → press `i` | Xcode |
| **Android Emulator** | `./run-android.sh` | Android Studio |
| **Web Browser** | `npm start` → press `w` | None |
| **Physical Device** | `npm start` → scan QR | Expo Go app |

---

## ✅ Verification Steps

1. **Backend is running:**
   ```bash
   curl http://localhost:8080/api/auth/login
   # Should return: {"timestamp":"...","status":405,...}
   ```

2. **Mobile dependencies installed:**
   ```bash
   ls mobile/node_modules
   # Should show many packages
   ```

3. **Expo is working:**
   ```bash
   cd mobile
   npm start
   # Should show QR code and options
   ```

---

## 🎓 First Time Setup Checklist

- [ ] Backend running (`cd backend && ./run.sh`)
- [ ] Xcode installed (for iOS)
- [ ] Mobile dependencies installed (`cd mobile && npm install`)
- [ ] Admin user created (see START_APP.md Step 4)
- [ ] Start mobile app (`npm start`)
- [ ] Press `i` for iOS or `a` for Android

---

## 💡 Pro Tips

1. **Keep backend running** in one terminal
2. **Keep mobile app running** in another terminal
3. **Use hot reload** - changes appear instantly
4. **Press `r`** in Expo terminal to reload app
5. **Press `m`** to toggle menu in simulator

---

## 🚀 Daily Usage

Once everything is set up:

```bash
# Terminal 1
cd backend && ./run.sh

# Terminal 2
cd mobile && npm start
# Press 'i'
```

**Done!** 🎉

---

For more details, see:
- [START_APP.md](START_APP.md) - Complete startup guide
- [ANDROID_SETUP.md](ANDROID_SETUP.md) - Android setup
- [README.md](README.md) - Project overview
