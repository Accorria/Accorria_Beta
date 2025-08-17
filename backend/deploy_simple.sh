#!/bin/bash

# Simple QuickFlip AI Backend Deployment
# For immediate mobile demo testing

echo "🚀 Deploying QuickFlip AI Backend (Simple Demo Version)..."

# Deploy to Cloud Run with minimal configuration
gcloud run deploy quickflip-ai-backend \
    --source . \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300 \
    --quiet

echo "✅ Simple deployment complete!"
echo "🌐 Test your mobile app now!"
