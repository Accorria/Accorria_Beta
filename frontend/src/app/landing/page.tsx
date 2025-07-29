'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
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
                  🚗 QuickFlip AI
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
                <a href="#about" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  About
                </a>
                <Link href="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                  Get Started
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
                  <span className="block xl:inline">AI-Powered</span>{' '}
                  <span className="block text-blue-600 xl:inline">Car Flipping</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Transform your car flipping business with AI. Get instant market analysis, 
                  generate professional listings, and maximize your profits with intelligent pricing.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link href="/dashboard" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10">
                      Start Flipping Cars
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <a href="#demo" className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 md:py-4 md:text-lg md:px-10">
                      Watch Demo
                    </a>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to flip cars smarter
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              AI-powered tools that give you the edge in the competitive car flipping market.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  🧠
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">AI Market Analysis</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Get instant market intelligence with AI-powered analysis of comparable sales, 
                  pricing trends, and demand patterns.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  📝
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Smart Listing Generator</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Generate professional car listings automatically with AI that understands 
                  what buyers want to see.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  💰
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Profit Optimization</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Maximize your profits with intelligent pricing recommendations and 
                  negotiation strategies.
                </p>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                  📱
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Multi-Platform Posting</p>
                <p className="mt-2 ml-16 text-base text-gray-500">
                  Post to Craigslist, Facebook Marketplace, and more with 
                  optimized listings for each platform.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Pricing</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </p>
          </div>

          <div className="mt-10 max-w-lg mx-auto lg:max-w-none lg:mx-0">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">Starter</h3>
                  <p className="mt-4 text-sm text-gray-500">
                    Perfect for getting started with car flipping
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">$0</span>
                    <span className="text-base font-medium text-gray-500">/month</span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">5 AI analyses per month</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Basic listing generation</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Market insights</span>
                    </li>
                  </ul>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <Link href="/dashboard" className="block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700">
                    Get Started Free
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">Pro</h3>
                  <p className="mt-4 text-sm text-gray-500">
                    For serious car flippers
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">$29</span>
                    <span className="text-base font-medium text-gray-500">/month</span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Unlimited AI analyses</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Advanced listing optimization</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Multi-platform posting</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Priority support</span>
                    </li>
                  </ul>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <Link href="/dashboard" className="block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700">
                    Start Pro Trial
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg divide-y divide-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900">Enterprise</h3>
                  <p className="mt-4 text-sm text-gray-500">
                    For dealerships and large operations
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">$99</span>
                    <span className="text-base font-medium text-gray-500">/month</span>
                  </p>
                  <ul className="mt-6 space-y-4">
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Everything in Pro</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Custom integrations</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">Dedicated account manager</span>
                    </li>
                    <li className="flex">
                      <span className="text-green-500">✓</span>
                      <span className="ml-3 text-sm text-gray-700">API access</span>
                    </li>
                  </ul>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <Link href="/dashboard" className="block w-full bg-blue-600 border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-blue-700">
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to start flipping cars smarter?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-blue-200">
            Join thousands of car flippers who are already using AI to maximize their profits.
          </p>
          <Link href="/dashboard" className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto">
            Get Started Now
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
          <div className="xl:grid xl:grid-cols-3 xl:gap-8">
            <div className="space-y-8 xl:col-span-1">
              <h3 className="text-2xl font-bold text-white">🚗 QuickFlip AI</h3>
              <p className="text-gray-300 text-base">
                AI-powered car flipping platform that helps you buy, sell, and profit from cars smarter.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
              <div className="md:grid md:grid-cols-2 md:gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Features</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Pricing</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">API</a></li>
                  </ul>
                </div>
                <div className="mt-12 md:mt-0">
                  <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Support</h3>
                  <ul className="mt-4 space-y-4">
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Help Center</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Contact</a></li>
                    <li><a href="#" className="text-base text-gray-300 hover:text-white">Status</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-base text-gray-400 xl:text-center">
              &copy; 2025 QuickFlip AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 