'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  🚗 Accorria
                </h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Features
                </a>
                <a href="#pricing" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Pricing
                </a>
                <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  How It Works
                </a>
                <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Get Started Free
                </Link>
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Accorria —</span>{' '}
                  <span className="block text-blue-600 xl:inline">your AI deal agent.</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Upload a photo. We'll craft the listing, prep the post for Facebook, handle negotiation, and (soon) escrow.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/beta-signup" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                      Get early access
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link href="/demo" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10">
                      Watch 60-sec demo
                    </Link>
                  </div>
                </div>
                <div className="mt-8">
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100">
                          <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Faster listings</p>
                        <p className="text-sm text-gray-500">AI writes, formats, and prices in seconds.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100">
                          <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Fewer headaches</p>
                        <p className="text-sm text-gray-500">You post with one click—no bots, all legit.</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100">
                          <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">More trust</p>
                        <p className="text-sm text-gray-500">Escrow contracts rolling out for cars (tax-time) → homes next.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">How It Works</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Sell your car in 5 minutes
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              AI handles 80% of the work. You just count the money and hand over the keys.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  📸
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">1. Upload Photos</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Take 5-20 photos of your car. AI analyzes them to detect features like leather seats, sunroof, and more.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  🤖
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">2. AI Creates Listing</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Get a professional description, 3-tier pricing strategy, and FlipScore in 30 seconds.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  📱
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">3. Post & Sell</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Copy to Facebook Marketplace. Messenger Bot handles buyer questions 24/7.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to sell your car faster
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              AI-powered tools that help you get the best price with minimal effort.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  🔍
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Smart Photo Analysis</h3>
                  <p className="mt-2 text-base text-gray-500">
                    AI detects features from your photos: leather seats, sunroof, navigation, backup camera, and more.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  💰
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">3-Tier Pricing Strategy</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Quick Sale, Market Price, or Top Dollar. Choose your strategy based on how fast you want to sell.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  📊
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">FlipScore Rating</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Get a 0-100 score showing your car's resale potential based on condition, features, and market demand.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  🤖
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Messenger Bot</h3>
                  <p className="mt-2 text-base text-gray-500">
                    AI handles buyer questions 24/7. Negotiates price, schedules meetings, and sends reminders.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Pricing</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              All plans include Messenger Bot and FlipScore. No hidden fees.
            </p>
          </div>

          <div className="mt-10 max-w-lg mx-auto lg:max-w-none lg:mx-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
              <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200 border-2 border-green-500">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Free Trial</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Popular
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">
                    Perfect for testing the platform
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">$0</span>
                    <span className="text-base font-medium text-gray-500">/7 days</span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">3 posts total</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">AI listing generator</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Messenger Bot (baseline)</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">FlipScore included</span>
                    </li>
                  </ul>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <Link href="/dashboard" className="block w-full bg-green-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-green-700">
                    Start Free Trial
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">Starter</h3>
                  <p className="mt-4 text-sm text-gray-500">
                    For side hustlers (1-2 cars/month)
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">$20</span>
                    <span className="text-base font-medium text-gray-500">/month</span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">5 posts / month</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Multi-platform posting</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Simple analytics</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Messenger Bot included</span>
                    </li>
                  </ul>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <Link href="/dashboard" className="block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700">
                    Start Starter
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">Growth</h3>
                  <p className="mt-4 text-sm text-gray-500">
                    For full-time sellers
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">$50</span>
                    <span className="text-base font-medium text-gray-500">/month</span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Unlimited posts</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Smart listing optimizer</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Lead & sales analytics</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Enhanced Messenger Bot</span>
                    </li>
                  </ul>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <Link href="/dashboard" className="block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700">
                    Start Growth
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">Dealer Pro</h3>
                  <p className="mt-4 text-sm text-gray-500">
                    For dealerships & teams
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">$200</span>
                    <span className="text-base font-medium text-gray-500">/month</span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Unlimited posts + Team seats</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Auction tools</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Repair cost estimator</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Dealer analytics</span>
                    </li>
                  </ul>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <Link href="/dashboard" className="block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700">
                    Start Dealer Pro
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            <span className="block">Ready to sell your car faster?</span>
            <span className="block text-blue-200">Start your free trial today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link href="/dashboard" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50">
                Get Started Free
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <a href="#how-it-works" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-500 hover:bg-blue-400">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <span className="text-2xl font-bold text-white">
                🚗 Accorria
              </span>
              <p className="text-gray-300 text-base">
                Upload photos. We'll flip the rest.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    Product
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#features" className="text-base text-gray-300 hover:text-white">
                        Features
                      </a>
                    </li>
                    <li>
                      <a href="#pricing" className="text-base text-gray-300 hover:text-white">
                        Pricing
                      </a>
                    </li>
                    <li>
                      <a href="#how-it-works" className="text-base text-gray-300 hover:text-white">
                        How It Works
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">
                    Support
                  </h3>
                  <ul className="mt-4 space-y-4">
                    <li>
                      <a href="#" className="text-base text-gray-300 hover:text-white">
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-base text-gray-300 hover:text-white">
                        Contact Us
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; 2025 Accorria. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 