# 🧪 GUIA COMPLETO DE TESTES - SISTEMA DE TRACKING

**Data**: 02 de Novembro de 2025  
**Status**: Pronto para Testes  
**Objetivo**: Validar 100% do sistema de rastreamento

---

## 📋 ÍNDICE

1. [Pré-requisitos](#pré-requisitos)
2. [Testes Rápidos (5 minutos)](#testes-rápidos-5-minutos)
3. [Testes Completos (20 minutos)](#testes-completos-20-minutos)
4. [Validação Meta Events Manager](#validação-meta-events-manager)
5. [Teste de Webhooks](#teste-de-webhooks)
6. [Checklist Final](#checklist-final)
7. [Troubleshooting](#troubleshooting)

---

## 📦 PRÉ-REQUISITOS

### 1. Variáveis de Ambiente

Verificar se o arquivo `.env.local` existe e contém:

```bash
# Meta Pixel
NEXT_PUBLIC_META_PIXEL_ID=642933108377475
NEXT_PUBLIC_BROWSER_PIXEL=false
NEXT_PUBLIC_CAPI_GATEWAY_URL=https://capig.maracujazeropragas.com/
NEXT_PUBLIC_TEST_EVENT_CODE=TEST60998

# Meta API (para webhook)
META_PIXEL_ID=642933108377475
META_ACCESS_TOKEN=seu_token_aqui

# Cakto
CAKTO_SECRET=12f4848f-35e9-41a8-8da4-1032642e3e89

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Iniciar Aplicação

```bash
# Instalar dependências (se necessário)
npm install

# Iniciar em desenvolvimento
npm run dev

# Aplicação estará em http://localhost:3000
```

### 3. Abrir DevTools

- Pressione `F12` ou `Ctrl+Shift+I`
- Ir na aba **Console**
- Limpar console: `Ctrl+L`

---

## ⚡ TESTES RÁPIDOS (5 MINUTOS)

### Teste 1: Meta Pixel Carregado

**Ação**: Carregar página inicial  
**URL**: `http://localhost:3000`

**Console deve mostrar:**
```
🎛️ SISTEMA DEFINITIVO - MODO: CAPI-ONLY
📡 Meta Pixel dispara SEMPRE para gerar eventos para CAPI Gateway
🎯 PageView com dados COMPLETOS - Nota garantida: 9.3/10
```

**Verificar:**
```javascript
// Copiar e colar no console:
console.log('Meta Pixel carregado?', typeof window.fbq !== 'undefined');
console.log('FBP:', document.cookie.split(';').find(c => c.includes('_fbp')));
```

✅ **Esperado**: 
- `true` para Meta Pixel
- Cookie `_fbp` deve existir

---

### Teste 2: PageView Event

**Deve aparecer automaticamente no console:**

```
🎯 PageView - Sistema Definitivo (Nota 9.5)
  🆔 Event ID: evt_1234567890_abc123
  📊 Dados pessoais: true
  🌍 Dados geográficos: true
  🔑 Deduplicação: ✅ Completa
  🎯 Enriquecimento Avançado: ✅ Facebook Ads + Dispositivo + Performance
  🎯 UTM Data: ⚠️ Ausente (normal se sem UTMs)
  🍪 FBP/FBC: ✅ FBP
  📈 Nota Esperada: 9.5+/10 ✅
```

✅ **Esperado**: Evento disparado com todos os checkmarks ✅

---

### Teste 3: ViewContent no Scroll

**Ação**: Rolar a página até 25%

**Console deve mostrar:**
```
🎯 ViewContent disparado no scroll 25% (Sistema Definitivo)
📊 ScrollDepth 25% disparado (Sistema Definitivo)
```

✅ **Esperado**: 
- ViewContent SÓ no 25%
- ScrollDepth em 25%, 50%, 75%, 90%

---

### Teste 4: UTMs Funcionando

**Ação**: Acessar com UTMs  
**URL**: `http://localhost:3000?utm_source=teste&utm_campaign=validacao&utm_medium=manual`

**Verificar no console:**
```javascript
// Copiar e colar:
import { getUTMManager } from '@/lib/utm-manager';
const utmManager = getUTMManager();
console.log('UTMs capturados:', utmManager?.getAll());
```

✅ **Esperado**: 
```javascript
{
  utm_source: "teste",
  utm_campaign: "validacao",
  utm_medium: "manual"
}
```

---

### Teste 5: FBP/FBC Capturado

**Verificar no console:**
```javascript
// Copiar e colar:
import { getMetaPixelCookies } from '@/lib/fbp-fbc-helper';
const cookies = getMetaPixelCookies();
console.log('FBP/FBC:', cookies);
```

✅ **Esperado**: 
```javascript
{
  fbp: "fb.1.1234567890.1234567890",
  fbc: null  // null se não veio de anúncio (OK)
}
```

---

## 🔬 TESTES COMPLETOS (20 MINUTOS)

### Teste Completo 1: Todos os Eventos

**Script de teste no console:**

```javascript
// Copiar e colar tudo de uma vez:

(async function testAllEvents() {
  console.log('🚀 INICIANDO TESTE COMPLETO DE EVENTOS');
  console.log('=======================================\n');
  
  // Importar funções
  const { 
    firePageViewDefinitivo,
    fireViewContentDefinitivo,
    fireScrollDepthDefinitivo,
    fireCTAClickDefinitivo,
    fireLeadDefinitivo,
    fireInitiateCheckoutDefinitivo
  } = await import('/src/lib/meta-pixel-definitivo');
  
  let passed = 0;
  let failed = 0;
  
  // Teste 1: PageView
  try {
    console.log('1️⃣ Testando PageView...');
    await firePageViewDefinitivo();
    console.log('✅ PageView OK\n');
    passed++;
  } catch (error) {
    console.error('❌ PageView FALHOU:', error);
    failed++;
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Teste 2: ViewContent
  try {
    console.log('2️⃣ Testando ViewContent...');
    await fireViewContentDefinitivo({ trigger_type: 'manual_test' });
    console.log('✅ ViewContent OK\n');
    passed++;
  } catch (error) {
    console.error('❌ ViewContent FALHOU:', error);
    failed++;
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Teste 3: ScrollDepth
  try {
    console.log('3️⃣ Testando ScrollDepth...');
    await fireScrollDepthDefinitivo(50);
    console.log('✅ ScrollDepth OK\n');
    passed++;
  } catch (error) {
    console.error('❌ ScrollDepth FALHOU:', error);
    failed++;
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Teste 4: CTAClick
  try {
    console.log('4️⃣ Testando CTAClick...');
    await fireCTAClickDefinitivo('Botão Teste', { test: true });
    console.log('✅ CTAClick OK\n');
    passed++;
  } catch (error) {
    console.error('❌ CTAClick FALHOU:', error);
    failed++;
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Teste 5: Lead
  try {
    console.log('5️⃣ Testando Lead...');
    await fireLeadDefinitivo({ test: true });
    console.log('✅ Lead OK\n');
    passed++;
  } catch (error) {
    console.error('❌ Lead FALHOU:', error);
    failed++;
  }
  
  await new Promise(r => setTimeout(r, 1000));
  
  // Teste 6: InitiateCheckout
  try {
    console.log('6️⃣ Testando InitiateCheckout...');
    await fireInitiateCheckoutDefinitivo({ test: true });
    console.log('✅ InitiateCheckout OK\n');
    passed++;
  } catch (error) {
    console.error('❌ InitiateCheckout FALHOU:', error);
    failed++;
  }
  
  // Resultado Final
  console.log('\n=======================================');
  console.log('🎯 RESULTADO FINAL:');
  console.log(`✅ Passaram: ${passed}/6`);
  console.log(`❌ Falharam: ${failed}/6`);
  console.log(`📊 Taxa de Sucesso: ${((passed/6)*100).toFixed(1)}%`);
  console.log('=======================================');
  
  if (passed === 6) {
    console.log('🎉 TODOS OS EVENTOS FUNCIONANDO PERFEITAMENTE!');
  } else {
    console.log('⚠️ Alguns eventos falharam. Verificar erros acima.');
  }
})();
```

✅ **Esperado**: 
```
✅ Passaram: 6/6
📊 Taxa de Sucesso: 100.0%
🎉 TODOS OS EVENTOS FUNCIONANDO PERFEITAMENTE!
```

---

### Teste Completo 2: Sistema de Monitoramento

**Script de teste:**

```javascript
// Ver métricas do sistema
import { showDashboard, getQuickMetrics } from '@/lib/tracking-monitor';

console.log('📊 MÉTRICAS RÁPIDAS:');
console.log(getQuickMetrics());

console.log('\n📈 DASHBOARD COMPLETO:');
showDashboard();
```

✅ **Esperado**: 
```javascript
{
  total: 6,
  success: 6,
  failureRate: "0.0%",
  qualityScore: 9.6,
  avgLatency: 95  // ms
}
```

---

### Teste Completo 3: Dados do Usuário

**Script de teste:**

```javascript
// Verificar dados completos
import { getCompleteUserData } from '@/lib/userData';

const userData = await getCompleteUserData();
console.log('👤 DADOS DO USUÁRIO:');
console.log({
  email: userData.email ? '✅' : '❌',
  phone: userData.phone ? '✅' : '❌',
  city: userData.city || 'fallback usado',
  state: userData.state || 'fallback usado',
  country: userData.country,
  sessionId: userData.sessionId,
  source: userData.source,
  confidence: userData.confidence + '%'
});
```

✅ **Esperado**: 
- Cidade e Estado capturados (via IP ou fallback)
- Confidence > 50%
- SessionId único

---

### Teste Completo 4: Fluxo de Lead

**Ação Manual:**

1. **Acessar**: `http://localhost:3000`
2. **Preencher formulário** (se existir) com:
   - Email: `teste@exemplo.com`
   - Nome: `João Silva`
   - Telefone: `11999999999`

3. **Verificar no console** se Lead foi disparado

4. **Verificar no banco de dados**:

```bash
# Em outro terminal
npx prisma studio
```

5. **Abrir**: `http://localhost:5555`
6. **Verificar tabela** `LeadUserData`
7. **Conferir campos**:
   - ✅ Email salvo
   - ✅ FBP salvo
   - ✅ UTMs salvos (se houver)

---

## 🎯 VALIDAÇÃO META EVENTS MANAGER

### Passo 1: Abrir Meta Events Manager

1. **URL**: https://business.facebook.com/events_manager2/list
2. **Selecionar Pixel**: `642933108377475`
3. **Ir em**: **Test Events**

### Passo 2: Filtrar Eventos de Teste

- **Test Event Code**: `TEST60998`
- **Filtrar**: Últimos 5 minutos

### Passo 3: Verificar Eventos

**Deve aparecer:**

| Evento | Status | Score Esperado |
|--------|--------|----------------|
| PageView | ✅ | 9.3+ |
| ViewContent | ✅ | 9.3+ |
| ScrollDepth | ✅ | 9.3+ |
| CTAClick | ✅ | 9.3+ |
| Lead | ✅ | 9.3+ |
| InitiateCheckout | ✅ | 9.3+ |

### Passo 4: Clicar em um Evento

**Verificar parâmetros:**

✅ **user_data presente:**
- `em` (email hash)
- `ph` (phone hash)
- `fn` (first name hash)
- `ln` (last name hash)
- `ct` (city hash)
- `st` (state hash)
- `country` (country hash)
- `fbp` (Facebook Browser ID)

✅ **custom_data presente:**
- `value`
- `currency`
- `content_ids`
- `content_name`
- 40+ outros parâmetros

✅ **event_id presente** (deduplicação)

---

## 🔗 TESTE DE WEBHOOKS

### Teste 1: Health Check

**Comando:**

```bash
curl http://localhost:3000/api/webhook-cakto
```

✅ **Esperado:**
```json
{
  "status": "webhook_active",
  "message": "Webhook Cakto Enterprise v3.1-enterprise-unified-server - O MELHOR WEBHOOK DO MUNDO! 🌍",
  "webhook_version": "3.1-enterprise-unified-server",
  "statistics": {
    "totalProcessed": 0,
    "successCount": 0,
    "purchaseApproved": 0
  }
}
```

---

### Teste 2: Purchase Approved (Simulado)

**Comando:**

```bash
curl -X POST http://localhost:3000/api/webhook-cakto \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "12f4848f-35e9-41a8-8da4-1032642e3e89",
    "event": "purchase_approved",
    "data": {
      "id": "test_transaction_123",
      "status": "paid",
      "amount": 39.9,
      "paymentMethod": "pix",
      "customer": {
        "email": "teste@exemplo.com",
        "phone": "11999999999",
        "name": "João Silva"
      },
      "product": {
        "name": "Sistema 4 Fases",
        "short_id": "hacr962"
      }
    }
  }'
```

✅ **Esperado:**
```json
{
  "status": "success",
  "message": "Evento purchase_approved processado com sucesso",
  "webhook_version": "3.1-enterprise-unified-server",
  "processing_time_ms": 150
}
```

**Verificar no console do Next.js:**
```
💰 PROCESSANDO PURCHASE_APPROVED COM VALIDAÇÃO CRUZADA
✅ User_data COMPLETO gerado (sua estrutura)
🎉 PURCHASE COM SUA ESTRUTURA ENVIADO!
```

---

### Teste 3: Checkout Abandonment (Simulado)

**Comando:**

```bash
curl -X POST http://localhost:3000/api/webhook-cakto \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "12f4848f-35e9-41a8-8da4-1032642e3e89",
    "event": "checkout_abandonment",
    "data": {
      "customerEmail": "abandono@exemplo.com",
      "customerName": "Maria Oliveira",
      "checkoutUrl": "https://pay.cakto.com.br/test",
      "offer": {
        "price": 39.9
      }
    }
  }'
```

✅ **Esperado:**
```json
{
  "status": "success",
  "message": "Evento checkout_abandonment processado com sucesso"
}
```

---

### Teste 4: Lead Capture API

**Comando:**

```bash
curl -X POST http://localhost:3000/api/lead-capture \
  -H "Content-Type: application/json" \
  -d '{
    "email": "novolead@exemplo.com",
    "phone": "11988888888",
    "name": "Carlos Santos",
    "city": "São Paulo",
    "state": "SP",
    "fbp": "fb.1.1234567890.1234567890",
    "utm_source": "teste",
    "utm_campaign": "validacao"
  }'
```

✅ **Esperado:**
```json
{
  "success": true,
  "message": "Lead capturado com sucesso",
  "leadId": "clxxx...",
  "isNew": true
}
```

**Verificar no banco:**
```bash
npx prisma studio
```
- Ir em `LeadUserData`
- Encontrar lead com email `novolead@exemplo.com`
- ✅ FBP deve estar salvo
- ✅ UTMs devem estar salvos

---

## ✅ CHECKLIST FINAL

### Configuração
- [ ] `.env.local` configurado
- [ ] Meta Pixel ID correto
- [ ] CAPI Gateway URL correto
- [ ] Test Event Code configurado
- [ ] Banco de dados funcionando

### Eventos Client-Side
- [ ] PageView dispara automaticamente
- [ ] ViewContent dispara em 25% scroll
- [ ] ScrollDepth dispara em 25%, 50%, 75%, 90%
- [ ] Eventos aparecem no console com ✅
- [ ] FBP capturado em todos os eventos
- [ ] UTMs incluídos quando presentes

### Dados do Usuário
- [ ] Geolocalização funciona (cidade/estado)
- [ ] Hash SHA-256 aplicado a PII
- [ ] SessionId gerado e persistido
- [ ] Dados salvos no localStorage

### Meta Events Manager
- [ ] Eventos aparecem em Test Events
- [ ] Event Match Quality > 9.0
- [ ] user_data presente e completo
- [ ] custom_data presente
- [ ] event_id presente (deduplicação)

### Webhooks
- [ ] Health check responde
- [ ] Purchase approved processa
- [ ] Checkout abandonment processa
- [ ] Lead capture salva no banco
- [ ] FBP/FBC recuperados do banco

### Monitoramento
- [ ] Métricas sendo coletadas
- [ ] Dashboard funciona
- [ ] Sem alertas críticos
- [ ] Quality Score estimado > 9.0

---

## 🔧 TROUBLESHOOTING

### Problema 1: Meta Pixel não carrega

**Sintomas:**
```
typeof window.fbq === 'undefined'
```

**Soluções:**
1. Verificar se `MetaPixelDefinitivo` está no layout
2. Aguardar 2-3 segundos após carregar página
3. Verificar bloqueador de anúncios (desativar)
4. Testar em aba anônima

---

### Problema 2: FBP não aparece

**Sintomas:**
```
Cookie _fbp não encontrado
```

**Soluções:**
1. Aguardar Meta Pixel carregar (2-3s)
2. Verificar cookies no DevTools (Application > Cookies)
3. Limpar cookies e recarregar
4. Verificar domain do cookie

---

### Problema 3: UTMs não salvam

**Sintomas:**
```
UTMs capturados: {}
```

**Soluções:**
1. Verificar se URL tem UTMs: `?utm_source=teste`
2. Verificar localStorage: `localStorage.getItem('maracuja_utm_data')`
3. Limpar localStorage: `localStorage.clear()`
4. Recarregar com UTMs

---

### Problema 4: Eventos não aparecem no Meta

**Sintomas:**
- Console mostra eventos OK
- Mas não aparecem no Test Events

**Soluções:**
1. Verificar Test Event Code no .env
2. Aguardar 30-60 segundos
3. Filtrar por código correto: `TEST60998`
4. Verificar CAPI Gateway URL
5. Testar sem VPN

---

### Problema 5: Webhook retorna erro 401

**Sintomas:**
```json
{
  "status": "error",
  "error": "invalid_secret"
}
```

**Soluções:**
1. Verificar secret no .env: `CAKTO_SECRET`
2. Secret correto: `12f4848f-35e9-41a8-8da4-1032642e3e89`
3. Verificar JSON no curl (copiar exatamente)

---

### Problema 6: Banco de dados não salva

**Sintomas:**
```
Error: PrismaClient is not available
```

**Soluções:**
1. Rodar migrations: `npx prisma migrate dev`
2. Gerar cliente: `npx prisma generate`
3. Verificar DATABASE_URL no .env
4. Reiniciar servidor

---

## 🎯 SCRIPT DE TESTE AUTOMÁTICO

**Arquivo**: `test-tracking-system.js`

Criar na raiz do projeto:

```javascript
// test-tracking-system.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const WEBHOOK_SECRET = '12f4848f-35e9-41a8-8da4-1032642e3e89';

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    console.log(`\n🧪 ${name}...`);
    await fn();
    console.log(`✅ ${name} - PASSOU`);
    passed++;
  } catch (error) {
    console.error(`❌ ${name} - FALHOU:`, error.message);
    failed++;
  }
}

async function main() {
  console.log('🚀 INICIANDO TESTES AUTOMATIZADOS');
  console.log('=' .repeat(50));

  // Teste 1: Health Check Webhook
  await test('Health Check Webhook', async () => {
    const response = await axios.get(`${BASE_URL}/api/webhook-cakto`);
    if (response.data.status !== 'webhook_active') throw new Error('Webhook não ativo');
  });

  // Teste 2: Purchase Approved
  await test('Purchase Approved', async () => {
    const response = await axios.post(`${BASE_URL}/api/webhook-cakto`, {
      secret: WEBHOOK_SECRET,
      event: 'purchase_approved',
      data: {
        id: 'test_' + Date.now(),
        status: 'paid',
        amount: 39.9,
        paymentMethod: 'pix',
        customer: {
          email: 'teste@exemplo.com',
          phone: '11999999999',
          name: 'Teste Automatizado'
        },
        product: {
          name: 'Sistema 4 Fases',
          short_id: 'hacr962'
        }
      }
    });
    if (response.data.status !== 'success') throw new Error('Purchase não processado');
  });

  // Teste 3: Lead Capture
  await test('Lead Capture', async () => {
    const response = await axios.post(`${BASE_URL}/api/lead-capture`, {
      email: 'teste' + Date.now() + '@exemplo.com',
      phone: '11988888888',
      name: 'Teste Lead',
      city: 'São Paulo',
      state: 'SP',
      fbp: 'fb.1.1234567890.1234567890',
      utm_source: 'teste_automatizado'
    });
    if (!response.data.success) throw new Error('Lead não capturado');
  });

  // Teste 4: Checkout Abandonment
  await test('Checkout Abandonment', async () => {
    const response = await axios.post(`${BASE_URL}/api/webhook-cakto`, {
      secret: WEBHOOK_SECRET,
      event: 'checkout_abandonment',
      data: {
        customerEmail: 'abandono' + Date.now() + '@exemplo.com',
        customerName: 'Teste Abandono',
        checkoutUrl: 'https://test.com',
        offer: { price: 39.9 }
      }
    });
    if (response.data.status !== 'success') throw new Error('Abandonment não processado');
  });

  // Resultado Final
  console.log('\n' + '='.repeat(50));
  console.log('🎯 RESULTADO FINAL:');
  console.log(`✅ Passaram: ${passed}/${passed + failed}`);
  console.log(`❌ Falharam: ${failed}/${passed + failed}`);
  console.log(`📊 Taxa de Sucesso: ${((passed/(passed+failed))*100).toFixed(1)}%`);
  console.log('='.repeat(50));

  if (failed === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM!');
  } else {
    console.log('⚠️  Alguns testes falharam. Verificar logs acima.');
    process.exit(1);
  }
}

main().catch(console.error);
```

**Rodar:**
```bash
node test-tracking-system.js
```

---

## 🎉 CONCLUSÃO

### Se TODOS os testes passarem:

✅ **Sistema 100% Funcional**
✅ **Pronto para Produção**
✅ **Quality Score 9.6/10 Confirmado**

### Próximo Passo:

1. Deploy na Vercel
2. Configurar variáveis de ambiente na Vercel
3. Testar em produção com Test Event Code
4. Remover Test Event Code quando confirmar
5. Monitorar conversões reais

---

**Documentação criada em**: 02/11/2025  
**Status**: ✅ Pronto para Testes  
**Tempo Estimado**: 20-30 minutos (completo)
