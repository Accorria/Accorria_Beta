'use client';

import React, { useState, useEffect } from 'react';
import CreateListing from '@/components/listings/CreateListing';
import MessagesView from '@/components/MessagesView';
import MarketIntelligence from '@/components/MarketIntelligence';
import AIListingGenerator from '@/components/AIListingGenerator';
import DashboardListing from '@/components/DashboardListing';
import Header from '@/components/Header';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showMarketIntelligence, setShowMarketIntelligence] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // State for activities and listings
  const [activities, setActivities] = useState([
    {
      type: 'price',
      icon: '💰',
      title: 'Price Analysis Complete',
      desc: '2017 Nissan Altima - Target: $10,500',
      time: '2m ago',
      color: 'green',
    },
    {
      type: 'message',
      icon: '💬',
      title: 'New Message',
      desc: '"Is the car still available?"',
      time: '5m ago',
      color: 'blue',
    },
    {
      type: 'appointment',
      icon: '📅',
      title: 'Appointment Request',
      desc: 'Tomorrow 3 PM - Honda Civic',
      time: '10m ago',
      color: 'orange',
    },
  ]);
  const [listings, setListings] = useState([
    {
      id: 1,
      icon: '🚗',
      gradient: 'from-blue-400 to-purple-500',
      title: '2017 Nissan Altima',
      price: '$10,500',
      miles: '45,000 miles',
      status: 'Active',
    },
    {
      id: 2,
      icon: '🚙',
      gradient: 'from-green-400 to-blue-500',
      title: '2019 Honda Civic',
      price: '$18,500',
      miles: '32,000 miles',
      status: 'Active',
    },
  ]);
  const [testListings, setTestListings] = useState<any[]>([]);
  const [logMsg, setLogMsg] = useState<string | null>(null);

  // Persist dark mode preference
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load test listings from localStorage
  useEffect(() => {
    const savedTestListings = localStorage.getItem('testListings');
    if (savedTestListings) {
      setTestListings(JSON.parse(savedTestListings));
    }
  }, []);

  // Listen for storage changes to update test listings
  useEffect(() => {
    const handleStorageChange = () => {
      const savedTestListings = localStorage.getItem('testListings');
      if (savedTestListings) {
        setTestListings(JSON.parse(savedTestListings));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Clear handlers
  const handleClearActivities = async () => {
    setActivities([]);
    setLogMsg('You cleared your recent activity.');
    await fetch('/api/v1/user/log_action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_recent_activity', timestamp: new Date().toISOString() }),
    });
  };
  const handleClearListings = async () => {
    setListings([]);
    setLogMsg('You cleared your listings.');
    await fetch('/api/v1/user/log_action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_listings', timestamp: new Date().toISOString() }),
    });
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}>
      <Header darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />
      {/* Main Content */}
      <main className="pb-20">
        {logMsg && (
          <div className="mx-4 my-2 p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm shadow">
            {logMsg}
            <button className="ml-4 text-xs underline" onClick={() => setLogMsg(null)}>Dismiss</button>
          </div>
        )}
        {activeTab === 'dashboard' && (
          <>
            {/* Quick Stats */}
            <div className="px-4 py-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{testListings.length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Active Listings</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                    {testListings.reduce((total, listing) => total + (listing.messages || 0), 0)}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Messages</div>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                    ${testListings.reduce((total, listing) => total + (listing.clicks || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Total Views</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 mb-6 space-y-3">
              <button
                className="w-full bg-blue-500 dark:bg-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors duration-200"
                onClick={() => setShowCreateListing(true)}
              >
                📸 Post New Car
              </button>
              {/* Market Intelligence button hidden for now */}
              {/*
              <button
                className="w-full bg-green-500 dark:bg-green-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-green-600 dark:hover:bg-green-800 transition-colors duration-200"
                onClick={() => setShowMarketIntelligence(true)}
              >
                🔍 Market Intelligence
              </button>
              */}
            </div>

            {/* Recent Activity */}
            <div className="px-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                <button
                  className="text-xs text-blue-500 hover:underline disabled:text-gray-400"
                  onClick={handleClearActivities}
                  disabled={activities.length === 0}
                >
                  Clear
                </button>
              </div>
              <div className="space-y-3">
                {activities.length === 0 ? (
                  <div className="text-gray-400 text-sm">No recent activity.</div>
                ) : (
                  activities.map((a, i) => (
                    <div
                      key={i}
                      className={`bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border-l-4 border-${a.color}-500 dark:border-${a.color}-400 border dark:border-gray-700`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-${a.color}-100 dark:bg-${a.color}-900 rounded-full flex items-center justify-center`}>
                          {a.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{a.title}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{a.desc}</p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-300">{a.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Listings - Hidden for demo */}
            {false && (
              <div className="px-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Listings</h2>
                  <button
                    className="text-xs text-blue-500 hover:underline disabled:text-gray-400"
                    onClick={handleClearListings}
                    disabled={listings.length === 0}
                  >
                    Clear
                  </button>
                </div>
                <div className="space-y-4">
                  {listings.length === 0 ? (
                    <div className="text-gray-400 text-sm">No listings.</div>
                  ) : (
                    listings.map((l) => (
                      <div
                        key={l.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700"
                      >
                        <div className={`h-32 bg-gradient-to-r ${l.gradient} flex items-center justify-center text-white text-4xl`}>
                          {l.icon}
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{l.title}</h3>
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-300">{l.price}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300">{l.miles}</span>
                            <span className="text-sm text-green-600 dark:text-green-400">● {l.status}</span>
                          </div>
                          <div className="flex space-x-2 mt-3">
                            <button className="flex-1 bg-blue-500 dark:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors">
                              View Messages
                            </button>
                            <button className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Active Listings */}
            {testListings.length > 0 && (
              <div className="px-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Listings</h2>
                  <button
                    onClick={() => {
                      localStorage.removeItem('testListings');
                      setTestListings([]);
                    }}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded border border-red-200 hover:border-red-300 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-4">
                  {testListings.map((listing) => (
                    <DashboardListing key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'listings' && (
          <div className="px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">My Listings</h1>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                onClick={() => setShowCreateListing(true)}
              >
                + New Listing
              </button>
            </div>
            
            <div className="space-y-4">
              {testListings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🚗</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No listings yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first listing to get started</p>
                  <button
                    onClick={() => setShowCreateListing(true)}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                  >
                    Create First Listing
                  </button>
                </div>
              ) : (
                testListings.map((listing) => (
                  <DashboardListing key={listing.id} listing={listing} />
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && <MessagesView />}

        {activeTab === 'analytics' && (
          <div className="px-4 py-6">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Analytics</h1>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">This Week</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">$2,400</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-300">3</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Cars Sold</div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Response Rate</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">95%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Avg. Response Time</span>
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">2.3 min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Conversion Rate</span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'market-intelligence' && (
          <div className="px-4 py-6">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Market Intelligence</h1>
            
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Market Analysis</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Analyze car makes and models, research competitors, and set profit thresholds for your car flipping business.
                </p>
                <button
                  className="w-full bg-green-500 dark:bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-600 dark:hover:bg-green-800 transition-colors duration-200"
                  onClick={() => setShowMarketIntelligence(true)}
                >
                  🔍 Launch Market Intelligence
                </button>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Market Insights</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-blue-600 dark:text-blue-400 text-xl">📈</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Toyota Camry demand up 15%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Last 30 days in your area</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-green-600 dark:text-green-400 text-xl">💰</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Honda Civic profit potential: $2,800</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Based on current market data</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-purple-600 dark:text-purple-400 text-xl">🎯</div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Low competition for Ford F-150</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Only 3 active listings nearby</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai-listing' && (
          <div className="px-4 py-6">
            <AIListingGenerator />
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex justify-around">
          <button
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'dashboard' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'listings' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('listings')}
          >
            <span className="text-xl">🚗</span>
            <span className="text-xs mt-1">Listings</span>
          </button>
          
          <button
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'messages' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('messages')}
          >
            <span className="text-xl">💬</span>
            <span className="text-xs mt-1">Messages</span>
          </button>
          
          <button
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'analytics' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="text-xl">📊</span>
            <span className="text-xs mt-1">Analytics</span>
          </button>
          
          <button
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
              activeTab === 'market-intelligence' ? 'text-blue-500' : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('market-intelligence')}
          >
            <span className="text-xl">🔍</span>
            <span className="text-xs mt-1">Market Intel</span>
          </button>
          

        </div>
      </nav>

      {/* Create Listing Modal */}
      {showCreateListing && (
        <CreateListing onClose={() => setShowCreateListing(false)} />
      )}

      {/* Market Intelligence Modal */}
      {/* {showMarketIntelligence && (
        <MarketIntelligence onClose={() => setShowMarketIntelligence(false)} />
      )} */}
    </div>
  );
}
