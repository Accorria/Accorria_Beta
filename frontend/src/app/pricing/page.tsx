'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/AuthModal';

export default function PricingPage() {
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const pricingPlans = [
    {
      name: "Free Trial",
      price: "$0",
      duration: "7 days",
      subtitle: "For new users testing the platform",
      posts: "3 posts total",
      features: [
        "Full feature access for trial duration",
        "AI Listing Generator",
        "Smart Inbox + Messenger Bot",
        "FlipScore included",
        "Email support"
      ],
      cta: "Start Free Trial",
      popular: false,
      trial: true
    },
    {
      name: "Starter",
      price: "$20",
      duration: "per month",
      subtitle: "For side hustlers (1–2 flips/mo)",
      posts: "5 posts / month",
      features: [
        "Multi-platform posting",
        "AI listing generator",
        "Simple analytics",
        "Messenger Bot (baseline replies)",
        "FlipScore included",
        "Email support"
      ],
      cta: "Get Starter",
      popular: false
    },
    {
      name: "Growth",
      price: "$50",
      duration: "per month",
      subtitle: "For full-time flippers & salespeople",
      posts: "Unlimited posts",
      features: [
        "Smart listing optimizer",
        "Lead & sales analytics",
        "Messenger Bot (enhanced replies + suggested replies + auto follow-ups)",
        "FlipScore (market comps & demand hints)",
        "Priority chat support"
      ],
      cta: "Upgrade to Growth",
      popular: true
    },
    {
      name: "Dealer Pro",
      price: "$200",
      duration: "per month",
      subtitle: "For dealerships & teams",
      posts: "Unlimited posts + Team seats",
      features: [
        "Team accounts",
        "Auction tools",
        "Repair-cost estimator",
        "Dealer analytics",
        "Messenger Bot (end-to-end automation with approval toggles)",
        "FlipScore (advanced insight pack)",
        "Priority chat & phone support"
      ],
      cta: "Join Dealer Pro",
      popular: false
    }
  ];

  const handleAuthSuccess = () => {
    // Optionally, you can close the modal or update the UI after successful auth
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-50">
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
              Home
            </Link>
            <Link href="/how-it-works" className="text-white/80 hover:text-white transition-colors">
              How it Works
            </Link>
            <Link href="/demo" className="text-white/80 hover:text-white transition-colors">
              Demo
            </Link>
            <Link href="/pricing" className="text-white font-medium">
              Pricing
            </Link>
            <Link href="/qa" className="text-white/80 hover:text-white transition-colors">
              Q&A
            </Link>
            
            {user ? (
              <Link 
                href="/dashboard" 
                className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-amber-400 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-amber-500 text-slate-900 px-4 py-2 rounded-lg font-medium hover:bg-amber-400 transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </nav>
      </header>

      {/* Pricing Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Accorria — #1 Trust-Native Listing Platform
          </h1>
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            Pricing (simplified for cars now)
          </h2>
          <p className="text-lg text-slate-700 max-w-3xl mx-auto mb-8">
            All plans include AI Listing Generator, Messenger Bot, FlipScore, Smart Inbox, and SafePay escrow (vehicles). 
            <br />
            <span className="text-sm text-slate-600 mt-2 block">
              <strong>Post</strong> = 1 unique vehicle listing. <strong>Trial</strong> ends at 7 days OR after 3 posts, whichever comes first.
            </span>
          </p>
          <p className="text-slate-600 font-medium">
            Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl p-8 border-2 ${
                plan.popular ? 'border-amber-500 scale-105' : 
                plan.trial ? 'border-green-500' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              {plan.trial && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Free Trial
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-600 mb-4">{plan.subtitle}</p>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-600 ml-2">{plan.duration}</span>
                </div>
                <p className="text-slate-700 font-medium">{plan.posts}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className="w-full bg-amber-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-amber-600 transition-colors">
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Escrow Fees Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Vehicle escrow fee
          </h2>
          
          <div className="text-center mb-8">
            <p className="text-2xl font-bold text-amber-600 mb-2">0.9% of sale price ($25 min)</p>
            <p className="text-slate-700 text-lg">
              ACH is the lowest-cost rail.
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-slate-700 text-lg">
              <strong>Homes:</strong> escrow 0.5% planned — pilot, waitlist open.
            </p>
          </div>
        </div>

        {/* Fine Print Section */}
        <div className="bg-slate-50 rounded-2xl p-8 mb-16">
          <p className="text-sm text-slate-600 text-center leading-relaxed">
            Channel availability varies by region. We use approved feeds or guided posting to stay compliant. Escrow provided under applicable licensing and KYC/AML.
          </p>
        </div>

        {/* Homes Coming Soon Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-4">
              Homes coming soon
            </h3>
            <p className="text-slate-700 mb-6">
              Selling a home soon? We're piloting real-estate listings + escrow.
            </p>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Join the homes waitlist →
            </button>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
