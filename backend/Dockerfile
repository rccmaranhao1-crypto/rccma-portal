FROM node:20-bookworm-slim

RUN apt-get update -y \
  && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm install

COPY backend/ ./

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
