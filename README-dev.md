# Development Setup Guide

This guide covers development tools and automation scripts for Accorria.

## 🎭 Playwright Setup for Facebook Marketplace Bot

The `fb_posting_bot.py` script uses Playwright to automate Facebook Marketplace posting with a human-in-the-loop workflow.

### Installation

1. **Install Playwright Python package:**
   ```bash
   pip install playwright
   ```

   Or add to your requirements:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Install Playwright browsers:**
   ```bash
   playwright install chromium
   ```

   This downloads the Chromium browser that Playwright will use.

### Generating Facebook Session File

Before running the bot, you need to create a `fb_session.json` file that contains your logged-in Facebook session.

**Option 1: Using Playwright Codegen (Recommended)**

```bash
playwright codegen facebook.com --save-storage=fb_session.json
```

This will:
1. Open a browser window
2. Navigate to Facebook
3. **You log in manually** (enter your credentials)
4. After logging in, close the browser
5. Your session will be saved to `fb_session.json`

**Option 2: Manual Session Capture**

If you prefer to capture the session manually:

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context()
    page = context.new_page()
    
    # Navigate to Facebook and log in manually
    page.goto("https://www.facebook.com")
    input("Log in to Facebook, then press Enter...")
    
    # Save the session
    context.storage_state(path="fb_session.json")
    browser.close()
```

### Running the Bot

Once you have `fb_session.json`:

```bash
python scripts/fb_posting_bot.py
```

The bot will:
1. Load your saved Facebook session
2. Navigate to Facebook Marketplace vehicle creation page
3. Auto-fill form fields (title, price, description)
4. Take a screenshot preview
5. **Pause** for you to review and manually click "Post"
6. Close the browser after you confirm

### Security Notes

- **Never commit `fb_session.json` to git** - it contains your authentication cookies
- The session file is already in `.gitignore`
- Keep your session file secure and don't share it
- Sessions may expire - regenerate if the bot stops working

### Troubleshooting

**Bot can't find session file:**
- Make sure `fb_session.json` is in the project root (same directory as `scripts/`)
- Or run from project root: `python scripts/fb_posting_bot.py`

**Fields not filling:**
- Facebook's DOM structure may have changed
- Check the browser console for errors
- You may need to update selectors in `fb_posting_bot.py`

**Session expired:**
- Regenerate `fb_session.json` using the steps above
- Facebook sessions typically last a few days to weeks

**Browser doesn't launch:**
- Make sure you ran `playwright install chromium`
- Check that Playwright is installed: `pip show playwright`

### Next Steps

Once the bot is working:
- Integrate with Accorria database to pull real listing data
- Replace hardcoded values with dynamic data
- Improve DOM selectors for better reliability
- Add image upload support
- Wire into frontend with "Preview + Confirm" UI

## 🛠 Other Development Tools

### Backend Setup

See `backend/requirements.txt` for Python dependencies.

### Frontend Setup

See `frontend/package.json` for Node.js dependencies.

### Database Setup

See `SUPABASE_SETUP_GUIDE.md` for database configuration.

