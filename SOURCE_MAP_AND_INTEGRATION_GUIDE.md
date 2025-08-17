# QuickFlips AI — Source Map & Integration Guide

## 🎯 Overview

This document maps out **exactly** how QuickFlips AI works, what comes from our internal playbook vs. external sources, and how to implement each component for a professional, scalable system.

---

## 🧩 Internal Playbook (Our Core Rules)

### **Locked Listing Template**
```
🚗 [Year] [Make] [Model]
💰 Asking Price: $[Price]
🏁 Mileage: [Mileage] miles
📄 Title: [Clean/Rebuilt/Salvage]
📍 Location: [Default: Redford, MI]

💡 Details:
• [6 standard details max]

🔧 Features & Equipment:
• [≤6 detected features max]

🔑 [Standard closing]
📱 Message me to schedule a test drive or ask questions!
```

### **Feature Whitelist & Rules**
- **No invention rule**: Only include features detected with high confidence
- **Max 6 features**: Prevents overwhelming descriptions
- **Standard details**: Always include "Runs and drives excellent", "Smooth-shifting automatic", etc.

### **Merge Precedence Logic**
1. **User input wins** (make, model, year, mileage, price)
2. **Add only high-confidence photo hints** (features, condition)
3. **Never override** user-provided information

### **Pricing Modes**
- **Seller-Net**: net + margin + pad
- **Heuristic**: simple percentage-based pricing
- **Default margin**: $400
- **Default pad**: $300

### **Organization Toggles**
- **Default location**: Redford, MI
- **Price ending style**: round_00 | psych_99 | hybrid
- **Rebuilt factor**: 0.70 (30% discount)
- **Margin**: $400
- **Pad**: $300

---

## 🌐 External Data Sources (Implementation Required)

### **Image Analysis & Deployment**

#### **Google Cloud Vision API**
- **Endpoint**: `images:annotate` (batch image detection)
- **Capabilities**: OCR, label detection, object detection, text extraction
- **Use case**: Reading badges, odometers, detecting features
- **Docs**: [Google Cloud Vision API](https://cloud.google.com/vision/docs/reference/rest/v1/images/annotate)
- **Status**: ✅ Ready to implement

#### **Cloud Run Deployment**
- **Method**: Deploy from source code
- **Command**: `gcloud run deploy --source .`
- **Config**: Environment variables for runtime configuration
- **Docs**: [Cloud Run Source Deployment](https://cloud.google.com/run/docs/deploying-source-code)
- **Status**: ✅ Ready to implement

### **Pricing & Market Data Providers**

#### **MarketCheck API** (Recommended)
- **Capabilities**: Active listings, predicted price endpoints, comps
- **Access**: Public docs + pricing pages
- **Use case**: Clean-title medians, market analysis
- **Docs**: [MarketCheck Cars API](https://www.marketcheck.com/apis/cars/)
- **Status**: 🔄 Research pricing tiers

#### **Vehicle Databases API**
- **Capabilities**: Market Value API (VIN → retail/private/trade-in estimates)
- **Use case**: Alternative to MarketCheck for pricing data
- **Docs**: [Vehicle Market Value API](https://vehicledatabases.com/vehicle-market-value-api)
- **Status**: 🔄 Research pricing tiers

#### **CarsXE API**
- **Capabilities**: Market Value API (VIN → value)
- **Use case**: Alternative pricing data source
- **Docs**: [CarsXE Market Value API](https://api.carsxe.com/vehicle-market-value)
- **Status**: 🔄 Research pricing tiers

#### **Kelley Blue Book API** (Future)
- **Status**: Developer portal exists but requires approval
- **Access**: Controlled/approval-based (not instant)
- **Priority**: "Nice-to-have," not day one
- **Docs**: [KBB Developer Portal](https://developer.kbb.com/)
- **Status**: ⏳ Future consideration

### **Title Status & Pricing Guidance**

#### **Edmunds Research**
- **Source**: Edmunds Help Center and articles
- **Guidance**: Salvage/branded titles reduce value up to ~50% vs. clean
- **Our Standard**: ~30% discount for rebuilt titles (factor: 0.70)
- **Docs**: 
  - [Salvage Title Value](https://help.edmunds.com/hc/en-us/articles/206102547-What-is-the-value-of-a-salvage-title-vehicle)
  - [Salvage Title Overview](https://www.edmunds.com/car-buying/what-is-a-salvage-title-vehicle.html)
- **Status**: ✅ Research complete, using 30% discount

---

## 🔗 Integration Flow (How Everything Connects)

### **1. Enhanced Analysis Flow**
```
User Uploads Images → Google Vision API → Photo Hints + Facts → Merge with User Input → Generate Description
```

**Components:**
- **Vision API**: Detects badges, odometer, features
- **Merge Logic**: User input wins, add high-confidence hints
- **Output**: Structured data for listing generation

### **2. Pricing Flow (Optional)**
```
VIN/Details → Market Data Provider → Clean Title Median → Apply Rebuilt Factor → Price Recommendations
```

**Components:**
- **Market Data**: MarketCheck, Vehicle Databases, or CarsXE
- **Rebuilt Factor**: 0.70 (30% discount) for rebuilt titles
- **Output**: Price recommendations (Quick Sale, Market Price, Top Dollar)

### **3. Listing Generation Flow**
```
Structured Data + Price Data → Apply Template → Format Output → Final Listing
```

**Components:**
- **Template Engine**: Locked listing template
- **Feature Filtering**: Whitelist + confidence thresholds
- **Output**: Paste-ready listing text

---

## 🧭 Implementation Responsibilities

### **What We Do (Internal Logic)**
- ✅ Structure and formatting
- ✅ Bullet points and wording
- ✅ Merge precedence rules
- ✅ Pricing math (Seller-Net vs. Heuristic)
- ✅ Organization toggles
- ✅ Final copy generation

### **What We Look Up (External Integration)**
- 🔄 Service documentation (Vision API, Cloud Run)
- 🔄 Comps providers (what exists & what they return)
- 🔄 Rebuilt-discount guidance (justify default factors)
- 🔄 API pricing and access requirements

---

## ✅ Setup Requirements

### **Organization Configuration**
```json
{
  "location_default": "Redford, MI",
  "price_ending_style": "round_00", // or "psych_99" or "hybrid"
  "rebuilt_factor": 0.70,
  "margin": 400,
  "pad": 300
}
```

### **API Integration Priority**
1. **Google Vision API** (already implemented in enhanced analysis)
2. **Choose ONE comps provider**: MarketCheck OR Vehicle Databases OR CarsXE
3. **Deploy enhanced analysis** to Cloud Run
4. **Configure organization settings**

### **Next Steps**
1. **Pick price ending style**: `round_00`, `psych_99`, or `hybrid`
2. **Research comps provider pricing** (MarketCheck recommended)
3. **Deploy enhanced analysis** with Vision API
4. **Test with real car photos**

---

## 📋 Decision Points

### **Price Ending Style** (Need to choose one)
- **`round_00`**: $12,500, $15,000 (clean, professional)
- **`psych_99`**: $12,499, $14,999 (psychological pricing)
- **`hybrid`**: Mix based on price range

### **Comps Provider** (Need to choose one)
- **MarketCheck**: Most comprehensive, good for listings + comps
- **Vehicle Databases**: Good for market value data
- **CarsXE**: Alternative option

### **Rebuilt Title Factor** (Currently set to 0.70)
- **30% discount**: Based on Edmunds research
- **Adjustable**: Can be exposed as slider (20-40%)

---

## 🚀 Current Status

### **✅ Completed**
- Enhanced image analysis service
- Google Vision API integration
- Locked listing template
- Merge precedence logic
- Basic pricing modes

### **🔄 In Progress**
- Backend deployment with enhanced analysis
- Frontend integration with enhanced endpoint

### **⏳ Next Phase**
- Comps provider integration
- Advanced pricing algorithms
- Organization settings UI
- KBB integration (future)

---

## 📚 References

### **Official Documentation**
- [Google Cloud Vision API](https://cloud.google.com/vision/docs/reference/rest/v1/images/annotate)
- [Cloud Run Source Deployment](https://cloud.google.com/run/docs/deploying-source-code)
- [MarketCheck Cars API](https://www.marketcheck.com/apis/cars/)
- [Vehicle Market Value API](https://vehicledatabases.com/vehicle-market-value-api)
- [CarsXE Market Value API](https://api.carsxe.com/vehicle-market-value)
- [KBB Developer Portal](https://developer.kbb.com/)

### **Research Sources**
- [Edmunds Salvage Title Value](https://help.edmunds.com/hc/en-us/articles/206102547-What-is-the-value-of-a-salvage-title-vehicle)
- [Edmunds Salvage Title Overview](https://www.edmunds.com/car-buying/what-is-a-salvage-title-vehicle.html)

---

*This document serves as the single source of truth for QuickFlips AI implementation strategy and external integrations.*
