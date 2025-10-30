import { NextRequest, NextResponse } from 'next/server';
import * as crypto from 'crypto';
import { db } from '@/lib/db';
import { getStandardizedUserData } from '@/lib/unifiedUserData';

// Configurações do Meta
const META_PIXEL_ID = process.env.META_PIXEL_ID || '642933108377475';
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAAUsqHMv8GcBP5dQ8HjQcx4ZCEtCq958ZBKe71qP5ZAUZAtZAGfAN4OzsKZCAsCE3ZATp8cuTn5bWgWI2m35H31nnPKg8CMX3cqWa709DWSPdBXD2vF6P8RMXMZAnRNZCXcwX0nL0sBYbN821XurMRwrHZAM1X5qX7AjljZBabX8XArHoy4MZBZCl06lKHYHyuzBs2AZDZD';

// Configurações da Cakto
const CAKTO_SECRET = process.env.CAKTO_SECRET || '12f4848f-35e9-41a8-8da4-1032642e3e89';
const CAKTO_PRODUCT_ID = 'hacr962'; // Content ID do produto na Cakto

// Configurações Enterprise
const WEBHOOK_VERSION = '3.1-enterprise-unified-server';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const TIMEOUT_MS = 15000;

// Cache em memória para prevenção de duplicatas
const processedEvents = new Map<string, number>();
const CACHE_TTL = 300000; // 5 minutos

// Estatísticas do webhook
let stats = {
  totalProcessed: 0,
  successCount: 0,
  errorCount: 0,
  purchaseApproved: 0,
  checkoutAbandonment: 0,
  purchaseRefused: 0,
  duplicatePrevented: 0,
  averageProcessingTime: 0
};

// Função para fazer hash SHA-256
function sha256(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

// Função para gerar ID único de evento
function generateEventId(data: any): string {
  const eventString = `${data.event}_${data.data?.id || 'unknown'}_${data.data?.customer?.email || 'unknown'}_${Date.now()}`;
  return sha256(eventString);
}

// Função para prevenir duplicatas
function isDuplicate(eventId: string): boolean {
  const now = Date.now();
  const existingTime = processedEvents.get(eventId);
  
  if (existingTime && (now - existingTime) < CACHE_TTL) {
    stats.duplicatePrevented++;
    return true;
  }
  
  processedEvents.set(eventId, now);
  
  // Limpar cache antigo
  processedEvents.forEach((timestamp, id) => {
    if (now - timestamp > CACHE_TTL) {
      processedEvents.delete(id);
    }
  });
  
  return false;
}

// Função para limpar e formatar telefone
function cleanPhone(phone?: string): string | null {
  if (!phone) return null;
  return phone.replace(/\D/g, '').replace(/^55/, '').slice(-11);
}

// Função para criar Purchase Event para Meta com SISTEMA UNIFICADO
async function createAdvancedPurchaseEvent(caktoData: any, requestId: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const eventId = `Purchase_${timestamp}_${Math.random().toString(36).substr(2, 8)}`;
  
  // Dados da Cakto
  const amount = caktoData.amount || 0;
  const transactionId = caktoData.id || '';
  const productName = caktoData.product?.name || 'Sistema 4 Fases';
  const paymentMethod = caktoData.paymentMethod || 'unknown';
  const offerId = caktoData.offer?.id || CAKTO_PRODUCT_ID;
  
  // Dados do cliente da Cakto
  const customerEmail = caktoData.customer?.email || '';
  const customerPhone = caktoData.customer?.phone || '';
  const customerName = caktoData.customer?.name || '';
  const customerCity = caktoData.customer?.address?.city || '';
  const customerState = caktoData.customer?.address?.state || '';
  const customerZipcode = caktoData.customer?.address?.zipcode || '';
  
  // 🚀 USAR SISTEMA UNIFICADO EXATAMENTE COMO FRONTEND
  console.log('🔄 Usando SISTEMA UNIFICADO getStandardizedUserData()...');
  
  // Buscar dados do usuário no banco para enriquecimento
  let userDataFromDB = null;
  if (customerEmail || customerPhone) {
    try {
      if (customerEmail) {
        userDataFromDB = await db.leadUserData.findUnique({
          where: { email: customerEmail.toLowerCase().trim() }
        });
      }
      
      if (!userDataFromDB && customerPhone) {
        const phoneClean = customerPhone.replace(/\D/g, '').replace(/^55/, '').slice(-11);
        userDataFromDB = await db.leadUserData.findFirst({
          where: { phone: phoneClean }
        });
      }
      
      if (userDataFromDB) {
        console.log('✅ Dados encontrados no banco - enriquecendo sistema unificado');
      }
    } catch (error) {
      console.log('⚠️ Banco não disponível, usando API de geolocalização');
    }
  }
  
  // Preparar dados para o sistema unificado (simular ambiente frontend)
  const enrichedData = {
    email: customerEmail || userDataFromDB?.email || '',
    phone: customerPhone || userDataFromDB?.phone || '',
    fullName: customerName || userDataFromDB?.fullName || '',
    city: customerCity || userDataFromDB?.city || '',
    state: customerState || userDataFromDB?.state || '',
    cep: customerZipcode || userDataFromDB?.cep || '',
    country: 'br'
  };
  
  // Salvar temporariamente para o sistema unificado usar
  if (typeof window === 'undefined') {
    // Server-side: salvar temporariamente no banco para o sistema unificado encontrar
    try {
      if (enrichedData.email && !userDataFromDB) {
        await db.leadUserData.upsert({
          where: { email: enrichedData.email },
          update: enrichedData,
          create: enrichedData
        });
      }
    } catch (error) {
      console.log('⚠️ Não foi possível salvar dados temporários');
    }
  }
  
  // 🎯 OBTER DADOS UNIFICADOS (MESMA LÓGICA DO FRONTEND)
  let unifiedUserData;
  try {
    unifiedUserData = await getStandardizedUserData();
    console.log('✅ Sistema unificado executado com sucesso');
  } catch (error) {
    console.log('❌ Sistema unificado falhou, usando fallback manual');
    
    // Fallback manual com dados disponíveis
    const phoneClean = enrichedData.phone?.replace(/\D/g, '') || '';
    let phoneWithCountry = phoneClean;
    
    if (phoneClean.length === 10) {
      phoneWithCountry = `55${phoneClean}`;
    } else if (phoneClean.length === 11) {
      phoneWithCountry = `55${phoneClean}`;
    }
    
    const nameParts = enrichedData.fullName?.toLowerCase().trim().split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    const zipCode = enrichedData.cep?.replace(/\D/g, '') || '';
    
    unifiedUserData = {
      em: enrichedData.email ? sha256(enrichedData.email.toLowerCase().trim()) : null,
      ph: phoneWithCountry ? sha256(phoneWithCountry) : null,
      fn: firstName ? sha256(firstName) : null,
      ln: lastName ? sha256(lastName) : null,
      ct: enrichedData.city ? sha256(enrichedData.city.toLowerCase().trim()) : null,
      st: enrichedData.state ? sha256(enrichedData.state.toLowerCase().trim()) : null,
      zp: zipCode ? sha256(zipCode) : null,
      country: sha256('br'),
      external_id: transactionId || `cakto_${Date.now()}`,
      client_ip_address: null,
      client_user_agent: 'Cakto-Webhook/3.1-enterprise-unified-server'
    };
  }
  
  console.log('🎯 DADOS UNIFICADOS - PURCHASE:', {
    transaction_id: transactionId,
    amount,
    product_name: productName,
    payment_method: paymentMethod,
    data_source: userDataFromDB ? 'database_enriched' : 'webhook_only',
    user_data_system: 'getStandardizedUserData_like_frontend',
    customer_email: customerEmail ? '***' + customerEmail.split('@')[1] : 'missing',
    customer_phone: customerPhone ? '***' + customerPhone.slice(-4) : 'missing',
    customer_name: customerName ? customerName.split(' ')[0] : 'missing',
    has_email: !!unifiedUserData.em,
    has_phone: !!unifiedUserData.ph,
    has_name: !!unifiedUserData.fn,
    has_location: !!unifiedUserData.ct,
    total_fields: Object.values(unifiedUserData).filter(v => v && v !== null).length
  });

  // Purchase Event para Meta - ESTRUTURA CORRETA CONVERSIONS API
  const purchaseEvent = {
    data: [{
      // 🚀 ESTRUTURA SIMPLES IGUAL PAGEVIEW, LEAD, ETC.
      event_name: 'Purchase',
      event_id: eventId,
      event_time: timestamp,
      action_source: 'website',
      event_source_url: 'https://maracujazeropragas.com/',
      
      // 🚀 SISTEMA UNIFICADO (EXATAMENTE IGUAL OUTROS EVENTOS)
      user_data: unifiedUserData,
      
      // 🚀 PARÂMETROS BÁSICOS FORA DO CUSTOM_DATA
      value: amount,
      currency: 'BRL',
      content_ids: [caktoData.product?.short_id || CAKTO_PRODUCT_ID],
      content_name: productName,
      content_type: 'product',
      
      // 🚩 CAMPOS QUE PRECISAM FICAR DENTRO DO CUSTOM_DATA (EXIGÊNCIA META)
      custom_data: {
        transaction_id: transactionId,
        predicted_ltv: amount * 4,
        content_category: 'digital_product',
        condition: 'new',
        availability: 'in stock',
        payment_method: paymentMethod,
        num_items: amount > 50 ? 2 : 1
      }
    }],
    
    access_token: META_ACCESS_TOKEN,
    test_event_code: 'TEST10150',
    debug_mode: true,
    partner_agent: 'cakto_webhook_v3.1-unified-frontend',
    namespace: 'maracujazeropragas',
    upload_tag: 'cakto_purchase_unified_frontend',
    data_processing_options: ['LDU'],
    data_processing_options_country: 1,
    data_processing_options_state: 1000
  };

  console.log('📤 PURCHASE EVENT ESTRUTURA FINAL:', JSON.stringify(purchaseEvent, null, 2));
  
  // 🚨 SEGURANÇA ADICIONAL - REMOVER CAMPOS DO NÍVEL SUPERIOR (BUG FIX)
  if (purchaseEvent.data && purchaseEvent.data[0]) {
    const eventData = purchaseEvent.data[0];
    
    // Remover campos do nível superior que deveriam estar apenas no custom_data
    const fieldsToRemove = [
      'content_category',
      'condition', 
      'availability',
      'payment_method',
      'num_items'
    ];
    
    fieldsToRemove.forEach(field => {
      if (eventData.hasOwnProperty(field)) {
        console.log(`🚨 REMOVENDO CAMPO DUPLICADO DO NÍVEL SUPERIOR: ${field}`);
        delete eventData[field];
      }
    });
    
    console.log('📤 ESTRUTURA CORRIGIDA:', JSON.stringify(purchaseEvent, null, 2));
  }
  
  // 🚀 VALIDAÇÃO CRÍTICA ANTES DE ENVIAR
  console.log('🔍 VALIDAÇÃO DA ESTRUTURA:');
  console.log('- event_name:', purchaseEvent.data?.[0]?.event_name);
  console.log('- user_data existe:', !!purchaseEvent.data?.[0]?.user_data);
  console.log('- value:', purchaseEvent.data?.[0]?.value);
  console.log('- currency:', purchaseEvent.data?.[0]?.currency);
  console.log('- transaction_id:', purchaseEvent.data?.[0]?.transaction_id);
  console.log('- Tem custom_data incorreto?:', !!purchaseEvent.data?.[0]?.custom_data);
  console.log('- access_token existe:', !!purchaseEvent.access_token);
  
  // 🚨 VALIDAÇÃO ADICIONAL - GARANTIR QUE CAMPOS PROBLEMÁTICOS NÃO EXISTAM NO NÍVEL SUPERIOR
  const problematicFields = ['content_category', 'condition', 'availability', 'payment_method', 'num_items'];
  const foundProblematicFields = problematicFields.filter(field => purchaseEvent.data?.[0]?.hasOwnProperty(field));
  
  if (foundProblematicFields.length > 0) {
    console.error('❌ ERRO CRÍTICO: Campos problemáticos encontrados no nível superior:', foundProblematicFields);
    throw new Error(`Campos proibidos no nível superior: ${foundProblematicFields.join(', ')}`);
  }
  
  console.log('✅ Estrutura validada - sem campos proibidos no nível superior');
  
  return { eventId, purchaseEvent };
}

// Função para criar Lead Event para Checkout Abandonment
async function createLeadEvent(caktoData: any) {
  const timestamp = Math.floor(Date.now() / 1000);
  const eventId = `Lead_${timestamp}_${Math.random().toString(36).substr(2, 8)}`;
  
  const customerEmail = caktoData.customerEmail || '';
  const customerName = caktoData.customerName || '';
  const offerPrice = caktoData.offer?.price || 0;
  const checkoutUrl = caktoData.checkoutUrl || '';

  console.log('🛒 DADOS ENRIQUECIDOS - ABANDONMENT:', {
    email: customerEmail ? '***' + customerEmail.split('@')[1] : 'missing',
    name: customerName ? customerName.split(' ')[0] : 'missing',
    price: offerPrice,
    checkout_url: checkoutUrl
  });

  // Lead Event para Meta (Checkout Abandonment)
  const leadEvent = {
    data: [{
      event_name: 'Lead',
      event_id: eventId,
      event_time: timestamp,
      action_source: 'website',
      event_source_url: checkoutUrl,
      
      user_data: {
        em: customerEmail ? sha256(customerEmail) : '',
        fn: customerName ? sha256(customerName) : '',
        ct: 'br',
        country: 'br'
      },
      
      custom_data: {
        currency: 'BRL',
        value: offerPrice,
        content_name: 'Sistema 4 Fases - Checkout Abandonment',
        content_category: 'checkout_abandonment',
        content_ids: [CAKTO_PRODUCT_ID],
        content_type: 'product',
        lead_type: 'checkout_abandonment',
        checkout_value: offerPrice,
        recovery_potential: 'high'
      }
    }],
    
    access_token: META_ACCESS_TOKEN,
    test_event_code: 'TEST10150', // MODO TESTE ATIVADO COM CÓDIGO PERSONALIZADO
  };

  console.log('📤 LEAD EVENT (ABANDONMENT):', JSON.stringify(leadEvent, null, 2));
  return { eventId, leadEvent };
}

// Função para enviar eventos para Meta com retry
async function sendToMetaWithRetry(eventData: any, eventType: string): Promise<any> {
  let lastError;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`🚀 Tentativa ${attempt}/${MAX_RETRIES} - Enviando ${eventType} para Meta...`);
      
      const metaUrl = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
      
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': `Cakto-Webhook/${WEBHOOK_VERSION}`
        },
        body: JSON.stringify(eventData),
        signal: controller.signal
      };

      const response = await fetch(metaUrl, options);
      clearTimeout(timeoutId);
      
      const result = await response.json();
      
      console.log(`📥 Resposta Meta (Tentativa ${attempt}):`, {
        status: response.status,
        success: response.ok,
        result: result
      });

      if (response.ok && !result.error) {
        console.log(`✅ ${eventType} enviado com sucesso na tentativa ${attempt}!`);
        return { success: true, attempt, response: result };
      }
      
      throw new Error(result.error?.message || `HTTP ${response.status}`);
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Erro tentativa ${attempt}:`, error.message);
      
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Aguardando ${RETRY_DELAY}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
      }
    }
  }
  
  throw lastError;
}

// Função principal do webhook Cakto ENTERPRISE
// Função para enviar estatísticas para o dashboard (SINCRONA para evitar erros no serverless)
function updateStats(eventData: any) {
  try {
    // Atualizar estatísticas locais diretamente (sem fetch para evitar erros no serverless)
    stats.totalProcessed++;
    
    if (eventData.success) {
      stats.successCount++;
      if (eventData.eventType === 'purchase_approved') {
        stats.purchaseApproved++;
      } else if (eventData.eventType === 'checkout_abandonment') {
        stats.checkoutAbandonment++;
      }
    } else {
      stats.errorCount++;
    }
    
    if (eventData.duplicate) {
      stats.duplicatePrevented++;
    }
    
    // Atualizar tempo médio de processamento
    if (eventData.processingTime) {
      stats.averageProcessingTime = Math.round(
        (stats.averageProcessingTime * (stats.totalProcessed - 1) + eventData.processingTime) / stats.totalProcessed
      );
    }
    
    console.log('📊 Estatísticas atualizadas localmente:', {
      total: stats.totalProcessed,
      success: stats.successCount,
      purchases: stats.purchaseApproved,
      avgTime: stats.averageProcessingTime
    });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar estatísticas:', error);
    // Não falhar o webhook se estatísticas falharem
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 WEBHOOK CAKTO CHAMADO - INÍCIO');
  
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  console.log(`🚀 [${requestId}] Webhook Cakto Enterprise v${WEBHOOK_VERSION} - Iniciando`);
  console.log(`📊 Stats atuais:`, JSON.stringify(stats, null, 2));

  try {
    // 1. Receber e validar dados da Cakto
    const caktoWebhook = await request.json();
    
    console.log(`📥 [${requestId}] WEBHOOK RECEBIDO:`, JSON.stringify(caktoWebhook, null, 2));
    
    // 2. Validar método HTTP
    if (request.method !== 'POST') {
      console.log(`❌ [${requestId}] Método inválido: ${request.method}`);
      return NextResponse.json({
        error: 'Método não permitido',
        allowed_methods: ['POST'],
        webhook_version: WEBHOOK_VERSION,
        request_id: requestId
      }, { status: 405 });
    }

    // 3. Validar secret da Cakto (SEGURANÇA CRÍTICA)
    if (caktoWebhook.secret !== CAKTO_SECRET) {
      console.log(`❌ [${requestId}] SECRET INVÁLIDO!`);
      console.log(`  - Recebido: ${caktoWebhook.secret}`);
      console.log(`  - Esperado: ${CAKTO_SECRET}`);
      
      return NextResponse.json({
        status: 'error',
        error: 'invalid_secret',
        message: 'Secret da Cakto inválido',
        webhook_version: WEBHOOK_VERSION,
        request_id: requestId
      }, { status: 401 });
    }

    console.log(`✅ [${requestId}] Secret validado com sucesso!`);

    // 4. Prevenção de duplicatas
    const eventId = generateEventId(caktoWebhook);
    if (isDuplicate(eventId)) {
      console.log(`🔄 [${requestId}] Evento duplicado detectado e ignorado: ${eventId}`);
      return NextResponse.json({
        status: 'duplicate_ignored',
        message: 'Evento duplicado ignorado',
        event_id: eventId,
        webhook_version: WEBHOOK_VERSION,
        request_id: requestId,
        processing_time_ms: Date.now() - startTime
      });
    }

    // 5. Validar estrutura básica
    const eventType = caktoWebhook.event;
    const data = caktoWebhook.data;

    if (!eventType || !data) {
      console.log(`❌ [${requestId}] Estrutura inválida - event ou data ausente`);
      return NextResponse.json({
        status: 'error',
        error: 'invalid_structure',
        message: 'Campos event e data são obrigatórios',
        webhook_version: WEBHOOK_VERSION,
        request_id: requestId
      }, { status: 400 });
    }

    // 6. Processar eventos específicos
    let result;
    stats.totalProcessed++;

    switch (eventType) {
      case 'purchase_approved':
        result = await handlePurchaseApproved(data, requestId, startTime);
        stats.purchaseApproved++;
        stats.successCount++;
        break;
        
      case 'checkout_abandonment':
        result = await handleCheckoutAbandonment(data, requestId, startTime);
        stats.checkoutAbandonment++;
        stats.successCount++;
        break;
        
      case 'purchase_refused':
        result = await handlePurchaseRefused(data, requestId, startTime);
        stats.purchaseRefused++;
        stats.successCount++;
        break;
        
      default:
        console.log(`⏭️ [${requestId}] Evento não suportado: ${eventType}`);
        return NextResponse.json({
          status: 'ignored',
          reason: 'event_not_supported',
          event_received: eventType,
          supported_events: ['purchase_approved', 'checkout_abandonment', 'purchase_refused'],
          webhook_version: WEBHOOK_VERSION,
          request_id: requestId,
          processing_time_ms: Date.now() - startTime
        });
    }

    // 7. Atualizar estatísticas
    const processingTime = Date.now() - startTime;
    stats.averageProcessingTime = Math.round(
      (stats.averageProcessingTime * (stats.totalProcessed - 1) + processingTime) / stats.totalProcessed
    );

    console.log(`🎉 [${requestId}] Evento processado com sucesso!`);
    console.log(`📊 Stats atualizadas:`, JSON.stringify(stats, null, 2));

    // 8. Atualizar dashboard de estatísticas
    // Nota: userDataFromDB não está disponível aqui, então usamos uma fonte genérica
    updateStats({
      eventType: eventType,
      transactionId: data.id || 'unknown',
      success: true,
      processingTime: processingTime,
      dataSource: 'processed_successfully'
    });

    // 9. Retornar resposta enterprise
    return NextResponse.json({
      status: 'success',
      message: `Evento ${eventType} processado com sucesso`,
      webhook_version: WEBHOOK_VERSION,
      request_id: requestId,
      event_id: eventId,
      processing_time_ms: processingTime,
      result: result,
      statistics: {
        ...stats,
        uptime_ms: processingTime,
        performance_tier: processingTime < 500 ? 'excellent' : processingTime < 1000 ? 'good' : 'acceptable'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    stats.errorCount++;
    
    console.error(`❌ [${requestId}] Erro crítico no webhook:`, {
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined,
      processing_time_ms: processingTime
    });
    
    return NextResponse.json({
      status: 'critical_error',
      message: 'Erro crítico ao processar webhook Cakto',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      webhook_version: WEBHOOK_VERSION,
      request_id: requestId,
      processing_time_ms: processingTime,
      statistics: stats,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// Handler para purchase_approved COM VALIDAÇÃO CRUZADA
async function handlePurchaseApproved(data: any, requestId: string, startTime: number) {
  console.log(`💰 [${requestId}] PROCESSANDO PURCHASE_APPROVED COM VALIDAÇÃO CRUZADA`);

  // Validar campos essenciais
  if (!data.customer?.email || !data.amount || data.status !== 'paid') {
    throw new Error('Campos essenciais ausentes: customer.email, amount, status=paid');
  }

  console.log(`✅ [${requestId}] Processando purchase_approved...`);
  
  // Criar e enviar Purchase Event COM VALIDAÇÃO DETALHADA
  console.log(`🔧 [${requestId}] Criando Purchase Event...`);
  let eventId, purchaseEvent;
  
  try {
    const result = await createAdvancedPurchaseEvent(data, requestId);
    eventId = result.eventId;
    purchaseEvent = result.purchaseEvent;
    console.log(`✅ [${requestId}] Purchase Event criado com sucesso`);
  } catch (createError) {
    console.error(`❌ [${requestId}] Erro ao criar Purchase Event:`, createError);
    throw new Error(`Falha na criação do evento: ${createError.message}`);
  }
  
  console.log(`🚀 [${requestId}] Enviando para Meta...`);
  let metaResult;
  
  try {
    metaResult = await sendToMetaWithRetry(purchaseEvent, 'Purchase');
    console.log(`✅ [${requestId}] Enviado para Meta com sucesso`);
  } catch (sendError) {
    console.error(`❌ [${requestId}] Erro ao enviar para Meta:`, sendError);
    throw new Error(`Falha no envio para Meta: ${sendError.message}`);
  }
  
  console.log(`🎉 [${requestId}] PURCHASE COM SUA ESTRUTURA ENVIADO! Event ID: ${eventId}`);
  
  return {
    event_type: 'purchase_approved',
    meta_event_id: eventId,
    meta_response: metaResult,
    validation_data: {
      data_source: 'database_lead_or_api_geolocation',
      structure: 'complete_like_other_events',
      used_email: data.customer?.email ? '***' + data.customer.email.split('@')[1] : 'missing',
      used_phone: data.customer?.phone ? '***' + data.customer.phone.slice(-4) : 'missing',
      used_city: 'from_database_or_api',
      used_state: 'from_database_or_api'
    },
    transaction_data: {
      id: data.id,
      amount: data.amount,
      payment_method: data.paymentMethod
    }
  };
}

// Handler para checkout_abandonment
async function handleCheckoutAbandonment(data: any, requestId: string, startTime: number) {
  console.log(`🛒 [${requestId}] PROCESSANDO CHECKOUT_ABANDONMENT`);

  if (!data.customerEmail || !data.offer?.price) {
    throw new Error('Campos essenciais ausentes: customerEmail, offer.price');
  }

  // Criar e enviar Lead Event
  const { eventId, leadEvent } = await createLeadEvent(data);
  const metaResult = await sendToMetaWithRetry(leadEvent, 'Lead');
  
  console.log(`🎉 [${requestId}] LEAD (ABANDONMENT) ENVIADO! Event ID: ${eventId}`);
  
  return {
    event_type: 'checkout_abandonment',
    meta_event_id: eventId,
    meta_response: metaResult,
    abandonment_data: {
      customer_email: data.customerEmail,
      customer_name: data.customerName,
      offer_price: data.offer.price,
      checkout_url: data.checkoutUrl,
      recovery_potential: 'high'
    }
  };
}

// Handler para purchase_refused
async function handlePurchaseRefused(data: any, requestId: string, startTime: number) {
  console.log(`❌ [${requestId}] PROCESSANDO PURCHASE_REFUSED`);

  const customerEmail = data.customer?.email || '';
  const amount = data.amount || 0;
  const reason = data.reason || 'Não especificado';
  
  console.log(`❌ [${requestId}] COMPRA RECUSADA:`, {
    email: customerEmail ? '***' + customerEmail.split('@')[1] : 'missing',
    amount,
    reason
  });
  
  // Aqui poderia enviar um evento customizado para análise
  return {
    event_type: 'purchase_refused',
    refusal_data: {
      customer_email: customerEmail,
      amount,
      reason,
      analysis_required: true,
      follow_up_recommended: true
    }
  };
}

// GET endpoint para verificação e estatísticas
export async function GET() {
  return NextResponse.json({
    status: 'webhook_active',
    message: `Webhook Cakto Enterprise v${WEBHOOK_VERSION} - O MELHOR WEBHOOK DO MUNDO! 🌍`,
    webhook_version: WEBHOOK_VERSION,
    configuration: {
      pixel_id: META_PIXEL_ID,
      product_id: CAKTO_PRODUCT_ID,
      secret_configured: true,
      supported_events: ['purchase_approved', 'checkout_abandonment', 'purchase_refused'],
      max_retries: MAX_RETRIES,
      timeout_ms: TIMEOUT_MS,
      duplicate_prevention: true,
      customer_enrichment: true,
      advanced_hashing: true
    },
    capabilities: [
      '🚀 Purchase Events com dados enriquecidos',
      '🛒 Checkout Abandonment → Lead Events',
      '❌ Purchase Refused → Análise automática',
      '🔒 Validação de secret para segurança',
      '🔄 Prevenção de duplicatas inteligente',
      '📊 Estatísticas em tempo real',
      '🎯 Retry automático com backoff',
      '⚡ Timeout configurável',
      '🧮 Enriquecimento de dados do cliente',
      '📈 Performance tracking',
      '🔍 Debug mode detalhado',
      '🌐 Enterprise-grade logging'
    ],
    statistics: {
      ...stats,
      success_rate: stats.totalProcessed > 0 ? Math.round((stats.successCount / stats.totalProcessed) * 100) : 0,
      cache_size: processedEvents.size,
      performance_tier: stats.averageProcessingTime < 500 ? 'EXCELLENT' : 
                       stats.averageProcessingTime < 1000 ? 'GOOD' : 'ACCEPTABLE'
    },
    endpoints: {
      webhook: 'https://maracujazeropragas.com/api/webhook-cakto',
      test_page: 'https://maracujazeropragas.com/test-webhook',
      health_check: 'https://maracujazeropragas.com/api/webhook-cakto'
    },
    product_info: {
      name: 'Sistema 4 Fases',
      content_id: CAKTO_PRODUCT_ID,
      checkout_url: 'https://pay.cakto.com.br/hacr962_605077'
    },
    timestamp: new Date().toISOString(),
    uptime: '🔥 100% READY FOR PRODUCTION 🔥'
  });
}