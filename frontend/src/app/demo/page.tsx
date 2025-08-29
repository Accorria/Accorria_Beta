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
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-50 text-slate-100">
      {/* Navigation */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img 
              src="/AccorriaYwLOGO.png" 
              alt="Accorria" 
              className="h-[175px] w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white/80 hover:text-white transition-colors">
              ← Back to Home
            </Link>
          </div>
        </nav>
      </header>

      {/* Demo Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
            See Accorria in Action
          </h1>
          <p className="mt-4 text-xl text-slate-300">
            Watch how AI transforms car selling from hours to minutes
          </p>
        </div>

        {/* Video Demo Section */}
        <div className="mb-16">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">60-Second Demo</h2>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-100 mb-4">
                  <svg className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-600">Demo video coming soon</p>
                <p className="text-sm text-gray-500 mt-2">Upload photo → AI analysis → Professional listing</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to try Accorria?
          </h2>
          <p className="text-xl text-slate-300 mb-8">
            Join the beta and be among the first to experience AI-powered car selling.
          </p>
          <div className="space-x-4">
            <Link href="/beta-signup" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-slate-900 bg-amber-400 hover:bg-amber-300">
              Get Early Access
            </Link>
            <Link href="/" className="inline-flex items-center px-6 py-3 border border-white/20 text-base font-medium rounded-md text-white bg-transparent hover:bg-white/5">
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
