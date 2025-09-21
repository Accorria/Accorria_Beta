'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { EmailVerification } from '@/components/EmailVerification';
import Header from '@/components/Header';
import { useTheme } from '@/contexts/ThemeContext';

export default function MessagesPage() {
  const { user, loading, isEmailVerified } = useAuth();
  const { isDarkMode } = useTheme();

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
          <p className="text-gray-600 mb-6">Please sign in to access your messages.</p>
          <Link 
            href="/dashboard" 
            className="inline-block bg-amber-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
      
      <main className="pb-20">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Messages</h1>
          
          <div className="space-y-4">
            {/* AI Agent Conversation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                  🤖
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">AI Agent - Honda Civic</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Live</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src="/Car in garage.png" alt="2020 Honda Civic" className="w-12 h-8 rounded object-cover" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">2020 Honda Civic - $18,500</p>
                      <div className="mt-2 space-y-1">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Buyer:</span> "Is this car still available?"
                        </div>
                        <div className="bg-amber-100 dark:bg-amber-900 rounded-lg p-2 text-sm">
                          <span className="text-amber-700 dark:text-amber-300">AI Agent:</span> "Yes! The 2020 Honda Civic is available. Would you like to schedule a viewing?"
                        </div>
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Buyer:</span> "What's the lowest you'll take?"
                        </div>
                        <div className="bg-amber-100 dark:bg-amber-900 rounded-lg p-2 text-sm">
                          <span className="text-amber-700 dark:text-amber-300">AI Agent:</span> "The price is firm at $18,500. This is below market value for the condition and mileage. Would you like to see it today?"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Another AI Agent Conversation */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-white font-semibold">
                  🤖
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">AI Agent - Toyota Camry</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Completed</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src="/ModernHome.png" alt="2018 Toyota Camry" className="w-12 h-8 rounded object-cover" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">2018 Toyota Camry - $16,500</p>
                      <div className="mt-2 space-y-1">
                        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Buyer:</span> "I'm interested in the Camry"
                        </div>
                        <div className="bg-amber-100 dark:bg-amber-900 rounded-lg p-2 text-sm">
                          <span className="text-amber-700 dark:text-amber-300">AI Agent:</span> "Great! The 2018 Camry has excellent fuel economy and one owner. When would you like to see it?"
                        </div>
                        <div className="bg-green-100 dark:bg-green-900 rounded-lg p-2 text-sm">
                          <span className="text-green-700 dark:text-green-300">✅ Deal Closed:</span> "Sold for $16,500 - Escrow completed"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  SM
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Sarah M.</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">15m ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src="/Car listing Details..png" alt="2019 Honda Civic" className="w-12 h-8 rounded object-cover" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">2019 Honda Civic</p>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">&ldquo;What&apos;s the lowest you&apos;ll take for the Honda?&rdquo;</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  MR
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Mike R.</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">1h ago</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src="/Car in garage.png" alt="2017 Nissan Altima" className="w-12 h-8 rounded object-cover" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">2017 Nissan Altima</p>
                      <p className="text-gray-700 dark:text-gray-300 mt-1">&ldquo;Can I schedule a test drive for tomorrow?&rdquo;</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex justify-around items-center">
          <Link href="/dashboard" className="flex flex-col items-center py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
            <span className="text-2xl">🏠</span>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link href="/listings" className="flex flex-col items-center py-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">
            <span className="text-2xl">🚗</span>
            <span className="text-xs mt-1">Listings</span>
          </Link>
          <Link href="/messages" className="flex flex-col items-center py-2 text-blue-600 dark:text-blue-400">
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
      </div>
  );
}
