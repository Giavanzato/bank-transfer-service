# Makefile zur Verwaltung des Docker-Stacks für NestJS und PostgreSQL

.PHONY: build up down logs restart

# Image-Build für API und DB
build:
	docker-compose build

# Startet Container (detached)
up:
	docker-compose up -d

# Stoppt und entfernt Container
down:
	docker-compose down

# Zeigt Live-Logs aller Dienste
tools:
	docker-compose logs -f

# Neustart
restart: down up