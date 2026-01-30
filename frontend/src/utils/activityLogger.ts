/**
 * Log user activity for admin/LOI tracking (logins, vehicle searches, etc.).
 * Calls POST /api/activity; fails silently so it never breaks the app.
 */

export type ActivityAction =
  | 'login'
  | 'search_vehicles'
  | 'view_listing'
  | 'create_listing'
  | 'register'
  | 'beta_signup'
  | 'page_view'
  | string;

export interface LogActivityOptions {
  action_type: ActivityAction;
  user_id?: string | null;
  email?: string | null;
  metadata?: Record<string, unknown>;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
}

export async function logActivity(options: LogActivityOptions): Promise<void> {
  try {
    await fetch('/api/activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_type: options.action_type,
        user_id: options.user_id ?? undefined,
        email: options.email ?? undefined,
        metadata: options.metadata ?? {},
        utm_source: options.utm_source ?? undefined,
        utm_medium: options.utm_medium ?? undefined,
        utm_campaign: options.utm_campaign ?? undefined,
      }),
    });
  } catch {
    // Silent: never break the app if logging fails
  }
}

/** Get UTM params from current URL (for LOI / letter of intent links). */
export function getUtmFromUrl(): {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
} {
  if (typeof window === 'undefined') return { utm_source: null, utm_medium: null, utm_campaign: null };
  const p = new URLSearchParams(window.location.search);
  return {
    utm_source: p.get('utm_source'),
    utm_medium: p.get('utm_medium'),
    utm_campaign: p.get('utm_campaign'),
  };
}
