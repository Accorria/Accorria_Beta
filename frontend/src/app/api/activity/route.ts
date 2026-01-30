import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action_type, user_id, email, metadata, utm_source, utm_medium, utm_campaign } = body;

    if (!action_type || typeof action_type !== 'string') {
      return NextResponse.json(
        { error: 'action_type is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Activity logging not configured' },
        { status: 500 }
      );
    }

    const { error } = await supabase.from('user_activity').insert([
      {
        action_type: action_type.trim(),
        user_id: user_id || null,
        email: email || null,
        metadata: metadata && typeof metadata === 'object' ? metadata : {},
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
      },
    ]);

    if (error) {
      console.error('Activity insert error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to log activity' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Activity API error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
