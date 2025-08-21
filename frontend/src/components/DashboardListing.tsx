'use client';

import React, { useState } from 'react';

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
    messages?: number;
    clicks?: number;
    soldAt?: string;
    soldFor?: number;
    soldTo?: string;
  };
}

export default function DashboardListing({ listing }: DashboardListingProps) {
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showSaleForm, setShowSaleForm] = useState(false);
  const [saleData, setSaleData] = useState({
    soldFor: '',
    soldTo: ''
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % listing.images.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + listing.images.length) % listing.images.length);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Images */}
      <div className="relative">
        <div 
          className="grid grid-cols-2 gap-1 h-48 cursor-pointer"
          onClick={() => setShowPhotoGallery(true)}
        >
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
        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          Click to view all {listing.images.length} photos
        </div>
      </div>

              {/* Content */}
        <div className="p-4">
          {/* Title and Price */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {listing.title}
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {listing.mileage} miles • {listing.titleStatus} title
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-green-600">
                ${listing.price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(listing.postedAt)}
              </div>
            </div>
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

        {/* Enhanced Listing Stats */}
        <div className="mt-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          {/* Top Row - Posted Info & Status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400">
              <span>🕒 {new Date(listing.postedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })} @ {new Date(listing.postedAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
              <span>🔄 {new Date(listing.postedAt).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })} - {new Date(listing.postedAt).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                listing.soldAt 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
              }`}>
                📊 {listing.soldAt ? 'Sold' : 'Active'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                #{listing.id.slice(-6)}
              </span>
            </div>
          </div>

          {/* Middle Row - Platforms & Price */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">📍</span>
              <div className="flex space-x-1">
                {listing.platforms?.map((platform, index) => {
                  const platformInfo = {
                    'facebook_marketplace': { name: 'FB', icon: '📘', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
                    'craigslist': { name: 'CL', icon: '📋', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300' },
                    'offerup': { name: 'OU', icon: '📱', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' }
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
            <div className="text-right">
              <div className="text-sm font-bold text-green-600">
                ${listing.price.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Listed Price</div>
            </div>
          </div>

          {/* Bottom Row - Activity Metrics */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
              <span>👁️ {listing.clicks || Math.floor(Math.random() * 50) + 10} views</span>
              <span>💬 {listing.messages || Math.floor(Math.random() * 5)} messages</span>
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {(() => {
                const postedDate = new Date(listing.postedAt);
                const now = new Date();
                const diffInDays = Math.floor((now.getTime() - postedDate.getTime()) / (1000 * 60 * 60 * 24));
                return diffInDays === 0 ? 'Today' : `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
              })()}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2 mt-4">
          <button 
            onClick={() => {
              const newMessages = (listing.messages || 0) + 1;
              // Update the listing in localStorage
              const existingListings = JSON.parse(localStorage.getItem('testListings') || '[]');
              const updatedListings = existingListings.map((l: any) => 
                l.id === listing.id ? { ...l, messages: newMessages } : l
              );
              localStorage.setItem('testListings', JSON.stringify(updatedListings));
              // Force re-render
              window.location.reload();
            }}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            📱 Message ({listing.messages || 0})
          </button>
          <button 
            onClick={() => {
              const newClicks = (listing.clicks || 0) + 1;
              // Update the listing in localStorage
              const existingListings = JSON.parse(localStorage.getItem('testListings') || '[]');
              const updatedListings = existingListings.map((l: any) => 
                l.id === listing.id ? { ...l, clicks: newClicks } : l
              );
              localStorage.setItem('testListings', JSON.stringify(updatedListings));
              // Force re-render
              window.location.reload();
            }}
            className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            👁️ View ({listing.clicks || 0})
          </button>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-3 space-y-2">
          {!listing.soldAt ? (
            <button 
              onClick={() => setShowSaleForm(true)}
              className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              🎉 Car Sold
            </button>
          ) : (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="text-green-800 dark:text-green-200 text-sm font-semibold mb-1">
                ✅ SOLD - ${listing.soldFor?.toLocaleString()}
              </div>
              <div className="text-green-600 dark:text-green-300 text-xs">
                Sold to: {listing.soldTo} • {new Date(listing.soldAt).toLocaleDateString()}
              </div>
            </div>
          )}
          
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to delete this listing?')) {
                // Remove the listing from localStorage
                const existingListings = JSON.parse(localStorage.getItem('testListings') || '[]');
                const updatedListings = existingListings.filter((l: any) => l.id !== listing.id);
                localStorage.setItem('testListings', JSON.stringify(updatedListings));
                // Force re-render
                window.location.reload();
              }
            }}
            className="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors"
          >
            🗑️ Delete Listing
          </button>
        </div>
      </div>

      {/* Photo Gallery Modal */}
      {showPhotoGallery && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={() => setShowPhotoGallery(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
            >
              ✕
            </button>
            
            {/* Photo Counter */}
            <div className="absolute top-4 left-4 text-white text-sm z-10">
              {currentPhotoIndex + 1} of {listing.images.length}
            </div>
            
            {/* Main Image */}
            <img
              src={listing.images[currentPhotoIndex]}
              alt={`${listing.title} - Photo ${currentPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Navigation Buttons */}
            {listing.images.length > 1 && (
              <>
                <button
                  onClick={prevPhoto}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 z-10"
                >
                  ‹
                </button>
                <button
                  onClick={nextPhoto}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-4xl hover:text-gray-300 z-10"
                >
                  ›
                </button>
              </>
            )}
            
            {/* Thumbnail Strip */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {listing.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`w-16 h-12 rounded overflow-hidden border-2 ${
                    index === currentPhotoIndex ? 'border-white' : 'border-gray-600'
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sale Form Modal */}
      {showSaleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                🎉 Car Sold!
              </h3>
              <button
                onClick={() => setShowSaleForm(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  How much did you sell it for?
                </label>
                <input
                  type="text"
                  value={saleData.soldFor}
                  onChange={(e) => setSaleData(prev => ({ ...prev, soldFor: e.target.value }))}
                  placeholder="e.g., 8500"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Who did you sell it to?
                </label>
                <input
                  type="text"
                  value={saleData.soldTo}
                  onChange={(e) => setSaleData(prev => ({ ...prev, soldTo: e.target.value }))}
                  placeholder="e.g., John Smith"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowSaleForm(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!saleData.soldFor || !saleData.soldTo) {
                    alert('Please fill in both fields');
                    return;
                  }
                  
                  // Update the listing in localStorage
                  const existingListings = JSON.parse(localStorage.getItem('testListings') || '[]');
                  const updatedListings = existingListings.map((l: any) => 
                    l.id === listing.id ? {
                      ...l,
                      soldAt: new Date().toISOString(),
                      soldFor: parseInt(saleData.soldFor),
                      soldTo: saleData.soldTo
                    } : l
                  );
                  localStorage.setItem('testListings', JSON.stringify(updatedListings));
                  
                  setShowSaleForm(false);
                  window.location.reload();
                }}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Mark as Sold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
