'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useDropzone, FileRejection } from 'react-dropzone';
import carDataRaw from '../../data/carData.json';
import carTrimsRaw from '../../data/carTrims.json';
import { api } from '../../utils/api';
import { getBackendUrl, API_ENDPOINTS } from '../../config/api';
import { ListingsService } from '../../services/listingsService';
import FacebookOAuth2 from '../FacebookOAuth2';
import { authenticatedFetch } from '../../utils/api';
const carData = carDataRaw as Record<string, string[]>;
const carTrims = carTrimsRaw as Record<string, Record<string, string[]>>;

interface CreateListingProps {
  onClose: () => void;
  onListingCreated?: () => void;
}

interface CarDetails {
  make: string;
  model: string;
  trim: string;
  year: string;
  mileage: string;
  price: string;
  lowestPrice: string;
  titleStatus: string;
  city?: string;
  zipCode?: string;
  aboutVehicle: string; // User's input about the vehicle
  finalDescription: string; // AI-generated final description

}

interface AnalysisResult {
  success: boolean;
  post_text?: string;
  description?: string;
  ai_analysis?: string;
  image_analysis?: {
    make?: string;
    model?: string;
    year?: string;
    color?: string;
    mileage?: number;
  };
  confidence_score?: number;
  detected?: {
    features?: string[];
    make?: string;
    model?: string;
    year?: number;
  };
  analysis_json?: Record<string, unknown>;
  listing_context?: Record<string, unknown>;
  final_listing_text?: string;
  market_intelligence?: {
    pricing_analysis?: {
      price_trends?: {
        trend?: string;
      };
      market_prices?: {
        market_average?: number;
        kbb_value?: number;
        edmunds_value?: number;
        cargurus_value?: number;
        price_range?: {
          low?: number;
          high?: number;
        };
        data_source?: string;
      };
      price_recommendations?: {
        recommended_buy_price?: number;
        recommended_sell_price?: number;
        target_profit_margin?: number;
      };
    };
    make_model_analysis?: {
      demand_analysis?: {
        demand_level?: string;
      };
    };
    competitor_research?: {
      competitors_found?: number;
      competitors?: Array<Record<string, unknown>>;
      pricing_analysis?: {
        average_price?: number;
        price_range?: {
          min?: number;
          max?: number;
        };
      };
    };
    profit_thresholds?: {
      acquisition_thresholds?: {
        max_acquisition_price?: number;
        target_acquisition_price?: number;
      };
      selling_thresholds?: {
        min_selling_price?: number;
        target_selling_price?: number;
      };
    };
  };
  price_recommendations?: {
    price_recommendations?: Record<string, { price: number; description?: string; estimated_days_to_sell?: number }>;
  };
  data?: {
    price_trends?: Record<string, unknown>;
    demand_analysis?: Record<string, unknown>;
    condition_assessment?: {
      overall_condition?: string;
    };
    features_detected?: {
      car_features?: {
        technology?: string[];
        interior?: string[];
        exterior?: string[];
      };
    };
  };
}

interface FileWithId {
  id: string;
  file: File;
}

export default function CreateListing({ onClose, onListingCreated }: CreateListingProps) {
  const [files, setFiles] = useState<FileWithId[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<FileWithId[]>([]);
  const [renderKey, setRenderKey] = useState(0);

  const [carDetails, setCarDetails] = useState<CarDetails>({
    make: '',
    model: '',
    trim: '',
    year: '',
    mileage: '',
    price: '',
    lowestPrice: '',
    titleStatus: 'clean',
    aboutVehicle: '',
    finalDescription: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [customMake, setCustomMake] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Clear any existing error on component mount
  useEffect(() => {
    setAnalysisError(null);
  }, []);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, boolean>>({});
  const [isPosting, setIsPosting] = useState(false);
  const [selectedPricingTier, setSelectedPricingTier] = useState<'quick' | 'market' | 'premium' | null>(null);
  const [titleRebuildExplanation, setTitleRebuildExplanation] = useState('');
  const [postSuccess, setPostSuccess] = useState(false);
  const [postResult, setPostResult] = useState<{successCount: number, totalCount: number} | null>(null);

  // Load connection statuses for platforms
  useEffect(() => {
    const loadConnections = async () => {
      try {
        // Check Facebook connection - use backend URL
        const backendUrl = getBackendUrl();
        const response = await authenticatedFetch(`${backendUrl}/api/v1/facebook/connection-status`);
        if (response.ok) {
          const data = await response.json();
          setConnectedPlatforms(prev => ({
            ...prev,
            facebook_marketplace: data.connected || false
          }));
        }
      } catch (err) {
        console.error('Error loading platform connections:', err);
        // Silently fail - connections are optional
      }
    };

    loadConnections();
  }, []);


  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    console.log('onDrop called with', acceptedFiles.length, 'accepted files');
    
    if (rejectedFiles.length > 0) {
      console.log('Rejected files details:', rejectedFiles);
              alert(`Some files were rejected. Please check file size (max 5MB) and format (JPEG, PNG, WebP).`);
    }
    
    if (acceptedFiles.length > 0) {
      // Convert and compress files
      const convertedFiles = await Promise.all(
        acceptedFiles.map(async (file): Promise<File> => {
          // Compress images to reduce file size
          if (file.type.startsWith('image/')) {
            
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
      
      // Append new files instead of replacing, with unique IDs
      const filesWithIds = convertedFiles.map(file => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}`,
        file
      }));
      setFiles(prev => [...prev, ...filesWithIds]);
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
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFileSelection = (fileWithId: FileWithId) => {
    console.log('Toggle file selection called for:', fileWithId.file.name);
    setSelectedFiles(prev => {
      if (prev.some(f => f.id === fileWithId.id)) {
        console.log('Removing file from selection:', fileWithId.file.name);
        return prev.filter(f => f.id !== fileWithId.id);
      } else if (prev.length < 4) {
        console.log('Adding file to selection:', fileWithId.file.name);
        return [...prev, fileWithId];
      }
      console.log('Max selection reached (4 files)');
      return prev;
    });
  };

  const handleTestPost = async () => {
    // Use market rate as default if no pricing tier is selected
    const pricingTier = selectedPricingTier || 'market';
    
    setIsPosting(true);
    
    try {
      // Convert images to base64 for persistent storage
      const imagePromises = files.map(fileWithId => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            resolve(reader.result as string);
          };
          reader.readAsDataURL(fileWithId.file);
        });
      });
      
      const imageUrls = await Promise.all(imagePromises);
      
      // Calculate price based on selected tier
      const basePrice = parseInt(carDetails.price || '0');
      const finalPrice = pricingTier === 'quick' ? Math.floor(basePrice * 0.85) :
                        pricingTier === 'premium' ? Math.floor(basePrice * 1.15) :
                        basePrice;
      
      // Create listing data for database
      const listingData = {
        title: `${carDetails.year} ${carDetails.make} ${carDetails.model}`,
        description: carDetails.finalDescription,
        price: finalPrice,
        platforms: selectedPlatforms.length > 0 ? selectedPlatforms : ['accorria'],
        status: 'active' as const,
        images: imageUrls,
        make: carDetails.make,
        model: carDetails.model,
        year: parseInt(carDetails.year) || new Date().getFullYear(),
        mileage: carDetails.mileage,
        condition: 'good',
        location: 'Detroit, MI',
        titleStatus: 'Clean',
        postedAt: new Date().toISOString()
      };
      
      // Use the listingsService to create the listing
      const listingsService = new ListingsService();
      const createdListing = await listingsService.createListing(listingData);
      
      if (createdListing) {
        console.log('Listing created successfully:', createdListing);
        
        // Show success state
        setPostResult({ successCount: 1, totalCount: 1 });
        setPostSuccess(true);
        
        // Notify parent component that listing was created
        if (onListingCreated) {
          onListingCreated();
        }
      } else {
        throw new Error('Failed to create listing');
      }
      
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to create listing. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };


  const generateAIDescription = (analysisResult: AnalysisResult, carDetails: CarDetails, titleRebuildExplanation?: string): string => {
    let description = '';
    
    // Start with basic car info (use actual user input)
    const make = carDetails.make || "Unknown";
    const model = carDetails.model || "Unknown";
    const year = carDetails.year || "Unknown";
    const mileage = carDetails.mileage || "Unknown";
    const price = carDetails.price || '';
    const titleStatus = carDetails.titleStatus || 'clean';
    
    // Calculate price based on selected tier and market data if available
    let displayPrice = parseInt(price || '0');
    const marketData = analysisResult.market_intelligence?.pricing_analysis;
    let basePriceForTier = displayPrice;
    
    // Use market average if available, otherwise use user's price
    if (marketData?.market_prices?.market_average) {
      const marketAvg = (marketData.market_prices as { market_average?: number }).market_average || displayPrice;
      basePriceForTier = Math.floor(marketAvg);
    }
    
    if (selectedPricingTier === 'quick') {
      displayPrice = Math.floor(basePriceForTier * 0.85);
    } else if (selectedPricingTier === 'premium') {
      displayPrice = Math.floor(basePriceForTier * 1.15);
    } else {
      // For market rate, use the base price (market average or user's price)
      displayPrice = basePriceForTier;
    }
    
    // Build description in your exact format with emojis
    description += `🚗 ${year} ${make} ${model}\n`;
    description += `💰 Asking Price: $${displayPrice.toLocaleString()}\n`;
    description += `🏁 Mileage: ${parseInt(mileage).toLocaleString()} miles\n`;
    
    const titleStatusText = titleStatus === 'clean' ? 'Clean' : 
                           titleStatus === 'rebuilt' ? 'Rebuilt' : 
                           titleStatus === 'salvage' ? 'Salvage' :
                           titleStatus === 'flood' ? 'Flood' :
                           titleStatus === 'lemon' ? 'Lemon' :
                           titleStatus === 'junk' ? 'Junk' : 'Clean';
    
    // Add title status with appropriate emoji and context
    const titleEmoji = titleStatus === 'clean' ? '✅' : 
                      titleStatus === 'rebuilt' ? '🔧' : 
                      titleStatus === 'salvage' ? '⚠️' :
                      titleStatus === 'flood' ? '🌊' :
                      titleStatus === 'lemon' ? '🍋' :
                      titleStatus === 'junk' ? '🗑️' : '✅';
    
    description += `${titleEmoji} Title: ${titleStatusText}\n`;
    const location = carDetails.city && carDetails.zipCode 
      ? `${carDetails.city}, ${carDetails.zipCode}` 
      : carDetails.city || 'Detroit, MI';
    description += `📍 Location: ${location}\n\n`;
    
    // Details section
    description += `💡 Details:\n`;
    
    // Add AI-detected details if available
    if (analysisResult.data?.condition_assessment) {
      const condition = analysisResult.data.condition_assessment;
      if (condition.overall_condition) {
        description += `• ${condition.overall_condition} condition\n`;
      }
    }
    
    // Add title rebuild explanation if applicable
    if (titleStatus === 'rebuilt' && titleRebuildExplanation) {
      description += `• ${titleRebuildExplanation}\n`;
    }
    
    // Add default details if no AI analysis
    if (!analysisResult.data?.features_detected) {
      description += `• Runs and drives\n`;
      description += `• Transmission works great\n`;
      description += `• Good condition\n`;
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
        'navigation': 'Navigation system',
        'heated_seats': 'Heated seats',
        'leather_seats': 'Leather seats',
        'alloy_wheels': 'Alloy wheels',
        'cruise_control': 'Cruise control',
        'dual_zone_climate': 'Dual-zone climate control',
        'sunroof': 'Sunroof',
        'tinted_windows': 'Tinted windows',
        'touchscreen': 'Touchscreen display',
        'premium_audio': 'Premium audio system',
        'keyless_entry': 'Keyless entry',
        'push_button_start': 'Push-button start',
        'lane_departure': 'Lane departure warning',
        'blind_spot': 'Blind spot monitoring',
        'adaptive_cruise': 'Adaptive cruise control',
        'parking_sensors': 'Parking sensors',
        'led_headlights': 'LED headlights',
        'fog_lights': 'Fog lights',
        'spoiler': 'Rear spoiler',
        'chrome_trim': 'Chrome trim',
        'premium_wheels': 'Premium wheels'
      };
      
      const uniqueFeatures = [...new Set(featureList.slice(0, 6))];
      uniqueFeatures.forEach(feature => {
        const readableFeature = featureMap[feature] || feature.replace(/_/g, ' ');
        description += `• ${readableFeature}\n`;
      });
    }
    
    // Add standard features if no detected features
    if (!analysisResult.data?.features_detected) {
      description += `• Touchscreen infotainment system\n`;
      description += `• Bluetooth + Backup camera\n`;
      description += `• Heated seats\n`;
      description += `• Alloy wheels\n`;
      description += `• Dual-zone climate control\n`;
      description += `• Power seats + remote start\n`;
    }
    
    // Add title-specific context to the description - use actual car details
    let titleContext = '';
    const vehicleType = analysisResult?.image_analysis?.color || analysisResult?.detected?.make 
      ? `${make} ${model}` 
      : 'vehicle';
    
    if (titleStatus === 'clean') {
      titleContext = `${make} ${model} with a clean title—priced competitively.`;
    } else if (titleStatus === 'rebuilt') {
      titleContext = `Rebuilt title ${make} ${model}—professionally restored and ready to drive.`;
    } else if (titleStatus === 'salvage') {
      titleContext = `Salvage title ${make} ${model}—great for parts or restoration project.`;
    } else if (titleStatus === 'flood') {
      titleContext = `Flood title ${make} ${model}—sold as-is for parts or restoration.`;
    } else if (titleStatus === 'lemon') {
      titleContext = `Lemon title ${make} ${model}—sold as-is, great for parts.`;
    } else if (titleStatus === 'junk') {
      titleContext = `Junk title ${make} ${model}—sold for parts only.`;
    } else {
      titleContext = `${make} ${model}—priced right for the market.`;
    }
    
    description += `\n🔑 ${titleContext}\n\n`;
    description += `📱 Message me to schedule a test drive or make an offer!`;
    
    return description;
  };

  // Function to fetch market intelligence
  const fetchMarketIntelligence = useCallback(async (location?: string) => {
    if (!carDetails.make || !carDetails.model) return;
    
    try {
      const marketLocation = location || 
        (carDetails.zipCode ? `${carDetails.city || ''}, ${carDetails.zipCode}`.trim() : 
         carDetails.city || 'United States');
      
      const marketResult = await api.post(API_ENDPOINTS.MARKET_INTELLIGENCE_ANALYZE, {
        make: carDetails.make,
        model: carDetails.model,
        year: carDetails.year ? parseInt(carDetails.year) : undefined,
        mileage: carDetails.mileage ? parseInt(carDetails.mileage) : undefined,
        location: marketLocation,
        analysis_type: 'comprehensive',
        radius_miles: 50,
      }) as { data?: Record<string, unknown>; success?: boolean };
      
      if (marketResult && marketResult.data) {
        const marketData = marketResult.data as Record<string, unknown>;
        setAnalysisResult((prev) => prev ? ({ ...prev, market_intelligence: marketData }) : null);
        
        // Update pricing tiers based on market data
        const pricingAnalysis = marketData.pricing_analysis as { market_prices?: { market_average?: number } } | undefined;
        if (pricingAnalysis?.market_prices?.market_average) {
          const marketAvg = pricingAnalysis.market_prices.market_average;
          if (marketAvg && carDetails.price) {
            const currentPrice = parseInt(carDetails.price);
            // Validate price against market
            if (currentPrice < marketAvg * 0.8) {
              console.log('Price is below market average - good for quick sale');
            } else if (currentPrice > marketAvg * 1.2) {
              console.log('Price is above market average - may take longer to sell');
            }
          }
        }
      }
    } catch (error) {
      console.error('Market intelligence error:', error);
    }
  }, [carDetails.make, carDetails.model, carDetails.year, carDetails.mileage, carDetails.city, carDetails.zipCode]);

  // Fetch market intelligence when zip code changes
  useEffect(() => {
    if (carDetails.zipCode && carDetails.zipCode.length >= 5 && carDetails.make && carDetails.model) {
      // Debounce the API call
      const timer = setTimeout(() => {
        fetchMarketIntelligence();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [carDetails.zipCode, carDetails.make, carDetails.model, fetchMarketIntelligence]);

  // Fetch market intelligence when price is set (to validate against market)
  useEffect(() => {
    if (carDetails.price && parseInt(carDetails.price) > 0 && carDetails.make && carDetails.model && analysisResult) {
      // Debounce the API call
      const timer = setTimeout(() => {
        fetchMarketIntelligence();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [carDetails.price, carDetails.make, carDetails.model, analysisResult, fetchMarketIntelligence]);

  // Regenerate description when any relevant field changes
  useEffect(() => {
    if (analysisResult && carDetails.finalDescription) {
      const newDescription = generateAIDescription(analysisResult, carDetails, titleRebuildExplanation);
      setCarDetails(prev => ({ ...prev, finalDescription: newDescription }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedPricingTier, 
    analysisResult, 
    carDetails.make, 
    carDetails.model, 
    carDetails.year, 
    carDetails.mileage, 
    carDetails.price, 
    carDetails.titleStatus,
    carDetails.city,
    carDetails.zipCode,
    carDetails.aboutVehicle,
    titleRebuildExplanation
  ]);

  const analyzeImages = async () => {
    const startTime = Date.now();
    console.log('🚀 [ANALYZE] analyzeImages called at:', new Date().toISOString());
    
    if (selectedFiles.length === 0) {
      console.log('❌ [ANALYZE] No files selected');
      alert('Please select at least one image for analysis');
      return;
    }

    console.log(`📁 [ANALYZE] Selected ${selectedFiles.length} files for analysis`);
    setIsAnalyzing(true);
    setAnalysisError(null);
    
    try {
      // Test API connectivity first
      try {
        const backendUrl = getBackendUrl();
        console.log('🏥 [ANALYZE] Starting health check using backend URL:', backendUrl);
        const healthCheckStart = Date.now();
        
        // Add timeout for health check (10 seconds)
        const healthCheckController = new AbortController();
        const healthCheckTimeout = setTimeout(() => healthCheckController.abort(), 10000);
        
        const healthCheck = await api.authenticatedFetch(API_ENDPOINTS.HEALTH, {
          signal: healthCheckController.signal
        });
        
        clearTimeout(healthCheckTimeout);
        const healthCheckTime = Date.now() - healthCheckStart;
        console.log(`⏱️  [ANALYZE] Health check completed in ${healthCheckTime}ms`);
        
        if (!healthCheck.ok) {
          console.error('❌ [ANALYZE] Health check failed with status:', healthCheck.status);
          throw new Error(`Backend health check failed: ${healthCheck.status}`);
        }
        console.log('✅ [ANALYZE] Backend health check passed');
      } catch (healthError: any) {
        const healthCheckTime = Date.now() - startTime;
        if (healthError.name === 'AbortError') {
          console.error('❌ [ANALYZE] Health check timed out after 10 seconds');
          setAnalysisError('Backend service is not responding. Make sure your local backend is running at http://localhost:8000');
        } else {
          console.error('❌ [ANALYZE] Backend health check failed after', healthCheckTime, 'ms:', healthError);
          setAnalysisError(`Backend service unavailable: ${healthError.message || 'Connection failed'}`);
        }
        setIsAnalyzing(false);
        return;
      }
      
      // Use enhanced analysis endpoint for comprehensive image analysis
      const formData = new FormData();
      
      // Add selected images for analysis
      selectedFiles.forEach((fileWithId) => {
        formData.append('images', fileWithId.file);
      });
      
      // Add car details
      formData.append('make', carDetails.make || '');
      formData.append('model', carDetails.model || '');
      formData.append('trim', carDetails.trim || '');
      formData.append('year', carDetails.year || '');
      formData.append('mileage', carDetails.mileage || '');
      formData.append('price', carDetails.price || '');
      formData.append('lowestPrice', carDetails.lowestPrice || '');
      formData.append('titleStatus', carDetails.titleStatus || '');
      formData.append('aboutVehicle', carDetails.aboutVehicle || '');
      
      console.log('📤 [ANALYZE] Sending analysis request with:', {
        files: selectedFiles.length,
        make: carDetails.make,
        model: carDetails.model,
        year: carDetails.year,
        mileage: carDetails.mileage,
        price: carDetails.price,
        titleStatus: carDetails.titleStatus,
        endpoint: API_ENDPOINTS.ENHANCED_ANALYZE
      });
      
      // Call backend directly instead of going through frontend API route
      const backendUrl = getBackendUrl();
      console.log('📡 [ANALYZE] Using backend URL:', backendUrl);
      console.log('⏱️  [ANALYZE] Calling api.postFormData to:', API_ENDPOINTS.ENHANCED_ANALYZE);
      const analysisStart = Date.now();
      
      const result = await api.postFormData(API_ENDPOINTS.ENHANCED_ANALYZE, formData);
      
      const analysisTime = Date.now() - analysisStart;
      console.log(`⏱️  [ANALYZE] Analysis completed in ${analysisTime}ms (${(analysisTime/1000).toFixed(1)}s)`);
      console.log('✅ [ANALYZE] Analysis result received:', {
        success: result?.success,
        hasDescription: !!result?.description,
        hasPostText: !!result?.post_text,
        descriptionLength: result?.description?.length || 0,
        postTextLength: result?.post_text?.length || 0
      });
      
      // DEBUG: Print the actual result to console
      console.log('📋 [ANALYZE] Full result object:', JSON.stringify(result, null, 2).substring(0, 500));
      
      setAnalysisResult(result as AnalysisResult);
      setShowAnalysis(true);
      
      // Generate AI description based on enhanced analysis
      const analysisResult = result as AnalysisResult;
      if (analysisResult.success) {
        // Use AI-generated content from backend if available, otherwise fallback to local generation
        let generatedDescription = '';
        
        if (analysisResult.post_text) {
          // Use the AI-generated post text from backend
          generatedDescription = analysisResult.post_text;
          console.log('✅ [ANALYZE] Using AI-generated post text from backend');
          console.log('📝 [ANALYZE] Post text preview:', generatedDescription.substring(0, 200));
        } else if (analysisResult.description) {
          // Use the AI-generated description from backend
          generatedDescription = analysisResult.description;
          console.log('✅ [ANALYZE] Using AI description from backend');
          console.log('📝 [ANALYZE] Description preview:', generatedDescription.substring(0, 200));
        } else if (analysisResult.ai_analysis) {
          // Use the raw AI analysis from backend
          generatedDescription = analysisResult.ai_analysis;
          console.log('⚠️ [ANALYZE] Using raw AI analysis from backend (no formatted description)');
        } else {
          // Fallback to local generation
          generatedDescription = generateAIDescription(analysisResult, carDetails, titleRebuildExplanation);
          console.log('⚠️ [ANALYZE] Using fallback local generation (backend did not return description)');
        }
        
        if (!generatedDescription || generatedDescription.trim().length === 0) {
          console.error('❌ [ANALYZE] ERROR: No description generated!');
          alert('Analysis completed but no description was generated. Please check console for details.');
          setIsAnalyzing(false);
          return;
        }
        
        // Clean up the description text
        const cleanedDescription = generatedDescription
          .replace(/no visible damage/gi, 'good condition')
          .replace(/runs and drives excellent/gi, 'Runs and drives')
          .replace(/runs and drives great/gi, 'Runs and drives')
          .replace(/transmission shifts smooth/gi, 'Transmission works great')
          .replace(/transmission shifts great/gi, 'Transmission works great')
          .replace(/good paint condition/gi, 'excellent paint condition')
          .replace(/clean interior/gi, 'well-maintained interior')
          // Remove emojis from features section
          .replace(/🔧 Features & Equipment:/g, 'Features & Equipment:')
          .replace(/❤️/g, '•')
          .replace(/🛠️/g, '•')
          .replace(/⚙️/g, '•')
          .replace(/🔧/g, '•')
          .replace(/📱/g, '•')
          .replace(/🎵/g, '•')
          .replace(/🧭/g, '•')
          .replace(/🪑/g, '•')
          .replace(/🛞/g, '•')
          .replace(/🌡️/g, '•')
          .replace(/🚗/g, '•');

        setCarDetails(prev => ({ ...prev, finalDescription: cleanedDescription }));
        setShowAnalysis(false); // Hide the analysis results section
        
        console.log('✅ [ANALYZE] Description set in carDetails.finalDescription');
        console.log('📝 [ANALYZE] Final description length:', cleanedDescription.length, 'chars');
        console.log('📝 [ANALYZE] Final description preview:', cleanedDescription.substring(0, 200));
      } else {
        console.error('❌ [ANALYZE] Analysis result.success is false');
        console.error('❌ [ANALYZE] Result:', result);
        alert('Analysis failed. Please check console for details.');
      }
      // Run market analysis in background
      if (carDetails.make && carDetails.model) {
        const backendUrl = getBackendUrl();
        api.post(API_ENDPOINTS.MARKET_INTELLIGENCE_ANALYZE, {
          make: carDetails.make,
          model: carDetails.model,
          year: carDetails.year ? parseInt(carDetails.year) : undefined,
          mileage: carDetails.mileage ? parseInt(carDetails.mileage) : undefined,
          location: 'United States',
          analysis_type: 'comprehensive',
        })
          .then(marketResult => {
            if (marketResult && result) {
              const marketData = marketResult as { data?: Record<string, unknown> };
              setAnalysisResult((prev) => prev ? ({ ...prev, market_intelligence: marketData.data }) : null);
            }
          })
          .catch(error => {
            console.error('Market intelligence error:', error);
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
      files.forEach((fileWithId) => {
        formData.append(`images`, fileWithId.file);
      });
      
      // Add car details, using custom values if 'Other' is selected
      
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

      const requestStartTime = Date.now();
      console.log('⏱️  [FRONTEND] Starting request at:', new Date().toISOString());
      console.log('📡 [FRONTEND] Calling fetch to /api/v1/platform-posting/analyze-and-post...');
      console.log('📦 [FRONTEND] FormData contains:', {
        images: files.length,
        make: carDetails.make,
        model: carDetails.model,
        year: carDetails.year,
        mileage: carDetails.mileage,
        price: carDetails.price
      });
      
      let response;
      try {
        response = await fetch('/api/v1/platform-posting/analyze-and-post', {
          method: 'POST',
          body: formData,
        });
        
        const requestTime = Date.now() - requestStartTime;
        console.log(`⏱️  [FRONTEND] Response received in ${requestTime}ms (${(requestTime/1000).toFixed(1)}s)`);
        console.log('📊 [FRONTEND] Response status:', response.status, response.statusText);
      } catch (fetchError: any) {
        const requestTime = Date.now() - requestStartTime;
        console.error('❌ [FRONTEND] Fetch error after', requestTime, 'ms:', fetchError);
        console.error('❌ [FRONTEND] Error details:', {
          name: fetchError.name,
          message: fetchError.message,
          stack: fetchError.stack
        });
        throw fetchError;
      }

      if (response.ok) {
        console.log('✅ [FRONTEND] Response OK, parsing JSON...');
        const result = await response.json();
        console.log('✅ [FRONTEND] Listing posted successfully:', result);
        console.log('📝 [FRONTEND] Generated description length:', result.car_analysis?.description?.length || 0);
        
        // Save listing locally for demo users (in addition to backend save)
        try {
          const { listingsService } = await import('@/services/listingsService');
          const service = listingsService;
          
          // Create listing data from the analysis result
          const listingData = {
            title: result.car_analysis?.title || `${result.car_analysis?.year || ''} ${result.car_analysis?.make || ''} ${result.car_analysis?.model || ''}`.trim(),
            description: result.car_analysis?.description || carDetails.finalDescription || '',
            price: result.car_analysis?.price || parseFloat(carDetails.price) || 0,
            platforms: selectedPlatforms,
            status: 'active' as const,
            images: files.map(fileWithId => fileWithId.file.name), // Store file names for demo
            make: result.car_analysis?.make || carDetails.make,
            model: result.car_analysis?.model || carDetails.model,
            year: result.car_analysis?.year || carDetails.year,
            mileage: result.car_analysis?.mileage || carDetails.mileage,
            condition: result.car_analysis?.condition || 'Good',
            location: result.car_analysis?.location || `${carDetails.city}, ${carDetails.zipCode}`,
            postedAt: new Date().toISOString(),
            titleStatus: 'Clean',
            messages: 0,
            clicks: 0,
            detectedFeatures: result.car_analysis?.features || [],
            aiAnalysis: result.car_analysis,
            finalDescription: result.car_analysis?.description || carDetails.finalDescription
          };
          
          await service.createListing(listingData);
          console.log('✅ Listing saved locally for demo user');
        } catch (error) {
          console.error('Failed to save listing locally:', error);
          // Don't fail the entire flow if local save fails
        }
        
        // Show success state instead of closing immediately
        const successCount = result.successful_postings || 0;
        const totalCount = result.total_platforms || 0;
        setPostResult({ successCount, totalCount });
        setPostSuccess(true);
      } else {
        const errorText = await response.text().catch(() => 'Could not read error');
        console.error('❌ [FRONTEND] Response not OK:', response.status, errorText);
        throw new Error(`Failed to post listing: ${response.status} ${errorText}`);
      }
    } catch (error: any) {
      const totalTime = Date.now() - (requestStartTime || Date.now());
      console.error('❌ [FRONTEND] Error posting listing after', totalTime, 'ms:', error);
      console.error('❌ [FRONTEND] Error details:', {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      });
      alert(`Failed to post listing: ${error?.message || 'Unknown error'}. Check console for details.`);
    } finally {
      setIsPosting(false);
      console.log('🏁 [FRONTEND] Request finished, isPosting set to false');
    }
  };


  const makes = Object.keys(carData);
  const models = carDetails.make && carDetails.make !== 'Other' ? carData[carDetails.make] : [];
  const trims = useMemo(() => {
    if (carDetails.make && carDetails.make !== 'Other' && 
        carDetails.model && carDetails.model !== 'Other' && 
        carTrims[carDetails.make] && 
        carTrims[carDetails.make][carDetails.model]) {
      return carTrims[carDetails.make][carDetails.model];
    }
    return [];
  }, [carDetails.make, carDetails.model]);
  const currentYear = new Date().getFullYear() + 1;
  const years = Array.from({ length: currentYear - 1959 }, (_, i) => (currentYear - i).toString());

  // Memoize image URLs to prevent constant re-rendering
  const imageUrls = useMemo(() => {
    console.log('🎯 Creating new image URLs for', files.length, 'files:', files.map(f => f.file.name));
    return files.map(fileWithId => URL.createObjectURL(fileWithId.file));
  }, [files]); // Depend on the entire files array so reordering updates the URLs

  // Cleanup URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [files]); // Depend on files array to cleanup when files change

  // Show success screen after posting
  if (postSuccess && postResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 mb-4">
              <svg className="h-8 w-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              🎉 Listing Posted Successfully!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Your listing has been posted to <strong>{postResult.successCount}</strong> out of <strong>{postResult.totalCount}</strong> platforms.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setPostSuccess(false);
                  setPostResult(null);
                  // Call the callback to refresh dashboard listings
                  if (onListingCreated) {
                    onListingCreated();
                  }
                  onClose();
                }}
                className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => {
                  setPostSuccess(false);
                  setPostResult(null);
                  // Reset form for new listing
                  setFiles([]);
                  setSelectedFiles([]);
                  setCarDetails({
                    make: '',
                    model: '',
                    trim: '',
                    year: '',
                    mileage: '',
                    price: '',
                    lowestPrice: '',
                    titleStatus: '',
                    city: '',
                    zipCode: '',
                    aboutVehicle: '',
                    finalDescription: ''
                  });
                  setAnalysisResult(null);
                  setShowAnalysis(false);
                  setSelectedPricingTier(null);
                  setSelectedPlatforms([]);
                }}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Create Another Listing
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Create New Listing
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-2 -m-2"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Car Photos ({files.length}/20)
              </label>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-colors ${
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
                        Hover to see selection checkbox • Drag to reorder
                      </p>
                    </div>
                    <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                      {selectedFiles.length}/4 selected
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {files.map((fileWithId, index) => {
                      const isSelected = selectedFiles.some(f => f.id === fileWithId.id);
                      console.log(`🎯 Rendering photo ${index}: ${fileWithId.file.name}`);
                      return (
                        <div 
                          key={`${fileWithId.id}-${index}`}
                          className="relative group cursor-move select-none"
                          draggable
                          style={{ userSelect: 'none' }}
                          onMouseDown={(e) => {
                            // Start tracking for drag vs click
                            e.currentTarget.dataset.mouseDownTime = Date.now().toString();
                          }}
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', index.toString());
                            e.currentTarget.classList.add('opacity-50', 'scale-105');
                            console.log('🎯 DRAG STARTED for image', index, 'File:', fileWithId.file.name);
                          }}
                          onDragEnd={(e) => {
                            e.currentTarget.classList.remove('opacity-50', 'scale-105');
                            console.log('Drag ended for image', index);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.add('ring-2', 'ring-blue-300');
                            console.log('Drag over image', index);
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.classList.remove('ring-2', 'ring-blue-300');
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.classList.remove('ring-2', 'ring-blue-300');
                            
                            const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
                            const dropIndex = index;
                            
                            console.log('🎯 DROP EVENT:', { draggedIndex, dropIndex, draggedIndexType: typeof draggedIndex, dropIndexType: typeof dropIndex });
                            
                            if (draggedIndex !== dropIndex && !isNaN(draggedIndex) && !isNaN(dropIndex)) {
                              console.log('🎯 REORDERING: Moving from', draggedIndex, 'to', dropIndex);
                              const newFiles = [...files];
                              const [draggedFile] = newFiles.splice(draggedIndex, 1);
                              newFiles.splice(dropIndex, 0, draggedFile);
                              setFiles(newFiles);
                              setRenderKey(prev => prev + 1); // Force re-render
                              console.log('🎯 FILES REORDERED:', newFiles.map(f => f.file.name));
                            } else {
                              console.log('🎯 NO REORDER: Same position or invalid indices');
                            }
                          }}
                          // Mobile touch events for drag and drop
                          onTouchStart={(e) => {
                            e.currentTarget.dataset.touchStartTime = Date.now().toString();
                            e.currentTarget.dataset.touchStartY = e.touches[0].clientY.toString();
                            e.currentTarget.dataset.touchStartX = e.touches[0].clientX.toString();
                            e.currentTarget.dataset.draggedIndex = index.toString();
                          }}
                          onTouchMove={(e) => {
                            e.preventDefault();
                            const touch = e.touches[0];
                            const startY = parseFloat(e.currentTarget.dataset.touchStartY || '0');
                            const startX = parseFloat(e.currentTarget.dataset.touchStartX || '0');
                            const deltaY = Math.abs(touch.clientY - startY);
                            const deltaX = Math.abs(touch.clientX - startX);
                            
                            // If moved more than 10px, start drag mode
                            if (deltaY > 10 || deltaX > 10) {
                              e.currentTarget.classList.add('opacity-50', 'scale-105', 'z-10');
                              e.currentTarget.style.transform = `translate(${touch.clientX - startX}px, ${touch.clientY - startY}px)`;
                            }
                          }}
                          onTouchEnd={(e) => {
                            const element = e.currentTarget;
                            element.classList.remove('opacity-50', 'scale-105', 'z-10');
                            element.style.transform = '';
                            
                            // Find the element under the touch point
                            const touch = e.changedTouches[0];
                            const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
                            
                            if (elementBelow) {
                              const dropTarget = elementBelow.closest('[data-file-index]');
                              if (dropTarget) {
                                const draggedIndex = parseInt(element.dataset.draggedIndex || '0');
                                const dropIndex = parseInt(dropTarget.getAttribute('data-file-index') || '0');
                                
                                if (draggedIndex !== dropIndex) {
                                  const newFiles = [...files];
                                  const [draggedFile] = newFiles.splice(draggedIndex, 1);
                                  newFiles.splice(dropIndex, 0, draggedFile);
                                  setFiles(newFiles);
                                  setRenderKey(prev => prev + 1); // Force re-render
                                  console.log('Mobile drag: Files reordered:', newFiles.map(f => f.file.name));
                                }
                              }
                            }
                          }}
                          data-file-index={index}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imageUrls[index]}
                            alt={`Preview ${index + 1}`}
                            draggable={false}
                            className={`w-full h-20 object-cover rounded-lg transition-all ${
                              isSelected ? 'ring-2 ring-blue-500 opacity-100' : 'opacity-70 hover:opacity-100'
                            }`}
                            onError={() => console.error('Image failed to load:', fileWithId.file.name)}
                            onLoad={() => {}}
                          />
                          
                          {/* Selection Checkbox - appears on hover */}
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('Selection button clicked for:', fileWithId.file.name);
                              toggleFileSelection(fileWithId);
                            }}
                            className={`absolute top-1 left-1 w-6 h-6 rounded-full border-2 transition-all z-10 ${
                              isSelected 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'bg-white border-gray-300 hover:border-green-400 hover:bg-green-50'
                            } opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer`}
                          >
                            {isSelected ? (
                              <span className="text-xs font-bold">✓</span>
                            ) : (
                              <span className="text-xs text-gray-400">+</span>
                            )}
                          </button>
                          
                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                          >
                            ✕
                          </button>
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                            {index + 1}
                          </div>
                          
                          {/* Selected indicator overlay */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-green-500 bg-opacity-20 border-2 border-green-500 rounded-lg flex items-center justify-center">
                              <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                                <span className="text-sm font-bold">✓</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              Drag to reorder
                            </span>
                          </div>
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
                        <span>Coordinating Listing...</span>
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        <span>Coordinate Listing</span>
                      </>
                    )}
                  </button>
                  
                  {/* Error Display */}
                  {analysisError && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">⚠️</span>
                        <span className="text-sm">{analysisError}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Car Details */}
            <div className="grid grid-cols-2 gap-4">
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
                  Make
                </label>
                <select
                  value={carDetails.make}
                  onChange={e => {
                    setCarDetails(prev => ({ ...prev, make: e.target.value, model: '', trim: '' }));
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
                    setCarDetails(prev => ({ ...prev, model: e.target.value, trim: '' }));
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
                  Trim
                </label>
                <select
                  value={carDetails.trim}
                  onChange={e => setCarDetails(prev => ({ ...prev, trim: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-10 overflow-y-auto"
                  disabled={!carDetails.make || !carDetails.model || carDetails.model === 'Other' || trims.length === 0}
                >
                  <option value="">{trims.length > 0 ? 'Select Trim (Optional)' : carDetails.make && carDetails.model ? 'No trims available' : 'Select Make & Model First'}</option>
                  {trims.map((trim: string) => (
                    <option key={trim} value={trim}>{trim}</option>
                  ))}
                </select>
                {trims.length === 0 && carDetails.make && carDetails.model && carDetails.model !== 'Other' && (
                  <input
                    type="text"
                    value={carDetails.trim}
                    onChange={e => setCarDetails(prev => ({ ...prev, trim: e.target.value }))}
                    className="mt-2 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter Trim (Optional)"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mileage
                </label>
                <input
                  type="text"
                  value={carDetails.mileage && carDetails.mileage !== '' ? parseInt(carDetails.mileage).toLocaleString() : ''}
                  onChange={(e) => {
                    // Remove all non-numeric characters and convert to number
                    const numericValue = e.target.value.replace(/[^0-9]/g, '');
                    setCarDetails(prev => ({ ...prev, mileage: numericValue }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="50,000"
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
                placeholder="Enter asking price"
                required
              />
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mt-2">
                Lowest I&apos;ll Take
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
                placeholder="Enter minimum price"
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
                <option value="flood">Flood Title</option>
                <option value="lemon">Lemon Title</option>
                <option value="junk">Junk Title</option>
              </select>
            </div>

            {/* Title Rebuild Explanation - only show when Rebuilt Title is selected */}
            {carDetails.titleStatus === 'rebuilt' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Why was the title rebuilt?
                </label>
                <textarea
                  value={titleRebuildExplanation}
                  onChange={(e) => setTitleRebuildExplanation(e.target.value)}
                  placeholder="e.g., Minor accident damage that has been professionally repaired"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
              </div>
            )}

            {/* Location Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={carDetails.city || ''}
                  onChange={(e) => setCarDetails(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter city"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Zip Code
                </label>
                <input
                  type="text"
                  value={carDetails.zipCode || ''}
                  onChange={(e) => setCarDetails(prev => ({ ...prev, zipCode: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter zip code"
                  required
                />
              </div>
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
                placeholder={`Tell us about the vehicle's condition, features, history, or any important details...${carDetails.titleStatus === 'rebuilt' && titleRebuildExplanation ? `\n\nTitle Rebuild: ${titleRebuildExplanation}` : ''}`}
              />
            </div>

            {/* Pricing Tier Selection */}
            {analysisResult && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center mb-3">
                  <span className="mr-2">🎯</span>
                  Choose Your Pricing Strategy
                  {analysisResult.market_intelligence?.pricing_analysis && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Market Data</span>
                  )}
                </h3>
                {(() => {
                  // Calculate prices based on market data if available, otherwise use user's price
                  const basePrice = parseInt(carDetails.price || '10000');
                  const marketData = analysisResult.market_intelligence?.pricing_analysis;
                  
                  // Use market average if available, otherwise use user's price
                  let quickPrice = Math.floor(basePrice * 0.85);
                  let marketPrice = basePrice;
                  let premiumPrice = Math.floor(basePrice * 1.15);
                  
                  // Update prices based on market intelligence if available
                  if (marketData?.market_prices?.market_average) {
                    const marketAvg = (marketData.market_prices as { market_average?: number }).market_average || basePrice;
                    quickPrice = Math.floor(marketAvg * 0.85);
                    marketPrice = Math.floor(marketAvg);
                    premiumPrice = Math.floor(marketAvg * 1.15);
                  }
                  
                  return (
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setSelectedPricingTier('quick')}
                        className={`p-4 rounded-lg border-2 transition-all min-h-[80px] active:scale-95 touch-manipulation ${
                          selectedPricingTier === 'quick' 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-green-300 active:border-green-400 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-green-600 dark:text-green-400">🚀 Quick Sale</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Lower price, faster sale</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-gray-900 dark:text-white">${quickPrice.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">~7 days</div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setSelectedPricingTier('market')}
                        className={`p-4 rounded-lg border-2 transition-all min-h-[80px] active:scale-95 touch-manipulation ${
                          selectedPricingTier === 'market' 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 active:border-blue-400 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-blue-600 dark:text-blue-400">⚖️ Market Rate</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Balanced price & speed</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-gray-900 dark:text-white">${marketPrice.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">~14 days</div>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setSelectedPricingTier('premium')}
                        className={`p-4 rounded-lg border-2 transition-all min-h-[80px] active:scale-95 touch-manipulation ${
                          selectedPricingTier === 'premium' 
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg' 
                            : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 active:border-purple-400 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-bold text-purple-600 dark:text-purple-400">💎 Premium</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Higher price, detailed listing</div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">${premiumPrice.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">~21 days</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  );
                })()}
                
                {/* Edit Button */}
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAnalysis(false);
                      setAnalysisResult(null);
                      setSelectedPricingTier('market');
                    }}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <span>✏️</span>
                    <span>Edit Details & Pricing</span>
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
                  className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-green-50 dark:bg-green-900/20 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  rows={Math.max(8, carDetails.finalDescription.split('\n').length + 2)}
                  placeholder="AI will generate the final polished listing here..."
                />
                
                {/* Unified Post Button */}
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
                    {selectedPlatforms.length > 0 
                      ? `Will post to ${selectedPlatforms.length} platform${selectedPlatforms.length > 1 ? 's' : ''} and save to dashboard`
                      : 'Will save to dashboard (select platforms above to post externally)'
                    }
                  </p>
                </div>
              </div>
            )}



            {/* Platform Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select Platforms (Optional)
                </label>
                <Link 
                  href="/dashboard/connections" 
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Manage Connections →
                </Link>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Choose which platforms to post to. Connect your accounts in Settings → Connections first.
              </p>
              <div className="space-y-2">
                {[
                  { id: 'facebook_marketplace', name: 'Facebook Marketplace', icon: '📘' },
                  { id: 'craigslist', name: 'Craigslist', icon: '📋' },
                  { id: 'offerup', name: 'OfferUp', icon: '📱' },
                  { id: 'ebay', name: 'eBay Motors', icon: '🛒' },
                  { id: 'autotrader', name: 'AutoTrader', icon: '🚗' },
                  { id: 'cars_com', name: 'Cars.com', icon: '🚙' },
                  { id: 'cargurus', name: 'CarGurus', icon: '🔍' },
                  { id: 'vroom', name: 'Vroom', icon: '💨' }
                ].map((platform) => {
                  const isConnected = connectedPlatforms[platform.id] || false;
                  return (
                    <label key={platform.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedPlatforms.includes(platform.id)}
                        onChange={(e) => {
                          if (e.target.checked && !isConnected) {
                            // Show message to connect account first
                            alert(`${platform.name} is not connected. Please connect your account in Settings → Connections first.`);
                            return;
                          }
                          if (e.target.checked) {
                            setSelectedPlatforms([...selectedPlatforms, platform.id]);
                          } else {
                            setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-sm ${isConnected ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'}`}>
                        {platform.icon} {platform.name}
                        {isConnected ? (
                          <span className="ml-2 text-xs text-green-600 dark:text-green-400">✓ Connected</span>
                        ) : (
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-500">(Not connected)</span>
                        )}
                      </span>
                    </label>
                  );
                })}
              </div>
              
              {/* Warning if selecting unconnected platforms */}
              {selectedPlatforms.some(platformId => !connectedPlatforms[platformId]) && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-300">
                    ⚠️ Some selected platforms are not connected. Please connect them in{' '}
                    <Link href="/dashboard/connections" className="underline font-medium">
                      Settings → Connections
                    </Link>{' '}
                    before posting.
                  </p>
                </div>
              )}
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
                      {Object.entries(analysisResult.price_recommendations.price_recommendations || {}).map(([strategy, data]: [string, { price: number; description?: string; estimated_days_to_sell?: number }]) => (
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
          
          {/* Mobile-friendly back button */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3 sm:hidden">
            <button
              onClick={onClose}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              ← Back to Dashboard
            </button>
          </div>
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