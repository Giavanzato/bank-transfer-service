# Stage 1: Build
FROM node:22-alpine AS builder
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY prisma ./prisma
COPY src ./src
COPY tsconfig*.json ./
RUN yarn build \
    && yarn prisma generate

# Stage 2: Runtime
FROM node:22-alpine AS runner
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/main"]
