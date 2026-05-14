#!/bin/bash

# FarmTime - Android Setup Verification Script
# This script checks if your Android development environment is properly configured

echo "🔍 FarmTime Android Setup Verification"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ISSUES=0

print_check() {
    echo -e "${BLUE}Checking:${NC} $1"
}

print_pass() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    echo ""
}

print_fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    echo -e "${YELLOW}Fix:${NC} $2"
    echo ""
    ((ISSUES++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARNING:${NC} $1"
    echo ""
}

# Check 1: ANDROID_HOME
print_check "ANDROID_HOME environment variable"
if [ -z "$ANDROID_HOME" ]; then
    print_fail "ANDROID_HOME is not set" "Add to ~/.zshrc: export ANDROID_HOME=\$HOME/Library/Android/sdk"
else
    if [ -d "$ANDROID_HOME" ]; then
        print_pass "ANDROID_HOME is set to: $ANDROID_HOME"
    else
        print_fail "ANDROID_HOME is set but directory doesn't exist: $ANDROID_HOME" "Install Android Studio or correct the path"
    fi
fi

# Check 2: Android SDK
print_check "Android SDK installation"
if [ -d "$HOME/Library/Android/sdk" ]; then
    print_pass "Android SDK found at: $HOME/Library/Android/sdk"
else
    print_fail "Android SDK not found" "Install Android Studio from https://developer.android.com/studio"
fi

# Check 3: emulator command
print_check "Android emulator command"
if command -v emulator &> /dev/null; then
    EMULATOR_PATH=$(which emulator)
    print_pass "Emulator found at: $EMULATOR_PATH"
else
    print_fail "Emulator command not found" "Add to ~/.zshrc: export PATH=\$PATH:\$ANDROID_HOME/emulator"
fi

# Check 4: adb command
print_check "Android Debug Bridge (adb)"
if command -v adb &> /dev/null; then
    ADB_PATH=$(which adb)
    ADB_VERSION=$(adb version | head -n 1)
    print_pass "ADB found at: $ADB_PATH ($ADB_VERSION)"
else
    print_fail "ADB command not found" "Add to ~/.zshrc: export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
fi

# Check 5: AVDs
print_check "Android Virtual Devices (AVDs)"
if command -v emulator &> /dev/null; then
    AVDS=$(emulator -list-avds 2>/dev/null)
    if [ -z "$AVDS" ]; then
        print_fail "No AVDs found" "Create one in Android Studio: Tools > Device Manager > Create Virtual Device"
    else
        AVD_COUNT=$(echo "$AVDS" | wc -l | xargs)
        print_pass "Found $AVD_COUNT AVD(s):"
        echo "$AVDS" | while read -r avd; do
            echo "   - $avd"
        done
        echo ""
    fi
fi

# Check 6: Node.js and npm
print_check "Node.js and npm"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    print_pass "Node.js $NODE_VERSION, npm $NPM_VERSION"
else
    print_fail "Node.js not found" "Install Node.js from https://nodejs.org/"
fi

# Check 7: Expo CLI
print_check "Expo CLI"
if [ -f "package.json" ]; then
    if grep -q "expo" package.json; then
        print_pass "Expo found in package.json"
    else
        print_warning "Expo not found in package.json"
    fi
fi

# Check 8: node_modules
print_check "Dependencies installed"
if [ -d "node_modules" ]; then
    print_pass "node_modules directory exists"
else
    print_warning "node_modules not found. Run: npm install"
fi

# Check 9: Backend connectivity
print_check "Backend server (optional check)"
if command -v curl &> /dev/null; then
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/api/auth/login 2>/dev/null | grep -q "405\|401\|200"; then
        print_pass "Backend is running on http://localhost:8080"
    else
        print_warning "Backend not running. Start it with: cd ../backend && ./run.sh"
    fi
fi

# Check 10: Running emulators
print_check "Currently running emulators"
if command -v adb &> /dev/null; then
    DEVICES=$(adb devices | grep "emulator" | grep "device")
    if [ -z "$DEVICES" ]; then
        echo -e "${BLUE}ℹ️  No emulators currently running${NC}"
        echo ""
    else
        print_pass "Running emulators:"
        echo "$DEVICES"
        echo ""
    fi
fi

# Summary
echo "========================================"
echo ""
if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed!${NC}"
    echo ""
    echo "You're ready to run the Android app:"
    echo -e "${BLUE}  ./run-android.sh${NC}"
    echo ""
else
    echo -e "${RED}⚠️  Found $ISSUES issue(s)${NC}"
    echo ""
    echo "Please fix the issues above, then run this script again."
    echo ""
    echo "Quick fixes:"
    echo "1. Add to ~/.zshrc:"
    echo "   export ANDROID_HOME=\$HOME/Library/Android/sdk"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/emulator"
    echo "   export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
    echo ""
    echo "2. Reload shell:"
    echo "   source ~/.zshrc"
    echo ""
    echo "3. Create AVD in Android Studio:"
    echo "   Tools > Device Manager > Create Virtual Device"
    echo ""
fi

echo "For detailed setup instructions, see:"
echo "  - ../ANDROID_SETUP.md (complete guide)"
echo "  - ANDROID_QUICK_START.md (quick reference)"
echo ""

exit $ISSUES
