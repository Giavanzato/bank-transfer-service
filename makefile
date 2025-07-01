.PHONY: install ensure-prisma build up down logs prisma studio clean rebuild generate

COMPOSE = docker compose

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

# Prisma-Jobs: Migration & Client-Generierung
prisma:
	$(COMPOSE) exec app npx prisma migrate dev --name autoupdate
	$(COMPOSE) exec app npx prisma generate

generate:
	$(COMPOSE) exec app npx prisma generate

studio:
	$(COMPOSE) exec app npx prisma studio --port 5555

clean:
	@echo "→ Entferne Container, Netzwerke, Volumes und Images…"
	$(COMPOSE) down --volumes --rmi all --remove-orphans

rebuild: clean build up prisma
	@echo "Neustart komplett abgeschlossen."

generate-local:
	npx prisma generate