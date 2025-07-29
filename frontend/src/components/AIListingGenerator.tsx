'use client';

import React, { useState, useRef } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Paper
} from '@mui/material';
import { 
  CloudUpload, 
  PhotoCamera, 
  Delete, 
  ExpandMore,
  ContentCopy,
  CheckCircle,
  Error
} from '@mui/icons-material';

interface CarDetails {
  make?: string;
  model?: string;
  year?: number;
  mileage?: string;
  description?: string;
  location: string;
  title_status: string;
  additional_details?: string;
}

interface ListingResult {
  success: boolean;
  timestamp: string;
  image_analysis: any;
  market_analysis: any;
  pricing_recommendations: any;
  formatted_listings: any;
  processing_time: number;
  error_message?: string;
}

const AIListingGenerator: React.FC = () => {
  const [images, setImages] = useState<File[]>([]);
  const [carDetails, setCarDetails] = useState<CarDetails>({
    location: 'Detroit, MI',
    title_status: 'clean'
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ListingResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (images.length + imageFiles.length > 20) {
      setError('Maximum 20 images allowed');
      return;
    }
    
    setImages(prev => [...prev, ...imageFiles]);
    setError(null);
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCarDetailsChange = (field: keyof CarDetails, value: string | number) => {
    setCarDetails(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateListing = async () => {
    if (images.length === 0) {
      setError('Please upload at least one image');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      
      // Add images
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      // Add car details
      Object.entries(carDetails).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch('/api/v1/car-listing/generate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to generate listing');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyListing = async (platform: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPlatform(platform);
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const getImagePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        🚗 AI Car Listing Generator
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Upload car photos and get AI-generated listings for multiple platforms
      </Typography>

      {/* Image Upload Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📸 Upload Car Photos
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUpload />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mr: 2 }}
            >
              Upload Images
            </Button>
            <Typography variant="caption" color="text.secondary">
              Upload up to 20 car images (max 10MB each)
            </Typography>
          </Box>

          {/* Image Previews */}
          {images.length > 0 && (
            <Grid container spacing={2}>
              {images.map((image, index) => (
                <Grid item xs={6} sm={4} md={3} key={index}>
                  <Paper
                    sx={{
                      position: 'relative',
                      height: 150,
                      backgroundImage: `url(${getImagePreview(image)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      borderRadius: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.7)',
                        },
                      }}
                      onClick={() => handleRemoveImage(index)}
                    >
                      <Delete />
                    </IconButton>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Car Details Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚙 Car Details
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Make"
                value={carDetails.make || ''}
                onChange={(e) => handleCarDetailsChange('make', e.target.value)}
                placeholder="e.g., Toyota, Honda"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Model"
                value={carDetails.model || ''}
                onChange={(e) => handleCarDetailsChange('model', e.target.value)}
                placeholder="e.g., Camry, Civic"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={carDetails.year || ''}
                onChange={(e) => handleCarDetailsChange('year', parseInt(e.target.value) || 0)}
                placeholder="e.g., 2018"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mileage"
                value={carDetails.mileage || ''}
                onChange={(e) => handleCarDetailsChange('mileage', e.target.value)}
                placeholder="e.g., 45,000"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={carDetails.location}
                onChange={(e) => handleCarDetailsChange('location', e.target.value)}
                placeholder="e.g., Detroit, MI"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Title Status"
                value={carDetails.title_status}
                onChange={(e) => handleCarDetailsChange('title_status', e.target.value)}
                placeholder="clean, rebuilt, salvage"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={carDetails.description || ''}
                onChange={(e) => handleCarDetailsChange('description', e.target.value)}
                placeholder="Additional details about the car..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handleGenerateListing}
          disabled={isGenerating || images.length === 0}
          startIcon={isGenerating ? <CircularProgress size={20} /> : <PhotoCamera />}
          sx={{ minWidth: 200 }}
        >
          {isGenerating ? 'Generating Listing...' : 'Generate AI Listing'}
        </Button>
      </Box>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results Section */}
      {result && (
        <Box>
          <Typography variant="h5" gutterBottom>
            ✨ AI Analysis Results
          </Typography>

          {/* Image Analysis */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">🔍 Image Analysis</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Vehicle Details:</Typography>
                  <Typography>Make: {result.image_analysis.make || 'Unknown'}</Typography>
                  <Typography>Model: {result.image_analysis.model || 'Unknown'}</Typography>
                  <Typography>Year: {result.image_analysis.year || 'Unknown'}</Typography>
                  <Typography>Color: {result.image_analysis.color || 'Unknown'}</Typography>
                  <Typography>Condition: {result.image_analysis.condition || 'Unknown'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Features:</Typography>
                  {result.image_analysis.features?.map((feature: string, index: number) => (
                    <Chip key={index} label={feature} size="small" sx={{ mr: 1, mb: 1 }} />
                  ))}
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Market Analysis */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">📊 Market Analysis</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Market Value Range:</Typography>
                  <Typography>
                    ${result.market_analysis.market_value_range?.low?.toLocaleString()} - 
                    ${result.market_analysis.market_value_range?.high?.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle1">Pricing Strategy:</Typography>
                  <Typography>{result.market_analysis.pricing_strategy}</Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Pricing Recommendations */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">💰 Pricing Recommendations</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1">Recommended Price:</Typography>
                  <Typography variant="h5" color="primary">
                    ${result.pricing_recommendations.recommended_price?.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1">Listing Price:</Typography>
                  <Typography variant="h5" color="success.main">
                    ${result.pricing_recommendations.listing_price?.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="subtitle1">Negotiation Room:</Typography>
                  <Typography variant="h5" color="warning.main">
                    {result.pricing_recommendations.negotiation_room}%
                  </Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Formatted Listings */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="h6">📝 Ready-to-Use Listings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {Object.entries(result.formatted_listings).map(([platform, content]) => (
                  <Grid item xs={12} key={platform}>
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                            {platform.replace('_', ' ')}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={copiedPlatform === platform ? <CheckCircle /> : <ContentCopy />}
                            onClick={() => handleCopyListing(platform, content as string)}
                            color={copiedPlatform === platform ? 'success' : 'primary'}
                          >
                            {copiedPlatform === platform ? 'Copied!' : 'Copy'}
                          </Button>
                        </Box>
                        <Paper
                          sx={{
                            p: 2,
                            backgroundColor: '#f5f5f5',
                            fontFamily: 'monospace',
                            whiteSpace: 'pre-wrap',
                            fontSize: '0.875rem',
                            maxHeight: 300,
                            overflow: 'auto'
                          }}
                        >
                          {content as string}
                        </Paper>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Box>
  );
};

export default AIListingGenerator; 