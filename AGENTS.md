# 🚗 QuickFlip AI — Agent Registry

_Last Updated: 2025-01-13_

## 1. Listening Agent
**Purpose:** Ingests uploaded images & form data.  
**Tech Stack:** React file-upload hook → Node.js event → RabbitMQ.  
**Next Enhancements:**  
- [ ] Add support for video clips  
- [ ] Real-time upload progress bar  

---

## 2. Vision Agent
**Purpose:** Runs Cloud Vision to detect make/model/color/damage.  
**Stack:** Python + `google-cloud-vision`.  
**Last Updated:** 2025-01-10  
**Notes:**  
- Tweak `confidence_threshold` to 0.7 for Detroit lighting.  

---

## 3. Market Analysis Agent
**Purpose:** Fetch pricing comps from KBB, Edmunds, eBay.  
**Stack:** Node.js + Axios + custom scraper fallback.  
**To Do:**  
- [ ] Integrate CarQuery REST API  
- [ ] Cache results in Redis  

---

## 4. Data Extraction Agent
**Purpose:** Extracts structured data from listings and forms.  
**Stack:** Python + Pydantic + OCR.  
**To Do:**  
- [ ] Implement OCR for handwritten forms  
- [ ] Add support for multiple document types  

---

## 5. Negotiation Agent
**Purpose:** Generates personalized negotiation strategies.  
**Stack:** Python + GPT-4 + custom prompts.  
**To Do:**  
- [ ] Add sentiment analysis for seller messages  
- [ ] Implement A/B testing for message templates  

---

## 6. Orchestrator Agent
**Purpose:** Coordinates all agents and manages workflow.  
**Stack:** Python + FastAPI + Redis.  
**To Do:**  
- [ ] Add workflow state management  
- [ ] Implement retry logic for failed agents  

---

## 7. Learning Agent
**Purpose:** Optimizes system performance based on outcomes.  
**Stack:** Python + ML models + PostgreSQL.  
**To Do:**  
- [ ] Implement outcome tracking  
- [ ] Add performance analytics dashboard  

---

> **How to use:**  
> 1. Open `AGENTS.md` in Cursor.  
> 2. Update the relevant section when you change code.  
> 3. Commit—Cursor will load the latest spec as context for future prompts.

---

✅ **Next Action:**  
Which agent do you want to scope out **first** in code?  
- 🎧 Listening  
- 📸 Vision  
- 💰 Market Analysis  
- 🛠️ Data Extraction  
- 🤝 Negotiation  
- ⚙️ Orchestrator  
- 🔄 Learning  

**Ready for the next step?** Want to tweak the template or deep-dive into an agent's implementation? 🚀 