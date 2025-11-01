# ============================================
# Base Stage - Common dependencies
# ============================================
FROM node:20-alpine AS base

# Install system dependencies
RUN apk add --no-cache bash git curl

# Set working directory
WORKDIR /app

# Copy package files for dependency caching
COPY package.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/platform/package.json ./packages/platform/
COPY packages/web/package.json ./packages/web/

# Install all dependencies
RUN npm install

# Copy source code
COPY packages/ ./packages/

# ============================================
# Development Stage - Vite dev server
# ============================================
FROM base AS development

# Expose Vite dev server port
EXPOSE 5173

# Start dev server (builds core and platform first)
CMD ["npm", "run", "dev"]

# ============================================
# Builder Stage - Build for production
# ============================================
FROM base AS builder

# Build all packages (core, platform, and web)
RUN npm run build

# ============================================
# Production Stage - Nginx serving static files
# ============================================
FROM nginx:1.27-alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built static files from builder stage
COPY --from=builder /app/packages/web/build /usr/share/nginx/html

# Copy entrypoint script for runtime config injection
COPY docker-entrypoint.sh /docker-entrypoint.sh

# Install utilities, setup nginx, and configure permissions
RUN apk add --no-cache bash wget jq && \
    rm -rf /etc/nginx/nginx.conf.default /usr/share/nginx/html/.gitkeep && \
    chmod +x /docker-entrypoint.sh && \
    mkdir -p /var/cache/nginx /var/run && \
    chown -R nginx:nginx /var/cache/nginx /var/run /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/run

# Use non-root user
USER nginx

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Set entrypoint and command
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
