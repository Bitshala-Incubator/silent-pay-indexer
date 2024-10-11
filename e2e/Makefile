# Variables
DOCKER_COMPOSE_FILE = helpers/docker/docker-compose.yml
NESTJS_SERVICE_PORT = 3000
INDEXER_TEST_CMD = npm run test:e2e 
MAX_RETRIES = 10 # Number of retries to check if the inddexer service is up
RETRY_INTERVAL = 5 # Seconds between retries
PM2_CMD = npx pm2
NPM_CMD = npm
APP_NAME = silent-indexer
LOG_DIR = .logs
INDEXER_OUTPUT_LOG = $(LOG_DIR)/$(APP_NAME)-out.log
INDEXER_ERROR_LOG = $(LOG_DIR)/$(APP_NAME)-error.log

# Targets
.PHONY: all start-bitcoind start-indexer setup test clean 

# Default target
all: setup test
	@$(MAKE) clean

# Start Docker Compose services
start-bitcoind:
	@echo "Starting Docker Compose services..."
	docker compose -f $(DOCKER_COMPOSE_FILE) up -d

# Start the Indexer service
start-indexer: 
	@echo "Starting the Indexer service with PM2..."
	$(PM2_CMD) start $(NPM_CMD) --name $(APP_NAME) --output $(INDEXER_OUTPUT_LOG) --error $(INDEXER_ERROR_LOG) -- run start:e2e 

# Wait for the Indexer service to be available before running tests
setup: start-bitcoind start-indexer
	@echo "Waiting for Indexer service to be ready on port $(NESTJS_SERVICE_PORT)..."
	@count=0; \
	while ! nc -z localhost $(NESTJS_SERVICE_PORT) && [ $$count -lt $(MAX_RETRIES) ]; do \
		count=$$((count + 1)); \
		echo "Waiting for service... ($$count/$(MAX_RETRIES))"; \
		sleep $(RETRY_INTERVAL); \
	done; \
	if ! nc -z localhost $(NESTJS_SERVICE_PORT); then \
		echo "Error: Service not available after $(MAX_RETRIES) retries, exiting."; \
		exit 1; \
	fi

# Run the end-to-end tests
test: 
	@echo "Running end-to-end tests..."
	$(INDEXER_TEST_CMD) || echo "Warning: E2E tests failed, but continuing..."

# Stop all services and delete all files
clean:
	@echo "Stopping and removing Docker Compose services..."
	docker compose -f $(DOCKER_COMPOSE_FILE) down -v
	$(PM2_CMD) delete $(APP_NAME) || echo "Warning: PM2 delete command failed, but continuing..."
	@echo "Clean up completed."