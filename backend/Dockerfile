FROM node:20-bullseye

WORKDIR /app/backend

# instala deps do backend
COPY backend/package*.json ./
RUN npm install

# copia o backend (inclui prisma/schema.prisma)
COPY backend/ ./

RUN npx prisma generate
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
