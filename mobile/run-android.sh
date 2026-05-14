#!/bin/bash

# FarmTime - Android Simulator Setup & Run Script
# This script checks for Android SDK, starts an emulator, and runs the app

set -e

echo "🤖 FarmTime Android Setup & Run Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo "ℹ️  $1"
}

# Check if Android SDK is installed
check_android_sdk() {
    if [ -z "$ANDROID_HOME" ]; then
        print_error "ANDROID_HOME is not set!"
        echo ""
        echo "Please install Android Studio and set up ANDROID_HOME:"
        echo "1. Download Android Studio from: https://developer.android.com/studio"
        echo "2. Install Android Studio"
        echo "3. Add to your ~/.zshrc or ~/.bash_profile:"
        echo ""
        echo "   export ANDROID_HOME=\$HOME/Library/Android/sdk"
        echo "   export PATH=\$PATH:\$ANDROID_HOME/emulator"
        echo "   export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
        echo "   export PATH=\$PATH:\$ANDROID_HOME/tools"
        echo "   export PATH=\$PATH:\$ANDROID_HOME/tools/bin"
        echo ""
        echo "4. Run: source ~/.zshrc (or source ~/.bash_profile)"
        echo ""
        exit 1
    fi
    
    print_success "Android SDK found at: $ANDROID_HOME"
}

# Check if emulator command exists
check_emulator() {
    if ! command -v emulator &> /dev/null; then
        print_error "Emulator command not found!"
        echo ""
        echo "Make sure emulator is in your PATH:"
        echo "export PATH=\$PATH:\$ANDROID_HOME/emulator"
        echo ""
        exit 1
    fi
    
    print_success "Emulator command found"
}

# List available AVDs
list_avds() {
    print_info "Checking for Android Virtual Devices (AVDs)..."
    
    if ! command -v avdmanager &> /dev/null; then
        AVDMANAGER="$ANDROID_HOME/cmdline-tools/latest/bin/avdmanager"
        if [ ! -f "$AVDMANAGER" ]; then
            print_warning "avdmanager not found. Using emulator -list-avds instead"
            AVDS=$(emulator -list-avds)
        else
            AVDS=$($AVDMANAGER list avd | grep "Name:" | cut -d ":" -f 2 | xargs)
        fi
    else
        AVDS=$(avdmanager list avd | grep "Name:" | cut -d ":" -f 2 | xargs)
    fi
    
    if [ -z "$AVDS" ]; then
        AVDS=$(emulator -list-avds)
    fi
    
    echo "$AVDS"
}

# Create a new AVD if none exists
create_avd() {
    print_warning "No Android Virtual Devices found!"
    echo ""
    echo "You need to create an AVD using Android Studio:"
    echo "1. Open Android Studio"
    echo "2. Go to Tools > Device Manager (or AVD Manager)"
    echo "3. Click 'Create Virtual Device'"
    echo "4. Choose a device (e.g., Pixel 5)"
    echo "5. Download and select a system image (e.g., API 33 - Android 13)"
    echo "6. Name it (e.g., 'Pixel_5_API_33')"
    echo "7. Click 'Finish'"
    echo ""
    read -p "Press Enter after creating an AVD, or Ctrl+C to exit..."
}

# Start emulator
start_emulator() {
    local avd_name=$1
    
    # Check if emulator is already running
    if adb devices | grep -q "emulator"; then
        print_success "Android emulator is already running!"
        return 0
    fi
    
    print_info "Starting Android emulator: $avd_name"
    echo "This may take a minute..."
    
    # Start emulator in background
    nohup emulator -avd "$avd_name" > /dev/null 2>&1 &
    
    # Wait for emulator to boot
    print_info "Waiting for emulator to boot..."
    adb wait-for-device
    
    # Wait for boot to complete
    while [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
        sleep 2
    done
    
    print_success "Emulator is ready!"
}

# Main execution
main() {
    # Step 1: Check Android SDK
    check_android_sdk
    
    # Step 2: Check emulator
    check_emulator
    
    # Step 3: List and select AVD
    AVDS=$(list_avds)
    
    if [ -z "$AVDS" ]; then
        create_avd
        AVDS=$(list_avds)
        
        if [ -z "$AVDS" ]; then
            print_error "Still no AVDs found. Please create one in Android Studio."
            exit 1
        fi
    fi
    
    # Convert to array
    AVD_ARRAY=($AVDS)
    
    if [ ${#AVD_ARRAY[@]} -eq 1 ]; then
        AVD_NAME=${AVD_ARRAY[0]}
        print_info "Found AVD: $AVD_NAME"
    else
        echo ""
        print_info "Available AVDs:"
        for i in "${!AVD_ARRAY[@]}"; do
            echo "  $((i+1)). ${AVD_ARRAY[$i]}"
        done
        echo ""
        read -p "Select AVD number (or press Enter for first one): " selection
        
        if [ -z "$selection" ]; then
            selection=1
        fi
        
        AVD_NAME=${AVD_ARRAY[$((selection-1))]}
    fi
    
    # Step 4: Start emulator
    start_emulator "$AVD_NAME"
    
    # Step 5: Start Expo
    echo ""
    print_success "Starting Expo development server..."
    echo ""
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        print_info "Installing dependencies..."
        npm install
    fi
    
    # Start Expo with Android flag
    npm run android
}

# Run main function
main
