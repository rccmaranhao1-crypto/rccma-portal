FROM node:20-bookworm-slim

WORKDIR /app/backend

# Copia só o package primeiro (cache bom)
COPY backend/package*.json ./

RUN npm ci

# Copia o código do backend
COPY backend/ ./

# Prisma + build
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
