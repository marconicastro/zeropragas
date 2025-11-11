# 📚 Documentação da API

## Endpoints

### POST /api/webhook-cakto

Processa eventos da plataforma Cakto (compras, abandonos de checkout, etc).

#### Rate Limiting
- **Limite:** 100 requisições por minuto por IP
- **Headers de resposta:**
  - `X-RateLimit-Limit`: Limite máximo
  - `X-RateLimit-Remaining`: Requisições restantes
  - `X-RateLimit-Reset`: Timestamp de reset
  - `Retry-After`: Segundos para retry (quando excedido)

#### Autenticação
Require `secret` no body da requisição (configurado via `CAKTO_SECRET`).

#### Request Body
```json
{
  "secret": "your-secret",
  "event": "purchase_approved" | "checkout_abandonment" | "purchase_refused",
  "data": {
    "id": "transaction-id",
    "amount": 39.9,
    "customer": {
      "email": "user@example.com",
      "phone": "11999999999",
      "name": "João Silva"
    },
    "product": {
      "name": "Product Name",
      "short_id": "hacr962"
    }
  }
}
```

#### Response Success (200)
```json
{
  "status": "success",
  "message": "Evento processado com sucesso",
  "webhook_version": "3.1-enterprise-unified-server",
  "request_id": "req_...",
  "event_id": "event_...",
  "processing_time_ms": 150,
  "result": { ... }
}
```

#### Response Error (429 - Rate Limit)
```json
{
  "status": "rate_limit_exceeded",
  "message": "Too many requests",
  "retryAfter": 30
}
```

---

### POST /api/meta-conversions

Envia eventos para Meta Conversions API (server-side).

#### Request Body
```json
{
  "eventName": "Purchase",
  "event_time": 1234567890,
  "action_source": "website",
  "event_source_url": "https://example.com",
  "user_data": {
    "em": "hashed_email",
    "ph": "hashed_phone",
    "fn": "hashed_firstname",
    "ln": "hashed_lastname"
  },
  "custom_data": {
    "value": 39.9,
    "currency": "BRL",
    "content_ids": ["hacr962"]
  }
}
```

#### Response
```json
{
  "success": true,
  "eventId": "event_...",
  "message": "Evento enviado com sucesso"
}
```

---

### GET /api/webhook-cakto

Retorna informações sobre o webhook e estatísticas.

#### Response
```json
{
  "status": "webhook_active",
  "webhook_version": "3.1-enterprise-unified-server",
  "statistics": {
    "totalProcessed": 100,
    "successCount": 95,
    "errorCount": 5,
    "purchaseApproved": 50,
    "checkoutAbandonment": 30
  }
}
```

---

## Códigos de Status

- `200` - Sucesso
- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (secret inválido)
- `405` - Method Not Allowed
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

---

## Headers Comuns

### Request
- `Content-Type: application/json`
- `X-Forwarded-For` ou `X-Real-IP` (para rate limiting)

### Response
- `Content-Type: application/json`
- `X-RateLimit-*` (quando aplicável)

