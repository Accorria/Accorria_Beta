# AI Listing Generation Technical Specification

## 0) Inputs Your App Provides

**images[]:** 4–12 photos (front ¾, rear ¾, interior, cluster if possible, infotainment, seats, sunroof/roof, wheels, cargo)

**user_fields (what you typed):**
- year, make, model (trim optional)
- mileage, title_status, city/state
- asking_price (optional), notes (optional)

**listing_style:** "bullet format w/ emojis" (the template below)

---

## 1) The Two-Pass Flow (Why Your Description Isn't Appearing)

You already have Pass-1 (vision analysis). What's missing is Pass-2 (composition).

I always run:
1. **ANALYZE** (images → facts JSON)
2. **COMPOSE** (facts JSON + user_fields → final listing text)

You should call OpenAI twice per listing with two different prompts and a strict JSON schema in Pass-1.

---

## 2) Pass-1: Analyze Images → Normalized JSON

**Goal:** extract only what's visible, with confidence scores, and never invent.
**Temperature:** 0.0 (we want consistency, not creativity).

### System Message (Analysis)
```
You are an expert vehicle appraiser. Analyze provided car photos.
Return ONLY valid JSON matching the schema. If uncertain, set "present": false and confidence ≤0.4.
Do not speculate. Use visible badges, controls, and design cues.
```

### JSON Schema (Copy As-Is)
```json
{
  "vehicle": {
    "year_guess": {"value": null, "confidence": 0},
    "make": {"value": null, "confidence": 0},
    "model": {"value": null, "confidence": 0},
    "trim": {"value": null, "confidence": 0},
    "drivetrain": {"value": null, "confidence": 0},            // e.g., FWD, AWD, 4x4
    "body_style": {"value": null, "confidence": 0},             // sedan, hatch, SUV, pickup crew cab, etc.
    "transmission": {"value": null, "confidence": 0},           // auto/manual; only if clearly visible
    "engine_hint": {"value": null, "confidence": 0}             // e.g., "TSI badge", "EcoBoost", "V8", only if visible
  },
  "features": {
    "backup_camera": {"present": false, "confidence": 0},
    "parking_sensors": {"present": false, "confidence": 0},
    "sunroof": {"present": false, "confidence": 0},
    "leather_seats": {"present": false, "confidence": 0},
    "heated_seats": {"present": false, "confidence": 0},
    "remote_start": {"present": false, "confidence": 0},
    "apple_carplay_android_auto": {"present": false, "confidence": 0},
    "bluetooth": {"present": false, "confidence": 0},
    "touchscreen": {"present": false, "confidence": 0},
    "third_row": {"present": false, "confidence": 0},
    "alloy_wheels": {"present": false, "confidence": 0},
    "roof_rack": {"present": false, "confidence": 0}
  },
  "condition": {
    "exterior_notes": [{"note": "", "confidence": 0}],          // e.g., "rear bumper scuff", "light curb rash"
    "interior_notes": [{"note": "", "confidence": 0}],          // e.g., "driver bolster wear"
    "tire_tread_estimate": {"value": null, "confidence": 0},    // rough: new/good/fair/low if visible
    "warning_lights_visible": {"present": false, "confidence": 0}
  },
  "photos_quality": {"overall": "good|ok|poor", "missing_angles": []},
  "badges_seen": ["strings like 'SXT', 'Latitude', 'TSI', '4x4'"]
}
```

### User Message (Analysis)
```
include: all images, and your typed line.

Photos of a car + quick line: "2018 Toyota Corolla, 145k, clean". 
Extract what is visible using the schema. If trim is not clearly visible, leave trim null.
```

### What I Look For in the Images (Heuristics the Model Follows)

**Exterior cues:** grille shape, headlight signature, wheel design, rear badge cluster, 4x4/AWD stickers, dual exhaust vs single.

**Interior cues:** infotainment UI style (identifies CarPlay era), heated-seat buttons, dual-zone climate, lane-keep buttons, shifter type, analog vs digital cluster, start/stop button.

**Options:** sunroof frame, leather texture vs cloth pattern, 3rd row (Journey), stow-n-go handles (Caravan), power seat controls.

**Condition:** obvious scuffs/dents, seat wear, headliner stains, cracked glass, aftermarket head unit (trucks), trailer brake controller, bed caps/toppers.

**Don'ts:** no VIN decoding, no assumptions about engine size, no MPG claims.

**Output:** a strict JSON blob. If the model returns text + JSON, you strip to the JSON (or set response_format: { type: "json_object" } if your SDK supports it).

---

## 3) Reconcile Pass (Lightweight Rule Step, Your Code)

Before composing, I merge the JSON with your typed user_fields:

### Rules
- **Year/Make/Model:** trust user_fields over guesses unless the JSON has a higher confidence ≥0.85 and contradicts user input (rare).
- **Trim/Drivetrain:** use JSON if confidence ≥0.7; else use user input if provided; else leave out of prose.
- **Features:** only include features with present=true AND confidence ≥0.6.
- **Condition notes:** include only top 2–4 with confidence ≥0.6.
- **Title status/mileage/location/price:** always from user input.
- **Formatting booleans:** convert true features into human words (e.g., backup_camera → "Backup camera").
- **Safety:** never invent; if a key field is missing, we simply omit that bullet.

This produces a listing_context object you pass to Pass-2.

### Example listing_context
```json
{
  "year": 2018,
  "make": "Toyota",
  "model": "Corolla",
  "trim": null,
  "mileage": 145000,
  "title": "Clean",
  "drivetrain": "FWD",
  "location": "Redford, MI",
  "asking_price": null,
  "features_list": ["Backup camera", "Bluetooth", "Touchscreen", "Alloy wheels"],
  "condition_blurbs": ["Clean interior for the year", "Small rear bumper scuff"],
  "photo_notes": [],
  "style": "emoji_bullets_v1"
}
```

---

## 4) Pass-2: Compose Description → Formatted Post

**Goal:** turn listing_context into the exact card you like.
**Temperature:** 0.2 (keeps tone consistent, a little warmth).

### System Message (Compose)
```
You are a dealership listing writer. Write concise, upbeat posts that maximize clarity and trust.
Only use information provided in the context. Do NOT invent specs or claims.
Keep bullet alignment and emoji style exactly as in the template.
If a field is missing, omit that line; do not add placeholders.
```

### Template (The One You've Been Using)
```
🚙 {year} {make} {model}{trim_optional}
{price_line}
🏁 Mileage: {mileage} miles
📄 Title: {title}
📍 Location: {location}

💡 Details:
• Runs and drives excellent
• Transmission shifts smooth
{detail_fillers_optional}

🔧 Features & Equipment:
{features_bullets}

🔑 {tagline}

📱 Message me to schedule a test drive or ask questions!
```

### Fill Rules

**trim_optional:** prepend a space and trim only if present (e.g., " SXT", " Latitude", " LTZ", " SR Turbo").

**price_line:**
- if asking_price present → 💰 Asking Price: ${price}
- else omit that line entirely.

**detail_fillers_optional:** pick up to 2 tasteful lines based on features/drivetrain/body:
- SUV: "Roomy 2-row crossover with a comfortable ride"
- Truck 4x4: "4x4 capability with solid towing manners"
- Sedan: "Great on gas and easy to maintain"

**features_bullets:** list 4–8 items from features_list, one per line:
• Backup camera / • Apple CarPlay/Android Auto / • Sunroof / • Leather seats / • Heated seats / • Bluetooth, USB / • Cruise control / • Power windows & locks / • Alloy wheels.

**tagline examples:**
- Clean title: "Simple, efficient, and dependable—perfect daily commuter."
- Rebuilt: avoid "budget-friendly" if you asked so; use: "Great on gas, easy to maintain, priced right for the equipment."

### Composition User Message
```
Here is listing_context JSON.
Write the listing using the template above. Keep bullet dots aligned and do not add a "+" after the year.
```

**Output:** plain markdown text of the ad.

---

## 5) Optional: Price Helper (If You Want "Why That Price?")

Add a third, optional call that suggests a price range (no browsing required if you don't want to yet):

**Inputs:** year/make/model/trim, title, mileage, condition tier ("clean for year", "scuffs present"), local city/state.

**Rules:**
- Set a base from wholesale logic (older sedans 2–5k, small SUVs 6–12k, ½-ton trucks 10–25k depending on miles).
- Adjust ± for title (rebuilt −15% to −30%), miles (− for above 120k, + for <60k), features (+ for sunroof/leather on sedans, 4x4 on trucks).

**Return:** `{"ask_suggested": 6500, "range": [6200, 6900], "rationale": "rebuilt title -20%, 120k miles -5%, features +2%"}`

You can then decide to print or just use it internally.

---

## 6) Moderation & Guardrails

- Never assert safety features not visible (airbags count is a common hallucination).
- Don't guarantee financing/warranty unless you feed that text.
- Don't claim "no rust"/"no leaks"—say nothing unless visible.
- If images show warning lights, either omit "no lights" language or add neutral note "No warning lights observed in photo" only if truly visible.

---

## 7) Failure Modes & Quick Fixes

- **Model returns prose instead of JSON in Pass-1** → use response_format: "json_object" or wrap the JSON schema in triple backticks and say "Return ONLY JSON."
- **Features hallucinated** → lower temperature to 0.0 in Pass-1 and enforce confidence threshold ≥0.6.
- **Description empty** → likely you skipped Pass-2 or the compose prompt didn't receive listing_context. Log the raw JSON and the exact prompt payload for debugging.
- **Weird bullets/emoji drift** → include the template verbatim in the compose system message; set temperature 0.2; include a one-sentence rule: "DO NOT alter emoji or bullet symbols."

---

## 8) An End-to-End Example (What Your App Should Do)

**You send:** 8 photos + user_fields `{ "year": 2018, "make": "Dodge", "model": "Journey", "trim": "SXT", "mileage": 120000, "title": "Clean", "location": "Redford, MI", "asking_price": 6500 }`

**Pass-1 returns JSON (abridged):**
```json
{
  "vehicle": {"make":{"value":"Dodge","confidence":0.99},"model":{"value":"Journey","confidence":0.98},"trim":{"value":"SXT","confidence":0.93},"body_style":{"value":"SUV","confidence":0.99},"drivetrain":{"value":"FWD","confidence":0.7}},
  "features": {"backup_camera":{"present":true,"confidence":0.92},"third_row":{"present":true,"confidence":0.88},"bluetooth":{"present":true,"confidence":0.83},"touchscreen":{"present":true,"confidence":0.91},"alloy_wheels":{"present":true,"confidence":0.76}},
  "condition": {"exterior_notes":[{"note":"minor front bumper scuff","confidence":0.74}]}
}
```

**Your reconcile step builds listing_context:**
```json
{
  "year": 2018,
  "make": "Dodge",
  "model": "Journey",
  "trim": "SXT",
  "mileage": 120000,
  "title": "Clean",
  "drivetrain": "FWD",
  "location": "Redford, MI",
  "asking_price": 6500,
  "features_list": ["Backup camera","Touchscreen","Bluetooth","Third-row seating","Alloy wheels"],
  "condition_blurbs": ["Minor front bumper scuff (cosmetic)"],
  "style": "emoji_bullets_v1"
}
```

**Pass-2 outputs exactly:**
```
🚙 2018 Dodge Journey SXT
💰 Asking Price: $6,500
🏁 Mileage: 120,000 miles
📄 Title: Clean
📍 Location: Redford, MI

💡 Details:
• Runs and drives excellent
• Transmission shifts smooth
• Roomy 3-row crossover with a comfortable ride

🔧 Features & Equipment:
• Backup camera
• Touchscreen
• Bluetooth
• Third-row seating
• Alloy wheels

🔑 Great family hauler—easy to maintain and great on gas for its size.

📱 Message me to schedule a test drive or ask questions!
```

That's the same style I've been giving you.

---

## 9) Minimal "Plumbing" to Make It Work (Not Code, Just Structure)

**/analyze (POST):** accepts images[], user_fields; calls OpenAI analysis prompt; returns JSON.

**/compose (POST):** accepts { analysis_json, user_fields }; runs reconcile; calls OpenAI compose prompt; returns final markdown.

**Frontend:**
- show the ad; allow edit before posting; store both the JSON and the final text for transparency.
- if any critical field (year/make/model) in JSON contradicts user input with high confidence → show a one-line "Possible mismatch" banner to the user.

---

## 10) Paste-Ready Checklists for Cursor

### Pass-1 Prompt Blocks to Store
- ANALYZE_SYSTEM
- ANALYZE_USER_TEMPLATE
- ANALYZE_JSON_SCHEMA

### Pass-2 Prompt Blocks to Store
- COMPOSE_SYSTEM
- LISTING_TEMPLATE

### Runtime Parameters
- **Pass-1:** temperature=0.0, max_tokens≈800, response_format=json_object
- **Pass-2:** temperature=0.2, max_tokens≈500

### Thresholds
- FEATURE_CONF_MIN = 0.6
- TRIM_CONF_MIN = 0.7
- OVERRIDE_USER_YEAR_MAKE_MODEL = 0.85 (rare)

