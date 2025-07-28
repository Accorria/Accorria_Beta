#!/bin/bash

# QuickFlip AI - Google Cloud Setup Script
# Sets up authentication and project configuration for deployment

set -e

echo "🔧 QuickFlip AI - Google Cloud Setup"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud SDK not found. Please install it first:"
    echo "   curl https://sdk.cloud.google.com | bash"
    echo "   exec -l $SHELL"
    exit 1
fi

# Authenticate with Google Cloud
echo "🔐 Authenticating with Google Cloud..."
gcloud auth login

# Set up application default credentials for local development
echo "🔑 Setting up application default credentials..."
gcloud auth application-default login

# List available projects
echo ""
echo "📋 Available projects:"
gcloud projects list --format="table(projectId,name,projectNumber)"

echo ""
read -p "Enter your Google Cloud Project ID: " PROJECT_ID

# Set the project
gcloud config set project $PROJECT_ID

# Enable required APIs
echo ""
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable vision.googleapis.com
gcloud services enable sqladmin.googleapis.com

# Create a service account for the application
echo ""
echo "👤 Creating service account..."
SERVICE_ACCOUNT_NAME="quickflip-ai-service"
SERVICE_ACCOUNT_EMAIL="$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"

gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name="QuickFlip AI Service Account" \
    --description="Service account for QuickFlip AI application" || echo "Service account already exists"

# Grant necessary permissions
echo "🔐 Granting permissions..."
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/vision.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/cloudsql.client"

# Create and download service account key
echo "🔑 Creating service account key..."
mkdir -p credentials
gcloud iam service-accounts keys create credentials/quickflip-service-account.json \
    --iam-account=$SERVICE_ACCOUNT_EMAIL

echo ""
echo "✅ Google Cloud setup complete!"
echo ""
echo "📝 Configuration summary:"
echo "   Project ID: $PROJECT_ID"
echo "   Service Account: $SERVICE_ACCOUNT_EMAIL"
echo "   Key file: credentials/quickflip-service-account.json"
echo ""
echo "🚀 Ready to deploy! Run:"
echo "   ./deploy-cloud-run.sh $PROJECT_ID" 