# Fix: compdef command not found error

## 🔧 The Issue

The error `/dev/fd/12:25: command not found: compdef` occurs when `compdef` is called before the completion system is initialized in your `~/.zshrc` file.

## ✅ Solution

You need to initialize the completion system before any `compdef` commands. Here's how:

### Option 1: Quick Fix (Recommended)

Open your `~/.zshrc` file and add these lines **at the very top** (before any other content):

```bash
# Initialize completion system
autoload -Uz compinit
compinit
```

### Step-by-step:

1. **Open the file:**
   ```bash
   nano ~/.zshrc
   ```

2. **Add these lines at the TOP of the file:**
   ```bash
   # Initialize completion system
   autoload -Uz compinit
   compinit
   ```

3. **Your Android SDK lines should come AFTER:**
   ```bash
   # Initialize completion system
   autoload -Uz compinit
   compinit

   # Android SDK (add these lines)
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```

4. **Save and exit:**
   - Press `Ctrl + X`
   - Press `Y` to confirm
   - Press `Enter`

5. **Apply changes:**
   ```bash
   source ~/.zshrc
   ```

### Option 2: Alternative Fix

If you still get errors, try this safer approach:

```bash
# Open file
nano ~/.zshrc

# Add at the top:
# Enable completion
if [ -f ~/.zsh/completion ]; then
  autoload -Uz compinit
  compinit
fi

# Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## 🎯 Complete ~/.zshrc Template

Here's a clean template for your `~/.zshrc`:

```bash
# Initialize completion system (MUST be at top)
autoload -Uz compinit
compinit

# Android SDK Configuration
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin

# Other configurations can go below...
```

## ✅ Verify It Works

After fixing, verify:

```bash
# Reload shell config
source ~/.zshrc

# Should show no errors

# Verify ANDROID_HOME
echo $ANDROID_HOME
# Should output: /Users/hiteshrajbhotra/Library/Android/sdk

# Verify emulator command
which emulator
# Should output: /Users/hiteshrajbhotra/Library/Android/sdk/emulator/emulator
```

## 🔍 What Happened?

- `compdef` is a zsh completion function
- It requires the completion system to be loaded first
- Adding `autoload -Uz compinit` and `compinit` initializes it
- This must be done **before** any commands that use completions

## 💡 Pro Tip

If you're not sure what's in your `~/.zshrc`, you can view it:

```bash
cat ~/.zshrc
```

Or back it up before editing:

```bash
cp ~/.zshrc ~/.zshrc.backup
```

---

**After fixing, you can proceed with Android setup!**
