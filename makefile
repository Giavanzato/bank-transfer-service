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

.PHONY: build up down logs migrate migrate-dev db-push generate seed studio pull clean rebuild

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

# Schiebt das schema.prisma direkt in die DB (ohne Migrations-Files)
db-push: ensure-prisma
	$(COMPOSE) exec app npx prisma db push

# Prisma-Client regenerieren
generate: ensure-prisma
	$(COMPOSE) exec app npx prisma generate


# Prisma Studio GUI (öffnet auf http://localhost:5555)
studio: ensure-prisma
	$(COMPOSE) exec app npx prisma studio --port 5555

# Volumes/Images nur bei clean, nicht bei down
clean:
	@echo "→ Entferne Container, Netzwerke, Volumes und Images…"
	$(COMPOSE) down --volumes --rmi all --remove-orphans

rebuild: clean build up
	@echo "Neustart komplett abgeschlossen."
