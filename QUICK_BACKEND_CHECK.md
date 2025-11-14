# 🚀 Quick Backend Health Check

## ⚡ **One-Command Health Check**
```bash
/Users/prestoneaton/QuickFlip_MVP/Accorria/scripts/health_check.sh
```

## 🔧 **Quick Fixes**

### **If Backend is Down:**
```bash
# Check status
gcloud run services describe accorria-backend --region us-central1 --format="value(status.conditions[0].status,status.conditions[0].type)"

# Check logs
gcloud run services logs read accorria-backend --region us-central1 --limit=5

# Redeploy
cd /Users/prestoneaton/QuickFlip_MVP/Accorria/backend
gcloud run deploy accorria-backend --source . --region us-central1 --platform managed --allow-unauthenticated --timeout=300
```

### **If Import Errors:**
```bash
# Test locally first
cd /Users/prestoneaton/QuickFlip_MVP/Accorria/backend
python3 -c "from app.main import app; print('✅ App imports successfully')"

# If fails, check the troubleshooting guide
cat /Users/prestoneaton/QuickFlip_MVP/Accorria/BACKEND_DEPLOYMENT_TROUBLESHOOTING.md
```

## 📊 **Service Info**
- **URL**: https://accorria-backend-19949436301.us-central1.run.app
- **Health**: https://accorria-backend-19949436301.us-central1.run.app/health
- **Docs**: https://accorria-backend-19949436301.us-central1.run.app/docs
- **Region**: us-central1

## 🚨 **Emergency Contacts**
- **Troubleshooting Guide**: `/Users/prestoneaton/QuickFlip_MVP/Accorria/BACKEND_DEPLOYMENT_TROUBLESHOOTING.md`
- **Health Check Script**: `/Users/prestoneaton/QuickFlip_MVP/Accorria/scripts/health_check.sh`
