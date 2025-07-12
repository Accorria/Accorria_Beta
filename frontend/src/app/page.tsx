"use client"

import React, { useState } from 'react';
import ListenerUpload from './components/ListenerUpload';

const mockStats = [
  {
    label: 'Total Listings',
    value: 27,
    icon: '📋',
    color: 'bg-purple-200 text-purple-700',
  },
  {
    label: 'Cars Sold',
    value: 8,
    icon: '🚗',
    color: 'bg-gray-200 text-gray-800',
  },
  {
    label: 'Revenue This Week',
    value: '$42,000',
    icon: '💰',
    color: 'bg-yellow-100 text-yellow-700',
  },
  {
    label: 'Market Insights',
    value: 'Avg. price: $13,500',
    icon: '📈',
    color: 'bg-blue-100 text-blue-700',
  },
];

export default function Home() {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-white to-gray-200 flex flex-col">
      {/* Hero Header */}
      <header className="py-12 text-center bg-gradient-to-r from-purple-700 via-purple-500 to-purple-400 text-white shadow-lg">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">QuickFlip AI</h1>
        <p className="mt-3 text-xl md:text-2xl font-medium text-purple-100 drop-shadow">Your intelligent car selling co-pilot. Automate 80% of your tasks while staying in control.</p>
      </header>

      {/* Dashboard Stats - Glassmorphism */}
      <section className="w-full flex justify-center mt-[-3.5rem] z-10 animate-fade-in">
        <div className="flex flex-wrap justify-center gap-8 max-w-6xl w-full px-4">
          {mockStats.map((stat, idx) => (
            <div
              key={idx}
              className={`backdrop-blur-md bg-white/60 ${stat.color} rounded-2xl shadow-xl flex flex-col items-center justify-center p-7 min-w-[180px] min-h-[120px] border border-white/40 hover:scale-105 transition-all duration-200`}
              style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)' }}
            >
              <span className="text-4xl mb-2 drop-shadow">{stat.icon}</span>
              <div className="text-3xl font-bold mb-1 drop-shadow-sm">{stat.value}</div>
              <div className="text-base font-medium opacity-80 text-center">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Cards - Minimal, Modern */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full max-w-5xl">
          {/* Listing Assistant */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition group">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-purple-600 text-white text-3xl mb-3 shadow-lg group-hover:scale-110 transition">🚗</div>
            <h2 className="text-lg font-bold mb-1 text-gray-900">Listing Assistant</h2>
            <p className="text-gray-600 text-center mb-4">AI-powered form filling and listing creation with manual submission workflow.</p>
            <button
              className="bg-gradient-to-r from-purple-600 to-purple-400 hover:from-purple-700 hover:to-purple-500 text-white font-semibold px-5 py-2 rounded-lg transition shadow group-hover:scale-105"
              onClick={() => setShowUpload(true)}
            >
              + New Listing
            </button>
          </div>
          {/* Message Monitor */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition group">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-gray-400 to-gray-700 text-white text-3xl mb-3 shadow-lg group-hover:scale-110 transition">💬</div>
            <h2 className="text-lg font-bold mb-1 text-gray-900">Message Monitor</h2>
            <p className="text-gray-600 text-center mb-4">Real-time message detection and intelligent reply generation.</p>
            <button className="bg-gray-400 text-white font-semibold px-5 py-2 rounded-lg opacity-60 cursor-not-allowed shadow">Coming Soon</button>
          </div>
          {/* Analytics Dashboard */}
          <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 flex flex-col items-center hover:shadow-2xl transition group">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-gray-500 text-white text-3xl mb-3 shadow-lg group-hover:scale-110 transition">📊</div>
            <h2 className="text-lg font-bold mb-1 text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600 text-center mb-4">Track performance, sales insights, and market analytics.</p>
            <button className="bg-gray-400 text-white font-semibold px-5 py-2 rounded-lg opacity-60 cursor-not-allowed shadow">Coming Soon</button>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button
        className="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-purple-600 to-purple-900 text-white text-4xl rounded-full shadow-2xl w-16 h-16 flex items-center justify-center hover:scale-110 transition-all duration-200 border-4 border-white/30"
        onClick={() => setShowUpload(true)}
        title="Add New Listing"
        style={{ boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)' }}
      >
        +
      </button>

      {/* Modal for ListenerUpload */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 transition animate-fade-in">
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-2xl p-8 max-w-2xl w-full relative animate-fade-in">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl font-bold"
              onClick={() => setShowUpload(false)}
              title="Close"
            >
              ×
            </button>
            <ListenerUpload />
          </div>
        </div>
      )}
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
