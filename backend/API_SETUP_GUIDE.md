# 🚀 Aquaria API Setup Guide

This guide will help you set up the necessary API keys to enable AI-powered car listing generation.

## 📋 Required API Keys

### 1. OpenAI API Key
**Purpose**: AI-powered car analysis, image recognition, and listing generation
**Cost**: Pay-per-use (very affordable for testing)

**How to get it:**
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Click "Create new secret key"
4. Copy the key (it starts with `sk-`)

### 2. Gemini API Key (Google)
**Purpose**: Market intelligence, pricing analysis, and enhanced AI features
**Cost**: Free tier available, then pay-per-use

**How to get it:**
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

## 🔧 Setup Instructions

### Option 1: Interactive Setup (Recommended)
```bash
cd backend
python setup_api_keys.py
```

This will guide you through the setup process interactively.

### Option 2: Manual Setup
1. Edit the `.env` file in the backend directory
2. Replace the placeholder values with your actual API keys:
   ```
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   GEMINI_API_KEY=your-actual-gemini-key-here
   ```

## 🧪 Testing Your Setup

After configuring your API keys, test them:

```bash
cd backend
python test_ai_apis.py
```

This will verify that both APIs are working correctly.

## 🔄 Restart the Server

After setting up the API keys, restart your backend server:

```bash
# Stop the current server (Ctrl+C)
# Then restart it:
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## 🎯 What You Can Do Now

Once the APIs are configured, you can:

1. **Generate AI-powered car listings** with image analysis
2. **Get market intelligence** and pricing recommendations
3. **Create optimized listings** for different platforms
4. **Analyze car photos** for condition and features

## 💰 Cost Estimates

- **OpenAI**: ~$0.01-0.05 per car listing analysis
- **Gemini**: Free tier available, then ~$0.001-0.01 per request
- **Total**: Less than $0.10 per complete car listing

## 🆘 Troubleshooting

### "API key not configured" error
- Make sure you've added the API keys to the `.env` file
- Restart the backend server after adding keys
- Check that the keys are correct (no extra spaces)

### "API rate limit exceeded"
- Wait a few minutes and try again
- Consider upgrading your API plan if needed

### "Connection timeout"
- Check your internet connection
- Verify the API keys are valid

## 📞 Support

If you need help:
1. Check the logs in your terminal
2. Run the test script: `python test_ai_apis.py`
3. Verify your API keys are working on their respective platforms

---

**Ready to generate some amazing car listings! 🚗✨** 