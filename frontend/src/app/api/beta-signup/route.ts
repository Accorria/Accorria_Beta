import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, role, source, focus } = body;

    // Validate required fields
    if (!email || !role || !source) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Supabase not configured, logging signup locally');
      console.log('Beta signup (Supabase not configured):', {
        email,
        role,
        source,
        focus,
        timestamp: new Date().toISOString()
      });
      
      return NextResponse.json({
        success: true,
        message: 'Successfully signed up for early access! (Note: Database not configured yet)',
        data: { email, role, source, focus }
      });
    }

    // Get additional tracking data
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const referrer = request.headers.get('referer') || 'unknown';

    // Extract UTM parameters from referrer if present
    let utmSource = null;
    let utmMedium = null;
    let utmCampaign = null;
    
    try {
      if (referrer && referrer !== 'unknown') {
        const url = new URL(referrer);
        utmSource = url.searchParams.get('utm_source') || null;
        utmMedium = url.searchParams.get('utm_medium') || null;
        utmCampaign = url.searchParams.get('utm_campaign') || null;
      }
    } catch (e) {
      // Invalid URL, use null values
      console.log('Invalid referrer URL:', referrer);
    }

    // Insert into database
    const { data, error } = await supabase
      .from('beta_signups')
      .insert([
        {
          email: email.toLowerCase().trim(),
          role,
          source,
          focus: focus || 'cars',
          ip_address: ip,
          user_agent: userAgent,
          referrer,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
        }
      ])
      .select();

    if (error) {
      console.error('Database error:', error);
      
      // Handle table doesn't exist error
      if (error.code === 'PGRST116' || error.code === 'PGRST205' || error.message?.includes('relation "beta_signups" does not exist') || error.message?.includes('Could not find the table')) {
        // For now, just log the signup and return success
        console.log('Beta signup (table not set up yet):', {
          email,
          role,
          source,
          focus,
          timestamp: new Date().toISOString()
        });
        
        return NextResponse.json({
          success: true,
          message: 'Successfully signed up for early access! (Note: Database table not set up yet)',
          data: { email, role, source, focus }
        });
      }
      
      // Handle duplicate email error gracefully
      if (error.code === '23505') {
        return NextResponse.json(
          { 
            success: true, 
            message: 'You\'re already signed up! We\'ll notify you when early access is ready.',
            already_exists: true 
          },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to save signup' },
        { status: 500 }
      );
    }

    // TODO: Send welcome email via SendGrid or similar
    // TODO: Add to email marketing list (Mailchimp, ConvertKit, etc.)
    // TODO: Send notification to admin team

    console.log('New beta signup:', {
      email,
      role,
      source,
      focus,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully signed up for early access!',
      data: data[0]
    });

  } catch (error) {
    console.error('Beta signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check if email is already signed up
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('beta_signups')
      .select('email, status, created_at')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      exists: !!data,
      data: data || null
    });

  } catch (error) {
    console.error('Check signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
