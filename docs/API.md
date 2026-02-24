# API (Resumo)

Base URL: `/`

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

## Diocese
- `GET /diocese`

## Users
- `GET /users/me` (JWT)
- `PATCH /users/me` (JWT)
- `GET /users` (ADM)
- `PATCH /users/promote` (ADM)

## Donations
- `POST /donations` (JWT)
- `GET /donations/dashboard/by-diocese?year=YYYY&month=MM` (ADM/TESOUREIRO/ARRECADACAO)

## Products
- `GET /products`
- `POST /products` (ADM)

## Orders
- `POST /orders` (JWT)

## Campaigns
- `GET /campaigns`
- `GET /campaigns/:id`
- `POST /campaigns` (ADM)
- `POST /campaigns/:id/reserve`
- `GET /campaigns/:id/dashboard` (ADM/TESOUREIRO/ARRECADACAO)

## Swagger
- `/docs`


## Uploads (ADM)
- `POST /uploads` (multipart/form-data, campo `file`) → retorna `{ url }`
