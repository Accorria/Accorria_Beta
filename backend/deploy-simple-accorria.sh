#!/bin/bash

# Simple Accorria Backend Deployment
# No interactive prompts - direct deployment

echo "🚀 ACCORRIA BACKEND - SIMPLE DEPLOYMENT"
echo "========================================"

# Set project
PROJECT_ID="accorria-beta"
REGION="us-central1"
SERVICE_NAME="accorria-backend"

echo "📦 Deploying to project: $PROJECT_ID"
echo "🌍 Region: $REGION"
echo "🔧 Service: $SERVICE_NAME"

# Deploy to Cloud Run
gcloud run deploy $SERVICE_NAME \
    --source . \
    --platform managed \
    --region $REGION \
    --project $PROJECT_ID \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --timeout 300 \
    --concurrency 100 \
    --max-instances 50 \
    --min-instances 1 \
    --port 8000 \
    --quiet

echo "✅ Deployment complete!"
echo "🌐 Service URL: https://$SERVICE_NAME-$(gcloud config get-value project).$REGION.run.app"
echo "📊 Monitor: https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME?project=$PROJECT_ID"
