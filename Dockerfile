# Stage 1: Build the NestJS application
FROM node:22-alpine AS builder

WORKDIR /app

# Install build dependencies using apk
RUN apk add --no-cache \
    python3 \
    py3-setuptools \
    make \
    g++ \
    build-base

# Copy package.json and package-lock.json for efficient layer caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine AS production

WORKDIR /app

# Copy the compiled application from the build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/migrations ./migrations

# Copy package.json and install only production dependencies
COPY package*.json ./
RUN apk add --no-cache \
    python3 \
    py3-setuptools \
    make \
    g++ \
    build-base && \
    npm install --omit=dev && \
    apk del python3 py3-setuptools make g++ build-base

# Set environment variables for SQLite path and app port
ENV DB_PATH="/app/data/database.sqlite"
ENV APP_PORT="80"

VOLUME /app/data

EXPOSE $APP_PORT

# Set up entrypoint to handle database migration and config generation
ENTRYPOINT ["sh", "-c", "npm run migration:run && mv dist/config/example.config.yaml dist/config/config.yaml && node dist/main.js"]
