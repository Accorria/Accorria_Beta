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
      name: "Starter",
      price: "$29",
      duration: "per month",
      subtitle: "For one-off sellers & new flippers",
      posts: "5 listings / month",
      features: [
        "Assist-to-Post (guided, compliant)",
        "Smart Inbox (1 user) + quick-reply templates",
        "1 active escrow at a time (0.9% vehicles / 0.5% homes, $25 min)",
        "Email support"
      ],
      cta: "Get Starter",
      popular: false
    },
    {
      name: "Pro",
      price: "$79",
      duration: "per month",
      subtitle: "For active flippers & side-hustle sellers",
      posts: "Unlimited listings",
      features: [
        "Smart Inbox (1 user) with saved templates",
        "Up to 3 active escrows",
        "Priority chat support"
      ],
      cta: "Upgrade to Pro",
      popular: true
    },
    {
      name: "Dealer (Beta)",
      price: "$199",
      duration: "per month",
      subtitle: "For independent dealers (waitlist while we onboard)",
      posts: "Unlimited listings",
      features: [
        "Smart Inbox (team access up to 3 seats during beta)",
        "Up to 10 active escrows",
        "Priority chat & phone support"
      ],
      cta: "Join Dealer Waitlist",
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
            Simple pricing. Start in minutes.
          </h1>
          <p className="text-xl text-slate-700 max-w-3xl mx-auto font-medium mb-8">
            Everything you need to list, post, and close safely.
          </p>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto mb-8">
            All plans include AI Listing Generator, Assist-to-Post (guided & ToS-compliant), Smart Inbox, SafePay escrow access, and e-sign docs.
          </p>
          <p className="text-slate-600 font-medium">
            Cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {pricingPlans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-2xl shadow-xl p-8 border-2 ${
                plan.popular ? 'border-amber-500 scale-105' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-amber-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
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

        {/* Simple Fees Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Simple fees (per deal)
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Vehicles</h3>
              <p className="text-3xl font-bold text-amber-600 mb-2">0.9%</p>
              <p className="text-slate-700">of sale price ($25 min)</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Homes</h3>
              <p className="text-3xl font-bold text-amber-600 mb-2">0.5%</p>
              <p className="text-slate-700">of sale price ($25 min)</p>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-slate-700 text-lg">
              ACH has the lowest cost; card rails may add standard processing fees.
            </p>
          </div>
        </div>

        {/* Fine Print Section */}
        <div className="bg-slate-50 rounded-2xl p-8">
          <p className="text-sm text-slate-600 text-center leading-relaxed">
            Channel availability varies by region; we use approved feeds or <strong>guided posting</strong> to stay compliant. Escrow provided under applicable licensing/KYC/AML. Features listed are current MVP; enhancements (auto-delist, inventory import/VIN decode, dealer feeds, CRM) will be announced separately.
          </p>
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
