FROM node:20-bookworm-slim

WORKDIR /app

# OpenSSL pro Prisma parar de reclamar
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copia só os manifests do backend
COPY package*.json ./

RUN npm install

# Copia o resto do backend
COPY . .

# Prisma + build
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# IMPORTANTE: iniciar o arquivo que existe no container
CMD ["node", "dist/main.js"]
