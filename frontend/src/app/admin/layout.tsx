'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'accorria2024';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const authStatus = localStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_authenticated', 'true');
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_authenticated');
    setPassword('');
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">
            Admin Access
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin password"
                required
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Access Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <a href="/admin" className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Accorria Admin Dashboard
              </a>
              <nav className="hidden lg:flex space-x-1">
                <a
                  href="/admin"
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  📊 Dashboard
                </a>
                <a
                  href="/admin/leads"
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  👥 Leads
                </a>
                <a
                  href="/admin/beta-signups"
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  🚀 Beta Signups
                </a>
                <a
                  href="/admin/qr-generator"
                  className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  📱 QR Generator
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="/"
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                ← Back to Site
              </a>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Navigation */}
      <div className="lg:hidden bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 py-3 overflow-x-auto">
            <a
              href="/admin"
              className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200"
            >
              📊 Dashboard
            </a>
            <a
              href="/admin/leads"
              className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200"
            >
              👥 Leads
            </a>
            <a
              href="/admin/beta-signups"
              className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200"
            >
              🚀 Beta Signups
            </a>
            <a
              href="/admin/qr-generator"
              className="text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200"
            >
              📱 QR Generator
            </a>
          </nav>
        </div>
      </div>
      
      {/* Admin Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/admin" className="hover:text-blue-600 transition-colors">
                Admin Dashboard
              </a>
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-900 font-medium">Current Page</span>
            </li>
          </ol>
        </nav>
        {children}
      </main>
    </div>
  );
}
