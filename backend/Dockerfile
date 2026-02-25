FROM node:20-bookworm-slim

WORKDIR /app

# copia package do backend (já que o build context é a pasta backend)
COPY package*.json ./

RUN npm ci

# copia todo o código do backend
COPY . .

# prisma + build
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/main.js"]
