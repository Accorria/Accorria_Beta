#!/bin/bash

# QuickFlip AI - Fix GCR Permissions Script
# This script creates the Docker repository and fixes permission issues

set -e

# Configuration
PROJECT_ID=${1:-"quickflip-ai"}
REPOSITORY_NAME="quickflip-ai-backend"
REGION="us-central1"

echo "🔧 Fixing GCR Permissions for QuickFlip AI Backend"
echo "Project: $PROJECT_ID"
echo "Repository: $REPOSITORY_NAME"
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
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable vision.googleapis.com

# Create the Docker repository
echo "🏗️  Creating Docker repository..."
gcloud artifacts repositories create $REPOSITORY_NAME \
    --repository-format=docker \
    --location=$REGION \
    --description="QuickFlip AI Backend Docker Repository" \
    --quiet

# Grant Cloud Build service account permission to push to the repository
echo "🔐 Setting up permissions..."
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
CLOUD_BUILD_SA="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud artifacts repositories add-iam-policy-binding $REPOSITORY_NAME \
    --location=$REGION \
    --member="serviceAccount:${CLOUD_BUILD_SA}" \
    --role="roles/artifactregistry.writer"

# Also grant the default compute service account
COMPUTE_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"
gcloud artifacts repositories add-iam-policy-binding $REPOSITORY_NAME \
    --location=$REGION \
    --member="serviceAccount:${COMPUTE_SA}" \
    --role="roles/artifactregistry.reader"

echo ""
echo "✅ Repository created and permissions set!"
echo ""
echo "🚀 Now you can deploy using:"
echo "   ./deploy-cloud-run.sh $PROJECT_ID"
echo ""
echo "📝 Or manually with:"
echo "   gcloud builds submit --config cloudbuild.yaml"
echo ""
echo "🔍 To verify the repository:"
echo "   gcloud artifacts repositories list --location=$REGION" 