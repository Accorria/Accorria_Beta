'use client';

import React from 'react';

interface HeaderProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export default function Header({ darkMode = false, onToggleDarkMode }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-4">
      <div className="flex items-center justify-between">
        <div 
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
            QF
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Plazoria</h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:scale-105 active:scale-95 transition-transform"
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          
          <div 
            className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            JD
          </div>
        </div>
      </div>
    </header>
  );
} 