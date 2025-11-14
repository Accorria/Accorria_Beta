# QuickFlip AI - Cloud Run Deployment Guide

## 🚀 Production Deployment to Google Cloud Run

This guide walks you through deploying the QuickFlip AI backend to Google Cloud Run with real APIs and production configuration.

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **Google Cloud SDK** installed locally
3. **Docker** installed (for local testing)
4. **API Keys** ready:
   - OpenAI API Key
   - Google Cloud Project with Vision API enabled
   - Platform credentials (Facebook, Craigslist, etc.)

## Quick Start

### 1. Setup Google Cloud Authentication

```bash
./setup-gcloud.sh
```

This script will:
- Authenticate with Google Cloud
- Set up your project
- Enable required APIs
- Create service accounts
- Generate credentials

### 2. Deploy to Cloud Run

```bash
./deploy-cloud-run.sh YOUR_PROJECT_ID
```

### 3. Configure Environment Variables

```bash
./configure-env-vars.sh YOUR_PROJECT_ID
```

### 4. Update Frontend Configuration

Update `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=https://your-service-url.run.app
```

## Detailed Steps

### Step 1: Google Cloud Setup

1. **Install Google Cloud SDK** (if not already installed):
   ```bash
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   ```

2. **Run setup script**:
   ```bash
   ./setup-gcloud.sh
   ```

3. **Verify authentication**:
   ```bash
   gcloud auth list
   gcloud config get-value project
   ```

### Step 2: Backend Deployment

1. **Build and deploy**:
   ```bash
   ./deploy-cloud-run.sh YOUR_PROJECT_ID
   ```

2. **The deployment script will**:
   - Build Docker image using `Dockerfile.production`
   - Push to Google Container Registry
   - Deploy to Cloud Run with optimized settings
   - Configure basic environment variables

### Step 3: Environment Configuration

1. **Set production environment variables**:
   ```bash
   ./configure-env-vars.sh YOUR_PROJECT_ID
   ```

2. **Required variables**:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `DATABASE_URL`: PostgreSQL connection string
   - `SECRET_KEY`: JWT secret key
   - `GOOGLE_CLOUD_PROJECT`: Your GCP project ID

3. **Optional variables**:
   - `FACEBOOK_ACCESS_TOKEN`: For Facebook Marketplace
   - `CRAIGSLIST_EMAIL/PASSWORD`: For Craigslist automation
   - `TWILIO_*`: For SMS notifications
   - `SENDGRID_API_KEY`: For email notifications

### Step 4: Database Setup

For production, you'll need a managed PostgreSQL database:

1. **Option A: Google Cloud SQL**:
   ```bash
   gcloud sql instances create quickflip-db \
       --database-version=POSTGRES_14 \
       --tier=db-f1-micro \
       --region=us-central1
   ```

2. **Option B: External PostgreSQL** (Supabase, AWS RDS, etc.)

3. **Update DATABASE_URL** in environment variables

### Step 5: Frontend Configuration

1. **Get Cloud Run URL**:
   ```bash
   gcloud run services describe quickflip-ai-backend \
       --region us-central1 \
       --format 'value(status.url)'
   ```

2. **Update frontend/.env.local**:
   ```env
   NEXT_PUBLIC_API_URL=https://your-service-url.run.app
   NEXT_PUBLIC_ENABLE_AI_FEATURES=true
   NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
   ```

3. **Deploy frontend** to Vercel, Netlify, or your preferred platform

## Testing the Deployment

### Health Check
```bash
curl https://your-service-url.run.app/health
```

### API Test
```bash
curl -X POST https://your-service-url.run.app/api/v1/user/log_action \
  -H "Content-Type: application/json" \
  -d '{"action": "test", "details": "production test"}'
```

### Image Analysis Test
```bash
curl -X POST https://your-service-url.run.app/api/v1/car-analysis/analyze-images \
  -F "images=@test-car-image.jpg" \
  -F "location=Detroit, MI" \
  -F "target_profit=2000"
```

## Monitoring and Logs

### View Logs
```bash
gcloud run services logs tail quickflip-ai-backend --region us-central1
```

### Monitor Performance
- Visit Google Cloud Console → Cloud Run → quickflip-ai-backend
- Check metrics, logs, and resource usage

## Scaling Configuration

The deployment includes:
- **Memory**: 1GB (adjustable)
- **CPU**: 1 vCPU (adjustable)
- **Min instances**: 0 (scales to zero)
- **Max instances**: 3 (prevents runaway costs)
- **Concurrency**: 80 requests per instance

### Adjust scaling:
```bash
gcloud run services update quickflip-ai-backend \
    --region us-central1 \
    --memory 2Gi \
    --cpu 2 \
    --max-instances 5
```

## Security Best Practices

1. **Environment Variables**: Never commit secrets to code
2. **Service Account**: Uses least-privilege IAM roles
3. **HTTPS Only**: All traffic encrypted
4. **Authentication**: Consider adding API authentication for production

## Cost Optimization

- **Free Tier**: 2 million requests/month free
- **Pay-per-use**: Only pay when processing requests
- **Auto-scaling**: Scales to zero when not in use
- **Resource limits**: Prevents unexpected costs

## Troubleshooting

### Common Issues

1. **Authentication errors**:
   ```bash
   gcloud auth application-default login
   ```

2. **Permission denied**:
   ```bash
   gcloud projects add-iam-policy-binding PROJECT_ID \
       --member="user:your-email@gmail.com" \
       --role="roles/run.admin"
   ```

3. **Build failures**: Check Dockerfile.production and requirements.txt

4. **Runtime errors**: Check Cloud Run logs

### Support Commands

```bash
# View service details
gcloud run services describe quickflip-ai-backend --region us-central1

# Update environment variables
gcloud run services update quickflip-ai-backend \
    --region us-central1 \
    --set-env-vars="KEY=VALUE"

# View recent logs
gcloud run services logs read quickflip-ai-backend --region us-central1 --limit 50
```

## Next Steps

1. **Set up monitoring** with Google Cloud Monitoring
2. **Configure custom domain** for your API
3. **Set up CI/CD pipeline** for automated deployments
4. **Add API authentication** for production security
5. **Set up database backups** and disaster recovery

---

🎯 **Goal Achieved**: QuickFlip AI backend running on Google Cloud Run with real AI APIs, ready for live testing and production use! 