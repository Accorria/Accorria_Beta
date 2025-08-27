'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Demo() {
  const [demoData, setDemoData] = useState({
    year: '',
    make: '',
    model: '',
    mileage: ''
  });
  const [showResult, setShowResult] = useState(false);

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResult(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDemoData({
      ...demoData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex-shrink-0">
                <img 
                  src="/AccorriaYwLOGO.png" 
                  alt="Accorria" 
                  className="h-[175px] w-auto"
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            See Accorria in Action
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Watch how AI transforms car selling from hours to minutes
          </p>
        </div>

        {/* Video Demo Section */}
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">60-Second Demo</h2>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                  <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600">Demo video coming soon</p>
                <p className="text-sm text-gray-500 mt-2">Upload photo → AI analysis → Professional listing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Demo Section */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Try the Listing Generator</h2>
            <form onSubmit={handleDemoSubmit} className="space-y-4">
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Year
                </label>
                <input
                  type="text"
                  id="year"
                  name="year"
                  value={demoData.year}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2020"
                />
              </div>
              <div>
                <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                  Make
                </label>
                <input
                  type="text"
                  id="make"
                  name="make"
                  value={demoData.make}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Honda"
                />
              </div>
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                  Model
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={demoData.model}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Civic"
                />
              </div>
              <div>
                <label htmlFor="mileage" className="block text-sm font-medium text-gray-700">
                  Mileage
                </label>
                <input
                  type="text"
                  id="mileage"
                  name="mileage"
                  value={demoData.mileage}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="45,000"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Generate Sample Listing
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Generated Listing</h2>
            {showResult ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Title</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {demoData.year} {demoData.make} {demoData.model} - Clean, Well-Maintained
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <div className="text-gray-700 bg-gray-50 p-3 rounded space-y-2">
                    <p>🚗 {demoData.year} {demoData.make} {demoData.model}</p>
                    <p>📏 {demoData.mileage} miles</p>
                    <p>✅ Clean title, no accidents</p>
                    <p>🔧 Well-maintained, runs great</p>
                    <p>💰 Competitive pricing</p>
                    <p>📱 Serious inquiries only, please</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Pricing Strategy</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quick Sale:</span>
                      <span className="font-semibold">$12,500</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Price:</span>
                      <span className="font-semibold">$14,200</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Top Dollar:</span>
                      <span className="font-semibold">$15,800</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">FlipScore</h3>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <span className="ml-2 text-sm font-semibold text-gray-700">75/100</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Good resale potential</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p>Enter your car details to see the AI-generated listing</p>
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to try Accorria?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join the beta and be among the first to experience AI-powered car selling.
          </p>
          <div className="space-x-4">
            <Link href="/beta-signup" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Get Early Access
            </Link>
            <Link href="/" className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
