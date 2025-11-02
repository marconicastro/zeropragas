#!/usr/bin/env node

/**
 * 🧪 Script de Testes Automatizados - APIs
 * 
 * Testa todos os endpoints do sistema de tracking
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const WEBHOOK_SECRET = process.env.CAKTO_SECRET || '12f4848f-35e9-41a8-8da4-1032642e3e89';

// Cores para console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

let passed = 0;
let failed = 0;
let startTime = Date.now();

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logTest(name, status, time = null) {
  const emoji = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏳';
  const color = status === 'passed' ? 'green' : status === 'failed' ? 'red' : 'yellow';
  const timeStr = time !== null ? ` (${time}ms)` : '';
  log(`${emoji} ${name}${timeStr}`, color);
}

async function test(name, fn) {
  const testStart = Date.now();
  
  try {
    log(`\n🧪 ${name}...`, 'cyan');
    await fn();
    
    const elapsed = Date.now() - testStart;
    logTest(name, 'passed', elapsed);
    passed++;
  } catch (error) {
    const elapsed = Date.now() - testStart;
    logTest(name, 'failed', elapsed);
    log(`   Erro: ${error.message}`, 'red');
    failed++;
  }
}

// Testes

async function testHealthCheck() {
  const response = await fetch(`${BASE_URL}/api/webhook-cakto`);
  const data = await response.json();
  
  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }
  
  if (data.status !== 'webhook_active') {
    throw new Error('Webhook não está ativo');
  }
  
  log(`   Version: ${data.webhook_version}`, 'blue');
  log(`   Stats: ${data.statistics.totalProcessed} processados`, 'blue');
}

async function testPurchaseApproved() {
  const response = await fetch(`${BASE_URL}/api/webhook-cakto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: WEBHOOK_SECRET,
      event: 'purchase_approved',
      data: {
        id: `test_${Date.now()}`,
        status: 'paid',
        amount: 39.9,
        paymentMethod: 'pix',
        customer: {
          email: 'teste.auto@exemplo.com',
          phone: '11999999999',
          name: 'Teste Automatizado',
          address: {
            city: 'São Paulo',
            state: 'SP',
            zipcode: '01310-100'
          }
        },
        product: {
          name: 'Sistema 4 Fases',
          short_id: 'hacr962'
        },
        offer: {
          id: 'hacr962'
        }
      }
    })
  });
  
  const data = await response.json();
  
  if (response.status !== 200) {
    throw new Error(`Status ${response.status}: ${JSON.stringify(data)}`);
  }
  
  if (data.status !== 'success') {
    throw new Error(`Webhook retornou status: ${data.status}`);
  }
  
  log(`   Transaction: ${data.result?.transaction_data?.id}`, 'blue');
  log(`   Processing Time: ${data.processing_time_ms}ms`, 'blue');
}

async function testCheckoutAbandonment() {
  const response = await fetch(`${BASE_URL}/api/webhook-cakto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: WEBHOOK_SECRET,
      event: 'checkout_abandonment',
      data: {
        customerEmail: `abandono.${Date.now()}@exemplo.com`,
        customerName: 'Teste Abandono Automatizado',
        checkoutUrl: 'https://pay.cakto.com.br/test',
        offer: {
          price: 39.9,
          id: 'hacr962'
        }
      }
    })
  });
  
  const data = await response.json();
  
  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }
  
  if (data.status !== 'success') {
    throw new Error(`Webhook retornou status: ${data.status}`);
  }
  
  log(`   Event Type: ${data.result?.event_type}`, 'blue');
}

async function testLeadCapture() {
  const email = `teste.${Date.now()}@exemplo.com`;
  
  const response = await fetch(`${BASE_URL}/api/lead-capture`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      phone: '11988888888',
      name: 'Teste Lead Auto',
      city: 'São Paulo',
      state: 'SP',
      zipcode: '01310-100',
      fbp: 'fb.1.1234567890.test',
      utm_source: 'teste_automatizado',
      utm_campaign: 'validacao_apis',
      capture_source: 'teste_script'
    })
  });
  
  const data = await response.json();
  
  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }
  
  if (!data.success) {
    throw new Error(data.error || 'Lead não capturado');
  }
  
  log(`   Lead ID: ${data.leadId}`, 'blue');
  log(`   Is New: ${data.isNew}`, 'blue');
  log(`   Email: ${email}`, 'blue');
}

async function testLeadQuery() {
  // Usar email do teste anterior (assumindo que foi criado)
  const response = await fetch(`${BASE_URL}/api/lead-capture?email=teste.auto@exemplo.com`);
  
  if (response.status === 404) {
    log('   Lead não encontrado (OK se é primeira execução)', 'yellow');
    return; // Não é erro
  }
  
  const data = await response.json();
  
  if (response.status !== 200) {
    throw new Error(`Status ${response.status}`);
  }
  
  if (!data.success) {
    throw new Error('Query falhou');
  }
  
  log(`   Lead encontrado: ${data.lead?.email}`, 'blue');
  log(`   Eventos: ${data.lead?.eventsCount || 0}`, 'blue');
}

async function testInvalidSecret() {
  const response = await fetch(`${BASE_URL}/api/webhook-cakto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: 'invalid_secret_123',
      event: 'purchase_approved',
      data: {
        id: 'test_invalid',
        status: 'paid',
        amount: 39.9
      }
    })
  });
  
  if (response.status !== 401) {
    throw new Error(`Esperado 401, recebido ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.status !== 'error' || data.error !== 'invalid_secret') {
    throw new Error('Validação de secret não funcionou');
  }
  
  log('   Validação de secret OK', 'blue');
}

async function testDuplicateEvent() {
  const transactionId = `duplicate_test_${Date.now()}`;
  
  // Primeiro envio
  const response1 = await fetch(`${BASE_URL}/api/webhook-cakto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: WEBHOOK_SECRET,
      event: 'purchase_approved',
      data: {
        id: transactionId,
        status: 'paid',
        amount: 39.9,
        paymentMethod: 'pix',
        customer: {
          email: 'duplicate@test.com',
          phone: '11999999999',
          name: 'Duplicate Test'
        },
        product: {
          name: 'Test Product',
          short_id: 'test'
        }
      }
    })
  });
  
  const data1 = await response1.json();
  
  if (data1.status !== 'success') {
    throw new Error('Primeiro envio falhou');
  }
  
  // Aguardar um pouco
  await new Promise(r => setTimeout(r, 100));
  
  // Segundo envio (duplicado)
  const response2 = await fetch(`${BASE_URL}/api/webhook-cakto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: WEBHOOK_SECRET,
      event: 'purchase_approved',
      data: {
        id: transactionId,
        status: 'paid',
        amount: 39.9,
        paymentMethod: 'pix',
        customer: {
          email: 'duplicate@test.com',
          phone: '11999999999',
          name: 'Duplicate Test'
        },
        product: {
          name: 'Test Product',
          short_id: 'test'
        }
      }
    })
  });
  
  const data2 = await response2.json();
  
  if (data2.status !== 'duplicate_ignored') {
    throw new Error('Duplicata não foi detectada');
  }
  
  log('   Prevenção de duplicatas OK', 'blue');
}

async function testClientInfo() {
  try {
    const response = await fetch(`${BASE_URL}/api/client-info`);
    
    if (response.status !== 200) {
      log('   API não disponível (OK)', 'yellow');
      return;
    }
    
    const data = await response.json();
    log(`   IP: ${data.ip || 'não detectado'}`, 'blue');
    log(`   City: ${data.city || 'não detectado'}`, 'blue');
  } catch (error) {
    log('   API não disponível (OK)', 'yellow');
  }
}

// Executar todos os testes
async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🚀 INICIANDO TESTES AUTOMATIZADOS DE APIs', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  log(`📍 Base URL: ${BASE_URL}`, 'blue');
  log(`🔑 Secret: ${WEBHOOK_SECRET.substring(0, 8)}...`, 'blue');
  
  // Testes básicos
  await test('1. Health Check - Webhook', testHealthCheck);
  await test('2. Purchase Approved', testPurchaseApproved);
  await test('3. Checkout Abandonment', testCheckoutAbandonment);
  await test('4. Lead Capture - Criar', testLeadCapture);
  await test('5. Lead Capture - Consultar', testLeadQuery);
  
  // Testes de segurança
  await test('6. Validação de Secret Inválido', testInvalidSecret);
  await test('7. Prevenção de Duplicatas', testDuplicateEvent);
  
  // Teste opcional
  await test('8. Client Info API', testClientInfo);
  
  // Resultado final
  const totalTime = Date.now() - startTime;
  const total = passed + failed;
  const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  
  log('\n' + '='.repeat(60), 'cyan');
  log('🎯 RESULTADO FINAL', 'cyan');
  log('='.repeat(60), 'cyan');
  log(`✅ Passaram: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  log(`❌ Falharam: ${failed}/${total}`, failed > 0 ? 'red' : 'green');
  log(`📊 Taxa de Sucesso: ${successRate}%`, successRate >= 90 ? 'green' : 'yellow');
  log(`⏱️  Tempo Total: ${(totalTime / 1000).toFixed(2)}s`, 'blue');
  log('='.repeat(60) + '\n', 'cyan');
  
  if (passed === total) {
    log('🎉 TODOS OS TESTES PASSARAM!', 'green');
    log('✨ Sistema de APIs está funcionando perfeitamente!', 'green');
  } else if (successRate >= 75) {
    log('⚠️  Maioria dos testes passou, mas alguns falharam', 'yellow');
    log('📝 Verificar logs acima para detalhes', 'yellow');
  } else {
    log('❌ Vários testes falharam', 'red');
    log('🔍 Verificar configuração e logs do servidor', 'red');
  }
  
  log('');
  
  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

// Verificar se fetch está disponível (Node 18+)
if (typeof fetch === 'undefined') {
  log('❌ fetch não está disponível', 'red');
  log('📝 Use Node.js 18+ ou instale node-fetch', 'yellow');
  process.exit(1);
}

// Executar testes
runAllTests().catch(error => {
  log(`\n❌ Erro crítico: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
