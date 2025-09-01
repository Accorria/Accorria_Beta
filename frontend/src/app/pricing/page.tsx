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
      posts: "5 listings/month",
      features: [
        "AI-crafted titles & descriptions + price hints",
        "Assist-to-Post to top channels (guided where required)",
        "Smart Inbox (1 user) + quick-reply templates",
        "1 active escrow at a time (0.9% vehicles / 0.5% homes; $25 min)",
        "Email support"
      ],
      cta: "Get Starter",
      popular: false
    },
    {
      name: "Solo",
      price: "$79",
      duration: "per month",
      posts: "Unlimited listings",
      features: [
        "Assist-to-Post to more channels + auto-delist on sale",
        "Smart Inbox (1 user) with lead scoring + saved templates",
        "Up to 3 concurrent escrows",
        "Basic CRM (pipeline view) & reporting lite",
        "Priority chat support"
      ],
      cta: "Upgrade to Solo",
      popular: true
    },
    {
      name: "Dealer Pro",
      price: "$199",
      duration: "per month",
      posts: "Unlimited + Team seats",
      features: [
        "Unlimited listings + inventory import (CSV/VIN decode)",
        "Dealer feeds (Autotrader/Cars.com) where approved",
        "Team access (up to 5 seats) & role permissions",
        "Multi-location support & branded 'Secure by Accorria' badge",
        "Up to 10 concurrent escrows",
        "CRM (contacts, deals) + reports export",
        "Escrow fee discount available on volume",
        "Priority chat & phone support"
      ],
      cta: "Start Dealer Pro",
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
            Pricing that scales with your hustle
          </h1>
          <p className="text-xl text-amber-600 max-w-3xl mx-auto font-medium mb-8">
            All plans include: AI listing generator, Assist-to-Post (ToS-compliant), Smart Inbox, e-sign docs (bill of sale, title/deed packet), SafePay escrow rails (blockchain-ready), and basic analytics.
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

        {/* Quick Comparison Table */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Quick comparison
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-slate-900">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-900">Starter</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-900">Solo</th>
                  <th className="text-center py-4 px-4 font-semibold text-slate-900">Dealer Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium">Monthly price</td>
                  <td className="text-center py-4 px-4">$29</td>
                  <td className="text-center py-4 px-4">$79</td>
                  <td className="text-center py-4 px-4">$199</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium">Listings</td>
                  <td className="text-center py-4 px-4">5 / mo</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                  <td className="text-center py-4 px-4">Unlimited</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium">Users</td>
                  <td className="text-center py-4 px-4">1</td>
                  <td className="text-center py-4 px-4">1</td>
                  <td className="text-center py-4 px-4">Up to 5</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium">Assist-to-Post</td>
                  <td className="text-center py-4 px-4">Core</td>
                  <td className="text-center py-4 px-4">Expanded + auto-delist</td>
                  <td className="text-center py-4 px-4">Expanded + dealer feeds*</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium">Smart Inbox</td>
                  <td className="text-center py-4 px-4">✓</td>
                  <td className="text-center py-4 px-4">✓ (lead scoring)</td>
                  <td className="text-center py-4 px-4">✓ (team)</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium">Concurrent escrows</td>
                  <td className="text-center py-4 px-4">1</td>
                  <td className="text-center py-4 px-4">3</td>
                  <td className="text-center py-4 px-4">10</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 font-medium">CRM & reports</td>
                  <td className="text-center py-4 px-4">—</td>
                  <td className="text-center py-4 px-4">Lite</td>
                  <td className="text-center py-4 px-4">Full + export</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-medium">Support</td>
                  <td className="text-center py-4 px-4">Email</td>
                  <td className="text-center py-4 px-4">Priority chat</td>
                  <td className="text-center py-4 px-4">Priority chat + phone</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-600 mt-4 text-center">
            *Dealer feeds depend on platform approval/region & your status; guided posting is used where APIs aren't available.
          </p>
        </div>

        {/* Escrow & Fees Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Escrow & fees (simple)
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Vehicles</h3>
              <p className="text-3xl font-bold text-amber-600 mb-2">0.9%</p>
              <p className="text-slate-600">of sale price ($25 min)</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Homes</h3>
              <p className="text-3xl font-bold text-amber-600 mb-2">0.5%</p>
              <p className="text-slate-600">of sale price ($25 min)</p>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-slate-50 rounded-lg">
            <p className="text-slate-700 mb-2">
              <strong>Payment processing:</strong> ACH lowest; card rails may add ~2.9% + $0.30 (passed through).
            </p>
            <p className="text-slate-700 mb-2">
              <strong>KYC/AML checks</strong> included when required.
            </p>
            <p className="text-slate-600 text-sm italic">
              Pilot promos: fee waivers/discounts may apply for early customers.
            </p>
          </div>
        </div>

        {/* Add-ons Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Add-ons (optional)
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-slate-900">Title verification + lien payoff assistance</h3>
                <p className="text-slate-600 text-sm">Complete title and lien management</p>
              </div>
              <span className="font-bold text-amber-600">$49/deal</span>
            </div>
            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-slate-900">Vehicle inspection & transport booking</h3>
                <p className="text-slate-600 text-sm">Professional inspection and logistics</p>
              </div>
              <span className="font-bold text-amber-600">Passthrough partner rates</span>
            </div>
            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-slate-900">Document packs (custom clauses/attachments)</h3>
                <p className="text-slate-600 text-sm">Customized legal documents</p>
              </div>
              <span className="font-bold text-green-600">Included</span>
            </div>
            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
              <div>
                <h3 className="font-semibold text-slate-900">White-label & API</h3>
                <p className="text-slate-600 text-sm">Custom branding and integrations</p>
              </div>
              <span className="font-bold text-amber-600">Enterprise (contact us)</span>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Do I need crypto?
              </h3>
              <p className="text-slate-600">
                No. Buyers can pay via ACH/card; funds are held via smart contract on the backend.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Which sites can I post to?
              </h3>
              <p className="text-slate-600">
                Facebook Marketplace, Craigslist, Autotrader, Cars.com, eBay Motors, Zillow/MLS (by license/role). Some use partner feeds; others use guided posting to stay ToS-compliant.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                What about limits?
              </h3>
              <p className="text-slate-600">
                Starter includes 5 listings/month; Solo & Dealer Pro are unlimited with fair-use. We'll reach out if usage is way beyond normal to help you move to the right plan.
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
