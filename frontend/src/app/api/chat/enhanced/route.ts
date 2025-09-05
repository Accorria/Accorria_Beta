import { NextRequest, NextResponse } from 'next/server';

export const runtime = "edge";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'https://accorria-backend-691352445702.us-central1.run.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, useWebSearch } = body;
    
    console.log('Chat request received:', { messages, useWebSearch, BACKEND_URL });
    
    // Forward the request to the backend API
    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/chat/enhanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages, useWebSearch }),
    });

    console.log('Backend response status:', backendResponse.status);

    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend API error: ${backendResponse.status} - ${errorText}`);
    }

    const data = await backendResponse.json();
    console.log('Backend response data:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    
    // Provide a fallback response when backend is not available
    const fallbackResponse = "Hello! I'm Accorria's AI agent. I'm here to help you list cars and homes for sale. I can help you with pricing guidance, listing optimization, and market analysis. How can I assist you today?";
    
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