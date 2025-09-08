import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://accorria-backend-19949436301.us-central1.run.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, useWebSearch } = body;
    
    console.log('Chat request received:', { messages, useWebSearch, BACKEND_URL });
    
    // Call OpenAI directly from frontend (bypassing backend timeout issues)
    const openai = require('openai');
    
    // Debug: Check if API key is available
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('DEBUG: API Key available:', !!apiKey);
    console.log('DEBUG: API Key starts with:', apiKey ? apiKey.substring(0, 10) + '...' : 'NOT_FOUND');
    
    if (!apiKey) {
      throw new Error('OpenAI API key not found in environment variables');
    }
    
    const client = new openai.OpenAI({
      apiKey: apiKey,
    });

    // Add system message for Accorria context
    const systemMessage = {
      role: "system",
      content: `You are Accorria's AI deal agent. You help people list cars and homes for sale on the Accorria platform.

Key capabilities:
- Generate professional listings from photos/specs
- Provide pricing guidance based on market data
- Coach negotiation strategies
- Explain escrow and closing processes
- Help with listing optimization and marketing
- Use web search for current market data when needed
- Analyze images to extract vehicle/property details

RESPONSE FORMATTING GUIDELINES:
- Use clean, structured formatting without any markdown symbols like ** or *
- For numbered lists, use simple numbers like "1. Location:" not "**1. Location:**"
- Use clear headings and bullet points for organization
- Keep responses concise and scannable
- Use emojis sparingly but effectively for visual breaks
- NEVER use asterisks around text for emphasis - remove all ** and * symbols from your response
- If you see asterisks in your response, remove them completely before sending

IMPORTANT: Stay focused on Accorria and car/home selling. Don't answer questions about changing the world, philosophy, or unrelated topics. Keep responses focused on helping users sell cars and homes faster with Accorria.

Tone: Professional, helpful, confident. You're an expert in real estate and automotive sales.
Keep responses concise and actionable. Always offer to help with specific next steps.`
    };

    // Prepare messages with system prompt
    const allMessages = [systemMessage, ...messages];

    try {
      console.log('DEBUG: About to call OpenAI API');
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: allMessages,
        temperature: 0.4,
        max_tokens: 1000
      });

      console.log('DEBUG: OpenAI API call successful');
      let aiResponse = response.choices[0].message.content;
      
      // Remove any asterisks that might have slipped through
      aiResponse = aiResponse.replace(/\*\*/g, '').replace(/\*/g, '');
      
      return NextResponse.json({
        response: aiResponse,
        success: true
      });
    } catch (error) {
      console.error('DEBUG: OpenAI API error:', error);
      throw error;
    }

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    // Provide a fallback response when backend is not available
    const fallbackResponse = `Hi! I'm Accorria's AI assistant. I'm experiencing high demand right now, but I'm here to help you sell your car or home faster and for more money.

Here's what I can help you with:

🚗 **Car Selling:**
- Analyze photos to extract details automatically
- Read odometer readings and detect features
- Suggest optimal pricing based on market data
- Generate professional listings

🏠 **Home Selling:**
- Pricing guidance and market analysis
- Listing optimization tips
- Professional descriptions

💰 **Pricing Options:**
- Quick Sale (fastest sale)
- Market Price (balanced approach)  
- Top Dollar (maximum value)

📸 **Just upload photos** and I'll help you create the perfect listing!

What would you like to sell today?`;
    
    return NextResponse.json(
      { 
        response: fallbackResponse, 
        success: true,
        fallback: true,
        error: `Backend temporarily unavailable: ${error.message}` 
      },
      { status: 200 }
    );
  }
}