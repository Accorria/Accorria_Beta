# 📊 Accorria Pricing Strategy (Updated – Sept 2025)

This document outlines the subscription tiers, pricing logic, upsell strategy, and instrumentation for Accorria.

---

## 💰 Subscription Tiers

### 🚀 Free Trial
- **7 days OR 3 posts (whichever comes first)**
- Full feature access
- Requires login & data permissions
- **Limits:**
  - Max 3 unique vehicle posts
  - Max 10 auto-replies
  - Cross-post **preview only**

---

### ⭐ Starter — $29/mo
- 3 unique posts per month
- Cross-post to **1 platform only**
- Basic AI listing generation
- Limited auto-replies (fair use cap: ~100/mo)
- **Designed to feel cramped → nudges to Solo**

---

### 🌟 Solo Hustler — $79/mo (Most Popular)
- **10 posts per month**  
- Full cross-posting (FB, OfferUp, Craigslist)  
- Messenger bot access (limited chats)  
- Flip score insights  
- Smart relist + lead CRM  
- **Primary tier (high perceived value)**  

💡 *Positioning:* $3/post at Starter vs. ~$7.90/post at Solo.  
💡 *Psychology:* Saves **5+ hours/listing** (~$150+ value vs. $79 cost).  

---

### 🏆 Dealer Pro — $249/mo
- All Solo features  
- **Unlimited posts**  
- Multiple team seats (3 included, $15/additional seat)  
- Full Messenger automation  
- Auction tools + repair scan  
- Dealer analytics + bulk imports  
- Priority support  

💡 *Positioning:* Enterprise-level → dealerships, bulk sellers, serious hustlers.  
💡 *Psychology:* $249 feels premium but fair compared to staffing costs + time saved.  

---

## 🎯 Strategic Flow

1. **Trial Hook →** Fast activation, user creates 1 listing in <15 min.  
2. **Starter Valve →** Feels restricted at 3 posts → forces decision.  
3. **Solo Hustler Highlight →** Marketed as "Most Popular" → clear $/value balance.  
4. **Dealer Pro →** Premium plan for dealerships & high-volume users.  

📌 **Price Psychology:**  
- $79 = "best value."  
- $249 = "serious business."  

---

## 📊 Data Logging & Instrumentation

### Key Funnels
- `sign_up → photo_upload → ai_listing_generated → listing_published`  
- `inbound_message → auto_reply_sent → lead_captured → crosspost_attempted`  
- `upgrade_cta_viewed → checkout_opened → checkout_completed`  

### Trial → Paid Conversion Drivers
- After 1st lead: upsell unlimited DMs.  
- After 2nd listing: "1 post left—upgrade now."  
- Cross-post preview: soft paywall.  
- Day 6 banner: "Trial ending—keep listings live."  

### Churn Logging
- `cancel_clicked → cancel_reason`  

---

## 🔒 Anti-Abuse & Fair Use

- Unique posts fingerprint = VIN + make/model/year/mileage hash.  
- Device/IP fingerprinting to block repeat free trials.  
- Auto-reply cap enforced server-side (10 for trial, ~100 for Starter).  
- Solo capped at 10 posts → upsell to Dealer if exceeded.  

---

## 🛠 Execution Order (MVP Build)

1. Create Stripe products:  
   - `trial`, `starter_monthly_2900`, `solo_monthly_7900`, `dealer_monthly_24900`  
2. Enforce post/message caps server-side.  
3. Build cross-post preview + soft paywall.  
4. Add event logging (see funnels above).  
5. Configure Day 0 + Day 6 lifecycle emails/SMS.  
6. Highlight $79 plan as "Most Popular" on site.  
7. Trial dashboard: show posts left, messages left, days left.  

---

## 🧪 Experiments to Run

- Trial cap: **3 posts OR 7 days** (test which converts better).  
- Starter: cross-post to **1 platform** vs. preview-only.  
- Solo: 10 vs. 15 posts/month cap.  
- Dealer: $249 flat vs. $199 + usage.  

---

## 🔐 Data Use Policy (Settings Copy)

"We use your listing + engagement data only to improve pricing accuracy and selling speed. We may publish aggregated, anonymized market insights (never personal data). You can opt-out anytime."

