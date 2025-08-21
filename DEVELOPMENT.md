# QuickFlip AI - Development Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)
- Git

### Local Development Setup

1. **Clone and Setup**
```bash
git clone <repository-url>
cd quickflip-ai
```

2. **Environment Configuration**
```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit with your configuration
nano backend/.env
nano frontend/.env
```

3. **Start with Docker (Recommended)**
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

4. **Access Applications**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Database: localhost:5432

## 🏗️ Architecture Overview

### Backend Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FastAPI App   │    │   Celery Worker │    │  Celery Beat    │
│                 │    │                 │    │                 │
│ • REST API      │    │ • Background    │    │ • Scheduled     │
│ • WebSocket     │    │   Tasks         │    │   Tasks         │
│ • Auth          │    │ • Message       │    │ • Monitoring    │
└─────────────────┘    │   Processing    │    │ • Cleanup       │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                └───────────────────────┘
                                          │
                    ┌─────────────────────────────────────────┐
                    │              Redis                      │
                    │ • Task Queue                           │
                    │ • Session Storage                       │
                    │ • Caching                               │
                    └─────────────────────────────────────────┘
                                          │
                    ┌─────────────────────────────────────────┐
                    │            PostgreSQL                   │
                    │ • User Data                            │
                    │ • Listings                             │
                    │ • Messages                             │
                    │ • Sales                                │
                    └─────────────────────────────────────────┘
```

### Frontend Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    React App                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Router    │  │   Store     │  │   API       │        │
│  │             │  │ (Zustand)   │  │ (Axios)     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Listing    │  │   Message   │  │  Analytics  │        │
│  │ Assistant   │  │   Monitor   │  │  Dashboard  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Negotiation │  │  Scheduler  │  │  Settings   │        │
│  │   Agent     │  │   Agent     │  │             │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Development Workflow

### Backend Development

1. **Local Development**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start database and Redis
docker-compose up postgres redis -d

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

2. **Testing**
```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_listings.py -v
```

3. **Code Quality**
```bash
# Format code
black app/
isort app/

# Lint code
flake8 app/

# Type checking
mypy app/
```

### Frontend Development

1. **Local Development**
```bash
cd frontend
npm install
npm run dev
```

2. **Testing**
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test
npm test -- --testNamePattern="ListingAssistant"
```

3. **Code Quality**
```bash
# Lint code
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

## 📁 Project Structure

### Backend Structure
```
backend/
├── app/
│   ├── main.py                 # FastAPI app entry point
│   ├── core/                   # Core configuration
│   │   ├── config.py           # Settings management
│   │   ├── database.py         # Database connection
│   │   └── security.py         # Authentication
│   ├── api/                    # API routes
│   │   └── v1/
│   │       ├── auth.py         # Authentication endpoints
│   │       ├── listings.py     # Listing management
│   │       ├── messages.py     # Message handling
│   │       ├── replies.py      # AI reply generation
│   │       └── scheduler.py    # Appointment scheduling
│   ├── services/               # Business logic
│   │   ├── browser_automation.py
│   │   ├── message_monitor.py
│   │   ├── ai_reply_generator.py
│   │   └── notification_service.py
│   ├── models/                 # Database models
│   │   ├── user.py
│   │   ├── listing.py
│   │   ├── message.py
│   │   └── sale.py
│   └── utils/                  # Utilities
│       ├── delay_simulator.py
│       └── template_manager.py
├── tests/                      # Test files
├── alembic/                    # Database migrations
├── requirements.txt            # Python dependencies
└── Dockerfile                  # Container configuration
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/             # React components
│   │   ├── common/             # Shared components
│   │   ├── ListingAssistant/
│   │   ├── MessageMonitor/
│   │   ├── NegotiationAgent/
│   │   ├── SchedulerAgent/
│   │   └── InsightsDashboard/
│   ├── hooks/                  # Custom React hooks
│   │   ├── useListings.ts
│   │   ├── useMessages.ts
│   │   └── useAuth.ts
│   ├── services/               # API and external services
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── notifications.ts
│   ├── store/                  # State management
│   │   ├── authStore.ts
│   │   ├── listingStore.ts
│   │   └── messageStore.ts
│   ├── types/                  # TypeScript definitions
│   │   └── index.ts
│   ├── utils/                  # Utility functions
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # App entry point
├── public/                     # Static assets
├── tests/                      # Test files
├── package.json                # Node.js dependencies
└── Dockerfile                  # Container configuration
```

## 🔐 Environment Variables

### Backend (.env)
```bash
# Application
DEBUG=true
SECRET_KEY=your-secret-key-here

# Database
DATABASE_URL=postgresql://user:password@localhost/quickflip

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Google Cloud
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_STORAGE_BUCKET=your-bucket-name

# Twilio (SMS)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-phone-number

# SendGrid (Email)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=your-email@domain.com
```

### Frontend (.env)
```bash
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000

# Feature Flags
VITE_AI_REPLIES_ENABLED=true
VITE_MESSAGE_MONITORING_ENABLED=true

# Analytics
VITE_ANALYTICS_ID=your-analytics-id
```

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test browser automation workflows
- **Performance Tests**: Test message processing and AI response times

### Frontend Testing
- **Unit Tests**: Test React components and hooks
- **Integration Tests**: Test component interactions
- **E2E Tests**: Test user workflows with Playwright
- **Visual Tests**: Test UI consistency

### Test Commands
```bash
# Backend
pytest                    # Run all tests
pytest -v                 # Verbose output
pytest -k "test_listing"  # Run specific tests
pytest --cov=app          # With coverage

# Frontend
npm test                  # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # With coverage
npm run test:e2e          # E2E tests
```

## 🚀 Deployment

### Production Deployment
1. **Google Cloud Run** (Backend)
2. **Vercel** (Frontend)
3. **Cloud SQL** (PostgreSQL)
4. **Cloud Memorystore** (Redis)
5. **Cloud Scheduler** (Background tasks)

### Deployment Commands
```bash
# Build and deploy backend
gcloud run deploy quickflip-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Deploy frontend
vercel --prod
```

## 📊 Monitoring and Logging

### Application Monitoring
- **Health Checks**: `/health` endpoint
- **Metrics**: Prometheus metrics
- **Logging**: Structured JSON logging
- **Error Tracking**: Sentry integration

### Key Metrics
- API response times
- Message processing latency
- AI reply generation time
- User engagement metrics
- Error rates and types

## 🔒 Security Considerations

### Authentication
- JWT tokens with short expiration
- Refresh token rotation
- Rate limiting on auth endpoints

### Data Protection
- Encrypted data at rest
- TLS for data in transit
- Secure API key management
- GDPR compliance

### Platform Compliance
- Manual submission requirement
- Human-like delays and behavior
- No automated posting without approval
- Session management best practices

## 🤝 Contributing

### Development Workflow
1. Create feature branch
2. Make changes with tests
3. Run linting and tests
4. Create pull request
5. Code review and merge

### Code Standards
- Follow PEP 8 (Python)
- Follow ESLint rules (TypeScript)
- Write comprehensive tests
- Update documentation
- Use conventional commits

---

**QuickFlip AI** - Making car selling smarter! 🚗💨 