#!/bin/bash

# Script de Teste do Webhook Cakto - MODO TESTE ATIVADO
# Este script envia eventos de teste para validar o webhook

echo "🧪 WEBHOOK CAKTO - MODO TESTE ATIVADO"
echo "======================================"
echo ""

# URL do webhook em modo teste
WEBHOOK_URL="http://localhost:3000/api/webhook-cakto"
SECRET="12f4848f-35e9-41a8-8da4-1032642e3e89"

echo "📡 Enviando evento de teste PURCHASE_APPROVED..."
echo ""

# Teste 1: Purchase Approved (valor simples)
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "'$SECRET'",
    "event": "purchase_approved",
    "data": {
      "id": "test_purchase_001",
      "customer": {
        "name": "João Silva",
        "email": "joao.silva@teste.com",
        "phone": "11999999999"
      },
      "amount": 39.90,
      "status": "paid",
      "product": {
        "name": "Sistema 4 Fases",
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
      "id": "test_purchase_002",
      "customer": {
        "name": "Maria Santos",
        "email": "maria.santos@teste.com",
        "phone": "11988888888"
      },
      "amount": 67.80,
      "status": "paid",
      "product": {
        "name": "Sistema 4 Fases + Bônus",
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
      "id": "test_abandonment_001",
      "customerEmail": "carlos.abandonado@teste.com",
      "customerName": "Carlos Abandonado",
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
echo "• Eventos com 'TEST' no nome"
echo "• Eventos com debug_mode: true"
echo "• Seus dados de teste (joao.silva, maria.santos, carlos.abandonado)"
echo ""
echo "📱 MODO TESTE ATIVADO: Todos os eventos estão marcados como teste"