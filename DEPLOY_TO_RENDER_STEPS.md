# Step-by-Step: Deploy FarmTime Backend to Render via GitHub

## Prerequisites Checklist
- [ ] GitHub account
- [ ] Render account (free at https://render.com)
- [ ] Neon database credentials ready
- [ ] Git installed on your machine

---

## Step 1: Prepare Your Code

### 1.1 Check Git Status
```bash
cd /Users/hiteshrajbhotra/Documents/Production/FarmTime
git status
```

### 1.2 Add All Files
```bash
git add .
```

### 1.3 Commit Your Changes
```bash
git commit -m "Add Render deployment configuration with Neon database"
```

---

## Step 2: Push to GitHub

### 2.1 Check if Remote Repository Exists
```bash
git remote -v
```

**If you see a GitHub URL**, skip to Step 2.3

**If you see nothing or no GitHub remote**, continue to Step 2.2

### 2.2 Create GitHub Repository (if needed)

1. Go to https://github.com
2. Click the **"+"** icon (top right) → **"New repository"**
3. Repository settings:
   - **Name:** `FarmTime` (or your preferred name)
   - **Visibility:** Private (recommended) or Public
   - **DO NOT** initialize with README, .gitignore, or license
4. Click **"Create repository"**
5. Copy the repository URL (looks like: `https://github.com/yourusername/FarmTime.git`)

6. Add remote to your local repository:
```bash
git remote add origin https://github.com/yourusername/FarmTime.git
```

### 2.3 Push to GitHub
```bash
git push -u origin main
```

**If you get an error about "main" branch**, try:
```bash
git branch -M main
git push -u origin main
```

**If prompted for credentials:**
- Username: Your GitHub username
- Password: Use a Personal Access Token (not your GitHub password)
  - Create token at: https://github.com/settings/tokens
  - Select scopes: `repo` (full control of private repositories)

---

## Step 3: Prepare Neon Database Credentials

### 3.1 Get Your Neon Connection Details

1. Go to https://console.neon.tech
2. Select your FarmTime database project
3. Click **"Connection Details"** or **"Dashboard"**
4. Copy the following information:

**Connection String Format:**
```
postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech:5432/dbname
```

**You'll need:**
- **Host:** `ep-xxx-xxx.region.aws.neon.tech`
- **Database Name:** `your_database_name`
- **Username:** `your_username`
- **Password:** `your_password`

### 3.2 Convert to JDBC Format

Your JDBC URL should look like:
```
jdbc:postgresql://ep-xxx-xxx.region.aws.neon.tech:5432/your_database_name?sslmode=require
```

**IMPORTANT:** Don't forget `?sslmode=require` at the end!

---

## Step 4: Generate JWT Secret

Run this command to generate a secure JWT secret:
```bash
openssl rand -base64 64
```

Copy the output - you'll need it in Step 6.

---

## Step 5: Connect GitHub to Render

### 5.1 Sign Up/Login to Render
1. Go to https://render.com
2. Click **"Get Started"** or **"Sign In"**
3. Choose **"Sign in with GitHub"** (recommended)
4. Authorize Render to access your GitHub account

### 5.2 Grant Repository Access
1. After authorization, Render will ask for repository access
2. Choose **"All repositories"** or **"Only select repositories"**
3. If selecting specific repos, choose your **FarmTime** repository
4. Click **"Install & Authorize"**

---

## Step 6: Deploy Using Blueprint (render.yaml)

### 6.1 Create New Blueprint
1. In Render Dashboard, click **"New +"** (top right)
2. Select **"Blueprint"**

### 6.2 Connect Repository
1. Find your **FarmTime** repository in the list
2. Click **"Connect"**

### 6.3 Configure Blueprint
Render will detect your `render.yaml` file and show:
- **Service Name:** farmtime-backend
- **Type:** Web Service
- **Runtime:** Docker

### 6.4 Add Environment Variables

Before clicking "Apply", you'll see a list of environment variables to configure. Add these values:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `SPRING_DATASOURCE_URL` | Your Neon JDBC URL | `jdbc:postgresql://ep-xxx.neon.tech:5432/farmtime_db?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Your Neon username | `your_neon_username` |
| `SPRING_DATASOURCE_PASSWORD` | Your Neon password | `your_neon_password` |
| `JWT_SECRET` | Generated secret from Step 4 | `abc123xyz...` (64 character string) |
| `CORS_ALLOWED_ORIGINS` | Mobile app origins | `*` (for testing) or `https://yourdomain.com` |

**Click each variable** and enter the value in the text field.

### 6.5 Deploy
1. Review all settings
2. Click **"Apply"** at the bottom
3. Render will start building your application

---

## Step 7: Monitor Deployment

### 7.1 Watch Build Progress
1. You'll be redirected to your service dashboard
2. Click on **"Logs"** tab to see build progress
3. Build process:
   - ✓ Cloning repository
   - ✓ Building Docker image (Stage 1: Maven build)
   - ✓ Building Docker image (Stage 2: Runtime)
   - ✓ Deploying container
   - ✓ Health check

**Build time:** Usually 5-10 minutes for first deployment

### 7.2 Check for Success
Look for these messages in logs:
```
Started FarmTimeApplication in X.XXX seconds
```
```
Tomcat started on port 8080
```

### 7.3 Get Your App URL
1. At the top of the dashboard, you'll see your app URL:
   ```
   https://farmtime-backend-xxxx.onrender.com
   ```
2. Copy this URL - you'll need it for your mobile app

---

## Step 8: Test Your Deployment

### 8.1 Test Health Endpoint
Open in browser or use curl:
```bash
curl https://your-app-name.onrender.com/api/health
```

Expected response:
```json
{
  "status": "UP"
}
```

### 8.2 Test API Endpoints
Try logging in (adjust URL and credentials):
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

---

## Step 9: Update Mobile App Configuration

### 9.1 Update API Base URL
In your mobile app, update the API endpoint:

**File:** `mobile/src/config.js` (or wherever you store config)

```javascript
// Before
export const API_BASE_URL = 'http://localhost:8080';

// After
export const API_BASE_URL = 'https://your-app-name.onrender.com';
```

### 9.2 Update CORS if Needed
If you have a specific mobile app domain, update the environment variable:
1. Go to Render Dashboard → Your Service
2. Click **"Environment"** tab
3. Edit `CORS_ALLOWED_ORIGINS`
4. Add your domain: `https://yourdomain.com`
5. Click **"Save Changes"**

---

## Step 10: Enable Auto-Deploy (Optional)

### 10.1 Configure Auto-Deploy
1. In Render Dashboard → Your Service
2. Go to **"Settings"** tab
3. Scroll to **"Build & Deploy"**
4. **"Auto-Deploy"** should be **"Yes"** by default

Now, every time you push to your `main` branch on GitHub, Render will automatically rebuild and deploy!

---

## Common Issues & Solutions

### Issue 1: Build Fails
**Check:**
- Logs show Maven errors → Check `pom.xml`
- Docker build errors → Check `Dockerfile`
- Path errors → Verify `dockerContext: ./backend` in `render.yaml`

### Issue 2: App Crashes After Deploy
**Check:**
- Environment variables are set correctly
- Neon database URL has `?sslmode=require`
- JWT_SECRET is set
- Check logs for specific error messages

### Issue 3: Database Connection Failed
**Check:**
- Neon database is active (not suspended)
- Connection string format is correct
- Username and password are correct
- `?sslmode=require` is present in URL

### Issue 4: CORS Errors from Mobile App
**Solution:**
- Set `CORS_ALLOWED_ORIGINS=*` for testing
- For production, add your specific domain

### Issue 5: 404 Not Found
**Check:**
- URL is correct: `https://your-app.onrender.com/api/...`
- Health check works: `/api/health`
- Controller mappings are correct

---

## Making Updates After Initial Deployment

### Update Code
```bash
# Make your changes
git add .
git commit -m "Description of changes"
git push origin main
```

Render will automatically detect the push and redeploy (if auto-deploy is enabled).

### Update Environment Variables
1. Render Dashboard → Your Service
2. **"Environment"** tab
3. Edit or add variables
4. Click **"Save Changes"**
5. Service will automatically restart

---

## Important Notes

### Free Tier Behavior
- **Cold Start:** App spins down after 15 minutes of inactivity
- **First Request:** May take 30-50 seconds after spin-down
- **Solution:** Upgrade to paid plan ($7/month) for always-on

### Database Backups
- Neon handles database backups based on your plan
- Check Neon dashboard for backup settings

### Monitoring
- **Logs:** Real-time in Render Dashboard
- **Metrics:** CPU, Memory usage in Dashboard
- **Alerts:** Configure in Render settings

---

## Next Steps

- [ ] Test all API endpoints
- [ ] Update mobile app with production URL
- [ ] Set up proper CORS origins
- [ ] Monitor logs for errors
- [ ] Consider upgrading to paid plan for production
- [ ] Set up database backups
- [ ] Configure custom domain (optional)

---

## Useful Commands

### View Render Logs
```bash
# In Render Dashboard → Logs tab
# Or use Render CLI (install first)
render logs -s farmtime-backend
```

### Redeploy Manually
1. Render Dashboard → Your Service
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Rollback to Previous Version
1. Render Dashboard → Your Service
2. **"Events"** tab
3. Find previous successful deploy
4. Click **"Rollback to this version"**

---

## Support Resources

- **Render Docs:** https://render.com/docs
- **Render Community:** https://community.render.com
- **Neon Docs:** https://neon.tech/docs
- **Spring Boot Docs:** https://spring.io/projects/spring-boot

---

**Deployment Complete! 🎉**

Your FarmTime backend is now live on Render and connected to your Neon database.
