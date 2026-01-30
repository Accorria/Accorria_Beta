import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '500', 10), 2000);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const action_type = searchParams.get('action_type') || undefined;
    const utm_source = searchParams.get('utm_source') || undefined;
    const email = searchParams.get('email') || undefined;
    const since = searchParams.get('since') || undefined;

    let query = supabase
      .from('user_activity')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (action_type) query = query.eq('action_type', action_type);
    if (utm_source) query = query.eq('utm_source', utm_source);
    if (email) query = query.ilike('email', `%${email}%`);
    if (since) query = query.gte('created_at', since);

    const { data: activities, error } = await query;

    if (error) {
      console.error('Admin activity fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      activities: activities || [],
      total: activities?.length ?? 0,
    });
  } catch (err) {
    console.error('Admin activity API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
