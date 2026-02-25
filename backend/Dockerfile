FROM node:20-bookworm-slim

WORKDIR /app

# Copia backend inteiro
COPY backend ./backend

WORKDIR /app/backend

# Instala dependências
RUN npm install

# Gera Prisma Client
RUN npx prisma generate --schema=prisma/schema.prisma

# Build Nest
RUN npm run build

# DEBUG: mostra se dist existe
RUN ls -la
RUN ls -la dist || echo "DIST NAO EXISTE"

EXPOSE 3000

CMD ["node", "dist/main.js"]
