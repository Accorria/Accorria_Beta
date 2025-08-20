'use client';

import React from 'react';

interface DashboardListingProps {
  listing: {
    id: string;
    title: string;
    price: number;
    description: string;
    images: string[];
    mileage: string;
    titleStatus: string;
    postedAt: string;
    status: string;
    platforms?: string[];
  };
}

export default function DashboardListing({ listing }: DashboardListingProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Images */}
      <div className="relative">
        <div className="grid grid-cols-2 gap-1 h-48">
          {listing.images.slice(0, 4).map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image}
                alt={`${listing.title} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {index === 3 && listing.images.length > 4 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    +{listing.images.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="absolute top-2 left-2">
          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
            TEST POST
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title and Price */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {listing.title}
          </h3>
          <div className="text-right">
            <div className="text-xl font-bold text-green-600">
              ${listing.price.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {listing.mileage} miles
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex items-center space-x-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
          <span>📍 Detroit, MI</span>
          <span>📄 {listing.titleStatus}</span>
          <span>🕒 {formatDate(listing.postedAt)}</span>
        </div>
        
        {/* Platform Info */}
        {listing.platforms && listing.platforms.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Posted to:</div>
            <div className="flex flex-wrap gap-1">
              {listing.platforms.map((platform, index) => {
                const platformInfo = {
                  'facebook_marketplace': { name: 'Facebook Marketplace', icon: '📘', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
                  'craigslist': { name: 'Craigslist', icon: '📋', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
                  'offerup': { name: 'OfferUp', icon: '📱', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' }
                };
                const info = platformInfo[platform as keyof typeof platformInfo];
                return (
                  <span key={index} className={`text-xs px-2 py-1 rounded-full ${info.color}`}>
                    {info.icon} {info.name}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Description Preview */}
        <div className="text-gray-700 dark:text-gray-300 text-sm line-clamp-3">
          {listing.description.split('\n').slice(0, 3).join(' ')}
        </div>

        {/* Actions */}
        <div className="flex space-x-2 mt-4">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            📱 Message
          </button>
          <button className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
            💾 Save
          </button>
        </div>
      </div>
    </div>
  );
}
