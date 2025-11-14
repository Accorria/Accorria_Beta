# 🤖 Aquaria - Messenger Bot Rate Limiting Strategy

> **Purpose:** Define how to limit Messenger Bot usage across different subscription tiers while maintaining value for all users.

---

## 🎯 **The Challenge**

- **All plans include Messenger Bot** (baseline replies)
- **Need to limit usage** without breaking the experience
- **Different tiers** need different capabilities
- **Must monetize** while keeping it valuable

---

## 💡 **Rate Limiting Approaches**

### **1. Message Volume Limits**
```
Free Trial: 50 messages/month
Starter: 200 messages/month  
Growth: 1,000 messages/month
Dealer Pro: Unlimited messages
```

### **2. Response Quality Tiers**
```
Free Trial: Basic auto-replies only
Starter: Basic + simple Q&A
Growth: Advanced + suggested replies + auto follow-ups
Dealer Pro: Full automation + approval toggles
```

### **3. Feature-Based Limits**
```
Free Trial: "Available? Price?" only
Starter: + "Accidents? VIN?" 
Growth: + "Schedule meeting" + follow-ups
Dealer Pro: + "Negotiate price" + full automation
```

---

## 🏗️ **Implementation Strategy**

### **1. Database Schema Updates**
```sql
-- Add to profiles table
ALTER TABLE public.profiles ADD COLUMN messages_used INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN messages_limit INTEGER DEFAULT 50;
ALTER TABLE public.profiles ADD COLUMN messenger_tier TEXT DEFAULT 'basic';
```

### **2. Message Counting System**
- Track messages per user per month
- Store in `profiles` table: `messages_used`, `messages_limit`
- Reset counters monthly based on subscription tier

### **3. Response Filtering**
- Check user tier before generating responses
- Limit response complexity based on plan
- Block advanced features for lower tiers

### **4. Upgrade Prompts**
- "You've used 45/50 messages this month"
- "Upgrade to Growth for unlimited messaging"
- "Unlock advanced features with Dealer Pro"

---

## 📊 **Tier-Specific Messenger Features**

### **Free Trial (50 messages/month)**
- ✅ Basic availability responses
- ✅ Price confirmation
- ✅ Simple "yes/no" questions
- ❌ No scheduling
- ❌ No negotiation
- ❌ No follow-ups

### **Starter (200 messages/month)**
- ✅ All Free Trial features
- ✅ Accident history responses
- ✅ VIN lookup responses
- ✅ Basic scheduling (time/date only)
- ❌ No price negotiation
- ❌ No automated follow-ups

### **Growth (1,000 messages/month)**
- ✅ All Starter features
- ✅ Advanced scheduling with location
- ✅ Suggested replies for complex questions
- ✅ Automated follow-ups (24h, 48h)
- ✅ Price negotiation assistance
- ✅ Meeting reminders

### **Dealer Pro (Unlimited messages)**
- ✅ All Growth features
- ✅ Full automation with approval toggles
- ✅ Advanced negotiation strategies
- ✅ Team collaboration features
- ✅ Custom response templates
- ✅ Analytics and insights

---

## 🔧 **Technical Implementation**

### **1. Message Tracking**
```python
# In Messenger Bot Agent
async def process_message(user_id: str, message: str) -> str:
    # Check message limits
    user_profile = await get_user_profile(user_id)
    
    if user_profile.messages_used >= user_profile.messages_limit:
        return "You've reached your monthly message limit. Upgrade to continue using Messenger Bot."
    
    # Increment message count
    await increment_message_count(user_id)
    
    # Generate response based on tier
    return await generate_tiered_response(user_profile.messenger_tier, message)
```

### **2. Response Generation**
```python
async def generate_tiered_response(tier: str, message: str) -> str:
    if tier == 'basic':
        return await generate_basic_response(message)
    elif tier == 'advanced':
        return await generate_advanced_response(message)
    elif tier == 'pro':
        return await generate_pro_response(message)
    else:
        return await generate_basic_response(message)
```

### **3. Upgrade Prompts**
```python
def get_upgrade_prompt(current_usage: int, limit: int) -> str:
    usage_percentage = (current_usage / limit) * 100
    
    if usage_percentage >= 80:
        return "⚠️ You've used {current_usage}/{limit} messages. Upgrade to continue!"
    elif usage_percentage >= 60:
        return "💡 {current_usage}/{limit} messages used. Consider upgrading for unlimited messaging."
    else:
        return ""
```

---

## 🎯 **Recommended Approach**

**Hybrid Strategy:**
1. **Message volume limits** (50/200/1000/unlimited)
2. **Feature-based limits** (basic/advanced/full automation)
3. **Progressive upgrade prompts** (usage-based nudges)

**Benefits:**
- ✅ Clear value progression
- ✅ Easy to understand limits
- ✅ Natural upgrade path
- ✅ Maintains user experience

---

## 📈 **Revenue Impact**

### **Expected Conversion Rates:**
- Free Trial → Starter: 15-20%
- Starter → Growth: 25-30%
- Growth → Dealer Pro: 10-15%

### **Revenue Projections:**
- Month 1: $500-1,000 (basic messaging limits)
- Month 3: $2,000-5,000 (advanced features driving upgrades)
- Month 6: $10,000-25,000 (full automation adoption)

---

## 🚀 **Next Steps**

1. **Database schema updates**
2. **Message tracking implementation**
3. **Tiered response generation**
4. **Upgrade prompt system**
5. **A/B testing different limits**

---

**Last Updated:** January 15, 2025  
**Status:** Planning Phase  
**Owner:** Development Team
