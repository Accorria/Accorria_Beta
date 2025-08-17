'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import carDataRaw from '../../data/carData.json';
import { api } from '../../utils/api';
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
  lowestPrice: string;
  titleStatus: string;
  aboutVehicle: string; // User's input about the vehicle
  finalDescription: string; // AI-generated final description
}

export default function CreateListing({ onClose }: CreateListingProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [carDetails, setCarDetails] = useState<CarDetails>({
    make: '',
    model: '',
    year: '',
    mileage: '',
    price: '',
    lowestPrice: '',
    titleStatus: 'clean',
    aboutVehicle: '',
    finalDescription: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customMake, setCustomMake] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isSearchingMarket, setIsSearchingMarket] = useState(false);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [postingResults, setPostingResults] = useState<any>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('Accepted files:', acceptedFiles.length);
    console.log('Rejected files:', rejectedFiles.length);
    
    if (rejectedFiles.length > 0) {
      alert(`Some files were rejected. Please check file size (max 10MB) and format (JPEG, PNG, WebP).`);
    }
    
    setFiles(prev => [...prev, ...acceptedFiles].slice(0, 20)); // Max 20 images
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 20,
    maxSize: 10 * 1024 * 1024, // 10MB max file size
    multiple: true,
    noClick: false,
    noKeyboard: false
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePricingSelection = (pricingStrategy: string) => {
    // Update the price based on selected strategy
    if (analysisResult?.price_recommendations?.price_recommendations?.[pricingStrategy]?.price) {
      const newPrice = analysisResult.price_recommendations.price_recommendations[pricingStrategy].price;
      setCarDetails(prev => ({ ...prev, price: newPrice.toString() }));
      
      // Regenerate description with new price
      const updatedDescription = generateAIDescription(analysisResult, { ...carDetails, price: newPrice.toString() });
      setCarDetails(prev => ({ ...prev, finalDescription: updatedDescription }));
    }
  };

  const generateAIDescription = (analysisResult: any, carDetails: CarDetails): string => {
    let description = '';
    
    // Start with basic car info (use actual user input)
    const make = carDetails.make || "Unknown";
    const model = carDetails.model || "Unknown";
    const year = carDetails.year || "Unknown";
    const mileage = carDetails.mileage || "Unknown";
    const price = carDetails.price || '';
    const titleStatus = carDetails.titleStatus || 'clean';
    
    // Build description in your exact format with emojis
    description += `🚗 ${year} ${make} ${model}\n`;
    description += `💰 Asking Price: $${parseInt(price).toLocaleString()}\n`;
    description += `🏁 Mileage: ${parseInt(mileage).toLocaleString()} miles\n`;
    
    const titleStatusText = titleStatus === 'clean' ? 'Clean' : 
                           titleStatus === 'rebuilt' ? 'Rebuilt' : 
                           'Salvage';
    description += `📄 Title: ${titleStatusText}\n`;
    description += `📍 Location: Detroit, MI\n\n`;
    
    // Details section
    description += `💡 Details:\n`;
    description += `• Runs and drives excellent\n`;
    description += `• Smooth-shifting automatic\n`;
    description += `• Fuel-efficient sedan\n`;
    description += `• Comfortable, quiet ride\n`;
    description += `• Clean interior & exterior\n\n`;
    
    // Features section
    description += `🔧 Features & Equipment:\n`;
    
    // Add detected features from analysis
    if (analysisResult.data?.features_detected) {
      const features = analysisResult.data.features_detected;
      const featureList = [];
      
      if (features.car_features?.technology?.length > 0) {
        featureList.push(...features.car_features.technology);
      }
      if (features.car_features?.interior?.length > 0) {
        featureList.push(...features.car_features.interior);
      }
      if (features.car_features?.exterior?.length > 0) {
        featureList.push(...features.car_features.exterior);
      }
      
      // Map feature names to readable format
      const featureMap: { [key: string]: string } = {
        'backup_camera': 'Backup camera',
        'bluetooth': 'Bluetooth & USB',
        'apple_carplay': 'Apple CarPlay & Android Auto',
        'navigation': 'Navigation',
        'heated_seats': 'Heated seats',
        'leather_seats': 'Leather seats',
        'alloy_wheels': 'Alloy wheels',
        'cruise_control': 'Cruise control',
        'dual_zone_climate': 'Dual-zone climate control'
      };
      
      const uniqueFeatures = [...new Set(featureList.slice(0, 6))];
      uniqueFeatures.forEach(feature => {
        const readableFeature = featureMap[feature] || feature.replace(/_/g, ' ');
        description += `• ${readableFeature}\n`;
      });
    }
    
    // Add standard features if no detected features
    if (!analysisResult.data?.features_detected) {
      description += `• Backup camera\n`;
      description += `• Apple CarPlay & Android Auto\n`;
      description += `• Bluetooth & USB\n`;
      description += `• Dual-zone climate control\n`;
      description += `• Cruise control\n`;
      description += `• Alloy wheels\n`;
    }
    
    description += `\n🔑 Reliable, efficient sedan—priced right for a ${titleStatusText.toLowerCase()} title.\n\n`;
    description += `📱 Message me to schedule a test drive or ask questions!`;
    
    return description;
  };

  const analyzeImages = async () => {
    if (files.length === 0) {
      alert('Please upload at least one image first');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Use enhanced analysis endpoint for comprehensive image analysis
      const formData = new FormData();
      
      // Add all images
      files.forEach((file) => {
        formData.append('images', file);
      });
      
      // Add car details
      formData.append('make', carDetails.make || '');
      formData.append('model', carDetails.model || '');
      formData.append('year', carDetails.year || '');
      formData.append('mileage', carDetails.mileage || '');
      formData.append('price', carDetails.price || '');
      formData.append('lowestPrice', carDetails.lowestPrice || '');
      formData.append('titleStatus', carDetails.titleStatus || '');
      formData.append('aboutVehicle', carDetails.aboutVehicle || '');
      
      const result = await api.postFormData('/api/v1/enhanced-analyze', formData);
      setAnalysisResult(result);
      setShowAnalysis(true);
      
      // Generate AI description based on enhanced analysis
      if (result.success) {
        const generatedDescription = generateAIDescription(result, carDetails);
        setCarDetails(prev => ({ ...prev, finalDescription: generatedDescription }));
        setShowAnalysis(false); // Hide the analysis results section
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
      if (carDetails.finalDescription) {
        formData.append('custom_description', carDetails.finalDescription);
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
                Car Photos ({files.length}/20)
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
                    : 'Tap to select photos from your camera or gallery'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Up to 20 images (JPEG, PNG, WebP) • Max 10MB each
                </p>
                <p className="text-xs text-blue-500 mt-2">
                  💡 Tip: Take photos from different angles for better analysis
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
                Title Status
              </label>
              <select
                value={carDetails.titleStatus}
                onChange={(e) => setCarDetails(prev => ({ ...prev, titleStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="clean">Clean Title</option>
                <option value="rebuilt">Rebuilt Title</option>
                <option value="salvage">Salvage Title</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                About the Vehicle
              </label>
              <textarea
                value={carDetails.aboutVehicle}
                onChange={(e) => setCarDetails(prev => ({ ...prev, aboutVehicle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Tell us about the vehicle's condition, features, history, or any important details..."
              />
            </div>

            {/* Final Description Field - Generated by AI */}
            {carDetails.finalDescription && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  📄 Final Description
                </label>
                <textarea
                  value={carDetails.finalDescription}
                  readOnly
                  className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-green-50 dark:bg-green-900/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={12}
                  placeholder="AI will generate the final polished listing here..."
                />
              </div>
            )}

            {/* Pricing Suggestions */}
            {analysisResult && analysisResult.price_recommendations && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-3">
                  <span className="mr-2">💰</span>
                  Pricing Suggestions
                </h3>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => handlePricingSelection('quick_sale')}
                    className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-green-600">🚀 Quick Sale</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Sell it fast</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${analysisResult.price_recommendations.price_recommendations?.quick_sale?.price?.toLocaleString() || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{analysisResult.price_recommendations.price_recommendations?.quick_sale?.estimated_days_to_sell || '7'} days</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handlePricingSelection('market_price')}
                    className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-blue-600">📊 Market Price</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Regular market value</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${analysisResult.price_recommendations.price_recommendations?.market_price?.price?.toLocaleString() || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{analysisResult.price_recommendations.price_recommendations?.market_price?.estimated_days_to_sell || '14'} days</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handlePricingSelection('top_dollar')}
                    className="w-full text-left p-3 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-purple-600">💎 Hold & Make More</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Premium pricing</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${analysisResult.price_recommendations.price_recommendations?.top_dollar?.price?.toLocaleString() || 'N/A'}</div>
                        <div className="text-xs text-gray-500">{analysisResult.price_recommendations.price_recommendations?.top_dollar?.estimated_days_to_sell || '30'} days</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

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

            {/* AI Analysis Results - Hidden for cleaner UX */}
            {false && showAnalysis && analysisResult && (
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

            {false && descriptionSuggestions.length > 0 && (
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