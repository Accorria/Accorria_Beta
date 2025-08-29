'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfile } from '@/components/UserProfile';
import Chatbot from '@/components/Chatbot';
import Link from 'next/link';

export default function AppPage() {
  const { user, loading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/';
    }
  }, [user, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show nothing while redirecting
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src="/AccorriaYwLOGO.png" 
                  alt="Accorria" 
                  className="h-12 w-auto"
                />
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-8">
                <Link href="/app" className="text-gray-900 hover:text-amber-600 px-3 py-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/app/listings" className="text-gray-500 hover:text-amber-600 px-3 py-2 text-sm font-medium">
                  My Listings
                </Link>
                <Link href="/app/analytics" className="text-gray-500 hover:text-amber-600 px-3 py-2 text-sm font-medium">
                  Analytics
                </Link>
              </nav>
              
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.user_metadata?.full_name || user.email}!
          </h1>
          <p className="mt-2 text-gray-600">
            Ready to list your next car or home? Let's get started.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">List a Car</h3>
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-sm">🚗</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Upload photos and get an AI-generated listing in minutes.
            </p>
            <button className="w-full bg-amber-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-amber-600 transition-colors">
              Start Car Listing
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">List a Home</h3>
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-sm">🏠</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Coming soon! List your home with AI-powered pricing guidance.
            </p>
            <button className="w-full bg-gray-300 text-gray-500 py-2 px-4 rounded-lg font-medium cursor-not-allowed">
              Coming Soon
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">View Analytics</h3>
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                <span className="text-amber-600 text-sm">📊</span>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Track your listing performance and market insights.
            </p>
            <Link href="/app/analytics" className="block w-full bg-amber-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-amber-600 transition-colors text-center">
              View Analytics
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📝</span>
            </div>
            <p className="text-gray-500">No recent activity</p>
            <p className="text-gray-400 text-sm">Start by creating your first listing</p>
          </div>
        </div>
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
