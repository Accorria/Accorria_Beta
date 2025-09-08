'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { EmailVerification } from '@/components/EmailVerification';
import DashboardListing from '@/components/DashboardListing';
import CreateListing from '@/components/listings/CreateListing';
import Header from '@/components/Header';

export default function Dashboard() {
  const { user, loading, isEmailVerified } = useAuth();
  const [testListings, setTestListings] = useState<any[]>([]);
  const [logMsg, setLogMsg] = useState<string | null>(null);
  const [showCreateListing, setShowCreateListing] = useState(false);

  // State for activities
  const [activities, setActivities] = useState([
    {
      type: 'price',
      icon: '💰',
      title: 'Price Updated',
      desc: '2019 Honda Civic - New price: $18,500',
      time: '2h ago'
    },
    {
      type: 'message',
      icon: '💬',
      title: 'New Message',
      desc: 'John D. asked about your 2017 Nissan Altima',
      time: '4h ago'
    },
    {
      type: 'listing',
      icon: '📸',
      title: 'Listing Created',
      desc: '2019 Honda Civic posted to Facebook Marketplace',
      time: '1d ago'
    }
  ]);

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

  const handleClearActivity = async () => {
    setActivities([]);
    setLogMsg('You cleared your recent activity.');
    await fetch('/api/v1/user/log_action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear_recent_activity', timestamp: new Date().toISOString() }),
    });
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show email verification if user is not verified
  if (user && !isEmailVerified) {
    return <EmailVerification email={user.email || ''} />;
  }

  // Show login prompt if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Required</h1>
          <p className="text-gray-600 mb-6">Please sign in to access your dashboard.</p>
          <Link 
            href="/" 
            className="inline-block bg-amber-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="pb-20">
        {logMsg && (
          <div className="mx-4 my-2 p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm shadow">
            {logMsg}
            <button className="ml-4 text-xs underline" onClick={() => setLogMsg(null)}>Dismiss</button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="px-4 py-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{testListings.length}</div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Active Listings</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                {testListings.reduce((total, listing) => total + (listing.messages || 0), 0)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Messages</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                ${testListings.reduce((total, listing) => {
                  return total + (listing.soldFor || 0);
                }, 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => setShowCreateListing(true)}
              className="w-full bg-blue-500 dark:bg-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors duration-200 text-center"
            >
              📸 Post New Car
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <button
              onClick={handleClearActivity}
              className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded border border-red-200 hover:border-red-300 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{activity.icon}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{activity.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{activity.desc}</p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Listings */}
        {testListings.length > 0 && (
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Your Listings ({testListings.length})</h2>
              <Link
                href="/listings"
                className="text-sm text-blue-600 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 hover:border-blue-300 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {testListings.slice(0, 2).map((listing) => (
                <DashboardListing key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}

        {/* Quick Market Analysis */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Market Analysis</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Analyze car makes and models, research competitors, and set profit thresholds for your car flipping business.
              </p>
              <Link
                href="/market-intel"
                className="w-full bg-green-500 dark:bg-green-700 text-white py-3 rounded-lg font-semibold hover:bg-green-600 dark:hover:bg-green-800 transition-colors duration-200 text-center block"
              >
                🔍 Launch Market Intelligence
              </Link>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Market Insights</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Honda Civic</span>
                    <span className="text-xs text-blue-600 dark:text-blue-300">+5.2%</span>
                  </div>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">Market demand increasing</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">Toyota Camry</span>
                    <span className="text-xs text-green-600 dark:text-green-300">+3.8%</span>
                  </div>
                  <p className="text-xs text-green-600 dark:text-green-300 mt-1">Stable pricing trend</p>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-800 dark:text-orange-200">Ford F-150</span>
                    <span className="text-xs text-orange-600 dark:text-orange-300">-2.1%</span>
                  </div>
                  <p className="text-xs text-orange-600 dark:text-orange-300 mt-1">Slight price decrease</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex justify-around items-center">
          <Link href="/" className="flex flex-col items-center py-2 text-blue-600 dark:text-blue-400">
            <span className="text-2xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/listings" className="flex flex-col items-center py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
            <span className="text-2xl">🚗</span>
            <span className="text-xs mt-1">Listings</span>
          </Link>
          <Link href="/messages" className="flex flex-col items-center py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
            <span className="text-2xl">💬</span>
            <span className="text-xs mt-1">Messages</span>
          </Link>
          <Link href="/analytics" className="flex flex-col items-center py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
            <span className="text-2xl">📊</span>
            <span className="text-xs mt-1">Analytics</span>
          </Link>
          <Link href="/market-intel" className="flex flex-col items-center py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
            <span className="text-2xl">🔍</span>
            <span className="text-xs mt-1">Market Intel</span>
          </Link>
        </div>
      </nav>

      {/* Create Listing Modal */}
      {showCreateListing && (
        <CreateListing 
          onClose={() => setShowCreateListing(false)}
        />
      )}
    </div>
  );
}