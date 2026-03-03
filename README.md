# RCC MA — Plataforma 1.0 (Produção)

Este repositório contém **frontend + backend + banco + integração PagBank (esqueleto pronto)**, seguindo as regras do documento de requisitos.

> **Importante:** Tokens/credenciais PagBank devem ser preenchidos no `.env`.  
> A integração está implementada com:
> - criação de cobrança PIX/Cartão via endpoints PagBank (placeholders prontos)
> - **webhook** de confirmação com verificação de assinatura (pronto)
> - persistência do status do pagamento no banco (pronto)

## Stack
- Frontend: Next.js 14 (App Router) + Tailwind (cores oficiais RCC)
- Backend: NestJS + Prisma + PostgreSQL
- Auth: JWT + Refresh Token + RBAC (perfis)
- Deploy: Railway (guias em `docs/DEPLOY_RAILWAY.md`)
- Banco: PostgreSQL (Docker compose para dev)

## Rodando local (DEV)
Pré-requisitos: Node 18+ e Docker.

### 1) Banco
```bash
cd infra
docker compose up -d
```

### 2) Backend
```bash
cd backend
cp .env.example .env
npm i
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```
Backend em: http://localhost:3001  
Swagger em: http://localhost:3001/docs

### 3) Frontend
```bash
cd ../frontend
cp .env.example .env
npm i
npm run dev
```
Frontend em: http://localhost:3000

## Usuário ADM padrão (seed)
- WhatsApp: (99)9824-7746
- Senha: ucra01

## Documentação
Veja pasta `docs/`:
- `INSTALACAO.md`
- `DEPLOY_RAILWAY.md`
- `PAGBANK.md`
- `PERFIS_E_PERMISSOES.md`
- `API.md`


## Área do ADM (Frontend)
- Login: `http://localhost:3000/login`
- Dashboards: `http://localhost:3000/adm`


## Teste rápido (1 comando)

1) Instale Docker Desktop.
2) Na raiz do projeto, rode:
```bash
docker compose up
```
3) Acesse:
- Frontend: http://localhost:3000
- Login: http://localhost:3000/login
- ADM: http://localhost:3000/adm
- Swagger: http://localhost:3001/docs

> ADM seed: WhatsApp (99)9824-7746 | senha ucra01
