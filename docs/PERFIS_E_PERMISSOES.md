# Perfis e permissões (RBAC)

Perfis:
- ADM (total)
- COMUNICACAO (conteúdo institucional)
- TESOUREIRO (dashboard financeiro + gestão usuários sem promover)
- ARRECADACAO (dashboard doações)
- USUARIO_PADRAO (doar e comprar)

Implementação:
- Decorator `@Roles(...)` e `RolesGuard` no backend.
- Endpoints protegidos:
  - `POST /campaigns` (somente ADM)
  - `GET /donations/dashboard/by-diocese` (ADM/TESOUREIRO/ARRECADACAO)
  - `GET /campaigns/:id/dashboard` (ADM/TESOUREIRO/ARRECADACAO)
  - `POST /products` (ADM)
  - `GET /users` e `PATCH /users/promote` (ADM)
