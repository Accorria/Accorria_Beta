'use client';

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from 'next/link';
import Chatbot from '@/components/Chatbot';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';

/**
 * Accorria Landing v2 (single-file mock)
 * - Hybrid light/dark look (hero dark, body light)
 * - Hero "swoop" motion cycling: Car → Home → Handshake
 * - "How it works" with icons
 * - Feature highlights
 * - Pricing teaser
 * - Floating Chatbot mock (bottom-right)
 * - Mobile-first, Tailwind-only
 *
 * Drop-in for Next.js / React. Tailwind required.
 */

const IMAGES = [
  {
    title: "List a car in minutes",
    caption: "Upload photos, VIN, or specs — we prep the post.",
    url: "/Car in garage.png",
    alt: "Car in a modern garage"
  },
  {
    title: "Price your home with guidance",
    caption: "Guided copy + comps to post confidently.",
    url: "/ModernHome.png",
    alt: "Modern home exterior"
  },
  {
    title: "Close the deal, safer",
    caption: "We coach replies. Escrow support coming soon.",
    url: "https://images.unsplash.com/photo-1573167243872-43c6433b9d40?q=80&w=1600&auto=format&fit=crop",
    alt: "Handshake at a desk"
  }
];

const Icon = ({ name, className = "w-5 h-5" }: { name: string; className?: string }) => {
  const paths: Record<string, string> = {
    upload:
      "M3 12a1 1 0 0 1 1-1h4V5a1 1 0 1 1 2 0v6h4a1 1 0 1 1 0 2H10v6a1 1 0 1 1-2 0v-6H4a1 1 0 0 1-1-1Z",
    magic:
      "M6 3l2 4 4 2-4 2-2 4-2-4-4-2 4-2 2-4Zm10 2 2 2 2-2 2 2-2 2 2 2-2 2-2-2-2 2-2-2 2-2-2-2 2-2Z",
    post:
      "M3 5a2 2 0 0 1 2-2h14a1 1 0 1 1 0 2H5v14a1 1 0 1 1-2 0V5Zm4 4h12a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2Zm0 6h8a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2Z",
    bolt:
      "M11 2l-6 10h6l-2 10 8-12h-6l4-8z",
    shield:
      "M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Zm0 6a4 4 0 0 0-4 4 1 1 0 1 0 2 0 2 2 0 0 1 4 0c0 1.7-.9 3.2-2.3 4.1a1 1 0 0 0-.5.86V19a1 1 0 1 0 2 0v-1.04c1.95-1.3 3.3-3.48 3.3-5.96A4 4 0 0 0 12 8Z",
    chat:
      "M4 3h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H9l-5 4v-4H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
  };
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={paths[name]} />
    </svg>
  );
};

function useCarousel(len: number, interval = 3800) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % len), interval);
    return () => clearInterval(id);
  }, [len, interval]);
  return idx;
}


export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);
  const idx = useCarousel(IMAGES.length);
  const hero = IMAGES[idx];
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const handleAuthSuccess = () => {
    // User successfully logged in or registered
    console.log('Authentication successful');
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-50 text-slate-100 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-50 text-slate-100" suppressHydrationWarning={true}>
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
            <Link href="/how-it-works" className="hover:text-white">How it works</Link>
            <Link href="/demo" className="hover:text-white">Demo</Link>
            <Link href="/get-paid" className="hover:text-white">Get Paid</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/qa" className="hover:text-white">Q&A</Link>
          </div>
          {user ? (
            <Link href="/dashboard" className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">
              Dashboard
            </Link>
          ) : (
            <button
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300"
            >
              Sign In
            </button>
          )}
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(255,255,255,0.08),rgba(2,6,23,0.2)_60%,rgba(2,6,23,1)_100%)]" />

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <h1 className="text-3xl font-extrabold leading-tight md:text-5xl">
              #1 Trust-Native Listing Platform
            </h1>
            <h2 className="mt-6 max-w-4xl text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
              The Future of Selling. Starts Here.
            </h2>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {user ? (
                <Link href="/dashboard" className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-300">Dashboard</Link>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-300"
                  >
                    Get Started Free
                  </button>
                  <Link href="/how-it-works" className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white/90 hover:bg-white/5">
                    Learn How It Works
                  </Link>
                </>
              )}
              <Link href="/demo" className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white/90 hover:bg-white/5">Watch 60‑sec Demo</Link>
            </div>

            {/* Newsletter Signup */}
            <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-2">🚀 Stay ahead. Get early access to Accorria.</h3>
              <p className="text-white/80 text-sm mb-4">Be the first to know about new features, pricing updates, and exclusive offers.</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400 text-base"
                />
                <button className="px-6 py-3 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors text-base">
                  Subscribe
                </button>
              </div>
            </div>

          </div>

          {/* Hero carousel with swoop motion */}
          <div className="relative h-[320px] w-full overflow-hidden rounded-2xl bg-slate-800 shadow-2xl md:h-[420px]">
            <AnimatePresence mode="popLayout">
              <motion.img
                key={hero.url}
                src={hero.url}
                alt={hero.alt}
                className="absolute inset-0 h-full w-full object-cover"
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -80, opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
              />
            </AnimatePresence>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 text-white">
              <div className="text-sm font-semibold uppercase tracking-wide text-amber-300">{idx === 0 ? "Car" : idx === 1 ? "Home" : "Deal"}</div>
              <div className="text-lg font-bold">{hero.title}</div>
              <div className="text-sm text-white/80">{hero.caption}</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl font-bold md:text-3xl">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <Card icon="upload" title="Upload" desc="Upload photos, select the ones you want analyzed. Your agent pulls details from the images + VIN/address and builds the foundation for your listing." />
            <Card icon="magic" title="Generate" desc="AI crafts the full listing: title, description, price guidance, and marketplace-ready post." />
            <Card icon="post" title="Post & Close" desc="Publish once → Accorria helps you cross-post everywhere. Sell via escrow for safer payments or in person your choice." />
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-6 md:grid-cols-3">
            <Feature title="Faster listings" desc="From photos to posting in minutes, not hours." />
            <Feature title="Smarter negotiations" desc="Your personal AI Negotiator Agent reduces back-and-forth and keeps buyers serious." />
            <Feature title="Safer closings" desc="Built-in escrow for cars now, homes next. Future-proof with optional digital certificates coming." />
          </div>
        </div>
      </section>

      {/* HERO IMAGE SECTION */}
      <section className="bg-gradient-to-br from-slate-900 to-gray-900">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">See It In Action</h2>
              <p className="text-lg text-gray-300 mb-8">
                Watch how Accorria transforms your photos into perfect listings in seconds. 
                Real users, real results, real savings.
              </p>
              <div className="flex gap-4">
                <Link href="/demo" className="bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors">
                  Watch Demo
                </Link>
                <Link href="/dashboard" className="border border-white/20 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  Try It Now
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gray-800 rounded-2xl p-8 text-center">
                <div className="w-full h-64 rounded-lg overflow-hidden mb-4">
                  <img 
                    src="/Analizing Photos.png" 
                    alt="AI analyzing photos to generate perfect listing" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-gray-400 text-sm">Upload photos → AI analysis → Perfect listing</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GET PAID TEASER SECTION */}
      <section className="bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 mb-4">
              💰 Coming Soon
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              A New Way to Get Paid
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Skip the bank delays. Skip the scams. Get paid instantly when deals close cars, homes, rentals. Blockchain-powered settlements within 48 hours.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">48-Hour Payments</h3>
              <p className="text-slate-600">No more waiting weeks for bank transfers</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔐</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Funds Locked</h3>
              <p className="text-slate-600">Smart contracts hold payment until deal closes</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">No Scams</h3>
              <p className="text-slate-600">Blockchain verification prevents fraud</p>
            </div>
          </div>
          
          <div className="text-center">
            <Link href="/get-paid" className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-6 py-3 font-semibold text-white hover:bg-amber-600 transition-colors">
              <span>Learn How It Works</span>
              <span className="text-sm">→</span>
            </Link>
            <p className="text-sm text-slate-700 mt-3">See how blockchain makes deals safer and faster</p>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      {/* Why It Works Better */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl text-gray-900">Why It Works Better</h2>
            <p className="mt-4 text-lg text-gray-700 max-w-3xl mx-auto">
              We&apos;re the trust layer for high-value listings. Upload photos → AI listing, Shield verification, escrow you can paste as a link, and optional digital-twin certificates for provenance.
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">10x Faster</h3>
              <p className="text-gray-600">AI generates perfect listings in seconds. No more hours writing descriptions or taking photos.</p>
              <div className="mt-4 w-full h-32 rounded-lg overflow-hidden">
                <img 
                  src="/Selecting Photos.png" 
                  alt="User selecting photos for AI analysis" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Better Results</h3>
              <p className="text-gray-600">Smart pricing, multi-platform posting, and automated negotiation get you top dollar.</p>
              <div className="mt-4 w-full h-32 rounded-lg overflow-hidden">
                <img 
                  src="/Fackbook posted.jpeg" 
                  alt="Final listing posted to Facebook Marketplace" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Safer Deals</h3>
              <p className="text-gray-600">Built-in escrow, ID verification, and title checks protect both buyers and sellers.</p>
              <div className="mt-4 w-full h-32 rounded-lg overflow-hidden">
                <img 
                  src="/Listing details.png" 
                  alt="Accorria listing details with verification and escrow" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-slate-700 max-w-3xl mx-auto">
              All plans include AI Listing Generator, Assist-to-Post, Smart Inbox, e-sign docs, and SafePay escrow. No hidden fees, no surprises.
            </p>
          </div>
          
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {/* Cars Pricing */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">🚗</span>
                <h3 className="text-2xl font-bold text-gray-900">Cars</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-blue-200">
                  <span className="font-medium text-gray-900">Escrow</span>
                  <span className="text-lg font-bold text-blue-600">1.0%</span>
                </div>
                <div className="text-sm text-gray-600 ml-4">(min $39, cap $149)</div>
                <div className="flex justify-between items-center py-3 border-b border-blue-200">
                  <span className="font-medium text-gray-900">Shield Verify</span>
                  <span className="text-lg font-bold text-blue-600">$19</span>
                </div>
                <div className="text-sm text-gray-600 ml-4">(ID + title check + escrow link)</div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-medium text-gray-900">Title Digital Twin</span>
                  <span className="text-lg font-bold text-blue-600">$199</span>
                </div>
                <div className="text-sm text-gray-600 ml-4">(optional: $199 setup, $19/yr upkeep)</div>
              </div>
            </div>

            {/* Homes Pricing */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
              <div className="flex items-center mb-6">
                <span className="text-3xl mr-3">🏠</span>
                <h3 className="text-2xl font-bold text-gray-900">Homes</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-green-200">
                  <span className="font-medium text-gray-900">Escrow</span>
                  <span className="text-lg font-bold text-green-600">0.35%</span>
                </div>
                <div className="text-sm text-gray-600 ml-4">(min $395, cap $995)</div>
                <div className="flex justify-between items-center py-3 border-b border-green-200">
                  <span className="font-medium text-gray-900">Shield Verify</span>
                  <span className="text-lg font-bold text-green-600">$49</span>
                </div>
                <div className="text-sm text-gray-600 ml-4">(owner ID + deed/recording match)</div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-medium text-gray-900">Digital Deed Twin</span>
                  <span className="text-lg font-bold text-green-600">$750</span>
                </div>
                <div className="text-sm text-gray-600 ml-4">(optional: $750 setup, $49/yr upkeep)</div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-medium text-gray-900">Token Lite</span>
                  <span className="text-lg font-bold text-green-600">$299</span>
                </div>
                <div className="text-sm text-gray-600 ml-4">(homes under $75k)</div>
              </div>
            </div>
          </div>

          {/* Savings Comparison */}
          <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">Massive Savings vs. Agent Commissions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-center">
                <thead>
                  <tr className="border-b-2 border-amber-200">
                    <th className="py-3 font-semibold text-gray-900 text-sm sm:text-base">Home Price</th>
                    <th className="py-3 font-semibold text-gray-900 text-sm sm:text-base">Legacy Agent @ 5.5%</th>
                    <th className="py-3 font-semibold text-gray-900 text-sm sm:text-base">Accorria Escrow</th>
                    <th className="py-3 font-semibold text-green-600 text-sm sm:text-base">Customer Saves</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b border-amber-100">
                    <td className="py-3 font-medium text-gray-900">$50,000</td>
                    <td className="py-3 text-gray-900">$2,750</td>
                    <td className="py-3 font-semibold text-blue-600">$395</td>
                    <td className="py-3 font-bold text-green-600">$2,355</td>
                  </tr>
                  <tr className="border-b border-amber-100">
                    <td className="py-3 font-medium text-gray-900">$250,000</td>
                    <td className="py-3 text-gray-900">$13,750</td>
                    <td className="py-3 font-semibold text-blue-600">$875</td>
                    <td className="py-3 font-bold text-green-600">$12,875</td>
                  </tr>
                  <tr>
                    <td className="py-3 font-medium text-gray-900">$500,000</td>
                    <td className="py-3 text-gray-900">$27,500</td>
                    <td className="py-3 font-semibold text-blue-600">$995</td>
                    <td className="py-3 font-bold text-green-600">$26,505</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-center text-sm text-gray-600 mt-4">
              Add token if you want faster deals and a clean digital certificate. Skip token on very low-value assets.
            </p>
          </div>
        </div>
      </section>

      {/* This Changes Everything */}
      <section className="bg-gradient-to-br from-slate-900 to-gray-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl mb-4">Why This Changes Everything</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto mb-12">
              We&apos;re not just another listing platform. We&apos;re the trust layer that makes high-value transactions safe, fast, and profitable for everyone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-amber-400">🚗 Car Sales</h3>
              <div className="mb-6 w-full h-48 rounded-lg overflow-hidden">
                <img 
                  src="/Car listing Details..png" 
                  alt="Complete car listing with Accorria verification and pricing" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-amber-400 mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold">Perfect For</h4>
                    <p className="text-gray-300 text-sm">Individual sellers, flippers, dealers, and anyone who wants to sell cars faster and safer</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-amber-400 mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold">AI-Powered Listings</h4>
                    <p className="text-gray-300 text-sm">Upload 20 photos, pick the best 4, get a perfect description in seconds</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-amber-400 mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold">Multi-Platform Posting</h4>
                    <p className="text-gray-300 text-sm">Post to Facebook, Craigslist, OfferUp with one click</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-amber-400 mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold">Built-in Escrow</h4>
                    <p className="text-gray-300 text-sm">1.0% escrow fee (min $39, cap $149) - way cheaper than dealer fees</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-6 text-amber-400">🏠 Home Sales</h3>
              <div className="mb-6 w-full h-48 rounded-lg overflow-hidden">
                <img 
                  src="/ModernHome.png" 
                  alt="Modern home listing with Accorria escrow and verification" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <span className="text-amber-400 mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold">Perfect For</h4>
                    <p className="text-gray-300 text-sm">FSBO sellers, investors, landlords, and anyone avoiding 5.5% agent commissions</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-amber-400 mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold">Massive Savings</h4>
                    <p className="text-gray-300 text-sm">$50k home: $395 vs $2,750 agent fee = $2,355 saved</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-amber-400 mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold">Digital Deed Twins</h4>
                    <p className="text-gray-300 text-sm">Optional digital certificates for faster resale and clean provenance</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <span className="text-amber-400 mr-3">✓</span>
                  <div>
                    <h4 className="font-semibold">High-Value Items</h4>
                    <p className="text-gray-300 text-sm">Boats, RVs, equipment, luxury items - all with the same trust layer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-4">The Safe Cashier</h3>
              <p className="text-lg text-white/90 max-w-2xl mx-auto">
                &ldquo;We&apos;re the safe cashier. You sell for your price, we keep you safe for a tiny fee. 
                Cars: 1% (min $39, cap $149). Homes: 0.35% (min $395, cap $995). 
                Token is optional—use it when you want faster deals and a clean digital certificate.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-slate-700 max-w-3xl mx-auto">
              Everything you need to know about Accorria&apos;s trust-native listing platform.
            </p>
            <div className="mt-8 w-full max-w-2xl mx-auto h-48 rounded-lg overflow-hidden">
              <img 
                src="/Platform Selection.png" 
                alt="Accorria platform selection and posting process" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-2">Do I need a dealer license?</h3>
                <p className="text-slate-600">No — Accorria works for individual sellers, flippers, and dealers. We help anyone sell faster and safer.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-2">Is this a new marketplace?</h3>
                <p className="text-slate-600">No — we enhance existing platforms like Facebook Marketplace and Craigslist with AI tools, escrow, and verification.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-2">What is Shield Verify?</h3>
                <p className="text-slate-600">Shield Verify checks seller ID and title/deed status, then provides an escrow link you can paste anywhere. $19 for cars, $49 for homes.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-2">What are digital twins?</h3>
                <p className="text-slate-600">Optional digital certificates that prove ownership and transaction history. Great for investors, landlords, and repeat sellers who want provenance.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-2">How does escrow work?</h3>
                <p className="text-slate-600">SafePay escrow is included! Cars: 1.0% (min $39, cap $149). Homes: 0.35% (min $395, cap $995). No crypto needed - buyers pay via ACH/card.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-2">Does it work on mobile?</h3>
                <p className="text-slate-600">Yes — the entire flow is built mobile-first and works perfectly on phones. Upload photos, get AI listings, post anywhere.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-2">Can I post to multiple marketplaces?</h3>
                <p className="text-slate-600">Yes — Facebook now, Craigslist and OfferUp coming next. One listing, multiple platforms, all managed from one place.</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-2">When should I use tokens?</h3>
                <p className="text-slate-600">Use tokens for investors, landlords, repeat sellers, or high-value assets where you want faster resale/rental payouts and clean provenance.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

                      <footer className="bg-slate-900 py-10 text-center text-sm text-slate-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="font-semibold text-white mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><Link href="/how-it-works" className="hover:text-amber-300">How it Works</Link></li>
                  <li><Link href="/pricing" className="hover:text-amber-300">Pricing</Link></li>
                  <li><Link href="/demo" className="hover:text-amber-300">Demo</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-4">Company</h3>
                <ul className="space-y-2">
                  <li><Link href="/about" className="hover:text-amber-300">About</Link></li>
                  <li><Link href="/contact" className="hover:text-amber-300">Contact</Link></li>
                  <li><Link href="/careers" className="hover:text-amber-300">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-4">Support</h3>
                <ul className="space-y-2">
                  <li><Link href="/help" className="hover:text-amber-300">Help Center</Link></li>
                  <li><Link href="/qa" className="hover:text-amber-300">FAQ</Link></li>
                  <li><Link href="/status" className="hover:text-amber-300">Status</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-white mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Link href="/privacy" className="hover:text-amber-300">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:text-amber-300">Terms of Service</Link></li>
                  <li><Link href="/cookies" className="hover:text-amber-300">Cookie Policy</Link></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-700 pt-8">
              <p>© {new Date().getFullYear()} Accorria. All rights reserved. | <a href="https://acoria.com" className="hover:text-amber-300">acoria.com</a></p>
            </div>
          </div>
        </footer>

      

      {/* Working Chatbot */}
      <Chatbot />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />
    </div>
  );
}

function Card({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  // Map icons to corresponding photos
  const getPhotoForIcon = (iconName: string) => {
    switch (iconName) {
      case 'upload':
        return '/Selecting Photos.png';
      case 'magic':
        return '/Description.png';
      case 'post':
        return '/Fackbook posted.jpeg';
      default:
        return '/Selecting Photos.png';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
          <Icon name={icon} className="h-5 w-5" />
        </div>
        <div className="text-lg font-semibold">{title}</div>
      </div>
      <div className="w-full h-64 rounded-lg overflow-hidden mb-3">
        <img 
          src={getPhotoForIcon(icon)} 
          alt={`${title} process step`}
          className="w-full h-full object-cover"
        />
      </div>
      <p className="text-slate-600">{desc}</p>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-6 ring-1 ring-slate-200">
      <div className="text-base font-semibold text-slate-900">{title}</div>
      <p className="mt-1 text-slate-600">{desc}</p>
    </div>
  );
}
