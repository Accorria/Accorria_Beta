'use client';

import React, { useMemo, useState, useEffect, useRef } from "react";
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
    url: "https://images.unsplash.com/photo-1517940310602-22521b3e44c0?q=80&w=1600&auto=format&fit=crop",
    alt: "Car in a modern garage"
  },
  {
    title: "Price your home with guidance",
    caption: "Guided copy + comps to post confidently.",
    url: "https://images.unsplash.com/photo-1505692794403-34d4982f88aa?q=80&w=1600&auto=format&fit=crop",
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

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/90 backdrop-blur">
      {children}
    </span>
  );
}

export default function Home() {
  const idx = useCarousel(IMAGES.length);
  const hero = IMAGES[idx];
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleAuthSuccess = () => {
    // User successfully logged in or registered
    console.log('Authentication successful');
  };

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
            <Link href="/how-it-works" className="hover:text-white">How it works</Link>
            <Link href="/demo" className="hover:text-white">Demo</Link>
            <Link href="/get-paid" className="hover:text-white">Get Paid</Link>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </div>
          {user ? (
            <div className="flex items-center gap-4">
              <Link href="/app" className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300">
                Go to App
              </Link>
            </div>
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
              Accorria your AI deal agent for <span className="text-amber-300">cars</span> & <span className="text-amber-300">homes</span>.
            </h1>
            <p className="mt-4 max-w-xl text-slate-300">
              Create the listing, prep the post for Facebook, coach the negotiation, and (soon) escrow—without giving up control.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              {user ? (
                <Link href="/app" className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-300">Go to App</Link>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setIsAuthModalOpen(true);
                    }}
                    className="rounded-lg bg-amber-400 px-4 py-2 font-semibold text-slate-900 hover:bg-amber-300"
                  >
                    Get Early Access
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setIsAuthModalOpen(true);
                    }}
                    className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white/90 hover:bg-white/5"
                  >
                    Sign In
                  </button>
                </>
              )}
              <Link href="/demo" className="rounded-lg border border-white/20 px-4 py-2 font-semibold text-white/90 hover:bg-white/5">Watch 60‑sec Demo</Link>
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
            <Card icon="upload" title="Upload" desc="Add photos or paste VIN/address. We pull specs & comps." />
            <Card icon="magic" title="Generate" desc="AI crafts title, description, price guidance, FB‑ready post." />
            <Card icon="post" title="Post & Close" desc="You click post. We coach replies. Escrow rolls out at tax time." />
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-6 md:grid-cols-3">
            <Feature title="Faster listings" desc="From photos to posted in minutes—not hours." />
            <Feature title="Cleaner negotiation" desc="Guided replies and templates cut the back‑and‑forth." />
            <Feature title="Safer closings" desc="Escrow (cars first, homes next). Optional but powerful." />
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
              Skip the bank delays. Skip the scams. Get paid instantly when deals close — cars, homes, rentals. Blockchain-powered settlements in 23 hours.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">23-Hour Payments</h3>
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
            <p className="text-sm text-slate-500 mt-3">See how blockchain makes deals safer and faster</p>
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section id="pricing" className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl font-bold md:text-3xl">Simple, transparent pricing</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <PriceCard name="Free Trial" price="$0" note="7 days • 3 posts" cta="Start free" />
            <PriceCard name="Starter" price="$20/mo" note="3 posts / mo" cta="Choose Starter" highlight />
            <PriceCard name="Solo Hustler" price="$50/mo" note="Unlimited posts" cta="Go Solo" />
          </div>
          <p className="mt-4 text-sm text-slate-600">Dealer Pro tier coming soon.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <h2 className="text-2xl font-bold md:text-3xl">FAQ</h2>
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Do I need a dealer license?</h3>
                <p className="text-slate-600">No — Accorria works for individual sellers, flippers, and dealers. We help anyone sell faster.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Is this a new marketplace?</h3>
                <p className="text-slate-600">No — we enhance existing platforms like Facebook Marketplace and Craigslist with AI tools.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Does it work on mobile?</h3>
                <p className="text-slate-600">Yes — the entire flow is built mobile‑first and works perfectly on phones.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">What about homes?</h3>
                <p className="text-slate-600">Homes are coming next! We're starting with cars, then expanding to real estate.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">What about escrow?</h3>
                <p className="text-slate-600">Escrow is launching soon! Join our beta waitlist to be first in line for secure deal closing.</p>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Can I post to multiple marketplaces?</h3>
                <p className="text-slate-600">Yes — Facebook now, Craigslist and OfferUp coming next.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 py-10 text-center text-sm text-slate-400">
        © {new Date().getFullYear()} Accorria. All rights reserved.
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
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-amber-100 p-2 text-amber-700">
          <Icon name={icon} className="h-5 w-5" />
        </div>
        <div className="text-lg font-semibold">{title}</div>
      </div>
      <p className="mt-2 text-slate-600">{desc}</p>
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

function PriceCard({ name, price, note, cta, highlight = false }: { name: string; price: string; note: string; cta: string; highlight?: boolean }) {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleCtaClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
    } else {
      // User is logged in, redirect to app
      window.location.href = '/app';
    }
  };

  return (
    <>
      <div className={`rounded-2xl p-6 ring-1 ${highlight ? "bg-amber-50 ring-amber-200" : "bg-white ring-slate-200"}`}>
        <div className="text-sm font-semibold text-slate-500">{name}</div>
        <div className="mt-2 text-3xl font-extrabold text-slate-900">{price}</div>
        <div className="mt-1 text-sm text-slate-600">{note}</div>
        <button
          onClick={handleCtaClick}
          className={`mt-6 block w-full rounded-xl px-4 py-2 text-center font-semibold ${highlight ? "bg-amber-400 text-slate-900 hover:bg-amber-300" : "bg-slate-900 text-white hover:bg-slate-800"}`}
        >
          {user ? 'Go to App' : cta}
        </button>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => window.location.href = '/app'}
        initialMode="register"
      />
    </>
  );
} 