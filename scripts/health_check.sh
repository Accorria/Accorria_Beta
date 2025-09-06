#!/bin/bash
# Accorria Backend Health Check Script
# Run this anytime to check if the backend is working

echo "🔍 Checking Accorria Backend Health..."
echo "=================================="

# Check service status
echo "📊 Checking service status..."
STATUS=$(gcloud run services describe accorria-backend --region us-central1 --format="value(status.conditions[0].status)" 2>/dev/null)

if [ "$STATUS" = "True" ]; then
    echo "✅ Service Status: Ready"
    
    # Test health endpoint
    echo "🏥 Testing health endpoint..."
    if curl -f -s https://accorria-backend-19949436301.us-central1.run.app/health > /dev/null; then
        echo "✅ Health Endpoint: Working"
        # Show health response
        echo "📋 Health Response:"
        curl -s https://accorria-backend-19949436301.us-central1.run.app/health | python3 -m json.tool
    else
        echo "❌ Health Endpoint: Failed"
        exit 1
    fi
    
    # Test basic endpoint
    echo "🧪 Testing test endpoint..."
    if curl -f -s https://accorria-backend-19949436301.us-central1.run.app/test > /dev/null; then
        echo "✅ Test Endpoint: Working"
        # Show test response
        echo "📋 Test Response:"
        curl -s https://accorria-backend-19949436301.us-central1.run.app/test | python3 -m json.tool
    else
        echo "❌ Test Endpoint: Failed"
        exit 1
    fi
    
    # Test docs endpoint
    echo "📚 Testing docs endpoint..."
    if curl -f -s https://accorria-backend-19949436301.us-central1.run.app/docs > /dev/null; then
        echo "✅ Docs Endpoint: Working"
    else
        echo "❌ Docs Endpoint: Failed"
    fi
    
    echo ""
    echo "🎉 Backend is fully operational!"
    echo "🌐 Service URL: https://accorria-backend-19949436301.us-central1.run.app"
    echo "📖 API Docs: https://accorria-backend-19949436301.us-central1.run.app/docs"
    
else
    echo "❌ Service Status: Not Ready"
    echo ""
    echo "📋 Recent logs:"
    gcloud run services logs read accorria-backend --region us-central1 --limit=5
    echo ""
    echo "🔧 Run the troubleshooting guide:"
    echo "   cat /Users/prestoneaton/QuickFlip_MVP/Accorria/BACKEND_DEPLOYMENT_TROUBLESHOOTING.md"
    exit 1
fi
