FROM node:20-bookworm-slim

RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia os manifests do backend (porque eles NÃO estão na raiz do repo)
COPY backend/package*.json ./
RUN npm install

# Copia o código do backend
COPY backend/ ./

RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
