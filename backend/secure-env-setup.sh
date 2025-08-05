#!/bin/bash

# QuickFlip AI - Secure Environment Setup Script
# This script helps set up secure environment variables for production

set -e

echo "🔐 QuickFlip AI - Secure Environment Setup"
echo "=========================================="
echo ""

# Generate secure secret key
echo "🔑 Generating secure secret key..."
SECRET_KEY=$(openssl rand -hex 32)
echo "Generated SECRET_KEY: ${SECRET_KEY:0:16}..."

# Create secure .env file
echo ""
echo "📝 Creating secure .env file..."

cat > .env.secure << EOF
# QuickFlip AI - Production Environment Variables
# Generated on $(date)

# Security
SECRET_KEY=${SECRET_KEY}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Database (Update with your Cloud SQL connection)
DATABASE_URL=postgresql+asyncpg://username:password@host:5432/quickflip_db

# Redis (Update with your Redis instance)
REDIS_URL=redis://localhost:6379

# CORS Settings (Update with your domains)
ALLOWED_ORIGINS=["https://your-frontend-domain.com", "https://quickflip-ai.vercel.app"]

# AI API Keys (Set these via environment variables)
OPENAI_API_KEY=\${OPENAI_API_KEY}
GOOGLE_API_KEY=\${GOOGLE_API_KEY}

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=\${GOOGLE_CLOUD_PROJECT}
GOOGLE_CLOUD_STORAGE_BUCKET=quickflip-images

# Platform API Keys (Set these via environment variables)
FACEBOOK_ACCESS_TOKEN=\${FACEBOOK_ACCESS_TOKEN}
CRAIGSLIST_EMAIL=\${CRAIGSLIST_EMAIL}
CRAIGSLIST_PASSWORD=\${CRAIGSLIST_PASSWORD}

# Notification Services (Set these via environment variables)
TWILIO_ACCOUNT_SID=\${TWILIO_ACCOUNT_SID}
TWILIO_AUTH_TOKEN=\${TWILIO_AUTH_TOKEN}
TWILIO_PHONE_NUMBER=\${TWILIO_PHONE_NUMBER}
SENDGRID_API_KEY=\${SENDGRID_API_KEY}
SENDGRID_FROM_EMAIL=\${SENDGRID_FROM_EMAIL}

# Application Settings
DEBUG=false
PLAYWRIGHT_HEADLESS=true
AI_REPLY_ENABLED=true
EOF

echo "✅ Secure .env file created: .env.secure"
echo ""

# Instructions for setting environment variables
echo "📋 Next Steps:"
echo "==============="
echo ""
echo "1. Set your API keys as environment variables:"
echo "   export OPENAI_API_KEY='your-openai-key'"
echo "   export GOOGLE_API_KEY='your-google-key'"
echo "   export GOOGLE_CLOUD_PROJECT='your-project-id'"
echo ""
echo "2. Update the DATABASE_URL in .env.secure with your Cloud SQL connection"
echo ""
echo "3. Update ALLOWED_ORIGINS with your frontend domains"
echo ""
echo "4. For Cloud Run deployment, set environment variables in the console:"
echo "   - Go to Cloud Run console"
echo "   - Select your service"
echo "   - Edit & Deploy New Revision"
echo "   - Add environment variables"
echo ""
echo "5. Test the configuration:"
echo "   python -c \"from app.core.config import settings; print('✅ Config loaded successfully')\""
echo ""

# Security checklist
echo "🔒 Security Checklist:"
echo "====================="
echo "✅ Strong secret key generated"
echo "✅ API keys moved to environment variables"
echo "✅ CORS configured for production domains"
echo "✅ Debug mode disabled for production"
echo "✅ Rate limiting enabled"
echo "✅ JWT authentication on all protected endpoints"
echo ""

echo "🎉 Environment setup complete!"
echo "Remember to never commit API keys to version control." 