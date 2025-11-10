# fb_posting_bot.py

"""
Facebook Marketplace Posting Bot with Human-in-the-Loop

This script automates the initial form filling for Facebook Marketplace listings,
then pauses for human confirmation before posting.

Usage:
    python scripts/fb_posting_bot.py

Prerequisites:
    - Playwright installed: pip install playwright && playwright install chromium
    - fb_session.json file with saved Facebook session (see README-dev.md)
"""

from playwright.sync_api import sync_playwright
import os
import sys


def run_bot():
    """Main bot function that automates FB Marketplace posting."""
    
    # Find session file - check current directory and parent directory
    session_file = "fb_session.json"
    if not os.path.exists(session_file):
        # Try parent directory (if running from scripts/)
        parent_session = os.path.join("..", session_file)
        if os.path.exists(parent_session):
            session_file = parent_session
        else:
            print(f"❌ Error: {session_file} not found!")
            print(f"   Please generate it first using:")
            print(f"   playwright codegen facebook.com --save-storage={session_file}")
            print(f"   Then log in and close the browser.")
            print(f"   Place {session_file} in the project root directory.")
            sys.exit(1)
    
    print("🚀 Starting Facebook Marketplace posting bot...")
    print("📋 Loading session from fb_session.json...")
    
    with sync_playwright() as p:
        # Launch browser in non-headless mode so user can see and interact
        browser = p.chromium.launch(headless=False)
        
        # Load saved session state
        context = browser.new_context(storage_state=session_file)
        page = context.new_page()
        
        # Navigate to FB Marketplace vehicle creation page
        print("🌐 Navigating to Facebook Marketplace...")
        page.goto("https://www.facebook.com/marketplace/create/vehicle")
        
        # Wait for page to load
        page.wait_for_load_state("networkidle")
        
        # Autofill listing fields (can improve later with real data)
        print("✍️  Auto-filling listing fields...")
        
        try:
            # Note: These selectors may need adjustment based on FB's actual DOM structure
            # The bot will attempt to fill common field patterns
            
            # Title field
            title_selector = 'input[name="title"], input[placeholder*="title" i], input[aria-label*="title" i]'
            if page.locator(title_selector).count() > 0:
                page.fill(title_selector, "2015 Honda Civic LX")
                print("   ✓ Title filled")
            
            # Price field
            price_selector = 'input[name="price"], input[placeholder*="price" i], input[aria-label*="price" i], input[type="text"][value=""]'
            if page.locator(price_selector).count() > 0:
                page.fill(price_selector, "8900")
                print("   ✓ Price filled")
            
            # Description field
            desc_selector = 'textarea[name="description"], textarea[placeholder*="description" i], textarea[aria-label*="description" i]'
            if page.locator(desc_selector).count() > 0:
                page.fill(desc_selector, "Runs great. 98k miles. Clean title.")
                print("   ✓ Description filled")
            
        except Exception as e:
            print(f"⚠️  Warning: Some fields may not have been filled: {e}")
            print("   You may need to fill them manually.")
        
        # Screenshot for user confirmation
        # Save screenshot in project root (same location as session file)
        screenshot_path = "preview.png"
        if session_file.startswith(".."):
            # If session was in parent, save screenshot there too
            screenshot_path = os.path.join("..", screenshot_path)
        print(f"📸 Taking screenshot: {screenshot_path}")
        page.screenshot(path=screenshot_path, full_page=True)
        
        print("\n" + "="*60)
        print("✅ Listing form filled. Preview saved to preview.png")
        print("⏸  Waiting for human to review and post manually...")
        print("="*60)
        print("\n💡 Instructions:")
        print("   1. Review the filled form in the browser")
        print("   2. Make any adjustments needed")
        print("   3. Click 'Post' or 'Publish' yourself")
        print("   4. Press Enter here after posting to close the browser")
        print()
        
        input("⏸ Press Enter after you post to close browser...")
        
        print("👋 Closing browser...")
        browser.close()
        print("✅ Bot finished successfully!")


if __name__ == "__main__":
    run_bot()

