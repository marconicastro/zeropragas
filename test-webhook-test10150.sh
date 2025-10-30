#!/bin/bash

# Script de Teste do Webhook Cakto - Código TEST10150
# Este script envia eventos de teste para validar o webhook com código personalizado

echo "🧪 WEBHOOK CAKTO - CÓDIGO DE TESTE: TEST10150"
echo "=============================================="
echo ""

# URL do webhook em modo teste
WEBHOOK_URL="http://localhost:3000/api/webhook-cakto"
SECRET="12f4848f-35e9-41a8-8da4-1032642e3e89"
TEST_CODE="TEST10150"

echo "📡 Enviando evento de teste PURCHASE_APPROVED..."
echo "Código de Teste: $TEST_CODE"
echo ""

# Teste 1: Purchase Approved (valor simples)
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "'$SECRET'",
    "event": "purchase_approved",
    "data": {
      "id": "test10150_purchase_001",
      "customer": {
        "name": "João TEST10150",
        "email": "joao.test10150@validacao.com",
        "phone": "11999999999"
      },
      "amount": 39.90,
      "status": "paid",
      "product": {
        "name": "Sistema 4 Fases - TEST10150",
        "short_id": "hacr962"
      },
      "paymentMethod": "pix"
    }
  }'

echo ""
echo ""
echo "⏳ Aguardando 2 segundos..."
sleep 2

echo "📡 Enviando evento de teste PURCHASE_APPROVED (com Order Bump)..."
echo ""

# Teste 2: Purchase Approved (com order bump)
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "'$SECRET'",
    "event": "purchase_approved",
    "data": {
      "id": "test10150_purchase_002",
      "customer": {
        "name": "Maria TEST10150",
        "email": "maria.test10150@validacao.com",
        "phone": "11988888888"
      },
      "amount": 67.80,
      "status": "paid",
      "product": {
        "name": "Sistema 4 Fases + Bônus - TEST10150",
        "short_id": "hacr962"
      },
      "paymentMethod": "credit_card"
    }
  }'

echo ""
echo ""
echo "⏳ Aguardando 2 segundos..."
sleep 2

echo "📡 Enviando evento de teste CHECKOUT_ABANDONMENT..."
echo ""

# Teste 3: Checkout Abandonment
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "'$SECRET'",
    "event": "checkout_abandonment",
    "data": {
      "id": "test10150_abandonment_001",
      "customerEmail": "carlos.test10150@validacao.com",
      "customerName": "Carlos TEST10150",
      "offer": {
        "id": "hacr962",
        "price": 39.90
      },
      "checkoutUrl": "https://maracujazeropragas.com/checkout/hacr962"
    }
  }'

echo ""
echo ""
echo "✅ Testes concluídos!"
echo ""
echo "📊 Verifique os resultados:"
echo "• Dashboard: http://localhost:3000/api/webhook-cakto/stats?format=html"
echo "• JSON API: http://localhost:3000/api/webhook-cakto/stats"
echo ""
echo "🔍 No Meta Events Manager, procure por:"
echo "• Código de teste: TEST10150"
echo "• Eventos com debug_mode: true"
echo "• Seus dados de teste (@validacao.com)"
echo "• Event IDs: test10150_purchase_001, test10150_purchase_002, test10150_abandonment_001"
echo ""
echo "📱 CÓDIGO DE TESTE PERSONALIZADO: TEST10150"