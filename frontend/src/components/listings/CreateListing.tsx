'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import carDataRaw from '../../data/carData.json';
const carData = carDataRaw as Record<string, string[]>;

interface CreateListingProps {
  onClose: () => void;
}

interface CarDetails {
  make: string;
  model: string;
  year: string;
  mileage: string;
  price: string;
  lowestPrice: string; // NEW FIELD
  description: string;
}

export default function CreateListing({ onClose }: CreateListingProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [carDetails, setCarDetails] = useState<CarDetails>({
    make: '',
    model: '',
    year: '',
    mileage: '',
    price: '',
    lowestPrice: '', // NEW FIELD
    description: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customMake, setCustomMake] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isSearchingMarket, setIsSearchingMarket] = useState(false);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["facebook_marketplace"]);
  const [isPosting, setIsPosting] = useState(false);
  const [postingResults, setPostingResults] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, 15)); // Max 15 images
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 15
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeImages = async () => {
    if (files.length === 0) {
      alert('Please upload at least one image first');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append(`images`, file);
      });
      formData.append('location', 'United States');
      formData.append('target_profit', carDetails.lowestPrice || '2000');
      const response = await fetch('/api/v1/car-analysis/analyze-images', {
        method: 'POST',
        body: formData,
      });
      let result = null;
      if (response.ok) {
        result = await response.json();
        setAnalysisResult(result);
        setShowAnalysis(true);
        // Auto-populate fields with detected information
        if (result.image_analysis) {
          const detected = result.image_analysis;
          setCarDetails(prev => ({
            ...prev,
            make: detected.make || prev.make,
            model: detected.model || prev.model,
            year: detected.year ? detected.year.toString() : prev.year,
            mileage: detected.mileage ? detected.mileage.toString() : prev.mileage,
          }));
        }
      } else {
        throw new Error('Image analysis failed');
      }
      // Run market analysis in background
      if (carDetails.make && carDetails.model) {
        fetch('/api/v1/market-intelligence/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            make: carDetails.make,
            model: carDetails.model,
            year: carDetails.year ? parseInt(carDetails.year) : undefined,
            mileage: carDetails.mileage ? parseInt(carDetails.mileage) : undefined,
            location: 'United States',
            analysis_type: 'comprehensive',
          }),
        })
          .then(res => res.ok ? res.json() : null)
          .then(marketResult => {
            if (marketResult && result) {
              setAnalysisResult((prev: any) => ({ ...prev, market_intelligence: marketResult.data }));
            }
          });
      }
      // 6. Generate 2-3 AI description suggestions (mock for now)
      setTimeout(() => {
        setDescriptionSuggestions([
          `${carDetails.year} ${carDetails.make} ${carDetails.model} - Clean, well-maintained, ${carDetails.mileage} miles. Ready to drive!`,
          `Excellent ${carDetails.year} ${carDetails.make} ${carDetails.model}, clean title, only ${carDetails.mileage} miles.`,
          `For sale: ${carDetails.year} ${carDetails.make} ${carDetails.model}, ${carDetails.mileage} miles, great condition!`,
        ]);
      }, 500);
    } catch (error) {
      console.error('Error analyzing images:', error);
      alert('Failed to analyze images. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Please upload at least one image');
      return;
    }

    setIsPosting(true);
    
    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append(`images`, file);
      });
      
      // Add car details, using custom values if 'Other' is selected
      const detailsToSend = {
        ...carDetails,
        make: carDetails.make === 'Other' ? customMake : carDetails.make,
        model: carDetails.model === 'Other' ? customModel : carDetails.model,
      };
      
      // Add platform selection
      selectedPlatforms.forEach(platform => {
        formData.append(`platforms`, platform);
      });
      
      // Add user ID (you'll need to get this from auth context)
      formData.append('user_id', '1'); // TODO: Get from auth context
      
      // Add custom price if available
      if (carDetails.price) {
        formData.append('custom_price', carDetails.price);
      }
      
      // Add custom description if available
      if (carDetails.description) {
        formData.append('custom_description', carDetails.description);
      }

      const response = await fetch('/api/v1/platform-posting/analyze-and-post', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Listing posted:', result);
        setPostingResults(result);
        
        // Show success message
        const successCount = result.successful_postings || 0;
        const totalCount = result.total_platforms || 0;
        alert(`Successfully posted to ${successCount}/${totalCount} platforms!`);
        
        onClose();
      } else {
        throw new Error('Failed to post listing');
      }
    } catch (error) {
      console.error('Error posting listing:', error);
      alert('Failed to post listing. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  const searchMarket = async () => {
    if (!carDetails.make || !carDetails.model) {
      alert('Please enter make and model first');
      return;
    }

    setIsSearchingMarket(true);
    try {
      const response = await fetch('/api/v1/market-intelligence/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          make: carDetails.make,
          model: carDetails.model,
          year: carDetails.year ? parseInt(carDetails.year) : undefined,
          mileage: carDetails.mileage ? parseInt(carDetails.mileage) : undefined,
          location: 'United States',
          analysis_type: 'comprehensive'
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Market search complete:', result);
        
        // Update analysis result with market data
        if (analysisResult) {
          setAnalysisResult({
            ...analysisResult,
            market_intelligence: result.data
          });
        }
        
        alert('Market search completed! Check the analysis results below.');
      } else {
        throw new Error('Market search failed');
      }
    } catch (error) {
      console.error('Error searching market:', error);
      alert('Failed to search market. Please try again.');
    } finally {
      setIsSearchingMarket(false);
    }
  };

  const makes = Object.keys(carData);
  const models = carDetails.make && carDetails.make !== 'Other' ? carData[carDetails.make] : [];
  const currentYear = new Date().getFullYear() + 1;
  const years = Array.from({ length: currentYear - 1959 }, (_, i) => (currentYear - i).toString());

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Create New Listing
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Car Photos ({files.length}/15)
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-4xl mb-2">📸</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {isDragActive
                    ? 'Drop the files here...'
                    : 'Drag & drop images here, or click to select'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Up to 15 images (JPEG, PNG, WebP)
                </p>
              </div>

              {/* Preview Images */}
              {files.length > 0 && (
                <div className="mt-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {files.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* AI Analysis Button */}
                  <button
                    type="button"
                    onClick={analyzeImages}
                    disabled={isAnalyzing}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Running Quick Script...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        <span>Quick Script</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Car Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Make
                </label>
                <select
                  value={carDetails.make}
                  onChange={e => {
                    setCarDetails(prev => ({ ...prev, make: e.target.value, model: '' }));
                    setCustomMake('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10 overflow-y-auto"
                  required
                >
                  <option value="" disabled>Select Make</option>
                  {makes.map(make => (
                    <option key={make} value={make}>{make}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {carDetails.make === 'Other' && (
                  <input
                    type="text"
                    value={customMake}
                    onChange={e => setCustomMake(e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Make"
                    required
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Model
                </label>
                <select
                  value={carDetails.model}
                  onChange={e => {
                    setCarDetails(prev => ({ ...prev, model: e.target.value }));
                    setCustomModel('');
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10 overflow-y-auto"
                  required
                  disabled={!carDetails.make}
                >
                  <option value="" disabled>{carDetails.make ? 'Select Model' : 'Select Make First'}</option>
                  {models.map((model: string) => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
                {carDetails.model === 'Other' && (
                  <input
                    type="text"
                    value={customModel}
                    onChange={e => setCustomModel(e.target.value)}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Model"
                    required
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Year
                </label>
                <select
                  value={carDetails.year}
                  onChange={e => setCarDetails(prev => ({ ...prev, year: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10 overflow-y-auto"
                  required
                >
                  <option value="" disabled>Select Year</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mileage
                </label>
                <input
                  type="number"
                  value={carDetails.mileage}
                  onChange={(e) => setCarDetails(prev => ({ ...prev, mileage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50000"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price
              </label>
              <input
                type="number"
                value={carDetails.price}
                onChange={(e) => setCarDetails(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="15000"
                min="0"
                step="100"
                required
              />
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mt-2">
                Lowest I'll Take
              </label>
              <input
                type="number"
                value={carDetails.lowestPrice}
                onChange={(e) => setCarDetails(prev => ({ ...prev, lowestPrice: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                placeholder="12000"
                min="0"
                step="100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={carDetails.description}
                onChange={(e) => setCarDetails(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Describe the car's condition, features, and any relevant details..."
              />
            </div>

            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Post to Platforms
              </label>
              <div className="space-y-2">
                {[
                  { id: 'facebook_marketplace', name: 'Facebook Marketplace', icon: '📘' },
                  { id: 'craigslist', name: 'Craigslist', icon: '📋' },
                  { id: 'offerup', name: 'OfferUp', icon: '📱' }
                ].map((platform) => (
                  <label key={platform.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedPlatforms.includes(platform.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlatforms([...selectedPlatforms, platform.id]);
                        } else {
                          setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {platform.icon} {platform.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* AI Analysis Results */}
            {showAnalysis && analysisResult && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <span className="mr-2">🤖</span>
                    AI Analysis Results
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAnalysis(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>
                
                {/* Detected Information */}
                {analysisResult.image_analysis && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Detected Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Make:</span>
                        <span className="font-medium">{analysisResult.image_analysis.make || 'Not detected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Model:</span>
                        <span className="font-medium">{analysisResult.image_analysis.model || 'Not detected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Year:</span>
                        <span className="font-medium">{analysisResult.image_analysis.year || 'Not detected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Color:</span>
                        <span className="font-medium">{analysisResult.image_analysis.color || 'Not detected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Mileage:</span>
                        <span className="font-medium">{analysisResult.image_analysis.mileage ? `${analysisResult.image_analysis.mileage.toLocaleString()} mi` : 'Not detected'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Confidence:</span>
                        <span className="font-medium">{Math.round((analysisResult.confidence_score || 0) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Price Recommendations */}
                {analysisResult.price_recommendations && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price Recommendations</h4>
                    <div className="space-y-2">
                      {Object.entries(analysisResult.price_recommendations.price_recommendations || {}).map(([strategy, data]: [string, any]) => (
                        <div key={strategy} className="flex justify-between items-center p-2 bg-white dark:bg-gray-800 rounded-lg border">
                          <div>
                            <div className="font-medium capitalize">{strategy.replace('_', ' ')}</div>
                            <div className="text-xs text-gray-500">{data.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">${data.price?.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{data.estimated_days_to_sell} days</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Market Intelligence */}
                {analysisResult.market_intelligence && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Market Intelligence</h4>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <p>Market trend: <span className="font-medium capitalize">{analysisResult.market_intelligence.pricing_analysis?.price_trends?.trend || 'stable'}</span></p>
                      <p>Demand level: <span className="font-medium capitalize">{analysisResult.market_intelligence.make_model_analysis?.demand_analysis?.demand_level || 'medium'}</span></p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {descriptionSuggestions.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI Description Suggestions</label>
                <div className="space-y-2">
                  {descriptionSuggestions.map((desc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="w-full text-left px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                      onClick={() => setCarDetails(prev => ({ ...prev, description: desc }))}
                    >
                      {desc}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPosting || files.length === 0}
                className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
              >
                {isPosting ? `Posting to ${selectedPlatforms.length} Platform${selectedPlatforms.length > 1 ? 's' : ''}...` : `Post to ${selectedPlatforms.length} Platform${selectedPlatforms.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {/* 1. Add a style block to hide number input spinners */}
      <style jsx global>{`
        /* Hide number input spinners for Chrome, Safari, Edge, Opera */
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        /* Hide number input spinners for Firefox */
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
} 