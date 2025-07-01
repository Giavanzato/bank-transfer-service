FROM node:22-slim

# Arbeitsverzeichnis setzen
WORKDIR /app

# Nur package.json kopieren, um Abhängigkeiten vorher zu installieren
COPY package*.json ./
RUN npm install

# Restlichen Code kopieren
COPY . .

# Prisma Client generieren
RUN npx prisma generate

# Anwendung bauen
RUN npm run build

# Anwendung starten
CMD ["node", "dist/main.js"]