# Deploy Railway (Produção)

## Backend (API)
1. Crie um projeto no Railway e conecte este repositório ao GitHub.
2. Adicione plugin **PostgreSQL** no Railway e copie a `DATABASE_URL`.
3. Configure variáveis no serviço do backend:
   - `NODE_ENV=production`
   - `PORT=3001` (Railway geralmente define)
   - `DATABASE_URL=...`
   - `JWT_ACCESS_SECRET=...`
   - `JWT_REFRESH_SECRET=...`
   - `CORS_ORIGIN=https://SEU_FRONTEND_DOMAIN`
   - `PAGBANK_BASE_URL=https://api.pagseguro.com` (produção) ou sandbox
   - `PAGBANK_TOKEN=...`
   - `PAGBANK_WEBHOOK_SECRET=...`
4. Comando de build: `npm run build`
5. Comando start: `npm run start`

## Frontend
1. Crie um novo serviço Railway para o `frontend/`.
2. Variáveis:
   - `NEXT_PUBLIC_API_BASE_URL=https://SEU_BACKEND_DOMAIN`
3. Build: `npm run build`
4. Start: `npm run start`

## Migrações Prisma em produção
No Railway, configure:
- Build step (ou deploy hook) rodando:
  - `npx prisma migrate deploy`
  - `npx prisma generate`

> Seed (ADM + dioceses) pode ser feito 1x via `npm run seed` no backend em ambiente seguro.
