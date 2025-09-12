'use client';

import React from "react";
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-50 text-slate-100">
      {/* NAV */}
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-slate-900/70">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img 
              src="/AccorriaYwLOGO.png" 
              alt="Accorria" 
              className="h-[175px] w-auto"
            />
          </div>
          <div className="hidden gap-6 text-sm text-slate-200/80 md:flex">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/how-it-works" className="hover:text-white text-amber-300">How it works</Link>
            <Link href="/demo" className="hover:text-white">Demo</Link>
            <Link href="/get-paid" className="hover:text-white">Get Paid</Link>
            <a href="/#pricing" className="hover:text-white">Pricing</a>
            <a href="/#faq" className="hover:text-white">FAQ</a>
          </div>
          <Link href="/beta-signup" className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">Get early access</Link>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.08),rgba(2,6,23,0.2)_60%,rgba(2,6,23,1)_100%)]" />

        <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl mb-6">
              How <span className="text-amber-300">Accorria</span> Works
            </h1>
            <p className="text-xl text-slate-700 max-w-3xl mx-auto mb-8">
              From photos to posted in minutes. From listing to closed deal in days. Here's how our AI deal agent makes selling faster and safer.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row justify-center">
              <Link href="/demo" className="rounded-lg bg-amber-400 px-6 py-3 font-semibold text-slate-900 hover:bg-amber-300">Watch Demo</Link>
              <Link href="/beta-signup" className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white/90 hover:bg-white/5">Try It Free</Link>
            </div>
          </div>
        </div>
      </section>

      {/* STEP BY STEP */}
      <section className="bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">The Process</h2>
          <div className="grid gap-12">
            {/* Step 1 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 mb-4">
                  Step 1
                </div>
                <h3 className="text-2xl font-bold mb-4">Upload & Analyze</h3>
                <p className="text-lg text-slate-600 mb-6">
                  Add photos of your car or home, or paste a VIN/address. Our AI analyzes the images and pulls specs, comps, and market data automatically.
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    AI identifies make, model, year, features
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    Pulls recent comparable sales
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    Analyzes market demand and pricing
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="w-full h-64">
                  <img 
                    src="/Selecting Photos.png" 
                    alt="Photo selection interface for AI analysis" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="md:order-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 mb-4">
                  Step 2
                </div>
                <h3 className="text-2xl font-bold mb-4">AI Generates Listing</h3>
                <p className="text-lg text-slate-600 mb-6">
                  Our AI crafts a professional title, compelling description, competitive pricing, and Facebook-ready post with all the right keywords.
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    Professional title with keywords
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    Compelling description that converts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    Market-based pricing guidance
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm md:order-1">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✨</span>
                </div>
                <h4 className="font-semibold text-center mb-2">AI-Powered Content</h4>
                <p className="text-sm text-slate-600 text-center">Professional listings in seconds</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 mb-4">
                  Step 3
                </div>
                <h3 className="text-2xl font-bold mb-4">Post & Close</h3>
                <p className="text-lg text-slate-600 mb-6">
                  One click posts to Facebook Marketplace. Our AI coaches your replies, handles negotiations, and soon — escrow for secure closings.
                </p>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    One-click posting to Facebook
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    AI reply suggestions and coaching
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    Secure escrow closing (coming soon)
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🚀</span>
                </div>
                <h4 className="font-semibold text-center mb-2">Smart Closing</h4>
                <p className="text-sm text-slate-600 text-center">From listing to closed deal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">Why It Works Better</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">10x Faster</h3>
              <p className="text-slate-600">From photos to posted in minutes, not hours. No more staring at blank screens wondering what to write.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Better Results</h3>
              <p className="text-slate-600">AI-optimized titles and descriptions get more views, better offers, and faster sales.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Safer Deals</h3>
              <p className="text-slate-600">Smart reply coaching and soon — blockchain escrow — make every deal safer and more secure.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Sell Faster?</h2>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Join thousands of sellers who are already using Accorria to close deals faster and safer.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row justify-center">
            <Link href="/beta-signup" className="rounded-lg bg-white px-6 py-3 font-semibold text-amber-600 hover:bg-amber-50">
              Start Free Trial
            </Link>
            <Link href="/demo" className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white hover:bg-white/10">
              Watch Demo
            </Link>
          </div>
        </div>
      </section>

              <footer className="bg-slate-900 py-10 text-center text-sm text-slate-200">
        © {new Date().getFullYear()} Accorria. All rights reserved.
      </footer>
    </div>
  );
}
