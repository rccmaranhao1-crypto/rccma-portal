FROM node:20-bullseye

WORKDIR /app

# Copia só package files primeiro (para cache)
COPY package*.json ./

# Instala dependências (sem rodar prisma ainda)
RUN npm install

# Agora copia o projeto inteiro (inclui prisma/schema.prisma)
COPY . .

# Prisma + Build
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
