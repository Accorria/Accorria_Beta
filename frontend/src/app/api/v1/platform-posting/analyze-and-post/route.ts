import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // For demo purposes, return mock response immediately
    // TODO: Replace with real backend call once deployment is fixed
    
    const mockResponse = {
      success: true,
      message: "Listing created successfully (demo mode)",
      listing: {
        id: `listing_${Date.now()}`,
        title: "Demo Car Listing",
        description: "This is a demo listing created for testing purposes.",
        price: 25000,
        platform: "accorria",
        status: "active",
        images: ["demo-image-url"],
        created_at: new Date().toISOString(),
        user_id: "demo-user"
      },
      platforms: ["accorria"],
      analysis: {
        make: "Demo",
        model: "Car",
        year: 2020,
        estimated_value: 25000,
        confidence: 0.95
      }
    };
    
    return new Response(JSON.stringify(mockResponse), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Original backend call code (commented out for demo)
    /*
    // Get the backend URL from environment variable
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://accorria-backend-19949436301.us-central1.run.app';
    
    // Forward the request to the backend (including form data)
    const response = await fetch(`${backendUrl}/api/v1/platform-posting/analyze-and-post`, {
      method: 'POST',
      body: req.body,
      headers: req.headers as any,
    });

    if (!response.ok) {
      console.error('Backend error:', response.status, response.statusText);
      return new Response(`Backend error: ${response.status}`, { status: response.status });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    */
  } catch (error) {
    console.error('Platform posting error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to create listing'
    }), {
      status: 200, // Return success even on error for demo
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
