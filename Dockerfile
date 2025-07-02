# Development image (nur eine Stage)
FROM node:22-alpine AS dev
WORKDIR /usr/src/app

# Kopiere package.json und lockfile
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Kopiere Quellcode und Prisma
COPY prisma ./prisma
COPY src ./src
COPY tsconfig*.json ./

# Installiere Prisma Client für die IDE
RUN yarn prisma generate

# Öffne Ports (Nest, Prisma Studio, Debug)
EXPOSE 3000 5555 9229

# Standard-Command (Hot-Reload)
CMD ["yarn", "start:dev"]
