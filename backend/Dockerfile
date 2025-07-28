# Multi-stage build for production
FROM python:3.11-slim as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-slim

# Metadata labels
LABEL maintainer="Preston <preston@path-suite.com>"
LABEL version="1.0.0"

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000
ENV PYTHONPATH=/app

# Install minimal runtime dependencies
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 appuser

# Set work directory
WORKDIR /app

# Copy Python packages from builder stage
COPY --from=builder /root/.local /home/appuser/.local

# Make sure scripts in .local are usable:
ENV PATH=/home/appuser/.local/bin:$PATH

# Playwright installation removed - not needed for OpenAI API

# Copy application code
COPY . .

# Create production start script
RUN echo '#!/bin/bash\n\
set -e\n\
echo "🚀 Starting QuickFlip AI in production mode..."\n\
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT --workers 1 --loop uvloop --http httptools' > /start-production.sh
RUN chmod +x /start-production.sh

# Change ownership to appuser
RUN chown -R appuser:appuser /app /home/appuser

# Switch to non-root user
USER appuser

# Expose port
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health || exit 1

# Production command
CMD ["/start-production.sh"] 