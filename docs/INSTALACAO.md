# Instalação (Local)

## 1) Banco (Postgres)
```bash
cd infra
docker compose up -d
```

## 2) Backend
```bash
cd backend
cp .env.example .env
npm i
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

## 3) Frontend
```bash
cd ../frontend
cp .env.example .env
npm i
npm run dev
```


## Upload de imagens (local)
- O backend serve arquivos em `/uploads/*`.
- Endpoint (ADM): `POST /uploads` com multipart e campo `file`.
