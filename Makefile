# ============================================================
#  Makefile — ChitChat Backend
# ============================================================

.PHONY: help dev build start test lint format typecheck validate \
        db-generate db-migrate db-migrate-prod db-studio db-seed db-reset \
        install clean docker-up docker-down

.DEFAULT_GOAL := help

CYAN  := \033[36m
RESET := \033[0m
BOLD  := \033[1m

# ──────────────────────────────────────────────────────────
#  Package Manager Auto-Detection & Runner Config
# ──────────────────────────────────────────────────────────
ifeq ($(NODE_ENV),)
    # Default runners
    INSTALL_CMD := npm install
    RUN_CMD     := npm run
    
    ifneq ($(wildcard pnpm-lock.yaml),)
        INSTALL_CMD := pnpm install
        RUN_CMD     := pnpm
    else ifneq ($(wildcard bun.lockb),)
        INSTALL_CMD := bun install
        RUN_CMD     := bun run
    else ifneq ($(wildcard yarn.lock),)
        INSTALL_CMD := yarn install
        RUN_CMD     := yarn
    endif
endif

## ── Help ──────────────────────────────────────────────────
help: ## Show this help message
	@echo ""
	@echo "$(BOLD)ChitChat Backend$(RESET)"
	@echo "──────────────────────────────────────────────────"
	@echo "Detected Package Manager Command: $(CYAN)$(INSTALL_CMD)$(RESET)"
	@echo "Detected Run Command: $(CYAN)$(RUN_CMD) <script>$(RESET)"
	@echo "──────────────────────────────────────────────────"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

## ── Development ───────────────────────────────────────────
install: ## Install all dependencies
	$(INSTALL_CMD)

dev: ## Start development server with hot reload
	$(RUN_CMD) dev

build: ## Build for production
	$(RUN_CMD) build

start: ## Start production server
	$(RUN_CMD) start

clean: ## Remove build artifacts
	rm -rf dist coverage

## ── Code Quality ──────────────────────────────────────────
lint: ## Run ESLint
	$(RUN_CMD) lint

lint-fix: ## Run ESLint with auto-fix
	$(RUN_CMD) lint:fix

format: ## Format code with Prettier
	$(RUN_CMD) format

format-check: ## Check code formatting
	$(RUN_CMD) format:check

typecheck: ## Run TypeScript type checking
	$(RUN_CMD) type-check

validate: ## Run all checks (type, lint, format, test)
	$(RUN_CMD) validate

## ── Testing ───────────────────────────────────────────────
test: ## Run tests
	$(RUN_CMD) test

test-watch: ## Run tests in watch mode
	$(RUN_CMD) test:watch

test-coverage: ## Run tests with coverage report
	$(RUN_CMD) test:coverage

## ── Database ──────────────────────────────────────────────
db-generate: ## Generate Prisma client
	$(RUN_CMD) db:generate

db-migrate: ## Run database migrations (dev)
	$(RUN_CMD) db:migrate

db-migrate-prod: ## Run database migrations (production)
	$(RUN_CMD) db:migrate:prod

db-studio: ## Open Prisma Studio
	$(RUN_CMD) db:studio

db-seed: ## Seed the database
	$(RUN_CMD) db:seed

db-reset: ## Reset database (WARNING: deletes all data)
	$(RUN_CMD) db:reset

## ── Docker (Local Dev) ────────────────────────────────────
docker-up: ## Start local PostgreSQL via Docker
	docker compose up -d

docker-down: ## Stop Docker containers
	docker compose down

docker-logs: ## Show Docker container logs
	docker compose logs -f

## ── Setup ─────────────────────────────────────────────────
setup: install db-generate ## Initial project setup (install + generate prisma)
	@echo "✅ Setup complete! Copy .env.example to .env and add your DATABASE_URL + DIRECT_URL"