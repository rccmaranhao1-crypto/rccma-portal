FROM node:20-bookworm-slim

RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

# 1) Trabalha na raiz
WORKDIR /app

# 2) Copia apenas manifests do backend (para cache)
COPY backend/package*.json ./backend/

# 3) Agora entra na pasta do backend
WORKDIR /app/backend

RUN npm install

# 4) Copia o restante do backend
COPY backend/ ./

# 5) Prisma + build
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# 6) Start no caminho CERTO
CMD ["node", "dist/main.js"]
