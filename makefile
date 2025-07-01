.PHONY: install ensure-prisma build up down logs prisma-migrate-new prisma-migrate-deploy generate studio clean rebuild generate-local

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

# Migration ERSTELLEN + DB aktualisieren (nur bei Schema-Änderung!)
# make prisma-migrate-new NAME=mein-feature
prisma-migrate-new:
	@if [ -z "$(NAME)" ]; then \
		echo "Bitte Namen angeben: make prisma-migrate-new NAME=dein_migration_name"; \
		exit 1; \
	fi
	$(COMPOSE) exec app npx prisma migrate dev --name $(NAME)

# Migration(en) ANWENDEN (wenn neue im Repo / nach Pull)
prisma-migrate-deploy:
	$(COMPOSE) exec app npx prisma migrate deploy
	$(COMPOSE) exec app npx prisma generate

# Prisma-Client neu generieren
generate:
	$(COMPOSE) exec app npx prisma generate

# Prisma Studio
studio:
	$(COMPOSE) exec app npx prisma studio --port 5555

clean:
	@echo "→ Entferne Container, Netzwerke, Volumes und Images…"
	$(COMPOSE) down --volumes --rmi all --remove-orphans

# Kompletter Neustart: alles löschen, bauen, hochfahren, Migrationen anwenden
rebuild: clean build up prisma-migrate-deploy
	@echo "Neustart komplett abgeschlossen."

# Prisma Client nur lokal generieren (für die IDE)
generate-local:
	npx prisma generate
