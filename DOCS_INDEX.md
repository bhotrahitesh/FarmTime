# 📚 FarmTime Documentation Index

Quick navigation to all project documentation.

---

## 🚀 Getting Started (Start Here!)

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[START_APP.md](START_APP.md)** | Quick start guide | First time setup, daily usage |
| **[README.md](README.md)** | Project overview | Understanding the project |
| **[SETUP_COMPLETE.md](SETUP_COMPLETE.md)** | Setup completion summary | After Android setup |

---

## 🤖 Android Setup

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[ANDROID_SETUP.md](ANDROID_SETUP.md)** | Complete Android guide | Full Android setup instructions |
| **[mobile/ANDROID_QUICK_START.md](mobile/ANDROID_QUICK_START.md)** | Quick reference | Daily Android development |
| **[ANDROID_SETUP_SUMMARY.md](ANDROID_SETUP_SUMMARY.md)** | What was configured | Understanding the setup |

---

## 🛠️ Scripts & Tools

| Script | Purpose | Location |
|--------|---------|----------|
| **`run-android.sh`** | Automated Android setup & run | `mobile/` |
| **`check-android-setup.sh`** | Verify Android setup | `mobile/` |
| **`run.sh`** | Start backend with Java 17 | `backend/` |
| **`start.sh`** | Start mobile app | `mobile/` |

---

## 📖 Technical Documentation

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)** | Database structure | Understanding data models |
| **[SETUP_GUIDE.md](SETUP_GUIDE.md)** | Detailed setup guide | Troubleshooting setup |

---

## 🎯 Quick Commands

### Check Android Setup
```bash
cd mobile
./check-android-setup.sh
```

### Run on Android (Automated)
```bash
cd mobile
./run-android.sh
```

### Run on iOS
```bash
cd mobile
npm start
# Press 'i'
```

### Start Backend
```bash
cd backend
./run.sh
```

---

## 📱 Platform-Specific

### iOS Development
- **Guide:** [START_APP.md](START_APP.md) - Step 5
- **API URL:** `http://localhost:8080/api` (auto-configured)
- **Command:** `npm start` then press `i`

### Android Development
- **Guide:** [ANDROID_SETUP.md](ANDROID_SETUP.md)
- **Quick Start:** [mobile/ANDROID_QUICK_START.md](mobile/ANDROID_QUICK_START.md)
- **API URL:** `http://10.0.2.2:8080/api` (auto-configured)
- **Command:** `./run-android.sh`

---

## 🔧 Troubleshooting

### Backend Issues
- **Guide:** [START_APP.md](START_APP.md) - Troubleshooting section
- **Common:** Java version, database connection, port conflicts

### Android Issues
- **Guide:** [ANDROID_SETUP.md](ANDROID_SETUP.md) - Troubleshooting section
- **Common:** ANDROID_HOME, no AVDs, emulator won't start

### Mobile App Issues
- **Guide:** [START_APP.md](START_APP.md) - Troubleshooting section
- **Common:** API connection, network errors

---

## 📂 File Structure

```
FarmTime/
├── README.md                      # Project overview
├── START_APP.md                   # Quick start guide ⭐
├── SETUP_GUIDE.md                 # Detailed setup
├── DATABASE_SCHEMA.md             # Database structure
│
├── ANDROID_SETUP.md               # Android complete guide ⭐
├── ANDROID_SETUP_SUMMARY.md       # Android setup summary
├── SETUP_COMPLETE.md              # Setup completion
├── DOCS_INDEX.md                  # This file
│
├── backend/
│   ├── run.sh                     # Backend startup script
│   └── ...
│
└── mobile/
    ├── run-android.sh             # Android automated setup ⭐
    ├── check-android-setup.sh     # Android verification
    ├── start.sh                   # Mobile startup
    ├── ANDROID_QUICK_START.md     # Android quick reference
    └── ...
```

---

## 🎓 Learning Path

### Day 1: Initial Setup
1. Read [README.md](README.md)
2. Follow [START_APP.md](START_APP.md)
3. Set up backend and database
4. Create admin user

### Day 2: Android Setup
1. Read [ANDROID_SETUP.md](ANDROID_SETUP.md)
2. Install Android Studio
3. Set environment variables
4. Create AVD
5. Run `./check-android-setup.sh`
6. Run `./run-android.sh`

### Day 3: Development
1. Use [mobile/ANDROID_QUICK_START.md](mobile/ANDROID_QUICK_START.md)
2. Start developing features
3. Refer to [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) for data models

---

## 🔍 Find What You Need

### "How do I start the app?"
→ [START_APP.md](START_APP.md)

### "How do I set up Android?"
→ [ANDROID_SETUP.md](ANDROID_SETUP.md)

### "What was configured for Android?"
→ [ANDROID_SETUP_SUMMARY.md](ANDROID_SETUP_SUMMARY.md)

### "Quick Android commands?"
→ [mobile/ANDROID_QUICK_START.md](mobile/ANDROID_QUICK_START.md)

### "Is my Android setup correct?"
→ Run `cd mobile && ./check-android-setup.sh`

### "What's the database structure?"
→ [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)

### "How do I troubleshoot?"
→ [START_APP.md](START_APP.md) or [ANDROID_SETUP.md](ANDROID_SETUP.md) troubleshooting sections

---

## ⚡ Most Used Commands

```bash
# Verify Android setup
cd mobile && ./check-android-setup.sh

# Start backend
cd backend && ./run.sh

# Run on Android (automated)
cd mobile && ./run-android.sh

# Run on iOS
cd mobile && npm start  # then press 'i'

# Check running emulators
adb devices

# List available AVDs
emulator -list-avds
```

---

## 📞 Support Resources

1. **Documentation:** This index and linked guides
2. **Verification:** `./check-android-setup.sh`
3. **Troubleshooting:** See individual guide troubleshooting sections
4. **API Reference:** [README.md](README.md) - API Endpoints section

---

**Last Updated:** May 13, 2026

**Quick Start:** [START_APP.md](START_APP.md) | **Android Setup:** [ANDROID_SETUP.md](ANDROID_SETUP.md)
