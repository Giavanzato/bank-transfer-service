# Host-seitige Paketinstallation (npm oder yarn)
.PHONY: install ensure-prisma

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

# Docker Compose Kurzbefehle
COMPOSE = docker compose

.PHONY: build up down logs migrate generate seed studio pull

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

# Prisma-Targets im Container (stellt sicher, dass Prisma CLI vorhanden ist)
migrate: ensure-prisma
	$(COMPOSE) exec app npx prisma migrate deploy

generate: ensure-prisma
	$(COMPOSE) exec app npx prisma generate

seed:
	$(COMPOSE) exec app npm run seed

# Prisma Studio GUI (öffnet auf http://localhost:5555)
studio: ensure-prisma
	$(COMPOSE) exec app npx prisma studio  --port 5555

# Aktuelles DB-Schema ins Prisma-Schema zurückziehen
pull: ensure-prisma
	$(COMPOSE) exec app npx prisma db pull

clean:
	@echo "→ Entferne Container, Netzwerke, Volumes und Images…"
	$(COMPOSE) down --volumes --rmi all --remove-orphans

rebuild: clean build up
	@echo "Neustart komplett abgeschlossen."