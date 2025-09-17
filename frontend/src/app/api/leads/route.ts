import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key
function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase credentials not configured');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Calculate lead score based on available data
    let score = 50; // Base score
    
    // Boost score based on source
    if (body.source === 'demo_page') score += 20;
    if (body.source === 'pricing_page') score += 15;
    if (body.source === 'hero_form') score += 10;
    
    // Boost score based on demo engagement
    if (body.demo_engagement?.completed) score += 25;
    if (body.demo_engagement?.replayed) score += 15;
    if (body.demo_engagement?.paused_at_key_moments) score += 10;
    
    // Boost score based on survey responses
    if (body.survey_responses?.timeline === 'this_week') score += 20;
    if (body.survey_responses?.volume === '10+') score += 15;
    if (body.survey_responses?.challenge) score += 5;

    // Prepare lead data
    const leadData = {
      name: body.name || null,
      email: body.email,
      phone: body.phone || null,
      source: body.source || 'web_form',
      utm_campaign: body.utm?.campaign || null,
      utm_source: body.utm?.source || null,
      utm_medium: body.utm?.medium || null,
      utm_content: body.utm?.content || null,
      utm_term: body.utm?.term || null,
      score: Math.min(100, Math.max(0, score)), // Clamp between 0-100
      notes: body.notes || null,
      demo_engagement: body.demo_engagement || null,
      survey_responses: body.survey_responses || null,
      status: score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold'
    };

    // Insert into Supabase
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to save lead' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      leadId: data.id,
      score: data.score,
      status: data.status,
      message: 'Lead captured successfully'
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get leads with pagination
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      leads: data,
      count: data.length
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
