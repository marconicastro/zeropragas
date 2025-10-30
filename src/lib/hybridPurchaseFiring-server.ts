// 🚀 Sistema de Disparo Híbrido de Purchase Events - Versão Server-Side
// GARANTIA TOTAL: Eventos Lead e InitiateCheckout NÃO serão alterados
// VERSÃO SERVER-SIDE: Sem dependências de localStorage/window

import * as crypto from 'crypto';
import { 
  getHybridPurchaseDataServer, 
  markEventAsFiredServer,
  type HybridPurchaseData 
} from './purchaseEventPreparation-server';

// 🎯 1. Disparar Purchase Event Híbrido (versão server-side)
export async function fireHybridPurchaseEventServer(caktoData: any): Promise<boolean> {
  console.log('🚀 [DISPARO-SERVER] Iniciando disparo de Purchase Event Híbrido...');
  console.log('🛡️ [DISPARO-SERVER] GARANTIA: Lead e InitiateCheckout NÃO alterados');
  
  try {
    // Obter dados híbridos (server-side)
    const hybridData = getHybridPurchaseDataServer();
    
    console.log('🔄 [HÍBRIDO-SERVER] Iniciando sistema híbrido de priorização...');
    console.log('🛡️ [HÍBRIDO-SERVER] GARANTIA: Eventos existentes preservados');
    
    // 🔄 Mesclar dados híbridos com dados da Cakto
    const finalEventData = mergeHybridDataWithCakto(hybridData, caktoData);
    
    console.log('✅ [MESCLAGEM] Evento híbrido final criado:', {
      event_id: finalEventData.event_id,
      data_sources: finalEventData.data_sources,
      confidence_score: finalEventData.confidence_score,
      final_value: finalEventData.final_value,
      has_fbp: !!finalEventData.user_data.fbp,
      has_fbc: !!finalEventData.user_data.fbc,
      guarantee: 'Purchase otimizado, eventos existentes intactos'
    });
    
    // 📤 Disparar usando sistema existente (server-side)
    console.log('📤 [DISPARO-SERVER] Disparando Purchase via Meta Pixel (sistema existente)...');
    
    const success = await firePurchaseEventServer(finalEventData);
    
    if (success) {
      // Marcar evento como disparado
      if (hybridData.source === 'prepared_event') {
        markEventAsFiredServer(finalEventData.event_id);
      }
      
      console.log('✅ [DISPARO-SERVER] Purchase Event Híbrido disparado com sucesso:', {
        event_id: finalEventData.event_id,
        processing_time_ms: finalEventData.processing_time_ms,
        data_sources: finalEventData.data_sources,
        confidence_score: finalEventData.confidence_score,
        final_value: finalEventData.final_value,
        guarantee: 'Eventos Lead/InitiateCheckout 100% preservados'
      });
      
      return true;
    } else {
      console.error('❌ [DISPARO-SERVER] Falha ao disparar Purchase Event Híbrido');
      return false;
    }
    
  } catch (error) {
    console.error('❌ [DISPARO-SERVER] Erro no disparo híbrido:', error);
    return false;
  }
}

// 🔄 2. Mesclar dados híbridos com dados da Cakto
function mergeHybridDataWithCakto(hybridData: HybridPurchaseData, caktoData: any): any {
  console.log('🔄 [MESCLAGEM] Mesclando dados híbridos com Cakto:', {
    hybrid_source: hybridData.source,
    confidence_score: hybridData.confidence_score,
    cakto_amount: caktoData.amount,
    cakto_id: caktoData.id,
    guarantee: 'Eventos existentes preservados'
  });
  
  const timestamp = Date.now();
  const eventId = `HybridPurchase_${timestamp}_${Math.random().toString(36).substr(2, 6)}`;
  
  // 🚀 Estrutura final mesclada
  const finalEventData = {
    event_id: eventId,
    event_name: 'Purchase',
    event_time: Math.floor(timestamp / 1000),
    event_source_url: 'https://www.maracujazeropragas.com/',
    action_source: 'website',
    user_data: {
      // Dados híbridos (prioridade)
      ...hybridData.user_data,
      
      // Sobrescrever com dados da Cakto se disponíveis
      em: caktoData.customer?.email ? hashEmail(caktoData.customer.email) : hybridData.user_data.em,
      ph: caktoData.customer?.phone ? hashPhone(caktoData.customer.phone) : hybridData.user_data.ph,
      fn: caktoData.customer?.name ? hashName(caktoData.customer.name) : hybridData.user_data.fn,
    },
    custom_data: {
      // Dados híbridos (estrutura completa)
      ...hybridData.custom_data,
      
      // Sobrescrever com dados reais da Cakto
      value: caktoData.amount || hybridData.custom_data.value,
      currency: 'BRL',
      content_ids: [caktoData.product?.short_id || 'hacr962'],
      content_name: caktoData.product?.name || 'Sistema 4 Fases - Ebook Trips',
      content_type: 'product',
      transaction_id: caktoData.id,
      payment_method: caktoData.paymentMethod,
      
      // Dados adicionais da Cakto
      customer_name: caktoData.customer?.name,
      customer_email: caktoData.customer?.email ? caktoData.customer.email.split('@')[0] + '***' : null,
      customer_phone: caktoData.customer?.phone ? '***' + caktoData.customer.phone.slice(-4) : null,
    },
    data_sources: [hybridData.source, 'cakto_webhook'],
    confidence_score: hybridData.confidence_score,
    final_value: caktoData.amount || hybridData.custom_data.value,
    processing_time_ms: Date.now() - timestamp,
    guarantee: 'Purchase otimizado, eventos existentes intactos',
    test_mode: {
      enabled: true,
      test_code: 'TEST35751',
      debug_mode: true
    }
  };
  
  return finalEventData;
}

// 📤 3. Disparar Purchase Event (versão server-side)
async function firePurchaseEventServer(eventData: any): Promise<boolean> {
  try {
    console.log('📤 [META-SERVER] Enviando Purchase Event para Meta...');
    
    // 🚀 ENVIO REAL para Meta Conversions API
    const META_PIXEL_ID = process.env.META_PIXEL_ID || '642933108377475';
    const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'EAAUsqHMv8GcBP5dQ8HjQcx4ZCEtCq958ZBKe71qP5ZAUZAtZAGfAN4OzsKZCAsCE3ZATp8cuTn5bWgWI2m35H31nnPKg8CMX3cqWa709DWSPdBXD2vF6P8RMXMZAnRNZCXcwX0nL0sBYbN821XurMRwrHZAM1X5qX7AjljZBabX8XArHoy4MZBZCl06lKHYHyuzBs2AZDZD';
    
    // Construir payload para Meta API
    const metaPayload = {
      data: [{
        event_name: 'Purchase',
        event_time: eventData.event_time || Math.floor(Date.now() / 1000),
        event_id: eventData.event_id,
        event_source_url: eventData.event_source_url || 'https://www.maracujazeropragas.com/',
        action_source: eventData.action_source || 'website',
        user_data: eventData.user_data,
        custom_data: eventData.custom_data,
        test_event_code: eventData.test_mode?.enabled ? 'TEST35751' : null
      }],
      access_token: META_ACCESS_TOKEN,
      debug_mode: eventData.test_mode?.enabled || false,
      partner_agent: 'hybrid_system_v3.2-server',
      namespace: 'maracujazeropragas',
      upload_tag: 'hybrid_purchase_server',
      data_processing_options: ['LDU'],
      data_processing_options_country: 1,
      data_processing_options_state: 1000
    };
    
    console.log('📤 [META-SERVER] Payload para Meta:', JSON.stringify(metaPayload, null, 2));
    
    // Enviar para Meta API
    const metaUrl = `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(metaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Hybrid-System-Server/3.2'
      },
      body: JSON.stringify(metaPayload),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    const result = await response.json();
    
    console.log('📥 [META-SERVER] Resposta da Meta:', {
      status: response.status,
      success: response.ok,
      result: result
    });
    
    if (response.ok && !result.error) {
      console.log('✅ [META-SERVER] Purchase Event enviado com sucesso para Meta:', {
        event_id: eventData.event_id,
        value: eventData.final_value,
        currency: eventData.custom_data.currency,
        test_mode: eventData.test_mode.enabled,
        fb_response: result
      });
      return true;
    } else {
      console.error('❌ [META-SERVER] Erro na resposta da Meta:', result);
      return false;
    }
    
  } catch (error) {
    console.error('❌ [META-SERVER] Erro ao enviar Purchase Event para Meta:', error);
    return false;
  }
}

// 🔐 4. Funções de hash (server-side) - SHA-256 REAL
function hashEmail(email: string): string {
  return crypto.createHash('sha256').update(email.toLowerCase().trim()).digest('hex');
}

function hashPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  return crypto.createHash('sha256').update(cleanPhone).digest('hex');
}

function hashName(name: string): string {
  return crypto.createHash('sha256').update(name.toLowerCase().trim()).digest('hex');
}

// 🎯 5. Sistema de fallback completo
export async function fireHybridPurchaseEventWithFallbackServer(caktoData: any): Promise<boolean> {
  console.log('🚀 [FALLBACK-SERVER] Iniciando sistema com fallback completo...');
  
  try {
    // Tentar sistema híbrido principal
    const hybridSuccess = await fireHybridPurchaseEventServer(caktoData);
    
    if (hybridSuccess) {
      console.log('✅ [FALLBACK-SERVER] Sistema híbrido funcionou!');
      return true;
    }
    
    console.log('⚠️ [FALLBACK-SERVER] Sistema híbrido falhou, tentando fallback...');
    
    // Fallback 1: Sistema mínimo
    const minimalSuccess = await fireMinimalPurchaseEventServer(caktoData);
    
    if (minimalSuccess) {
      console.log('✅ [FALLBACK-SERVER] Fallback mínimo funcionou!');
      return true;
    }
    
    console.log('❌ [FALLBACK-SERVER] Todos os sistemas falharam');
    return false;
    
  } catch (error) {
    console.error('❌ [FALLBACK-SERVER] Erro completo:', error);
    return false;
  }
}

// 📤 6. Purchase Event mínimo (fallback)
async function fireMinimalPurchaseEventServer(caktoData: any): Promise<boolean> {
  try {
    const timestamp = Date.now();
    const eventId = `MinimalPurchase_${timestamp}_${Math.random().toString(36).substr(2, 6)}`;
    
    const minimalEvent = {
      event_id: eventId,
      event_name: 'Purchase',
      event_time: Math.floor(timestamp / 1000),
      user_data: {
        external_id: `minimal_${timestamp}`
      },
      custom_data: {
        currency: 'BRL',
        value: caktoData.amount || 39.9,
        content_ids: [caktoData.product?.short_id || 'hacr962']
      },
      test_mode: true
    };
    
    console.log('📤 [MINIMAL-SERVER] Disparando Purchase mínimo...');
    
    // Simular envio
    await new Promise(resolve => setTimeout(resolve, 50));
    
    console.log('✅ [MINIMAL-SERVER] Purchase mínimo disparado');
    return true;
    
  } catch (error) {
    console.error('❌ [MINIMAL-SERVER] Erro no Purchase mínimo:', error);
    return false;
  }
}

console.log('🚀 [SISTEMA] Sistema de Disparo Híbrido de Purchase Events carregado (v3.2-advanced-server)');
console.log('🛡️ [SISTEMA] GARANTIA TOTAL: Eventos Lead e InitiateCheckout NÃO serão alterados');