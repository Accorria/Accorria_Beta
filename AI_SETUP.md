# 🤖 AI Car Listing Generator Setup

This guide will help you set up the AI-powered car listing generator that replicates the ChatGPT workflow.

## 🚀 What It Does

The AI Car Listing Generator replicates your ChatGPT workflow:
1. **Upload car photos** (up to 20 images)
2. **AI analysis** using OpenAI Vision API
3. **Market intelligence** using Gemini/OpenAI
4. **Price recommendations** with negotiation room
5. **Formatted listings** for multiple platforms (Craigslist, Facebook, OfferUp, AutoTrader)

## 🔑 Required API Keys

### 1. OpenAI API Key
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or sign in
3. Navigate to "API Keys" in the sidebar
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

### 2. Gemini API Key (Optional)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key

## ⚙️ Setup Instructions

### Step 1: Set Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp env.example .env
```

Edit the `.env` file and add your API keys:

```env
# AI API Keys
OPENAI_API_KEY=sk-your-openai-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
```

### Step 2: Start the Application

```bash
# From the project root
npm run dev
```

This will start both:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000

### Step 3: Access the AI Listing Generator

1. Open http://localhost:3000
2. Click the "🤖 AI Listing" tab in the bottom navigation
3. Upload car photos and fill in details
4. Click "Generate AI Listing"

## 🎯 How to Use

### Basic Workflow:
1. **Upload Photos**: Drag and drop or click to upload up to 20 car images
2. **Add Details**: Fill in make, model, year, mileage, location, etc.
3. **Generate**: Click "Generate AI Listing" to get:
   - Image analysis (make, model, condition, features)
   - Market intelligence (pricing, demand trends)
   - Price recommendations (listing price, negotiation room)
   - Ready-to-use listings for multiple platforms

### Advanced Features:
- **Image Analysis**: AI detects make, model, year, color, condition, features
- **Market Intelligence**: Analyzes local market conditions and comparable sales
- **Smart Pricing**: Calculates optimal listing price with negotiation room
- **Multi-Platform**: Generates listings for Craigslist, Facebook, OfferUp, AutoTrader
- **Copy to Clipboard**: One-click copy of formatted listings

## 🔧 API Endpoints

### Generate Car Listing
```
POST /api/v1/car-listing/generate
```
- Upload images and car details
- Returns complete analysis and formatted listings

### Test Endpoint
```
POST /api/v1/car-listing/test
```
- Tests if the service is working
- No images required

### Supported Platforms
```
GET /api/v1/car-listing/platforms
```
- Returns list of supported listing platforms

## 🛠️ Troubleshooting

### "OpenAI API key not configured"
- Make sure you've added your OpenAI API key to the `.env` file
- Restart the backend after adding the key

### "Maximum 20 images allowed"
- The system limits uploads to 20 images for performance
- Use high-quality, well-lit photos for best results

### "Failed to generate listing"
- Check your internet connection
- Verify API keys are correct
- Try with fewer images first

## 💡 Tips for Best Results

1. **Photo Quality**: Use clear, well-lit photos from multiple angles
2. **Car Details**: Provide accurate make, model, year, and mileage
3. **Location**: Set your actual location for accurate market analysis
4. **Title Status**: Specify if the car has a clean, rebuilt, or salvage title

## 🚀 Next Steps

Once you have this working, you can:
1. **Integrate with existing listings**: Connect to your current car inventory
2. **Automate posting**: Add direct posting to platforms
3. **Track performance**: Monitor which listings perform best
4. **Customize templates**: Modify listing formats for your style

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify API keys are correct
3. Test with the `/api/v1/car-listing/test` endpoint
4. Check the backend logs for detailed error messages

---

**Ready to revolutionize your car listing process! 🚗✨** 