# Login to Expo CLI with GitHub Account

If you signed up for Expo using GitHub and don't have a password, you can still login to the CLI!

---

## Method 1: Browser-Based Login (Recommended)

This method opens your browser and uses your GitHub session.

### Step 1: Start Login Process

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
eas login
```

### Step 2: Choose Browser Login

When prompted, you'll see options:
```
? How would you like to authenticate?
  › Log in with your Expo account
  › Sign up for a new Expo account
  › Log in with SSO
```

**Select:** "Log in with your Expo account"

### Step 3: Browser Opens Automatically

- Your browser will open automatically
- You'll see the Expo login page
- Click **"Continue with GitHub"**
- GitHub authenticates you (already logged in)
- Browser shows: "Successfully authenticated!"

### Step 4: Return to Terminal

- Terminal shows: "Logged in as [your-username]"
- You're now authenticated!

---

## Method 2: Manual Browser Authentication

If browser doesn't open automatically:

### Step 1: Run Login Command

```bash
eas login
```

### Step 2: Get Authentication URL

Terminal shows:
```
Opening https://expo.dev/login in your browser...
Or visit: https://expo.dev/login?code=XXXXX
```

### Step 3: Copy and Open URL

1. Copy the URL from terminal
2. Open in your browser manually
3. Click **"Continue with GitHub"**
4. Authorize if prompted
5. See success message

### Step 4: Return to Terminal

Terminal automatically detects authentication and logs you in.

---

## Method 3: Create Expo Password (Optional)

If you want a password for CLI access:

### Step 1: Go to Expo Settings

1. Visit https://expo.dev
2. Sign in with GitHub
3. Click your profile (top right)
4. Click **"Settings"**

### Step 2: Set Password

1. Go to **"Password"** section
2. Click **"Set Password"**
3. Enter new password
4. Confirm password
5. Save

### Step 3: Use Password in CLI

```bash
eas login
# Enter username: your-expo-username
# Enter password: your-new-password
```

---

## Method 4: Use Personal Access Token

For advanced users or CI/CD:

### Step 1: Create Access Token

1. Visit https://expo.dev/accounts/[username]/settings/access-tokens
2. Click **"Create Token"**
3. Name: "CLI Access"
4. Copy the token (save it securely!)

### Step 2: Login with Token

```bash
export EXPO_TOKEN=your-token-here
eas login
```

Or set in environment:
```bash
echo 'export EXPO_TOKEN=your-token-here' >> ~/.zshrc
source ~/.zshrc
```

---

## Troubleshooting

### Issue: Browser Doesn't Open

**Solution:**
```bash
# Get the login URL
eas login

# Copy the URL shown
# Manually open in browser
# Complete authentication
```

### Issue: "Not Logged In" After Browser Auth

**Solution:**
```bash
# Try again
eas logout
eas login

# Or clear credentials
rm -rf ~/.expo
eas login
```

### Issue: "Invalid Credentials"

**Solution:**
- You're trying to use password but signed up with GitHub
- Use browser-based login instead
- Or set a password in Expo settings first

### Issue: Multiple Accounts

**Solution:**
```bash
# Logout first
eas logout

# Then login with correct account
eas login
```

---

## Verify You're Logged In

### Check Current User

```bash
eas whoami
```

Should show:
```
Logged in as: your-username
```

### Check Account Info

```bash
eas account:view
```

Shows your account details.

---

## Quick Reference

### Login Commands

```bash
# Standard login (opens browser)
eas login

# Check who's logged in
eas whoami

# Logout
eas logout

# View account
eas account:view
```

### For Expo Orbit

Expo Orbit uses the same authentication:
1. Click Orbit icon
2. Click "Sign In"
3. Browser opens
4. Click "Continue with GitHub"
5. Done!

---

## Recommended Setup

**For your situation (GitHub account, no password):**

1. **Use browser-based login:**
   ```bash
   eas login
   # Browser opens → Continue with GitHub → Done
   ```

2. **Optionally set a password:**
   - Visit https://expo.dev/settings
   - Set password for future CLI use

3. **Use Expo Orbit:**
   - Already signed in via browser
   - No CLI password needed
   - Visual interface for everything

---

## Your Next Steps

### Right Now:

```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime/mobile
eas login
```

**What happens:**
1. Browser opens automatically
2. You see Expo login page
3. Click "Continue with GitHub"
4. GitHub authenticates you (already logged in)
5. Terminal shows: "Logged in as [username]"
6. You're ready to build!

### Then Build:

```bash
eas build --platform android --profile preview
```

Or use Expo Orbit (already signed in there!).

---

## Why This Works

When you signed up with GitHub:
- ✅ Expo linked your GitHub account
- ✅ No password was created
- ✅ Browser authentication uses GitHub session
- ✅ CLI detects browser authentication
- ✅ You're logged in without password!

---

## Best Practice

**For GitHub-based Expo accounts:**

1. **Use browser login** for CLI (easiest)
2. **Use Expo Orbit** for visual builds (no CLI needed)
3. **Optionally set password** if you prefer traditional login

**You don't need a password if you use browser authentication!**

---

**Ready to login! 🚀**

Just run `eas login` and let the browser handle authentication.
