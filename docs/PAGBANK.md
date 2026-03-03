# PagBank (PIX + Cartão) — Integração

A pasta `backend/src/modules/payments/` já contém:
- criação de Payment no banco
- placeholders prontos para chamar a API PagBank (PIX/Cartão)
- webhook com verificação de assinatura HMAC SHA256 (`x-signature`)

## O que você precisa colocar
1) Preencher `.env`:
- `PAGBANK_BASE_URL`
- `PAGBANK_TOKEN`
- `PAGBANK_WEBHOOK_SECRET`

2) Trocar o "placeholder" em `PaymentsService.createPayment()` pela chamada real do PagBank.

## Webhook
Endpoint:
- `POST /payments/webhook/pagbank`

Recomendação:
- No PagBank, configure para enviar status (PAID/CONFIRMED/CANCELED/FAILED).
- Enviar header `x-signature` com HMAC SHA256 do rawBody usando `PAGBANK_WEBHOOK_SECRET`.
