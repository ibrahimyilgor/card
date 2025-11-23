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

# Build stage’de Prisma generate **opsiyonel** olarak kaldırıldı
# RUN npx prisma generate  # artık build sırasında çalıştırılmıyor

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

# Runtime: .env.prod yükle + Prisma generate/migrate + Node server
CMD ["sh", "-c", "set -a && . .env.prod && set +a && npx prisma generate && npx prisma migrate deploy && npm start"]

