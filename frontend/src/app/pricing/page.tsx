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
      posts: "3 posts total",
      features: [
        "Full feature access for trial duration",
        "AI listing generator",
        "Market intelligence",
        "FlipScore analysis",
        "Messenger bot (baseline replies)"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Starter",
      price: "$20",
      duration: "per month",
      posts: "5 posts / month",
      features: [
        "Multi-platform posting",
        "AI listing generator",
        "Simple analytics",
        "Messenger bot (baseline replies)",
        "FlipScore included",
        "Email support"
      ],
      cta: "Get Started",
      popular: false
    },
    {
      name: "Growth",
      price: "$50",
      duration: "per month",
      posts: "Unlimited posts",
      features: [
        "Smart listing optimizer",
        "Lead & sales analytics",
        "Enhanced replies + suggested replies",
        "Auto follow-ups",
        "Market comps & demand hints",
        "Priority support"
      ],
      cta: "Start Growing",
      popular: true
    },
    {
      name: "Dealer Pro",
      price: "$200",
      duration: "per month",
      posts: "Unlimited + Team seats",
      features: [
        "Team accounts",
        "Auction tools",
        "Repair-cost estimator",
        "Dealer analytics",
        "End-to-end automation",
        "Advanced insight pack",
        "Dedicated support"
      ],
      cta: "Go Pro",
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
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-amber-600 max-w-2xl mx-auto font-medium">
            Choose a plan for you
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
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
                <div className="mb-4">
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-600 ml-2">{plan.duration}</span>
                </div>
                <p className="text-slate-600 font-medium">{plan.posts}</p>
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

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                What counts as a "post"?
              </h3>
              <p className="text-slate-600">
                A post is one unique vehicle listing generated and pushed by the app. Edits don't consume a new post.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Is the Messenger Bot included?
              </h3>
              <p className="text-slate-600">
                Yes! All plans include our AI messenger bot that handles buyer communication using your rules.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-slate-600">
                Absolutely. You can cancel your subscription at any time with no penalties.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                What's included in FlipScore?
              </h3>
              <p className="text-slate-600">
                FlipScore is our AI score (0-100) that estimates resale potential based on photos, market data, and trends.
              </p>
            </div>
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
