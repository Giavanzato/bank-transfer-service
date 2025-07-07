# 🚀 NestJS + Prisma + PostgreSQL Starter (Dockerized Dev Environment)

Dieses Projekt ist ein **NestJS Backend mit Prisma ORM** und einer PostgreSQL-Datenbank. Die gesamte Entwicklungsumgebung läuft in Docker Containern – inklusive Hot-Reload und einfacher Makefile-Kommandos.

---

## 🚦 Voraussetzungen

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Make](https://www.gnu.org/software/make/) (`brew install make` auf macOS oder über WSL/Ubuntu auf Windows)
- (Optional) [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/) – oder nutze `npm`

---

## 🏁 Schnellstart

1. **Repository klonen**

    ```bash
    git clone <dein-repo-url>
    cd <dein-projektordner>
    ```

2. **.env Datei erstellen**

    Lege im Root eine `.env` an, zum Beispiel:

    ```
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres
    POSTGRES_DB=mydb
    ```

3. **Abhängigkeiten lokal installieren**

    ```bash
    make install
    ```

4. **Container bauen und starten**

    ```bash
    make build
    make up
    ```

    → Die API ist erreichbar unter http://localhost:3000

5. **Prisma Migration anlegen (bei Schema-Änderung)**

    ```bash
    make prisma-migrate-new NAME=init
    ```

6. **Prisma Studio starten**

    ```bash
    make studio
    ```
    → erreichbar unter http://localhost:5555

7. **Logs ansehen**

    ```bash
    make logs
    ```

8. **Container stoppen**

    ```bash
    make down
    ```

---
