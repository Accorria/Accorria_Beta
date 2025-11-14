'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

interface HeaderProps {
  currentMode?: 'solo' | 'dealer';
  onModeChange?: (mode: 'solo' | 'dealer') => void;
}

export default function Header({ currentMode = 'solo', onModeChange }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center border border-gray-200 dark:border-gray-600 shadow-sm">
            <img 
              src="/LogoinBLUEONEword.png" 
              alt="Accorria" 
              className="h-6 w-auto sm:h-8"
            />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Accorria</h1>
          </div>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:scale-105 active:scale-95 transition-transform"
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          
          <div className="flex items-center space-x-2 sm:space-x-3">
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
              {user?.email}
            </span>
          </div>
          
          <div className="relative">
            <div 
              className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold hover:scale-105 active:scale-95 transition-transform cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  Switch Mode
                </div>
                <button
                  onClick={() => {
                    onModeChange?.('solo');
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                    currentMode === 'solo' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  👤 Solo Mode
                </button>
                <button
                  onClick={() => {
                    onModeChange?.('dealer');
                    setShowDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                    currentMode === 'dealer' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  🏢 Dealer Mode
                </button>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  onClick={() => {
                    signOut();
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 