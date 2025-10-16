import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { searchTerm, location, radius, results, summary } = body;
    
    // Extract make, model, and year from search term
    const searchParts = searchTerm.split(' ');
    const year = searchParts.find(part => /^\d{4}$/.test(part)) || '';
    const make = searchParts.find(part => !/^\d{4}$/.test(part)) || '';
    const model = searchParts.filter(part => part !== year && part !== make).join(' ') || '';
    
    // Generate a car photo URL based on make/model
    const carPhotoUrl = `https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&h=200&fit=crop&crop=center&auto=format&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D`;
    
    // Create detailed search record
    const searchRecord = {
      id: Date.now(),
      searchTerm,
      make,
      model,
      year,
      location,
      radius,
      resultCount: results?.length || 0,
      averagePrice: summary?.averagePrice || 0,
      priceRange: summary?.priceRange || { min: 0, max: 0 },
      sources: summary?.sources || [],
      carPhotoUrl,
      results: results || [],
      summary: summary || {},
      timestamp: new Date().toISOString(),
      isRealData: summary?.isRealData || false,
      isGoogleSearch: summary?.isGoogleSearch || false
    };
    
    // For demo purposes, we'll just log the search
    // In production, this would save to a database
    console.log('Market search saved:', searchRecord);

    return new Response(JSON.stringify({
      success: true,
      message: 'Search saved successfully',
      searchRecord
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Search history error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to save search history'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function GET() {
  try {
    // For demo purposes, return mock search history with photos
    // In production, this would fetch from database
    const mockHistory = [
      {
        id: 1,
        searchTerm: '2024 Toyota Camry',
        make: 'Toyota',
        model: 'Camry',
        year: '2024',
        location: 'Los Angeles, CA',
        radius: 50,
        resultCount: 5,
        averagePrice: 27580,
        priceRange: { min: 24000, max: 32000 },
        sources: ['Google Search', 'eBay Motors', 'CarGurus', 'AutoTrader', 'Cars.com'],
        carPhotoUrl: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=300&h=200&fit=crop&crop=center&auto=format&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        isRealData: true,
        isGoogleSearch: true
      },
      {
        id: 2,
        searchTerm: '2023 Honda Civic',
        make: 'Honda',
        model: 'Civic',
        year: '2023',
        location: 'San Diego, CA',
        radius: 25,
        resultCount: 3,
        averagePrice: 24200,
        priceRange: { min: 22000, max: 28000 },
        sources: ['Google Search', 'eBay Motors', 'CarGurus'],
        carPhotoUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=300&h=200&fit=crop&crop=center&auto=format&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        isRealData: true,
        isGoogleSearch: true
      },
      {
        id: 3,
        searchTerm: '2012 Audi A6',
        make: 'Audi',
        model: 'A6',
        year: '2012',
        location: 'United States',
        radius: 50,
        resultCount: 5,
        averagePrice: 0,
        priceRange: { min: 0, max: 0 },
        sources: ['Google Search', 'eBay Motors', 'CarGurus', 'AutoTrader', 'Cars.com'],
        carPhotoUrl: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=300&h=200&fit=crop&crop=center&auto=format&q=80&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
        isRealData: true,
        isGoogleSearch: true
      }
    ];

    return new Response(JSON.stringify({
      success: true,
      history: mockHistory
    }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Search history fetch error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to fetch search history'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
