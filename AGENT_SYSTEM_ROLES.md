# 🚗 Aquaria - 8-Agent System Roles & Responsibilities

**Purpose:** This document defines the complete roles, responsibilities, and workflows for all 8 AI agents in the Aquaria system.

---

## 🎯 **Agent Overview**

Aquaria uses a sophisticated **8-agent AI system** to provide comprehensive car selling assistance while maintaining user control and approval at every step.

### **Agent List:**
1. **Vision Agent** 👁️ - Image Analysis Specialist
2. **Data Extraction Agent** 📝 - Text Parser & Data Structurer  
3. **Market Intelligence Agent** 📊 - Market Research & Pricing Analyst
4. **Pricing Strategy Agent** 💰 - Pricing Optimization Specialist
5. **Content Generation Agent** ✍️ - Listing Content Creator
6. **Messenger Bot Agent** 💬 - Buyer Communication Manager
7. **Orchestrator Agent** 🎼 - Workflow Coordinator & Decision Maker
8. **Learning Agent** 🧠 - Continuous Improvement Specialist

---

## 🧠 **Detailed Agent Roles**

### **1. Vision Agent** 👁️
**Role:** Image Analysis Specialist

**What it does:**
- Analyzes uploaded car photos (5-12 images)
- Detects vehicle features (leather seats, navigation, sunroof, etc.)
- Identifies condition issues (scratches, dents, wear)
- Reads odometer from dashboard photos
- Assesses photo quality and completeness
- Extracts color, trim level, and visual details

**Input:** Car photos
**Output:** Structured data about vehicle features, condition, mileage, visual details

**Tech Stack:** Python + Google Vision API + GPT-4 Vision

---

### **2. Data Extraction Agent** 📝
**Role:** Text Parser & Data Structurer

**What it does:**
- Parses user's text input (e.g., "2014 Chevy Cruze, 148k miles, rebuilt title")
- Extracts year, make, model, mileage, title status
- Identifies additional details (accidents, modifications, etc.)
- Validates data consistency between text and images
- Handles various input formats and abbreviations
- Flags missing or unclear information

**Input:** User text description
**Output:** Structured vehicle data (year, make, model, miles, title, etc.)

**Tech Stack:** Python + Pydantic + OCR

---

### **3. Market Intelligence Agent** 📊
**Role:** Market Research & Pricing Analyst

**What it does:**
- Fetches real-time market comps from KBB, Edmunds, CarGurus
- Analyzes local market demand and supply
- Tracks seasonal price trends
- Identifies geographic pricing differences
- Monitors competitor listings and pricing
- Provides demand forecasting for vehicle types

**Input:** Vehicle data + location
**Output:** Market comps, demand analysis, price trends, competitor data

**Tech Stack:** Node.js + Axios + custom scraper fallback

---

### **4. Pricing Strategy Agent** 💰
**Role:** Pricing Optimization Specialist

**What it does:**
- Calculates 3-tier pricing strategy (Quick Sale, Market Price, Top Dollar)
- Provides pricing rationale for each option
- Considers market conditions, seasonality, and demand
- Factors in vehicle condition and features
- Adjusts for title status and mileage impact
- Recommends optimal pricing for user's goals

**Input:** Vehicle data + market intelligence
**Output:** 3 pricing options with detailed rationale

**Tech Stack:** Python + GPT-4 + custom algorithms

---

### **5. Content Generation Agent** ✍️
**Role:** Listing Content Creator

**What it does:**
- Generates optimized listing titles
- Creates compelling descriptions with feature bullets
- Formats content for different platforms (Facebook, Craigslist, etc.)
- Includes relevant disclosures (rebuilt title, accidents, etc.)
- Optimizes for SEO and search visibility
- Creates platform-specific CTAs and formatting

**Input:** Vehicle data + pricing strategy
**Output:** Complete listing content (title, description, features, CTAs)

**Tech Stack:** Python + GPT-4 + custom prompts

---

### **6. Messenger Bot Agent** 💬
**Role:** Buyer Communication Manager

**What it does:**
- Handles incoming buyer messages automatically
- Responds to common questions (availability, price, VIN, etc.)
- Schedules appointments based on user's availability
- Sends reminders and confirmations
- Identifies serious buyers vs. tire-kickers
- Notifies user only when action is needed
- Manages negotiation within user's price floor

**Input:** Buyer messages + user rules
**Output:** Automated responses, appointment scheduling, user notifications

**Tech Stack:** Python + GPT-4 + custom prompts

---

### **7. Orchestrator Agent** 🎼
**Role:** Workflow Coordinator & Decision Maker

**What it does:**
- Manages the entire user workflow from start to finish
- Coordinates calls to all other agents in the right sequence
- Combines outputs from all agents into final recommendations
- Makes final decisions about what to present to the user
- Handles errors and fallbacks if agents fail
- Manages user session state throughout the process
- Ensures data consistency across all agents

**Input:** User request (photos + text)
**Output:** Complete user experience (pricing options, listing preview, FlipScore)

**Tech Stack:** Python + FastAPI + Redis

---

### **8. Learning Agent** 🧠
**Role:** Continuous Improvement Specialist

**What it does:**
- Tracks outcomes of all listings (sold/not sold, price, time)
- Analyzes which features drive successful sales
- Learns optimal pricing strategies for different vehicles
- Improves FlipScore accuracy based on real outcomes
- Identifies successful content patterns
- Predicts market trends and demand changes
- Optimizes agent performance based on results
- Provides insights for product improvement

**Input:** All user outcomes and market data
**Output:** Improved predictions, recommendations, and system optimization

**Tech Stack:** Python + ML models + PostgreSQL

---

## 🔄 **Complete User Workflow**

### **Example: Samantha's Car Listing Journey**

1. **User Input:** Samantha uploads photos + "2014 Chevy Cruze, 148k miles, rebuilt title? What should I list it for?"

2. **Orchestrator Agent** receives request and starts workflow

3. **Vision Agent** analyzes photos:
   - Detects: Black exterior, cloth interior, navigation system, minor scratches
   - Reads odometer: 148,250 miles
   - Assesses: Good condition, 7/10 photo quality

4. **Data Extraction Agent** parses text:
   - Extracts: 2014, Chevrolet, Cruze, 148k miles, rebuilt title
   - Validates: Consistent with image data
   - Flags: Missing trim level, accident history unclear

5. **Market Intelligence Agent** gets market data:
   - Comps: 2014 Cruze listings $12,000-$18,000
   - Demand: Medium demand, 45-day average time to sell
   - Trends: Prices stable, slight seasonal dip

6. **Pricing Strategy Agent** calculates options:
   - Quick Sale: $13,500 (sell in 2 weeks)
   - Market Price: $15,500 (sell in 6 weeks)  
   - Top Dollar: $17,000 (sell in 12 weeks)

7. **Content Generation Agent** creates listing:
   - Title: "2014 Chevrolet Cruze - Clean, Well-Maintained, Navigation"
   - Description: Feature bullets, condition details, pricing
   - Disclosures: Rebuilt title, mileage verification

8. **Orchestrator Agent** presents to Samantha:
   - FlipScore: 72/100 (good condition, rebuilt title impact)
   - 3 pricing options with rationale
   - Complete listing preview
   - Recommendations for additional photos

9. **Messenger Bot Agent** handles buyers:
   - Responds to "still available?" messages
   - Schedules test drives
   - Sends appointment reminders
   - Notifies Samantha of serious buyers

10. **Learning Agent** tracks outcomes:
    - Records: Sold for $15,200 in 8 days
    - Learns: Rebuilt title cars sell faster at 10% discount
    - Updates: FlipScore model for similar vehicles
    - Optimizes: Pricing recommendations for Cruze models

---

## 🎯 **Agent Communication Flow**

```
User Request
     ↓
Orchestrator Agent
     ↓
Vision Agent ←→ Data Extraction Agent
     ↓
Market Intelligence Agent
     ↓
Pricing Strategy Agent
     ↓
Content Generation Agent
     ↓
Orchestrator Agent (Final Decision)
     ↓
User Experience + Messenger Bot Agent
     ↓
Learning Agent (Continuous Improvement)
```

---

## 💡 **Key Benefits of Multi-Agent System**

1. **Specialized Expertise** - Each agent focuses on specific tasks
2. **Coordinated Intelligence** - Agents work together for comprehensive analysis
3. **Scalable Architecture** - Easy to add new agents or modify existing ones
4. **Continuous Learning** - Learning agent improves system over time
5. **Fault Tolerance** - If one agent fails, others continue working
6. **User Control** - All actions are user-approved, no automation without permission

---

## 🔧 **Technical Implementation Notes**

- **Backend:** FastAPI with agent orchestration
- **Database:** PostgreSQL for agent state and learning data
- **Caching:** Redis for agent communication and performance
- **Task Queue:** Celery for background agent processing
- **API Integration:** OpenAI, Google Vision, market data APIs
- **Real-time Processing:** < 30 second response times
- **Error Handling:** Graceful fallbacks if agents fail

---

## 📋 **Development Priorities**

### **Phase 1 (Core Agents):**
- ✅ Vision Agent - Image analysis
- ✅ Data Extraction Agent - Text parsing
- ✅ Market Intelligence Agent - Market data
- ✅ Pricing Strategy Agent - Pricing options
- ✅ Content Generation Agent - Listing creation

### **Phase 2 (Communication & Coordination):**
- 🔄 Orchestrator Agent - Workflow management
- 🔄 Messenger Bot Agent - Buyer communication

### **Phase 3 (Intelligence & Optimization):**
- 📋 Learning Agent - Continuous improvement
- 📋 Advanced analytics and insights

---

*This document serves as the definitive reference for the Aquaria 8-agent system architecture and should be updated as the system evolves.*
