# 🚗 Accorria — Pricing & Product Flow (FINAL, LOCKED)

> **Purpose:** This doc defines the **official pricing**, **feature entitlements**, and the **end-to-end user flow** used by Accorria.  
> **Note:** Anywhere you see "analysts," replace with **"posts."** We do **not** sell "scans" or "analysts."

---

**Definitions**
- **Post** = 1 *unique vehicle listing* generated and pushed by the app (new VIN/plate or new image bundle counts as a new post). Edits don't consume a new post.
- **Messenger Bot** = AI replies to buyer messages using your rules (price floor, availability, location). It **notifies the seller at key moments** (appointment set, serious buyer detected).
- **FlipScore** = AI score estimating resale potential based on photos, text, title status, mileage, comps, and seasonality.

---

## 🧭 User Flow (What Actually Happens)

**Persona: "Samantha" wants to sell her car.**
1. **Upload**: Samantha uploads **5–12 photos** (front, back, sides, interior, dash/odo).  
2. **Describe (short form)**: One-line input like:  
   > "2014 Chevy Cruze, 148k miles, rebuilt title? What should I list it for?"  
3. **AI Vision + Parse** *(no scraping)*:  
   - Detects **features** from photos (e.g., black leather, infotainment/nav, rear screens).  
   - Parses short text for **year/make/model/miles/title**.  
   - Pulls **market comps** (allowed sources/APIs) to estimate value range.  
4. **Pricing Options (3-tier)**:  
   - **Quick Sale** (sell fast): lowest reasonable price.  
   - **Market Price** (balanced): median comps for average time-to-sale.  
   - **Top Dollar** (wait longer): premium list price with justification.  
5. **FlipScore**: Shows **0–100** score and plain-English rationale (title status impact, mileage, trim, photo quality, seasonal demand).  
6. **AI Listing (Preview)**:  
   - Clean title/trim/mileage/feature bullets, formatted description, CTAs, disclosure (e.g., rebuilt title).  
   - Auto-detects missing details and **prompts** Samantha to confirm (miles, trim, title).  
7. **Post Flow (no automation, user-approved)**:  
   - Click **"Get My Listing"** (recommended CTA text).  
   - App **opens Facebook Marketplace create-listing** page (mobile/desktop).  
   - Samantha **pastes** the generated title/description and uploads the same photos.  
   - (Future: OfferUp/Craigslist deep-links; still **user-approved**, no scraping.)  
8. **Messenger Bot**:  
   - Connects to Samantha's Messenger.  
   - Uses her **price floor**, **availability window**, **meetup location**, and **negotiation rules**.  
   - **Handles common buyer questions** (available? lowest price? accidents? VIN?).  
   - **Notifies** Samantha only when it matters (serious buyer, appointment set).  
   - **1-hour reminder** to both buyer and Samantha before meetup; sends **"still good?"** confirmation.  
9. **After-Sale** (optional):  
   - Mark **Sold** → logs sale price, days-to-sell, buyer source, and messages outcome.  
   - Updates FlipScore model for learning.

**No Scraping / No Puppeteer / No Playwright (MVP)**  
- Every action is **user-approved** and **manual where required** by platform rules.  
- We provide **copy-ready** content, **price ranges**, and **deep links** where permitted.

---

## 🧩 Product Copy (Use in UI — fixes the "analysts" confusion)

- Button (primary): **Get My Listing**
- Secondary CTA: **Show Price Options**
- Section headers: **Your FlipScore**, **Listing Preview**, **Choose Your Price Strategy**
- Empty-state hint: "Add 5–12 photos for best results (front/back/sides/interior/odometer)."
- Messenger note: "**Messenger Bot is included** and follows your rules. You approve key actions."

---

## 🏷️ Recommended CTA/Copy (Marketing)

- Headline: **"Upload photos. We'll flip the rest."**
- Sub: **"Price smarter, post faster, and let AI handle buyer messages."**
- Trust line: **"No scraping. You approve every step."**

---
