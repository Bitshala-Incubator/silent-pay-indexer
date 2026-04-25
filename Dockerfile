# Stage 1: Build the NestJS application
FROM node:22-alpine AS builder

WORKDIR /app

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

# Copy package.json and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Set environment variables for LMDB path and app port
ENV DB_PATH="/app/data/lmdb"
ENV APP_PORT="80"

VOLUME /app/data

EXPOSE $APP_PORT

# Set up entrypoint to handle config generation and start
ENTRYPOINT ["sh", "-c", "mv dist/config/example.config.yaml dist/config/config.yaml && node dist/main.js"]
