FROM node:20-bookworm-slim

WORKDIR /app

# Copia só o backend
COPY backend ./backend

WORKDIR /app/backend

RUN npm install

# Gera Prisma Client
RUN npx prisma generate --schema=prisma/schema.prisma

# Build Nest
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
