#!/bin/bash

# Accorria - Cloud Run Deployment Script
# Usage: ./deploy-cloud-run.sh [PROJECT_ID]

set -e

# Configuration
PROJECT_ID=${1:-"your-project-id"}
SERVICE_NAME="accorria-backend"
REGION="us-central1"
IMAGE_NAME="gcr.io/$PROJECT_ID/$SERVICE_NAME"

echo "🚀 Deploying Accorria Backend to Cloud Run"
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo "Region: $REGION"
echo ""

# Check if gcloud is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated with gcloud. Please run:"
    echo "   gcloud auth login"
    echo "   gcloud auth application-default login"
    exit 1
fi

# Set the project
echo "📋 Setting project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable vision.googleapis.com

# Build the container image
echo "🏗️  Building container image..."
cd backend
gcloud builds submit --tag $IMAGE_NAME .

# Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_NAME \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8000 \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 3 \
    --timeout 300 \
    --concurrency 80 \
    --set-env-vars="PYTHONPATH=/app" \
    --quiet

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format 'value(status.url)')

echo ""
echo "✅ Deployment successful!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "📝 Next steps:"
echo "1. Update your frontend .env.local with: NEXT_PUBLIC_API_URL=$SERVICE_URL"
echo "2. Set environment variables in Cloud Run console:"
echo "   - DATABASE_URL"
echo "   - OPENAI_API_KEY"
echo "   - GOOGLE_CLOUD_PROJECT"
echo "   - SECRET_KEY"
echo "3. Test the deployment: curl $SERVICE_URL/health"
echo ""
echo "🔧 To set environment variables:"
echo "   gcloud run services update $SERVICE_NAME --region $REGION --set-env-vars='KEY=VALUE'" 