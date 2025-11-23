FROM node:20-bullseye

WORKDIR /app

# Paketleri yükle
COPY package*.json ./

# npm install hataları için legacy peer deps ve clean cache
RUN npm install --legacy-peer-deps

# Uygulama dosyalarını kopyala
COPY . .

# Prisma client generate
RUN npx prisma generate

# Port aç
EXPOSE 5000

# Container ayağa kalkınca migrate ve server start
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]