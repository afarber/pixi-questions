# Multi-stage build: Node.js for frontend, Python for backend
FROM node:24-alpine AS frontend-builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and test files
COPY src/ ./src/
COPY tests/ ./tests/
COPY index.html ./
COPY vite.config.js ./
COPY vitest.config.js ./

# Run tests to ensure code quality
RUN npm run test:run

# Build frontend
RUN npm run build

# Python backend stage
FROM python:3.13-alpine

WORKDIR /app

# Install system dependencies
RUN apk add --no-cache curl

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend from previous stage
COPY --from=frontend-builder /app/dist ./dist

# Create non-root user for security
RUN addgroup -S app && adduser -S -G app app
RUN chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
