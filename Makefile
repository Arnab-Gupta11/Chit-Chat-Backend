# ============================================================
#  Makefile — Express + Prisma 7 + NeonDB Boilerplate (pnpm)
# ============================================================

.PHONY: help dev build start test lint format typecheck validate \
        db-generate db-migrate db-migrate-prod db-studio db-seed db-reset \
        install clean docker-up docker-down

.DEFAULT_GOAL := help

CYAN  := \033[36m
RESET := \033[0m
BOLD  := \033[1m

## ── Help ──────────────────────────────────────────────────
help: ## Show this help message
	@echo ""
	@echo "$(BOLD)Express + Prisma 7 + NeonDB Boilerplate$(RESET)"
	@echo "──────────────────────────────────────────────────"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-20s$(RESET) %s\n", $$1, $$2}'
	@echo ""

## ── Development ───────────────────────────────────────────
install: ## Install all dependencies
	pnpm install

dev: ## Start development server with hot reload
	pnpm dev

build: ## Build for production
	pnpm build

start: ## Start production server
	pnpm start

clean: ## Remove build artifacts
	rm -rf dist coverage

## ── Code Quality ──────────────────────────────────────────
lint: ## Run ESLint
	pnpm lint

lint-fix: ## Run ESLint with auto-fix
	pnpm lint:fix

format: ## Format code with Prettier
	pnpm format

format-check: ## Check code formatting
	pnpm format:check

typecheck: ## Run TypeScript type checking
	pnpm type-check

validate: ## Run all checks (type, lint, format, test)
	pnpm validate

## ── Testing ───────────────────────────────────────────────
test: ## Run tests
	pnpm test

test-watch: ## Run tests in watch mode
	pnpm test:watch

test-coverage: ## Run tests with coverage report
	pnpm test:coverage

## ── Database ──────────────────────────────────────────────
db-generate: ## Generate Prisma client
	pnpm db:generate

db-migrate: ## Run database migrations (dev)
	pnpm db:migrate

db-migrate-prod: ## Run database migrations (production)
	pnpm db:migrate:prod

db-studio: ## Open Prisma Studio
	pnpm db:studio

db-seed: ## Seed the database
	pnpm db:seed

db-reset: ## Reset database (WARNING: deletes all data)
	pnpm db:reset

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
