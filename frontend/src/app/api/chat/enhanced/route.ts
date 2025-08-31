import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // For now, return a simple response while we fix the backend
    return NextResponse.json({
      response: "Hello! I'm Accorria's AI agent. I'm here to help you list cars and homes for sale. How can I assist you today?",
      success: true
    });
  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
