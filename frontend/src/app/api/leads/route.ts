import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

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

    // Extract qualifications from form data
    const qualifications = {
      wants_notifications: body.wants_notifications || body.qualifications?.wants_notifications || false,
      wants_demo: body.wants_demo || body.qualifications?.wants_demo || false,
      wants_beta_access: body.wants_beta_access || body.qualifications?.wants_beta_access || false,
      wants_early_access: body.wants_early_access || body.qualifications?.wants_early_access || false,
      signup_type: body.signup_type || body.qualifications?.signup_type || body.source,
      interest_level: body.interest_level || body.qualifications?.interest_level || 'medium',
      budget_range: body.budget_range || body.qualifications?.budget_range || body.survey_responses?.budget,
      timeline: body.timeline || body.qualifications?.timeline || body.survey_responses?.timeline,
      volume: body.volume || body.qualifications?.volume || body.survey_responses?.volume,
      pain_points: body.pain_points || body.qualifications?.pain_points || (body.survey_responses?.challenge ? [body.survey_responses.challenge] : [])
    };

    // Boost score based on qualifications
    if (qualifications.wants_demo) score += 15;
    if (qualifications.wants_beta_access) score += 20;
    if (qualifications.wants_early_access) score += 25;
    if (qualifications.timeline === 'this_week') score += 20;
    if (qualifications.volume && qualifications.volume.includes('10+')) score += 15;

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
      qualifications: qualifications,
      status: score >= 70 ? 'hot' : score >= 40 ? 'warm' : 'cold'
    };

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, saving to local file');
      
      // Save to local JSON file for now
      const leadDataWithMeta = {
        ...leadData,
        id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      };
      
      try {
        const leadsPath = path.join(process.cwd(), '..', 'leads.json');
        let leads = [];
        
        // Read existing leads
        if (fs.existsSync(leadsPath)) {
          const data = fs.readFileSync(leadsPath, 'utf8');
          leads = JSON.parse(data);
        }
        
        // Add new lead
        leads.push(leadDataWithMeta);
        
        // Write back to file
        fs.writeFileSync(leadsPath, JSON.stringify(leads, null, 2));
        
        console.log('Lead saved to local file:', leadDataWithMeta);
        
        return NextResponse.json({
          success: true,
          leadId: leadDataWithMeta.id,
          score: leadDataWithMeta.score,
          status: leadDataWithMeta.status,
          message: 'Lead captured successfully (saved locally)'
        });
      } catch (error) {
        console.error('Error saving lead to file:', error);
        return NextResponse.json(
          { error: 'Failed to save lead locally' },
          { status: 500 }
        );
      }
    }

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

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, reading from local file');
      
      try {
        const leadsPath = path.join(process.cwd(), '..', 'leads.json');
        let leads = [];
        
        // Read existing leads
        if (fs.existsSync(leadsPath)) {
          const data = fs.readFileSync(leadsPath, 'utf8');
          leads = JSON.parse(data);
        }
        
        // Sort by created_at descending and apply pagination
        leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        const paginatedLeads = leads.slice(offset, offset + limit);
        
        return NextResponse.json({
          success: true,
          leads: paginatedLeads,
          count: paginatedLeads.length,
          total: leads.length
        });
      } catch (error) {
        console.error('Error reading leads from file:', error);
        return NextResponse.json(
          { error: 'Failed to fetch leads from local storage' },
          { status: 500 }
        );
      }
    }

    // Get leads with pagination from Supabase
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
