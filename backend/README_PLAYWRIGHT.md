# Playwright Setup Guide

## Quick Setup

Run the setup script:

```bash
cd backend
./setup_playwright.sh
```

Or manually:

```bash
cd backend
source .venv/bin/activate
pip install playwright==1.40.0
python -m playwright install chromium
```

## Verify Installation

```bash
source .venv/bin/activate
python -c "from playwright.async_api import async_playwright; print('✅ Playwright ready')"
```

## Common Issues

### Issue: `playwright: command not found`

**Solution:** Use `python -m playwright` instead of just `playwright`

```bash
# ❌ Wrong
playwright install chromium

# ✅ Correct
python -m playwright install chromium
```

### Issue: Module not found

**Solution:** Make sure you're in the virtual environment

```bash
source .venv/bin/activate
python -m playwright install chromium
```

### Issue: Browser download fails

**Solution:** Check internet connection and try again

```bash
python -m playwright install chromium --force
```

## What Gets Installed

- **Playwright Python package** → Installed via pip
- **Chromium browser** → Downloaded to `~/.cache/ms-playwright/chromium-1091`
- **FFMPEG** → Downloaded for video/audio support

## Browser Locations

- Chromium: `~/.cache/ms-playwright/chromium-1091/`
- FFMPEG: `~/.cache/ms-playwright/ffmpeg-1009/`

## Usage in Code

```python
from playwright.async_api import async_playwright

async with async_playwright() as p:
    browser = await p.chromium.launch(headless=False)
    # ... use browser
```

---

**Last Updated:** 2026-01-15

