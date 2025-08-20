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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
  const [selectedPricingTier, setSelectedPricingTier] = useState<'quick' | 'market' | 'premium' | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('onDrop called!');
    console.log('Accepted files:', acceptedFiles.length);
    console.log('Rejected files:', rejectedFiles.length);
    console.log('Accepted file names:', acceptedFiles.map(f => f.name));
    console.log('Accepted file types:', acceptedFiles.map(f => f.type));
    console.log('Accepted file sizes:', acceptedFiles.map(f => f.size));
    
    if (rejectedFiles.length > 0) {
      console.log('Rejected files details:', rejectedFiles);
              alert(`Some files were rejected. Please check file size (max 5MB) and format (JPEG, PNG, WebP).`);
    }
    
    if (acceptedFiles.length > 0) {
      console.log('Setting files...');
      
      // Convert and compress files
      const convertedFiles = await Promise.all(
        acceptedFiles.map(async (file): Promise<File> => {
          // Compress images to reduce file size
          if (file.type.startsWith('image/')) {
            console.log('Compressing file:', file.name, 'Size:', file.size);
            
            // Create a canvas to compress the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            return new Promise<File>((resolve) => {
              img.onload = () => {
                // Calculate new dimensions (max 1200px width/height)
                const maxSize = 1200;
                let { width, height } = img;
                
                if (width > height) {
                  if (width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                  }
                } else {
                  if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                  }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw and compress
                ctx?.drawImage(img, 0, 0, width, height);
                canvas.toBlob((blob) => {
                  if (blob) {
                    const compressedFile = new File([blob], file.name, {
                      type: 'image/jpeg',
                      lastModified: Date.now()
                    });
                    console.log('Compressed file:', file.name, 'New size:', compressedFile.size);
                    resolve(compressedFile);
                  } else {
                    resolve(file);
                  }
                }, 'image/jpeg', 0.8); // 80% quality
              };
              
              img.src = URL.createObjectURL(file);
            });
          }
          return file;
        })
      );
      
      setFiles(convertedFiles);
      console.log('Files state updated with:', convertedFiles.length, 'files');
    } else {
      console.log('No files to add!');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.heic', '.heif']
    },
    maxFiles: 20,
    maxSize: 50 * 1024 * 1024, // 50MB limit - let compression handle the rest
    multiple: true,
    noClick: false,
    noKeyboard: false
  });

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFileSelection = (file: File) => {
    setSelectedFiles(prev => {
      if (prev.includes(file)) {
        return prev.filter(f => f !== file);
      } else if (prev.length < 4) {
        return [...prev, file];
      }
      return prev;
    });
  };

  const handleTestPost = async () => {
    if (!selectedPricingTier) {
      alert('Please select a pricing tier first');
      return;
    }
    
    // Convert images to base64 for persistent storage
    const imagePromises = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });
    
    const imageUrls = await Promise.all(imagePromises);
    
    // Create test listing data
    const testListing = {
      id: Date.now().toString(),
      title: `${carDetails.year} ${carDetails.make} ${carDetails.model}`,
      price: selectedPricingTier === 'quick' ? Math.floor(parseInt(carDetails.price) * 0.85) :
             selectedPricingTier === 'premium' ? Math.floor(parseInt(carDetails.price) * 1.15) :
             parseInt(carDetails.price),
      description: carDetails.finalDescription,
      images: imageUrls, // Use base64 URLs instead of blob URLs
      mileage: carDetails.mileage,
      titleStatus: carDetails.titleStatus,
      postedAt: new Date().toISOString(),
      status: 'active',
      platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['facebook_marketplace'],
      messages: 0,
      clicks: Math.floor(Math.random() * 20) + 5 // Random initial views
    };
    
    // Store in localStorage for demo (in real app, this would go to database)
    const existingListings = JSON.parse(localStorage.getItem('testListings') || '[]');
    existingListings.unshift(testListing);
    localStorage.setItem('testListings', JSON.stringify(existingListings));
    
    // Show success message with platform info
    const platformNames = {
      'facebook_marketplace': 'Facebook Marketplace',
      'craigslist': 'Craigslist',
      'offerup': 'OfferUp'
    };
    
    const postedPlatforms = testListing.platforms.map(p => platformNames[p]).join(', ');
    
    alert(`✅ Listing posted successfully to: ${postedPlatforms}\n\nRedirecting to dashboard...`);
    
    // Close modal and navigate to dashboard
    onClose();
    
    // Force dashboard to refresh and show new listing
    setTimeout(() => {
      window.location.reload();
    }, 500);
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
    
    // Calculate price based on selected tier
    let displayPrice = parseInt(price);
    let priceMessage = '';
    
    if (selectedPricingTier === 'quick') {
      displayPrice = Math.floor(parseInt(price) * 0.85);
      priceMessage = '🚀 QUICK SALE - Priced to sell fast!';
    } else if (selectedPricingTier === 'premium') {
      displayPrice = Math.floor(parseInt(price) * 1.15);
      priceMessage = '💎 PREMIUM LISTING - Top condition, premium price';
    } else {
      priceMessage = '⚖️ FAIR MARKET PRICE - Great value for money';
    }
    
    // Build description in your exact format with emojis
    description += `🚗 ${year} ${make} ${model}\n`;
    description += `💰 Asking Price: $${displayPrice.toLocaleString()}\n`;
    description += `🏁 Mileage: ${parseInt(mileage).toLocaleString()} miles\n`;
    
    const titleStatusText = titleStatus === 'clean' ? 'Clean' : 
                           titleStatus === 'rebuilt' ? 'Rebuilt' : 
                           'Salvage';
    description += `📄 Title: ${titleStatusText}\n`;
    description += `📍 Location: Detroit, MI\n\n`;
    
    // Details section
    description += `💡 Details:\n`;
    
    // Add AI-detected details if available
    if (analysisResult.data?.condition_assessment) {
      const condition = analysisResult.data.condition_assessment;
      if (condition.overall_condition) {
        description += `• ${condition.overall_condition} condition\n`;
      }
    }
    
    // Add default details if no AI analysis
    if (!analysisResult.data?.features_detected) {
      description += `• Runs and drives excellent\n`;
      description += `• Smooth-shifting automatic\n`;
      description += `• Clean interior & exterior\n`;
    }
    
    description += `\n`;
    
    // Features section
    description += `🔧 Features & Equipment:\n`;
    
    // Add user-provided features (moved from details to features)
    if (carDetails.aboutVehicle && carDetails.aboutVehicle.trim()) {
      // Handle both comma-separated and line-break separated items
      const userFeatures = carDetails.aboutVehicle
        .split(/[,\n]/) // Split by comma OR newline
        .map(feature => feature.trim())
        .filter(feature => feature.length > 0); // Remove empty items
      
      userFeatures.forEach(feature => {
        description += `• ${feature}\n`;
      });
    }
    
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
    if (selectedFiles.length === 0) {
      alert('Please select at least one image for analysis');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Use enhanced analysis endpoint for comprehensive image analysis
      const formData = new FormData();
      
      // Add selected images for analysis
      selectedFiles.forEach((file) => {
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
      
      console.log('Sending analysis request with:', {
        files: files.length,
        make: carDetails.make,
        model: carDetails.model,
        year: carDetails.year,
        endpoint: '/api/v1/enhanced-analyze'
      });
      
      const result = await api.postFormData('/api/v1/enhanced-analyze', formData);
      console.log('Analysis result:', result);
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
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
        files: files.length
      });
      alert(`Failed to analyze images. Error: ${error.message || 'Unknown error'}. Please try again.`);
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
                    Up to 20 images (JPEG, PNG, WebP) • Auto-compressed for optimal size
                  </p>
                                  <p className="text-xs text-blue-500 mt-2">
                    💡 Tip: Take photos from different angles for better analysis (v2)
                  </p>
              </div>

              {/* Preview Images */}
              {files.length > 0 && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        🎯 Select 4 Key Photos for AI Analysis
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Choose: Exterior, Interior, Dashboard, & Key Features (saves tokens)
                      </p>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                      {selectedFiles.length}/4 selected
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {files.map((file, index) => {
                      const isSelected = selectedFiles.includes(file);
                      // Debug logging
                      console.log('Rendering file:', file.name, file.type, file.size);
                      return (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className={`w-full h-20 object-cover rounded-lg cursor-pointer transition-all ${
                              isSelected ? 'ring-2 ring-blue-500 opacity-100' : 'opacity-70 hover:opacity-100'
                            }`}
                            onClick={() => toggleFileSelection(file)}
                            onError={(e) => console.error('Image failed to load:', file.name)}
                            onLoad={() => console.log('Image loaded successfully:', file.name)}
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            ✕
                          </button>
                          {isSelected && (
                            <div className="absolute top-1 left-1 w-5 h-5 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center">
                              ✓
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                type="text"
                value={carDetails.price ? parseInt(carDetails.price).toLocaleString() : ''}
                onChange={(e) => {
                  // Remove all non-numeric characters and convert to number
                  const numericValue = e.target.value.replace(/[^0-9]/g, '');
                  setCarDetails(prev => ({ ...prev, price: numericValue }));
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="15,000"
                required
              />
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mt-2">
                Lowest I'll Take
              </label>
              <input
                type="text"
                value={carDetails.lowestPrice ? parseInt(carDetails.lowestPrice).toLocaleString() : ''}
                onChange={(e) => {
                  // Remove all non-numeric characters and convert to number
                  const numericValue = e.target.value.replace(/[^0-9]/g, '');
                  setCarDetails(prev => ({ ...prev, lowestPrice: numericValue }));
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 focus:border-transparent mt-1"
                placeholder="12,000"
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

            {/* Pricing Tier Selection */}
            {analysisResult && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-3">
                  <span className="mr-2">🎯</span>
                  Choose Your Pricing Strategy
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPricingTier('quick');
                      // Regenerate description with new pricing tier
                      const newDescription = generateAIDescription(analysisResult, carDetails);
                      setCarDetails(prev => ({ ...prev, finalDescription: newDescription }));
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPricingTier === 'quick' 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-green-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-green-600">🚀 Quick Sale</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Lower price, faster sale</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${Math.floor(parseInt(carDetails.price || '0') * 0.85).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">~7 days</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPricingTier('market');
                      // Regenerate description with new pricing tier
                      const newDescription = generateAIDescription(analysisResult, carDetails);
                      setCarDetails(prev => ({ ...prev, finalDescription: newDescription }));
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPricingTier === 'market' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-blue-600">⚖️ Market Rate</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Balanced price & speed</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">${parseInt(carDetails.price || '0').toLocaleString()}</div>
                        <div className="text-xs text-gray-500">~14 days</div>
                      </div>
                    </div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPricingTier('premium');
                      // Regenerate description with new pricing tier
                      const newDescription = generateAIDescription(analysisResult, carDetails);
                      setCarDetails(prev => ({ ...prev, finalDescription: newDescription }));
                    }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedPricingTier === 'premium' 
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                        : 'border-gray-200 dark:border-gray-600 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-purple-600">💎 Premium</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Higher price, detailed listing</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">${Math.floor(parseInt(carDetails.price || '0') * 1.15).toLocaleString()}</div>
                        <div className="text-xs text-gray-500">~21 days</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Final Description Field - Generated by AI */}
            {carDetails.finalDescription && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    📄 Final Description
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(carDetails.finalDescription);
                      alert('✅ Listing copied to clipboard! Ready to paste into Facebook Marketplace.');
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    📋 Copy to Clipboard
                  </button>
                </div>
                <textarea
                  value={carDetails.finalDescription}
                  readOnly
                  className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-green-50 dark:bg-green-900/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={12}
                  placeholder="AI will generate the final polished listing here..."
                />
                
                {/* Post Button */}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleTestPost}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>🚀</span>
                    <span>Post Listing</span>
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    This will create your listing on the dashboard
                  </p>
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