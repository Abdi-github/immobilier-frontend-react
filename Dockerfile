# =============================================
# DOCKERFILE - FRONTEND PRODUCTION
# Immobilier Frontend (React + Vite + Tailwind v4)
# Multi-stage build for optimized production image
# =============================================

# =============================================
# Stage 1: Build
# =============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package*.json pnpm-lock.yaml* ./

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then \
      pnpm install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then \
      npm ci; \
    else \
      npm install; \
    fi

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_APP_NAME
ARG VITE_DEFAULT_LANGUAGE

# Set environment variables for build
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-https://api.immobilier.ch/api/v1}
ENV VITE_APP_NAME=${VITE_APP_NAME:-Immobilier.ch}
ENV VITE_DEFAULT_LANGUAGE=${VITE_DEFAULT_LANGUAGE:-en}

# Build the application
RUN npm run build

# =============================================
# Stage 2: Production
# =============================================
FROM nginx:alpine AS production

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
