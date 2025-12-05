# Playwright Posting Testing Plan

## Recommended Testing Approach

### ✅ Step 1: Check Facebook App Configuration (5 minutes)

**Before testing, verify:**

1. **Facebook App Dashboard:**
   - Go to [Facebook Developers](https://developers.facebook.com/apps/)
   - Select your Accorria app
   - Check **Settings → Basic:**
     - App ID is set
     - App Secret is set
   - Check **Facebook Login → Settings:**
     - Valid OAuth Redirect URIs includes:
       - `http://localhost:8000/api/v1/auth/facebook/callback` (local backend)
       - `https://accorria.com/api/v1/auth/facebook/callback` (production backend - if using separate domain)
       - OR `http://localhost:3000/auth/facebook/callback` (if frontend handles callback)

2. **Backend `.env` file:**
   ```bash
   FACEBOOK_APP_ID=your-app-id
   FACEBOOK_APP_SECRET=your-app-secret
   FACEBOOK_REDIRECT_URI=http://localhost:8000/api/v1/auth/facebook/callback
   TOKEN_ENCRYPTION_KEY=your-key-here
   ```

**Note:** The redirect URI must match exactly what's in Facebook App settings!

### ✅ Step 2: Test Locally First (Recommended)

**Why test locally first:**
- Easier to debug
- Browser opens on your machine
- Can see errors immediately
- No deployment needed

**Steps:**

1. **Start Backend:**
   ```bash
   cd backend
   source .venv/bin/activate
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend (separate terminal):**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test OAuth Connection:**
   - Open `http://localhost:3000`
   - Log in to Accorria
   - Go to platform connections
   - Click "Connect Facebook"
   - Complete OAuth flow
   - Verify connection shows as connected

4. **Test Playwright Posting:**
   - Create a test listing
   - Click "Post to Facebook Marketplace"
   - Browser should open automatically
   - Form should fill automatically
   - Review and click "Post" manually

### ✅ Step 3: Fix Any Issues Locally

**Common issues to check:**
- OAuth redirect URI mismatch
- Missing environment variables
- Playwright browser not installed
- Form selectors not working (Facebook DOM may have changed)

### ✅ Step 4: Push to Production (After Local Works)

**Only after local testing works:**

1. **Update Facebook App:**
   - Add production redirect URI
   - Verify App ID/Secret are correct

2. **Update Environment Variables:**
   - Set production `FACEBOOK_REDIRECT_URI`
   - Deploy backend with updated env vars

3. **Deploy:**
   ```bash
   # Push code
   git add .
   git commit -m "Add Playwright Marketplace posting"
   git push

   # Deploy backend (your deployment process)
   # Deploy frontend (your deployment process)
   ```

4. **Test in Production:**
   - Connect Facebook account (production)
   - Test Playwright posting
   - Verify browser opens (may need server with display or headless mode)

## Testing Checklist

### Pre-Testing
- [ ] Facebook App created
- [ ] App ID and Secret set in `.env`
- [ ] Redirect URI configured in Facebook App
- [ ] Redirect URI matches `.env` file
- [ ] Token encryption key set
- [ ] Playwright browsers installed

### OAuth Testing
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] User can log in to Accorria
- [ ] "Connect Facebook" button works
- [ ] OAuth popup opens
- [ ] User can authorize Accorria
- [ ] Redirect works correctly
- [ ] Connection status shows as connected
- [ ] Token stored in database

### Playwright Posting Testing
- [ ] User can create a listing
- [ ] "Post to Marketplace" button works
- [ ] API endpoint responds
- [ ] Browser opens automatically
- [ ] Browser navigates to Marketplace form
- [ ] Form fields are filled (title, price, description)
- [ ] Vehicle fields are filled (make, model, year, mileage)
- [ ] Images are uploaded
- [ ] Screenshot is saved
- [ ] Browser stays open
- [ ] User can review form
- [ ] User can edit fields
- [ ] User can click "Post" manually
- [ ] Listing appears on Facebook Marketplace

## Quick Test Command

Test the endpoint directly:

```bash
curl -X POST http://localhost:8000/api/v1/facebook/post-to-marketplace-playwright \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Listing",
    "description": "Test description",
    "price": 10000,
    "make": "Honda",
    "model": "Civic",
    "year": 2020,
    "mileage": 50000,
    "condition": "GOOD"
  }'
```

## What to Test

### ✅ Must Work
- Browser opens
- Form fills with data
- Images upload
- User can click "Post"

### ⚠️ May Need Adjustment
- Form field selectors (Facebook DOM may change)
- Image upload selectors
- Login detection

### 🔄 Future Enhancements
- Auto-detect posting success
- Auto-close browser after posting
- Better error handling
- Progress updates to frontend

## Recommended Order

1. **Check Facebook App config** ← Start here
2. **Test OAuth locally**
3. **Test Playwright locally**
4. **Fix any issues**
5. **Push to production**
6. **Test in production**

---

**Recommendation:** Test locally first, then push. This is faster and easier to debug!
