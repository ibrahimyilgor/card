# --------------------------
# Stage 1: Build
# --------------------------
FROM node:20-bullseye AS builder

WORKDIR /app

# Tüm bağımlılıkları yükle (dev + prod)
COPY package*.json ./
RUN npm ci

# Uygulama dosyalarını kopyala
COPY . .

# --------------------------
# Stage 2: Production
# --------------------------
FROM node:20-bullseye-slim AS production

WORKDIR /app

# Optional: npm cache’i /tmp’ye yönlendir (disk tasarrufu için)
ENV NPM_CONFIG_CACHE=/tmp/.npm

# Prod-only bağımlılıkları yükle
COPY package*.json ./
RUN npm ci --only=production

# Builder stage’den uygulama dosyalarını kopyala
COPY --from=builder /app ./

# Port aç
EXPOSE 5000

# Runtime: Prisma generate + migrate + Node server start
CMD ["sh", "-c", "npx dotenv -e /app/.env.prod -- npx prisma generate && npx dotenv -e /app/.env.prod -- npx prisma migrate deploy && npm start"]