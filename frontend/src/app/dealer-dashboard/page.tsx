'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { EmailVerification } from '@/components/EmailVerification';
import Header from '@/components/Header';
import DealerMode from '@/components/DealerMode';
import { listingsService, Listing } from '@/services/listingsService';

export default function DealerDashboard() {
  const { user, loading, isEmailVerified } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    totalRevenue: 0
  });
  const [logMsg, setLogMsg] = useState<string | null>(null);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  // Load listings from Supabase database
  useEffect(() => {
    const loadListings = async () => {
      if (!user) {
        setIsLoadingListings(false);
        return;
      }

      try {
        setIsLoadingListings(true);
        
        // Load listings and stats in parallel for better performance
        const [userListings, listingStats] = await Promise.all([
          listingsService.getUserListings(),
          listingsService.getListingStats()
        ]);
        
        setListings(userListings);
        setStats(listingStats);
        
        // Only show message if there are listings or if there was an error
        if (userListings.length > 0) {
          setLogMsg(`Loaded ${userListings.length} listings from database`);
        } else {
          setLogMsg(null); // Don't show "loaded 0 listings" message
        }
        
        // Run migration in background after initial load (non-blocking)
        setTimeout(async () => {
          try {
            await listingsService.migrateLocalStorageData();
          } catch (error) {
            console.log('Background migration completed or failed:', error);
          }
        }, 100);
        
      } catch (error) {
        console.error('Failed to load listings:', error);
        setLogMsg('Failed to load listings from database');
      } finally {
        setIsLoadingListings(false);
      }
    };

    loadListings();
  }, [user]);

  // Show loading state
  if (loading) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
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
          <p className="text-gray-600 mb-6">Please sign in to access your dealer dashboard.</p>
          <div className="space-y-3">
            <Link 
              href="/login" 
              className="inline-block w-full bg-amber-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/register" 
              className="inline-block w-full border border-amber-500 text-amber-600 py-3 px-6 rounded-lg font-semibold hover:bg-amber-50 transition-colors"
            >
              Create Account
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/" className="text-gray-500 hover:text-gray-700 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header currentMode="dealer" onModeChange={(mode) => {
          if (mode === 'solo') {
            window.location.href = '/dashboard';
          }
        }} />
      
      <main className="pb-20">
        {logMsg && (
          <div className="mx-4 my-2 p-3 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-lg text-sm shadow">
            {logMsg}
            <button className="ml-4 text-xs underline" onClick={() => setLogMsg(null)}>Dismiss</button>
          </div>
        )}

        {/* Dealer Header */}
        <div className="px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🏢 Dealer Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your entire inventory with AI-powered listings
            </p>
          </div>
        </div>

        {/* Enhanced Stats for Dealers */}
        <div className="px-4 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                {isLoadingListings ? '...' : stats.activeListings}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Active Listings</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                {isLoadingListings ? '...' : stats.totalListings}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Total Inventory</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">
                {isLoadingListings ? '...' : stats.soldListings}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Vehicles Sold</div>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                ${isLoadingListings ? '...' : stats.totalRevenue.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-300">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Dealer Mode Features */}
        <div className="px-4 mb-6">
          <DealerMode userTier={user?.user_metadata?.subscription_tier || 'free_trial'} />
        </div>

        {/* Quick Actions for Dealers */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-1 gap-3">
            <button className="w-full bg-blue-500 dark:bg-blue-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-blue-600 dark:hover:bg-blue-800 transition-colors duration-200 text-center flex items-center justify-center gap-3">
              📸 Add New Vehicle
            </button>
            <button className="w-full bg-green-500 dark:bg-green-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-green-600 dark:hover:bg-green-800 transition-colors duration-200 text-center flex items-center justify-center gap-3">
              📊 Bulk Import CSV
            </button>
            <button className="w-full bg-purple-500 dark:bg-purple-700 text-white py-4 rounded-xl font-semibold shadow-lg hover:bg-purple-600 dark:hover:bg-purple-800 transition-colors duration-200 text-center flex items-center justify-center gap-3">
              🚀 Post to All Platforms
            </button>
          </div>
        </div>

        {/* Inventory Overview */}
        {!isLoadingListings && listings.length > 0 && (
          <div className="px-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Inventory Overview ({listings.length})</h2>
              <Link
                href="/listings"
                className="text-sm text-blue-600 hover:text-blue-700 px-2 py-1 rounded border border-blue-200 hover:border-blue-300 transition-colors"
              >
                View All
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listings.slice(0, 4).map((listing) => (
                <div key={listing.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{listing.title}</h3>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">${listing.price?.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{listing.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Status: {listing.status}</span>
                    <div className="flex gap-2">
                      <button className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 px-2 py-1 rounded">Edit</button>
                      <button className="text-xs bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 px-2 py-1 rounded">Post</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoadingListings && listings.length === 0 && (
          <div className="px-4 mb-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Inventory Yet</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Start building your dealer inventory by importing your vehicles.</p>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Import Inventory
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
    </ThemeProvider>
  );
}
