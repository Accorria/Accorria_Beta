# 🧪 Manual Testing Guide - QuickFlip MVP

**Purpose:** Test that the system correctly distinguishes between different vehicles and extracts detailed information from photos.

---

## 🎯 Test Objectives

1. **Verify Image Analysis Works**
   - Photos are analyzed correctly
   - Detailed information is extracted from photos
   - Features are detected accurately

2. **Verify Market Intelligence Works**
   - Real market data is retrieved from Google Search
   - Prices are accurate and realistic
   - Data source is clearly marked

3. **Verify Vehicle Distinction**
   - System correctly identifies different vehicles
   - Analysis results are unique for each vehicle
   - No cross-contamination between vehicles

---

## 📋 Pre-Test Checklist

- [ ] Backend is running on `http://localhost:8000`
- [ ] Frontend is running on `http://localhost:3000`
- [ ] Redis is running (for caching)
- [ ] API keys are configured:
  - [ ] `GEMINI_API_KEY` is set
  - [ ] `OPENAI_API_KEY` is set
- [ ] Test images are ready (at least 2 different vehicles)

---

## 🧪 Test Procedure

### Test 1: Single Vehicle Analysis

**Goal:** Verify basic analysis works for one vehicle.

1. **Open Frontend**
   - Navigate to `http://localhost:3000`
   - Go to "Create Listing" or "Coordinate" feature

2. **Upload Vehicle Photos**
   - Upload 5-12 photos of a single vehicle
   - Include photos showing:
     - Exterior (front, back, sides)
     - Interior (dashboard, seats, controls)
     - Badges/emblems (make, model, trim)
     - Features (sunroof, touchscreen, etc.)

3. **Enter Vehicle Information**
   - Make: (e.g., "Honda")
   - Model: (e.g., "Civic")
   - Year: (e.g., "2015")
   - Mileage: (e.g., "100000")
   - Price: (e.g., "12000")
   - Title Status: "Clean"

4. **Submit Analysis**
   - Click "Analyze" or "Coordinate"
   - Wait for analysis to complete (35-45 seconds first time)

5. **Verify Results**
   - [ ] Analysis completed successfully
   - [ ] Detected make matches your input (or is close)
   - [ ] Detected model matches your input (or is close)
   - [ ] Detected year matches your input (within 1-2 years)
   - [ ] Features are detected (check list of features)
   - [ ] Market average is shown (should be realistic)
   - [ ] Data source is "google_search_grounding" (not "estimated")
   - [ ] Price warnings are shown (if price is too high/low)

6. **Check Backend Logs**
   - Look for: `[ENHANCED-ANALYZE] ✅ Gemini Vision API call completed successfully`
   - Look for: `[MARKET-INTEL] ✅ REAL MARKET DATA from structured JSON`
   - Look for: `[ENHANCED-ANALYZE] ✅ PARALLEL execution completed`

---

### Test 2: Different Vehicles (Vehicle Distinction)

**Goal:** Verify system can distinguish between different vehicles.

1. **First Vehicle - Vehicle A**
   - Upload photos of Vehicle A (e.g., 2015 Honda Civic)
   - Enter information for Vehicle A
   - Submit analysis
   - **Record Results:**
     - Detected make: ___________
     - Detected model: ___________
     - Detected year: ___________
     - Detected trim: ___________
     - Features detected: ___________
     - Market average: $___________
     - Data source: ___________

2. **Second Vehicle - Vehicle B**
   - Upload photos of Vehicle B (e.g., 2018 Toyota Camry)
   - Enter information for Vehicle B
   - Submit analysis
   - **Record Results:**
     - Detected make: ___________
     - Detected model: ___________
     - Detected year: ___________
     - Detected trim: ___________
     - Features detected: ___________
     - Market average: $___________
     - Data source: ___________

3. **Third Vehicle - Vehicle C** (Optional)
   - Upload photos of Vehicle C (e.g., 2016 Ford F-150)
   - Enter information for Vehicle C
   - Submit analysis
   - **Record Results:**
     - Detected make: ___________
     - Detected model: ___________
     - Detected year: ___________
     - Detected trim: ___________
     - Features detected: ___________
     - Market average: $___________
     - Data source: ___________

4. **Compare Results**
   - [ ] Vehicle A make ≠ Vehicle B make (if different vehicles)
   - [ ] Vehicle A model ≠ Vehicle B model (if different vehicles)
   - [ ] Vehicle A market average ≠ Vehicle B market average
   - [ ] Vehicle A features ≠ Vehicle B features (if different vehicles)
   - [ ] No cross-contamination (Vehicle A data doesn't appear in Vehicle B)

---

### Test 3: Same Model, Different Years

**Goal:** Verify system can distinguish between different years of same model.

1. **First Vehicle - 2015 Model**
   - Upload photos of 2015 Honda Civic
   - Enter information: Year = "2015"
   - Submit analysis
   - **Record Results:**
     - Detected year: ___________
     - Market average: $___________

2. **Second Vehicle - 2018 Model**
   - Upload photos of 2018 Honda Civic
   - Enter information: Year = "2018"
   - Submit analysis
   - **Record Results:**
     - Detected year: ___________
     - Market average: $___________

3. **Compare Results**
   - [ ] Detected years are different (2015 vs 2018)
   - [ ] Market averages are different (2018 should be higher)
   - [ ] Features may be different (newer model may have more features)

---

### Test 4: Same Model, Different Trims

**Goal:** Verify system can distinguish between different trims.

1. **First Vehicle - Base Trim**
   - Upload photos of Honda Civic LX
   - Enter information: Trim = "LX"
   - Submit analysis
   - **Record Results:**
     - Detected trim: ___________
     - Features detected: ___________

2. **Second Vehicle - Sport Trim**
   - Upload photos of Honda Civic Sport
   - Enter information: Trim = "Sport"
   - Submit analysis
   - **Record Results:**
     - Detected trim: ___________
     - Features detected: ___________

3. **Compare Results**
   - [ ] Detected trims are different (LX vs Sport)
   - [ ] Features are different (Sport may have more features)
   - [ ] Market averages may be different (Sport may be higher)

---

### Test 5: Market Data Accuracy

**Goal:** Verify market data is accurate and from real sources.

1. **Test with Known Vehicle**
   - Use a vehicle you know the market value for
   - Upload photos and enter information
   - Submit analysis

2. **Verify Market Data**
   - [ ] Market average is within 20% of actual market value
   - [ ] Price range (low/high) is reasonable
   - [ ] Data source is "google_search_grounding" (not "estimated")
   - [ ] Number of prices found is reported (if available)

3. **Check Backend Logs**
   - Look for: `[MARKET-INTEL] ✅ REAL MARKET DATA from structured JSON`
   - Look for: `[MARKET-INTEL] ✅ Extracted X prices from Google search`
   - Should NOT see: `[MARKET-INTEL] ⚠️  Google Search didn't return usable prices`

---

### Test 6: Feature Detection

**Goal:** Verify features are detected accurately from photos.

1. **Test with Vehicle with Known Features**
   - Use a vehicle you know has specific features (e.g., sunroof, backup camera)
   - Upload photos showing those features clearly
   - Submit analysis

2. **Verify Feature Detection**
   - [ ] Features that are clearly visible are detected
   - [ ] Confidence scores are high (≥0.7) for visible features
   - [ ] Features that are not visible are not detected (or have low confidence)

3. **Check Analysis JSON**
   - Look at `analysis_json` in response
   - Check `features` section for detected features
   - Check confidence scores

---

## ✅ Success Criteria

### Must Pass (Before Production)
- [ ] **Vehicle Distinction:** System correctly identifies different vehicles
- [ ] **Market Data:** Real market data is used (not estimates)
- [ ] **Feature Detection:** Features are detected from photos
- [ ] **API Reliability:** All APIs work correctly
- [ ] **Error Handling:** Errors are handled gracefully

### Should Pass (Ideal)
- [ ] **Accuracy:** Detected make/model/year matches actual vehicle
- [ ] **Market Accuracy:** Market average is within 20% of actual value
- [ ] **Feature Accuracy:** Features detected match actual vehicle
- [ ] **Performance:** First request <45 seconds, cached <15 seconds

---

## 🐛 Troubleshooting

### Issue: Analysis fails
- **Check:** Backend logs for errors
- **Check:** API keys are configured
- **Check:** Images are valid (JPG/PNG format)
- **Fix:** Check error message in response

### Issue: Market data is "estimated"
- **Check:** Google Search API is working
- **Check:** Backend logs for Google Search errors
- **Check:** API key is valid
- **Fix:** May need to wait and retry (API may be rate-limited)

### Issue: Features not detected
- **Check:** Photos show features clearly
- **Check:** Confidence scores in analysis JSON
- **Fix:** Upload better photos showing features

### Issue: Vehicles not distinguished
- **Check:** Different photos are uploaded for each vehicle
- **Check:** Analysis results are unique
- **Fix:** Clear cache and retry

---

## 📊 Test Results Template

```
Test Date: ___________
Tester: ___________

Test 1: Single Vehicle Analysis
- Vehicle: ___________
- Result: ✅ Pass / ❌ Fail
- Notes: ___________

Test 2: Different Vehicles
- Vehicle A: ___________
- Vehicle B: ___________
- Result: ✅ Pass / ❌ Fail
- Notes: ___________

Test 3: Same Model, Different Years
- Year 1: ___________
- Year 2: ___________
- Result: ✅ Pass / ❌ Fail
- Notes: ___________

Test 4: Same Model, Different Trims
- Trim 1: ___________
- Trim 2: ___________
- Result: ✅ Pass / ❌ Fail
- Notes: ___________

Test 5: Market Data Accuracy
- Vehicle: ___________
- Market Average: $___________
- Actual Value: $___________
- Result: ✅ Pass / ❌ Fail
- Notes: ___________

Test 6: Feature Detection
- Vehicle: ___________
- Features Tested: ___________
- Result: ✅ Pass / ❌ Fail
- Notes: ___________

Overall Result: ✅ Pass / ❌ Fail
```

---

## 🚀 Next Steps

After completing tests:
1. Review test results
2. Fix any critical issues
3. Re-test to verify fixes
4. Document any known issues
5. Proceed to production deployment

