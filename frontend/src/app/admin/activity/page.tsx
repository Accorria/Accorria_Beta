'use client';

import React, { useState, useEffect } from 'react';

interface ActivityRow {
  id: string;
  user_id: string | null;
  email: string | null;
  action_type: string;
  metadata: Record<string, unknown>;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  created_at: string;
}

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterAction, setFilterAction] = useState<string>('');
  const [filterUtmSource, setFilterUtmSource] = useState<string>('');
  const [filterEmail, setFilterEmail] = useState<string>('');

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('limit', '500');
      if (filterAction) params.set('action_type', filterAction);
      if (filterUtmSource) params.set('utm_source', filterUtmSource);
      if (filterEmail) params.set('email', filterEmail);
      const response = await fetch(`/api/admin/activity?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch');
      setActivities(data.activities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [filterAction, filterUtmSource, filterEmail]);

  const exportCSV = () => {
    const headers = ['Date', 'Action', 'Email', 'User ID', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Metadata'];
    const rows = activities.map((a) => [
      new Date(a.created_at).toISOString(),
      a.action_type,
      a.email ?? '',
      a.user_id ?? '',
      a.utm_source ?? '',
      a.utm_medium ?? '',
      a.utm_campaign ?? '',
      JSON.stringify(a.metadata || {}),
    ]);
    const csvContent = [
      headers.join(','),
      ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-loi-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const actionTypes = Array.from(new Set(activities.map((a) => a.action_type))).sort();
  const utmSources = Array.from(new Set(activities.map((a) => a.utm_source).filter(Boolean))) as string[];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Activity & LOI Tracking</h1>
        <p className="mt-2 text-gray-600">
          Logins, vehicle searches, and key actions from letter-of-intent and other sources
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 p-4">
          <p className="text-amber-800">{error}</p>
          <p className="text-sm text-amber-700 mt-1">
            Run <code className="bg-amber-100 px-1 rounded">USER_ACTIVITY_TABLE.sql</code> in Supabase SQL Editor to create the table.
          </p>
          <button
            onClick={fetchActivities}
            className="mt-3 px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 text-sm"
          >
            Retry
          </button>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Action</label>
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            {actionTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">UTM Source (e.g. LOI)</label>
          <select
            value={filterUtmSource}
            onChange={(e) => setFilterUtmSource(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="">All</option>
            {utmSources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Email</label>
          <input
            type="text"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            placeholder="Filter by email"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm w-48"
          />
        </div>
        <button
          onClick={exportCSV}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
        >
          Export CSV
        </button>
        <button
          onClick={() => { setLoading(true); fetchActivities(); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">UTM Source</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {activities.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{a.action_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.email ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.utm_source ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">
                      {Object.keys(a.metadata || {}).length ? JSON.stringify(a.metadata) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {activities.length === 0 && !error && (
            <div className="text-center py-12 text-gray-500">
              No activity yet. Activity is logged when users sign in or run vehicle searches.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
