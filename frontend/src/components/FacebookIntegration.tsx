'use client';

import React, { useState, useEffect } from 'react';
import FacebookLogin from 'react-facebook-login';
import { 
  Box, 
  Button, 
  Typography, 
  Card, 
  CardContent, 
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  Facebook as FacebookIcon,
  CheckCircle,
  Error,
  Share
} from '@mui/icons-material';

interface FacebookIntegrationProps {
  listingContent?: {
    title: string;
    description: string;
    price: number;
    images?: string[];
  };
  onPostSuccess?: (postId: string) => void;
  onPostError?: (error: string) => void;
}

const FacebookIntegration: React.FC<FacebookIntegrationProps> = ({
  listingContent,
  onPostSuccess,
  onPostError
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postStatus, setPostStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Facebook App ID - You'll need to create a Facebook App
  const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'your-facebook-app-id';

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('facebook_access_token');
    if (savedToken) {
      setAccessToken(savedToken);
      setIsConnected(true);
    }
  }, []);

  const handleFacebookLogin = (response: any) => {
    if (response.accessToken) {
      setAccessToken(response.accessToken);
      setIsConnected(true);
      localStorage.setItem('facebook_access_token', response.accessToken);
      console.log('Facebook login successful:', response);
    } else {
      console.log('Facebook login failed:', response);
    }
  };

  const handleFacebookLogout = () => {
    setAccessToken(null);
    setIsConnected(false);
    localStorage.removeItem('facebook_access_token');
    setPostStatus('idle');
    setErrorMessage('');
  };

  const postToFacebookMarketplace = async () => {
    if (!listingContent || !accessToken) {
      setErrorMessage('Please connect Facebook and generate a listing first');
      setPostStatus('error');
      return;
    }

    setIsPosting(true);
    setPostStatus('idle');
    setErrorMessage('');

    try {
      // For now, we'll simulate posting and provide instructions
      // In production, you'd use Facebook Graph API
      
      const postData = {
        title: listingContent.title,
        description: listingContent.description,
        price: listingContent.price,
        accessToken: accessToken
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For demo purposes, we'll show success
      // In real implementation, you'd call Facebook Graph API
      setPostStatus('success');
      onPostSuccess?.('demo-post-id');
      
      console.log('Posting to Facebook:', postData);
      
    } catch (error) {
      console.error('Error posting to Facebook:', error);
      setErrorMessage('Failed to post to Facebook. Please try again.');
      setPostStatus('error');
      onPostError?.(errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  const openFacebookMarketplace = () => {
    // Open Facebook Marketplace in new tab
    window.open('https://www.facebook.com/marketplace/create/vehicle', '_blank');
  };

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <FacebookIcon sx={{ mr: 1, color: '#1877F2' }} />
          Facebook Integration
        </Typography>

        {!isConnected ? (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Connect your Facebook account to post listings directly to Facebook Marketplace
            </Typography>
            
            <FacebookLogin
              appId={FACEBOOK_APP_ID}
              autoLoad={false}
              fields="name,email,picture"
              scope="public_profile,email,publish_actions"
              callback={handleFacebookLogin}
              cssClass="facebook-login-button"
              textButton="Connect Facebook Account"
              icon={<FacebookIcon />}
            />
            
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              We'll only post to your Facebook Marketplace with your permission
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircle color="success" sx={{ mr: 1 }} />
              <Typography variant="body2" color="success.main">
                Facebook Connected
              </Typography>
              <Button 
                size="small" 
                onClick={handleFacebookLogout}
                sx={{ ml: 'auto' }}
              >
                Disconnect
              </Button>
            </Box>

            {listingContent ? (
              <Box>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Ready to post your listing to Facebook Marketplace
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Listing Preview:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {listingContent.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${listingContent.price.toLocaleString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={isPosting ? <CircularProgress size={16} /> : <Share />}
                    onClick={postToFacebookMarketplace}
                    disabled={isPosting}
                    sx={{ 
                      bgcolor: '#1877F2',
                      '&:hover': { bgcolor: '#166FE5' }
                    }}
                  >
                    {isPosting ? 'Posting...' : 'Post to Facebook'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={openFacebookMarketplace}
                  >
                    Open Facebook Marketplace
                  </Button>
                </Box>

                {postStatus === 'success' && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Successfully posted to Facebook Marketplace!
                  </Alert>
                )}

                {postStatus === 'error' && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errorMessage || 'Failed to post to Facebook'}
                  </Alert>
                )}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Generate a listing first to post to Facebook
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default FacebookIntegration;
