# Production Dockerfile for Al-Manar Trading Agencies Platform
# Node 24 runtime with native SQLite support (node:sqlite)

# --- Stage 1: Build Frontend ---
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Install client dependencies
COPY client/package*.json ./client/
RUN cd client && npm ci

# Build client production bundle
COPY client/ ./client/
RUN cd client && npm run build

# --- Stage 2: Production Runner ---
FROM node:24-bookworm-slim AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev

# Copy server source and root configuration
COPY server/ ./server/
COPY package.json ./

# Copy compiled static frontend assets
COPY --from=builder /app/client/dist ./client/dist

# Expose default port
EXPOSE 5000

# Start server
CMD ["node", "server/server.js"]
