import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 500 }
      );
    }

    const { data: rows, error } = await supabase
      .from('beta_signups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Admin beta-signups fetch error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to fetch signups' },
        { status: 500 }
      );
    }

    const signups = (rows || []).map((row: any) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      source: row.source,
      focus: row.focus,
      status: row.status,
      created_at: row.created_at,
      updated_at: row.updated_at,
      utm_source: row.utm_source,
      utm_medium: row.utm_medium,
      utm_campaign: row.utm_campaign,
    }));

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      total_signups: signups.length,
      pending_signups: signups.filter((s: any) => s.status === 'pending').length,
      invited_signups: signups.filter((s: any) => s.status === 'invited').length,
      active_signups: signups.filter((s: any) => s.status === 'active').length,
      signups_today: signups.filter((s: any) => new Date(s.created_at).toDateString() === now.toDateString()).length,
      signups_this_week: signups.filter((s: any) => new Date(s.created_at) > weekAgo).length,
      signups_this_month: signups.filter((s: any) => new Date(s.created_at) > monthAgo).length,
    };

    return NextResponse.json({ signups, stats });
  } catch (err) {
    console.error('Admin API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
