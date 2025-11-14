# 🚀 Accorria Backend Deployment Troubleshooting Guide

## 📋 **Quick Health Check Commands**

Run these commands to quickly diagnose backend issues:

```bash
# Check service status
gcloud run services describe accorria-backend --region us-central1 --format="value(status.conditions[0].status,status.conditions[0].type)"

# Check recent logs
gcloud run services logs read accorria-backend --region us-central1 --limit=10

# Test health endpoint
curl -f https://accorria-backend-19949436301.us-central1.run.app/health

# Test basic endpoint
curl -f https://accorria-backend-19949436301.us-central1.run.app/test
```

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Container failed to start" - Module Import Errors**

**Symptoms:**
- Error: `ModuleNotFoundError: No module named 'app.api.v1.xxx'`
- Service shows `Ready: False`
- No traffic routing to revision

**Root Cause:**
- Missing or broken imports in `app/api/v1/__init__.py`
- Files exist locally but not in Docker container
- Import dependencies causing circular imports

**Solution:**
1. **Check imports locally first:**
   ```bash
   cd /Users/prestoneaton/QuickFlip_MVP/Accorria/backend
   python3 -c "from app.main import app; print('✅ App imports successfully')"
   ```

2. **If import fails, check the problematic module:**
   ```bash
   python3 -c "from app.api.v1.xxx import router; print('✅ Module imports successfully')"
   ```

3. **Fix the import in `app/api/v1/__init__.py`:**
   ```python
   # Comment out problematic imports temporarily
   # from .problematic_module import router as problematic_router
   ```

4. **Update `app/main.py` to remove the import:**
   ```python
   from app.api.v1 import (
       auth as auth_router,
       user as user_router,
       analytics
       # Remove problematic imports
   )
   ```

5. **Remove router registration:**
   ```python
   # Comment out problematic router registrations
   # app.include_router(problematic_router, prefix="/api/v1", tags=["Problematic"])
   ```

---

### **Issue 2: "Container failed to start" - Port Configuration**

**Symptoms:**
- Error: "failed to start and listen on the port defined by the PORT=8000 environment variable"
- Service shows `Ready: False`
- Health checks failing

**Root Cause:**
- Application not listening on correct port
- Docker health check conflicts with Cloud Run health checks
- Startup timeout too short

**Solution:**
1. **Remove Docker health check from Dockerfile:**
   ```dockerfile
   # Remove this section:
   # HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
   #     CMD curl -f http://localhost:8000/health || exit 1
   ```

2. **Ensure application listens on 0.0.0.0:8000:**
   ```python
   # In start_server.py or main.py
   uvicorn.run(
       app,
       host="0.0.0.0",  # Must be 0.0.0.0, not 127.0.0.1
       port=8000,
       reload=False
   )
   ```

3. **Deploy with longer timeout:**
   ```bash
   gcloud run deploy accorria-backend --source . --region us-central1 --platform managed --allow-unauthenticated --timeout=300
   ```

---

### **Issue 3: "Container failed to start" - Supabase Configuration**

**Symptoms:**
- Error: `Client.__init__() got an unexpected keyword argument 'proxy'`
- Service starts but has configuration warnings

**Root Cause:**
- Supabase client version incompatibility
- Missing environment variables

**Solution:**
1. **Fix Supabase client initialization:**
   ```python
   # In app/core/supabase_config.py
   def init_supabase():
       try:
           if not settings.SUPABASE_URL or not settings.SUPABASE_ANON_KEY:
               logger.warning("Supabase credentials not configured, skipping initialization")
               return None
               
           # Create client without proxy parameter
           supabase = create_client(
               settings.SUPABASE_URL,
               settings.SUPABASE_ANON_KEY
           )
           return supabase
       except Exception as e:
           logger.error(f"Failed to initialize Supabase: {e}")
           return None
   ```

---

## 🔧 **Deployment Process**

### **Step 1: Pre-Deployment Check**
```bash
# Test imports locally
cd /Users/prestoneaton/QuickFlip_MVP/Accorria/backend
python3 -c "from app.main import app; print('✅ App imports successfully')"

# Test startup locally
python3 start_server.py &
sleep 3
curl -f http://localhost:8000/health
pkill -f "python.*start_server"
```

### **Step 2: Deploy**
```bash
gcloud run deploy accorria-backend --source . --region us-central1 --platform managed --allow-unauthenticated --timeout=300
```

### **Step 3: Post-Deployment Verification**
```bash
# Check service status
gcloud run services describe accorria-backend --region us-central1 --format="value(status.conditions[0].status,status.conditions[0].type)"

# Test endpoints
curl -f https://accorria-backend-19949436301.us-central1.run.app/health
curl -f https://accorria-backend-19949436301.us-central1.run.app/test
```

---

## 📊 **Health Check Script**

Create this script to automate health checks:

```bash
#!/bin/bash
# health_check.sh

echo "🔍 Checking Accorria Backend Health..."

# Check service status
STATUS=$(gcloud run services describe accorria-backend --region us-central1 --format="value(status.conditions[0].status)" 2>/dev/null)

if [ "$STATUS" = "True" ]; then
    echo "✅ Service Status: Ready"
    
    # Test health endpoint
    if curl -f -s https://accorria-backend-19949436301.us-central1.run.app/health > /dev/null; then
        echo "✅ Health Endpoint: Working"
    else
        echo "❌ Health Endpoint: Failed"
        exit 1
    fi
    
    # Test basic endpoint
    if curl -f -s https://accorria-backend-19949436301.us-central1.run.app/test > /dev/null; then
        echo "✅ Test Endpoint: Working"
    else
        echo "❌ Test Endpoint: Failed"
        exit 1
    fi
    
    echo "🎉 Backend is fully operational!"
else
    echo "❌ Service Status: Not Ready"
    echo "📋 Recent logs:"
    gcloud run services logs read accorria-backend --region us-central1 --limit=5
    exit 1
fi
```

---

## 🚨 **Emergency Recovery Process**

If the backend is completely down:

1. **Check current status:**
   ```bash
   gcloud run services describe accorria-backend --region us-central1
   ```

2. **Deploy minimal working version:**
   ```bash
   # Use the minimal configuration that we know works
   gcloud run deploy accorria-backend --source . --region us-central1 --platform managed --allow-unauthenticated --timeout=300
   ```

3. **Verify recovery:**
   ```bash
   curl -f https://accorria-backend-19949436301.us-central1.run.app/health
   ```

---

## 📝 **Prevention Checklist**

Before each deployment:

- [ ] Test imports locally: `python3 -c "from app.main import app; print('✅ App imports successfully')"`
- [ ] Test startup locally: `python3 start_server.py`
- [ ] Check for new imports in `app/api/v1/__init__.py`
- [ ] Verify all imported modules exist and work
- [ ] Remove any Docker health checks
- [ ] Ensure application listens on `0.0.0.0:8000`
- [ ] Test health endpoint locally

---

## 🔗 **Useful Commands Reference**

```bash
# Service management
gcloud run services list --region us-central1
gcloud run services describe accorria-backend --region us-central1
gcloud run revisions list --service accorria-backend --region us-central1

# Logs
gcloud run services logs read accorria-backend --region us-central1 --limit=20
gcloud run services logs tail accorria-backend --region us-central1

# Deployment
gcloud run deploy accorria-backend --source . --region us-central1 --platform managed --allow-unauthenticated

# Testing
curl -f https://accorria-backend-19949436301.us-central1.run.app/health
curl -f https://accorria-backend-19949436301.us-central1.run.app/test
curl -f https://accorria-backend-19949436301.us-central1.run.app/docs
```

---

## 📞 **When to Use This Guide**

Use this guide when you see:
- "Container failed to start" errors
- Service showing `Ready: False`
- Health check failures
- Import errors in logs
- Port configuration issues
- Supabase initialization errors

---

**Last Updated:** September 6, 2025  
**Service URL:** https://accorria-backend-19949436301.us-central1.run.app  
**Region:** us-central1
