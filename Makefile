.PHONY: build run run-it stop clean logs help rebuild restart shell smoke test

# Variables
IMAGE_NAME = bookkeeping-app
CONTAINER_NAME = bookkeeping-app-container
HOST_PORT = 3000
CONTAINER_PORT = 3000
ENV_FILE = .env.local
ENV_ARGS = $(shell test -f $(ENV_FILE) && echo "--env-file $(ENV_FILE)")

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

build: ## Build the Docker image
	docker build -t $(IMAGE_NAME) .

run: ## Run the Docker container
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(HOST_PORT):$(CONTAINER_PORT) \
		-e PORT=$(CONTAINER_PORT) \
		$(ENV_ARGS) \
		$(IMAGE_NAME)
	@echo "Container started at http://localhost:$(HOST_PORT)"

run-it: ## Run the Docker container in interactive mode
	docker run -it --rm \
		--name $(CONTAINER_NAME) \
		-p $(HOST_PORT):$(CONTAINER_PORT) \
		-e PORT=$(CONTAINER_PORT) \
		$(ENV_ARGS) \
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

smoke: ## Check the running container responds over HTTP
	curl -fsS -I http://localhost:$(HOST_PORT)/
	curl -fsS -I http://localhost:$(HOST_PORT)/login
	curl -fsS -I http://localhost:$(HOST_PORT)/dashboard

test: build restart ## Build, restart, and smoke-test the container
	@echo "Waiting for container to start..."
	@sleep 3
	$(MAKE) smoke
	@echo "Container is running at http://localhost:$(HOST_PORT)"
	@echo "Run 'make logs' to see the logs"
	@echo "Run 'make stop' to stop the container"
