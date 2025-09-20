import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin access, fallback to anon key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    // Fetch all beta signups
    const { data: signups, error: signupsError } = await supabase
      .from('beta_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (signupsError) {
      console.error('Error fetching signups:', signupsError);
      return NextResponse.json(
        { error: 'Failed to fetch signups' },
        { status: 500 }
      );
    }

    // Fetch stats
    const { data: stats, error: statsError } = await supabase
      .rpc('get_beta_signup_stats');

    if (statsError) {
      console.error('Error fetching stats:', statsError);
      // Return signups even if stats fail
      return NextResponse.json({
        signups: signups || [],
        stats: null,
        error: 'Stats unavailable'
      });
    }

    return NextResponse.json({
      signups: signups || [],
      stats: stats?.[0] || null
    });

  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
