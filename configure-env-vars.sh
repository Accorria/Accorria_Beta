#!/bin/bash

# QuickFlip AI - Environment Variables Configuration Script
# Helps set up environment variables for Cloud Run deployment

set -e

PROJECT_ID=${1:-"your-project-id"}
SERVICE_NAME="quickflip-ai-backend"
REGION="us-central1"

echo "🔧 Configuring Environment Variables for QuickFlip AI"
echo "Project: $PROJECT_ID"
echo "Service: $SERVICE_NAME"
echo ""

# Check if service exists
if ! gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT_ID &> /dev/null; then
    echo "❌ Service $SERVICE_NAME not found. Please deploy first with:"
    echo "   ./deploy-cloud-run.sh $PROJECT_ID"
    exit 1
fi

echo "📝 Setting up environment variables..."
echo "Please provide the following values (press Enter to skip):"
echo ""

# Collect environment variables
read -p "OpenAI API Key: " OPENAI_API_KEY
read -p "Google Cloud Project ID [$PROJECT_ID]: " GOOGLE_CLOUD_PROJECT
GOOGLE_CLOUD_PROJECT=${GOOGLE_CLOUD_PROJECT:-$PROJECT_ID}
read -p "Database URL (PostgreSQL): " DATABASE_URL
read -p "Secret Key (for JWT): " SECRET_KEY
read -p "Facebook Access Token: " FACEBOOK_ACCESS_TOKEN
read -p "Craigslist Email: " CRAIGSLIST_EMAIL
read -s -p "Craigslist Password: " CRAIGSLIST_PASSWORD
echo ""
read -p "Twilio Account SID: " TWILIO_ACCOUNT_SID
read -p "Twilio Auth Token: " TWILIO_AUTH_TOKEN
read -p "SendGrid API Key: " SENDGRID_API_KEY

# Build environment variables string
ENV_VARS="PORT=8000,PYTHONPATH=/app,DEBUG=false,PLAYWRIGHT_HEADLESS=true"

if [ ! -z "$OPENAI_API_KEY" ]; then
    ENV_VARS="$ENV_VARS,OPENAI_API_KEY=$OPENAI_API_KEY"
fi

if [ ! -z "$GOOGLE_CLOUD_PROJECT" ]; then
    ENV_VARS="$ENV_VARS,GOOGLE_CLOUD_PROJECT=$GOOGLE_CLOUD_PROJECT"
fi

if [ ! -z "$DATABASE_URL" ]; then
    ENV_VARS="$ENV_VARS,DATABASE_URL=$DATABASE_URL"
fi

if [ ! -z "$SECRET_KEY" ]; then
    ENV_VARS="$ENV_VARS,SECRET_KEY=$SECRET_KEY"
fi

if [ ! -z "$FACEBOOK_ACCESS_TOKEN" ]; then
    ENV_VARS="$ENV_VARS,FACEBOOK_ACCESS_TOKEN=$FACEBOOK_ACCESS_TOKEN"
fi

if [ ! -z "$CRAIGSLIST_EMAIL" ]; then
    ENV_VARS="$ENV_VARS,CRAIGSLIST_EMAIL=$CRAIGSLIST_EMAIL"
fi

if [ ! -z "$CRAIGSLIST_PASSWORD" ]; then
    ENV_VARS="$ENV_VARS,CRAIGSLIST_PASSWORD=$CRAIGSLIST_PASSWORD"
fi

if [ ! -z "$TWILIO_ACCOUNT_SID" ]; then
    ENV_VARS="$ENV_VARS,TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID"
fi

if [ ! -z "$TWILIO_AUTH_TOKEN" ]; then
    ENV_VARS="$ENV_VARS,TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN"
fi

if [ ! -z "$SENDGRID_API_KEY" ]; then
    ENV_VARS="$ENV_VARS,SENDGRID_API_KEY=$SENDGRID_API_KEY"
fi

# Update the service with environment variables
echo ""
echo "🚀 Updating Cloud Run service with environment variables..."
gcloud run services update $SERVICE_NAME \
    --region $REGION \
    --project $PROJECT_ID \
    --set-env-vars="$ENV_VARS" \
    --quiet

# Get service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --project $PROJECT_ID --format 'value(status.url)')

echo ""
echo "✅ Environment variables configured successfully!"
echo "🌐 Service URL: $SERVICE_URL"
echo ""
echo "📝 Next steps:"
echo "1. Test the service: curl $SERVICE_URL/health"
echo "2. Update frontend .env.local with: NEXT_PUBLIC_API_URL=$SERVICE_URL"
echo "3. Deploy frontend to Vercel or your hosting platform" 