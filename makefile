.PHONY: install ensure-prisma build up down logs prisma-migrate-new prisma-migrate-deploy generate studio clean rebuild generate-local

COMPOSE = docker compose
SERVICE = app

install:
	@if [ -f yarn.lock ]; then \
		yarn install --frozen-lockfile; \
	else \
		npm ci; \
	fi

ensure-prisma:
	@if ! grep -q '"prisma":' package.json; then \
		if [ -f yarn.lock ]; then \
			yarn add prisma --dev; \
		else \
			npm install prisma --save-dev; \
		fi \
	fi

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

prisma-migrate-new:
	@if [ -z "$(NAME)" ]; then \
		echo "Bitte Namen angeben: make prisma-migrate-new NAME=dein_migration_name"; \
		exit 1; \
	fi
	$(COMPOSE) exec $(SERVICE) npx prisma migrate dev --name $(NAME)

prisma-migrate-deploy:
	$(COMPOSE) exec $(SERVICE) npx prisma migrate deploy
	$(COMPOSE) exec $(SERVICE) npx prisma generate

generate:
	$(COMPOSE) exec $(SERVICE) npx prisma generate

studio:
	$(COMPOSE) exec $(SERVICE) npx prisma studio --port 5555

clean:
	@echo "→ Entferne Container, Netzwerke, Volumes und Images…"
	$(COMPOSE) down --volumes --rmi all --remove-orphans

rebuild: clean build up prisma-migrate-deploy
	@echo "Neustart komplett abgeschlossen."

generate-local:
	npx prisma generate
