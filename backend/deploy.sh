#!/bin/bash

# QuickFlip AI Backend Deployment Script
# Complete Firebase → Supabase Migration

echo "🚀 Deploying QuickFlip AI Backend (Supabase-only)..."

# Set variables
PROJECT_ID="quickflip-ai-backend"
REGION="us-central1"
SERVICE_NAME="quickflip-ai-backend"

echo "📦 Building and deploying to Google Cloud Run..."

# Deploy to Cloud Run
echo "🔧 Deploying to project: quickflip-ai"
echo "🔧 Service: $SERVICE_NAME"
echo "🔧 Region: $REGION"

gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --project quickflip-ai \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --timeout 300 \
    --concurrency 80 \
    --max-instances 10 \
    --set-env-vars "SUPABASE_URL=$SUPABASE_URL,SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY" \
    --quiet

echo "✅ Deployment complete!"
echo "🌐 Service URL: https://$SERVICE_NAME-$(gcloud config get-value project).$REGION.run.app"
echo "📊 Health check: https://$SERVICE_NAME-$(gcloud config get-value project).$REGION.run.app/health"
