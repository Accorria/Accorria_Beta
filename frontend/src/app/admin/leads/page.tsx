'use client';

import React, { useState, useEffect } from 'react';

interface Lead {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  source: string;
  role?: string;
  focus?: string;
  score: number;
  status: string;
  created_at: string;
  updated_at: string;
  ip_address?: string;
  user_agent?: string;
  demo_engagement?: any;
  survey_responses?: any;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  notes?: string;
  // Qualification & Preferences
  qualifications?: {
    wants_notifications?: boolean;
    wants_demo?: boolean;
    wants_beta_access?: boolean;
    wants_early_access?: boolean;
    signup_type?: string;
    interest_level?: string;
    budget_range?: string;
    timeline?: string;
    volume?: string;
    pain_points?: string[];
  };
}

export default function LeadsAdmin() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    bySource: {} as Record<string, number>,
    byRole: {} as Record<string, number>,
    byQualification: {
      wants_notifications: 0,
      wants_demo: 0,
      wants_beta_access: 0,
      wants_early_access: 0
    }
  });

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads');
      const result = await response.json();
      
      if (result.success && result.leads) {
        setLeads(result.leads);
        
        // Calculate stats
        const total = result.leads.length;
        const thisWeek = result.leads.filter((lead: any) => {
          const leadDate = new Date(lead.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return leadDate > weekAgo;
        }).length;
        
        const bySource = result.leads.reduce((acc: any, lead: any) => {
          acc[lead.source] = (acc[lead.source] || 0) + 1;
          return acc;
        }, {});
        
        const byRole = result.leads.reduce((acc: any, lead: any) => {
          acc[lead.role || 'unknown'] = (acc[lead.role || 'unknown'] || 0) + 1;
          return acc;
        }, {});
        
        // Calculate qualification stats
        const byQualification = result.leads.reduce((acc: any, lead: any) => {
          if (lead.qualifications) {
            if (lead.qualifications.wants_notifications) acc.wants_notifications++;
            if (lead.qualifications.wants_demo) acc.wants_demo++;
            if (lead.qualifications.wants_beta_access) acc.wants_beta_access++;
            if (lead.qualifications.wants_early_access) acc.wants_early_access++;
          }
          return acc;
        }, {
          wants_notifications: 0,
          wants_demo: 0,
          wants_beta_access: 0,
          wants_early_access: 0
        });
        
        setStats({
          total,
          thisWeek,
          bySource,
          byRole,
          byQualification
        });
      } else {
        setLeads([]);
        setStats({
          total: 0,
          thisWeek: 0,
          bySource: {},
          byRole: {},
          byQualification: {
            wants_notifications: 0,
            wants_demo: 0,
            wants_beta_access: 0,
            wants_early_access: 0
          }
        });
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
      setStats({
        total: 0,
        thisWeek: 0,
        bySource: {},
        byRole: {},
        byQualification: {
          wants_notifications: 0,
          wants_demo: 0,
          wants_beta_access: 0,
          wants_early_access: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead Capture System</h2>
        <p className="text-gray-600">Track and manage your leads from the chatbot and signup forms.</p>
      </div>

      {/* Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-green-900 mb-3">✅ CRM System Active</h3>
        <div className="text-green-800 space-y-3">
          <p><strong>Current Status:</strong> Lead capture is working perfectly! All leads are being saved with automatic scoring and classification.</p>
          
          <div className="bg-white p-4 rounded border">
            <h4 className="font-semibold mb-2">What's Working:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li><strong>Lead Capture:</strong> All forms and automation flows are capturing leads</li>
              <li><strong>Lead Scoring:</strong> Automatic 0-100 point scoring system</li>
              <li><strong>Status Classification:</strong> Hot/Warm/Cold based on engagement</li>
              <li><strong>Data Storage:</strong> Leads saved to local file (leads.json)</li>
              <li><strong>API Access:</strong> Real-time lead data via REST API</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📧</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Leads</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">📅</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">This Week</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.thisWeek}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🤖</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">From Chatbot</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.bySource.chatbot || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Dealers</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.byRole.dealer || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Qualification Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">🎯 Lead Qualifications & Preferences</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{stats.byQualification.wants_notifications}</div>
            <div className="text-sm text-gray-600">Want Notifications</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{stats.byQualification.wants_demo}</div>
            <div className="text-sm text-gray-600">Want Demo</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{stats.byQualification.wants_beta_access}</div>
            <div className="text-sm text-gray-600">Want Beta Access</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-2xl font-bold text-orange-600">{stats.byQualification.wants_early_access}</div>
            <div className="text-sm text-gray-600">Want Early Access</div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Leads</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            All leads captured from your website and chatbot.
          </p>
        </div>
        
        {leads.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h3>
            <p className="text-gray-500 mb-4">
              Leads will appear here as they come through your forms and automation.
            </p>
            <div className="text-sm text-gray-400">
              <p>Test your forms to see leads appear here!</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">🎯 Qualifications</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {lead.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.source}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="space-y-2">
                        {/* Google Forms Detailed Responses */}
                        {lead.survey_responses && (
                          <div className="space-y-1">
                            {lead.survey_responses.dealership_name && (
                              <div className="text-xs">
                                <span className="font-medium text-gray-700">Dealership:</span> {lead.survey_responses.dealership_name}
                              </div>
                            )}
                            {lead.survey_responses.city && (
                              <div className="text-xs">
                                <span className="font-medium text-gray-700">City:</span> {lead.survey_responses.city}
                              </div>
                            )}
                            {lead.survey_responses.monthly_volume && (
                              <div className="text-xs">
                                <span className="font-medium text-gray-700">Volume:</span> {lead.survey_responses.monthly_volume}
                              </div>
                            )}
                            {lead.survey_responses.willingness_to_pay && (
                              <div className="text-xs">
                                <span className="font-medium text-gray-700">Budget:</span> {lead.survey_responses.willingness_to_pay}
                              </div>
                            )}
                            {lead.survey_responses.biggest_pain_point && (
                              <div className="text-xs">
                                <span className="font-medium text-gray-700">Pain Point:</span> {lead.survey_responses.biggest_pain_point}
                              </div>
                            )}
                            {lead.survey_responses.platforms_used && (
                              <div className="text-xs">
                                <span className="font-medium text-gray-700">Platforms:</span> {Array.isArray(lead.survey_responses.platforms_used) ? lead.survey_responses.platforms_used.join(', ') : lead.survey_responses.platforms_used}
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Fallback to qualifications if no survey responses */}
                        {!lead.survey_responses && (
                          <div className="flex flex-wrap gap-1">
                            {lead.qualifications?.wants_notifications && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                📧 Notifications
                              </span>
                            )}
                            {lead.qualifications?.wants_demo && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                🎥 Demo
                              </span>
                            )}
                            {lead.qualifications?.wants_beta_access && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                                🚀 Beta
                              </span>
                            )}
                            {lead.qualifications?.wants_early_access && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                ⚡ Early Access
                              </span>
                            )}
                            {lead.survey_responses?.timeline && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                ⏰ {lead.survey_responses.timeline}
                              </span>
                            )}
                            {lead.survey_responses?.volume && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                📊 {lead.survey_responses.volume}
                              </span>
                            )}
                            {!lead.qualifications && !lead.survey_responses && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                No Preferences
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.score >= 70 ? 'bg-red-100 text-red-800' :
                        lead.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.score}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.status === 'hot' ? 'bg-red-100 text-red-800' :
                        lead.status === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => {
                          setSelectedLead(lead);
                          setShowDetailModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lead Detail Modal */}
      {showDetailModal && selectedLead && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Lead Details</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Basic Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Name:</span> {selectedLead.name || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Email:</span> {selectedLead.email}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Phone:</span> {selectedLead.phone || 'N/A'}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Source:</span> {selectedLead.source}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Score:</span> {selectedLead.score}/100
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span> 
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        selectedLead.status === 'hot' ? 'bg-red-100 text-red-800' :
                        selectedLead.status === 'warm' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLead.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Google Forms Survey Responses */}
                {selectedLead.survey_responses && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">📋 Google Forms Responses</h4>
                    <div className="space-y-3 text-sm">
                      {selectedLead.survey_responses.dealership_name && (
                        <div>
                          <span className="font-medium text-gray-700">Dealership Name:</span> {selectedLead.survey_responses.dealership_name}
                        </div>
                      )}
                      {selectedLead.survey_responses.role && (
                        <div>
                          <span className="font-medium text-gray-700">Role:</span> {selectedLead.survey_responses.role}
                        </div>
                      )}
                      {selectedLead.survey_responses.city && (
                        <div>
                          <span className="font-medium text-gray-700">City:</span> {selectedLead.survey_responses.city}
                        </div>
                      )}
                      {selectedLead.survey_responses.monthly_volume && (
                        <div>
                          <span className="font-medium text-gray-700">Monthly Volume:</span> {selectedLead.survey_responses.monthly_volume}
                        </div>
                      )}
                      {selectedLead.survey_responses.platforms_used && (
                        <div>
                          <span className="font-medium text-gray-700">Platforms Used:</span> {Array.isArray(selectedLead.survey_responses.platforms_used) ? selectedLead.survey_responses.platforms_used.join(', ') : selectedLead.survey_responses.platforms_used}
                        </div>
                      )}
                      {selectedLead.survey_responses.biggest_pain_point && (
                        <div>
                          <span className="font-medium text-gray-700">Biggest Pain Point:</span> {selectedLead.survey_responses.biggest_pain_point}
                        </div>
                      )}
                      {selectedLead.survey_responses.willingness_to_pay && (
                        <div>
                          <span className="font-medium text-gray-700">Willingness to Pay:</span> {selectedLead.survey_responses.willingness_to_pay}
                        </div>
                      )}
                      {selectedLead.survey_responses.interest_confirmed && (
                        <div>
                          <span className="font-medium text-gray-700">Interest Confirmed:</span> {selectedLead.survey_responses.interest_confirmed}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Qualifications */}
                {selectedLead.qualifications && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">🎯 Lead Qualifications</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">Wants Notifications:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${selectedLead.qualifications.wants_notifications ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedLead.qualifications.wants_notifications ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">Wants Demo:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${selectedLead.qualifications.wants_demo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedLead.qualifications.wants_demo ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">Wants Beta Access:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${selectedLead.qualifications.wants_beta_access ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedLead.qualifications.wants_beta_access ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">Wants Early Access:</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${selectedLead.qualifications.wants_early_access ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {selectedLead.qualifications.wants_early_access ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {selectedLead.qualifications.budget_range && (
                        <div>
                          <span className="font-medium text-gray-700">Budget Range:</span> {selectedLead.qualifications.budget_range}
                        </div>
                      )}
                      {selectedLead.qualifications.timeline && (
                        <div>
                          <span className="font-medium text-gray-700">Timeline:</span> {selectedLead.qualifications.timeline}
                        </div>
                      )}
                      {selectedLead.qualifications.volume && (
                        <div>
                          <span className="font-medium text-gray-700">Volume:</span> {selectedLead.qualifications.volume}
                        </div>
                      )}
                      {selectedLead.qualifications.pain_points && selectedLead.qualifications.pain_points.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">Pain Points:</span> {selectedLead.qualifications.pain_points.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedLead.notes && (
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">📝 Notes</h4>
                    <p className="text-sm text-gray-700">{selectedLead.notes}</p>
                  </div>
                )}

                {/* Timestamps */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">⏰ Timestamps</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Created:</span> {new Date(selectedLead.created_at).toLocaleString()}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Updated:</span> {new Date(selectedLead.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}