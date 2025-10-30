#!/bin/bash

# Script para salvar lead com dados REAIS no banco
# Isso vai permitir que o webhook use dados reais no Purchase

echo "💾 Salvando lead com dados REAIS no banco..."
echo ""

# Salvar lead com dados REAIS (coletados de API)
curl -X POST "http://localhost:3000/api/save-lead" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao.silva@exemplo.com",
    "phone": "5511977775555",
    "fullName": "João da Silva",
    "firstName": "João",
    "lastName": "Silva",
    "city": "São Paulo",
    "state": "SP",
    "zipcode": "01310-100",
    "country": "BR",
    "capturePage": "https://maracujazeropragas.com/",
    "utmSource": "facebook",
    "utmMedium": "cpc",
    "utmCampaign": "sistema_4_fases_v2",
    "ipAddress": "177.104.128.0",
    "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  }'

echo ""
echo ""
echo "⏳ Aguardando 2 segundos..."
sleep 2

echo "📦 Salvando segundo lead com dados REAIS..."
curl -X POST "http://localhost:3000/api/save-lead" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.santos@exemplo.com",
    "phone": "5521998887777",
    "fullName": "Maria Santos",
    "firstName": "Maria",
    "lastName": "Santos",
    "city": "Rio de Janeiro",
    "state": "RJ",
    "zipcode": "20040-020",
    "country": "BR",
    "capturePage": "https://maracujazeropragas.com/checkout",
    "utmSource": "google",
    "utmMedium": "organic",
    "utmCampaign": "trips_solucao",
    "ipAddress": "200.160.2.3",
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
  }'

echo ""
echo ""
echo "✅ Leads salvos! Agora vamos testar o webhook com dados REAIS..."
echo ""

# Testar webhook com dados REAIS do banco
echo "🧪 Testando Purchase com dados REAIS do banco..."
curl -X POST "http://localhost:3000/api/webhook-cakto" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "12f4848f-35e9-41a8-8da4-1032642e3e89",
    "event": "purchase_approved",
    "data": {
      "id": "purchase_dados_reais_001",
      "customer": {
        "name": "João da Silva",
        "email": "joao.silva@exemplo.com",
        "phone": "5511977775555"
      },
      "amount": 197.00,
      "status": "paid",
      "product": {
        "name": "Sistema 4 Fases Completo",
        "short_id": "hacr962"
      },
      "paymentMethod": "credit_card"
    }
  }'

echo ""
echo ""
echo "📊 Verificando resultados..."
echo "• Dashboard: http://localhost:3000/api/webhook-cakto/stats?format=html"
echo "• Banco de dados: npx tsx check-db.js"