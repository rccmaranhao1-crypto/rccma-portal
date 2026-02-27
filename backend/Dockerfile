FROM node:20-bookworm-slim

# OpenSSL (Prisma)
RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

# instala deps do backend
COPY backend/package*.json ./
RUN npm install

# copia o código do backend
COPY backend/ ./

# prisma + build
RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
