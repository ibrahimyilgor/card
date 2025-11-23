FROM node:20-bullseye

WORKDIR /app

# Paketleri yükle
COPY package*.json ./

# npm install hataları için legacy peer deps ve clean cache
RUN npm install --legacy-peer-deps

# Uygulama dosyalarını kopyala
COPY . .

# Port aç
EXPOSE 5000

# Container ayağa kalkınca migrate ve server start
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && npm start"]