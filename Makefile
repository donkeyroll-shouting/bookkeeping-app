.PHONY: build run stop clean logs help

# Variables
IMAGE_NAME = bookkeeping-app
CONTAINER_NAME = bookkeeping-app-container
PORT = 3000

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

build: ## Build the Docker image
	docker build -t $(IMAGE_NAME) .

run: ## Run the Docker container (requires .env.local file)
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):$(PORT) \
		--env-file .env.local \
		$(IMAGE_NAME)
	@echo "Container started at http://localhost:$(PORT)"

run-it: ## Run the Docker container in interactive mode
	docker run -it --rm \
		--name $(CONTAINER_NAME) \
		-p $(PORT):$(PORT) \
		--env-file .env.local \
		$(IMAGE_NAME)

stop: ## Stop the running container
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true

logs: ## Show container logs
	docker logs -f $(CONTAINER_NAME)

clean: stop ## Stop container and remove image
	docker rmi $(IMAGE_NAME) || true

rebuild: clean build ## Clean, rebuild, and run
	@echo "Image rebuilt successfully"

restart: stop run ## Restart the container
	@echo "Container restarted"

shell: ## Open a shell in the running container
	docker exec -it $(CONTAINER_NAME) /bin/sh

test: build run ## Build and run the container
	@echo "Waiting for container to start..."
	@sleep 3
	@echo "Container is running at http://localhost:$(PORT)"
	@echo "Run 'make logs' to see the logs"
	@echo "Run 'make stop' to stop the container"
