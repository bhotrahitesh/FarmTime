#!/bin/bash

# Increase file watcher limit for macOS
ulimit -n 65536

echo "Starting FarmTime Mobile App..."
echo ""

# Check if watchman is installed (helps with file watching)
if ! command -v watchman &> /dev/null; then
    echo "⚠️  Watchman not installed. Installing via Homebrew..."
    echo "This will help prevent 'too many open files' errors."
    brew install watchman
fi

echo ""
echo "After the app starts, you can:"
echo "  - Press 'i' for iOS Simulator"
echo "  - Press 'a' for Android Emulator"
echo "  - Scan QR code with Expo Go app on your phone"
echo ""

# Use watchman if available
if command -v watchman &> /dev/null; then
    watchman shutdown-server 2>/dev/null
    watchman watch-del-all 2>/dev/null
fi

npx expo start --clear
