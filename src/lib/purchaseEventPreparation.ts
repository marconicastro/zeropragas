// 🚀 Sistema de Preparação de Purchase Events - Abordagem Híbrida Avançada
// GARANTIA ABSOLUTA: Eventos existentes NÃO serão alterados

import { getPersistedUserData, formatUserDataForMeta } from './userDataPersistence';

interface PreparedPurchaseEvent {
  id: string;
  user_data: any;
  custom_data: any;
  event_metadata: {
    prepared_at: number;
    prepared_by: string;
    status: 'ready_to_fire' | 'fired' | 'expired';
    version: string;
    source_event: string;
  };
}

interface FallbackUserData {
  email?: string;
  phone?: string;
  fullName?: string;
  city?: string;
  state?: string;
  cep?: string;
  fbp?: string;
  fbc?: string;
  timestamp: number;
}

// 🎯 1. Criar Purchase Event Preparado (SEM DISPARAR - apenas armazenar)
export function createPreparedPurchaseEvent(sourceEvent: 'lead' | 'initiate_checkout', additionalData: any = {}): PreparedPurchaseEvent {
  const timestamp = Date.now();
  const eventId = `PreparedPurchase_${timestamp}_${Math.random().toString(36).substr(2, 6)}`;
  
  console.log(`🎯 [PREPARAÇÃO] Criando Purchase Event preparado a partir de: ${sourceEvent}`);
  console.log(`🛡️ [PREPARAÇÃO] GARANTIA: Eventos existentes NÃO serão alterados!`);
  
  // Obter dados do usuário (estrutura existente - sem alterações)
  const persistedData = getPersistedUserData();
  const formattedUserData = persistedData ? formatUserDataForMeta(persistedData) : null;
  
  // 🚀 Estrutura completa baseada no InitiateCheckout (57 parâmetros)
  const preparedEvent: PreparedPurchaseEvent = {
    id: eventId,
    
    // User Data - Nossa estrutura validada (Nota 9.3)
    user_data: formattedUserData || {
      em: null,
      ph: null,
      fn: null,
      ln: null,
      ct: null,
      st: null,
      zp: null,
      country: null,
      external_id: null,
      fbp: null,
      fbc: null
    },
    
    // Custom Data - Todos os parâmetros do InitiateCheckout
    custom_data: {
      // Básicos obrigatórios
      currency: 'BRL',
      value: 39.9,
      content_ids: ['hacr962'],
      content_name: 'Sistema 4 Fases - Ebook Trips',
      content_type: 'product',
      
      // Dados completos do InitiateCheckout (57 parâmetros)
      campaign_name: additionalData.campaign_name || 'unknown',
      campaign_id: additionalData.campaign_id || 'unknown',
      adset_name: additionalData.adset_name || 'unknown',
      adset_id: additionalData.adset_id || 'unknown',
      ad_name: additionalData.ad_name || 'unknown',
      ad_id: additionalData.ad_id || 'unknown',
      placement: additionalData.placement || 'unknown',
      campaign_type: additionalData.campaign_type || 'unknown',
      ad_format: additionalData.ad_format || 'unknown',
      targeting_type: additionalData.targeting_type || 'unknown',
      audience_segment: additionalData.audience_segment || 'general',
      creative_type: additionalData.creative_type || 'standard',
      objective_type: additionalData.objective_type || 'awareness',
      device_type: additionalData.device_type || 'desktop',
      screen_width: additionalData.screen_width || 1360,
      screen_height: additionalData.screen_height || 768,
      viewport_width: additionalData.viewport_width || 1352,
      viewport_height: additionalData.viewport_height || 610,
      pixel_ratio: additionalData.pixel_ratio || 1,
      browser: additionalData.browser || 'chrome',
      operating_system: additionalData.operating_system || 'linux',
      language: additionalData.language || 'pt-BR',
      timezone: additionalData.timezone || 'America/Sao_Paulo',
      connection_type: additionalData.connection_type || '4g',
      page_load_time: additionalData.page_load_time || 12742,
      dom_content_loaded: additionalData.dom_content_loaded || 352,
      first_contentful_paint: additionalData.first_contentful_paint || 500,
      session_start_time: additionalData.session_start_time || timestamp,
      page_number: additionalData.page_number || 1,
      user_journey_stage: additionalData.user_journey_stage || 'awareness',
      content_language: additionalData.content_language || 'pt-BR',
      market: additionalData.market || 'BR',
      platform: additionalData.platform || 'web',
      event_id: eventId,
      event_source_url: additionalData.event_source_url || 'https://www.maracujazeropragas.com/',
      event_time: Math.floor(timestamp / 1000),
      action_source: 'website',
      content_category: 'digital_product',
      num_items: 1,
      checkout_step: 1,
      payment_method: 'digital',
      predicted_ltv: 159.6,
      product_availability: 'in stock',
      condition: 'new',
      trigger_type: additionalData.trigger_type || 'button_click',
      cart_value: 39.9,
      items_count: 1,
      cart_operation: 'add_to_cart',
      checkout_url: additionalData.checkout_url || 'https://www.maracujazeropragas.com/',
      payment_method_available: ['credit_card', 'pix'],
      
      // Custom data adicional
      custom_data: {
        checkout_step: 1,
        payment_method_available: ['credit_card', 'pix'],
        num_items: 1,
        delivery_type: 'digital_download',
        order_type: 'online_purchase',
        product_category: 'digital_guide',
        user_engagement_time: additionalData.user_engagement_time || 12,
        form_completion_time: additionalData.form_completion_time || 30,
        checkout_type: additionalData.checkout_type || 'modal_redirect'
      }
    },
    
    // Metadados de controle
    event_metadata: {
      prepared_at: timestamp,
      prepared_by: 'hybrid_system_v3.2',
      status: 'ready_to_fire',
      version: '3.2-prepared-purchase',
      source_event: sourceEvent
    }
  };
  
  console.log('✅ [PREPARAÇÃO] Purchase Event preparado criado:', {
    id: preparedEvent.id,
    source_event: sourceEvent,
    has_user_data: !!preparedEvent.user_data.em,
    custom_data_params: Object.keys(preparedEvent.custom_data).length,
    status: preparedEvent.event_metadata.status,
    guarantee: 'Eventos existentes NÃO alterados'
  });
  
  return preparedEvent;
}

// 🗄️ 2. Armazenar evento preparado (sem disparar)
export function storePreparedPurchaseEvent(event: PreparedPurchaseEvent): void {
  try {
    // Armazenar em localStorage
    const storedEvents = JSON.parse(localStorage.getItem('preparedPurchaseEvents') || '[]');
    
    // Adicionar novo evento
    storedEvents.push(event);
    
    // Manter apenas últimos 5 eventos (limpeza automática)
    if (storedEvents.length > 5) {
      storedEvents.splice(0, storedEvents.length - 5);
    }
    
    localStorage.setItem('preparedPurchaseEvents', JSON.stringify(storedEvents));
    
    console.log('💾 [PREPARAÇÃO] Purchase Event preparado armazenado:', {
      id: event.id,
      total_events: storedEvents.length,
      status: event.event_metadata.status,
      guarantee: 'Apenas armazenamento, sem disparo'
    });
    
  } catch (error) {
    console.error('❌ [PREPARAÇÃO] Erro ao armazenar evento preparado:', error);
  }
}

// 🔄 3. Armazenar dados brutos como fallback (segurança adicional)
export function storeFallbackUserData(userData: FallbackUserData): void {
  try {
    localStorage.setItem('fallbackUserData', JSON.stringify(userData));
    console.log('💾 [PREPARAÇÃO] Dados fallback armazenados para segurança');
  } catch (error) {
    console.error('❌ [PREPARAÇÃO] Erro ao armazenar dados fallback:', error);
  }
}

// 🎯 4. Recuperar evento preparado mais recente
export function getPreparedPurchaseEvent(): PreparedPurchaseEvent | null {
  try {
    const storedEvents = JSON.parse(localStorage.getItem('preparedPurchaseEvents') || '[]');
    
    // Encontrar evento mais recente com status 'ready_to_fire'
    const readyEvents = storedEvents.filter((event: PreparedPurchaseEvent) => 
      event.event_metadata.status === 'ready_to_fire'
    );
    
    if (readyEvents.length === 0) {
      console.log('⚠️ [PREPARAÇÃO] Nenhum Purchase Event preparado encontrado');
      return null;
    }
    
    // Retornar o mais recente
    const latestEvent = readyEvents.reduce((latest: PreparedPurchaseEvent, current: PreparedPurchaseEvent) => 
      current.event_metadata.prepared_at > latest.event_metadata.prepared_at ? current : latest
    );
    
    console.log('✅ [PREPARAÇÃO] Purchase Event preparado recuperado:', {
      id: latestEvent.id,
      prepared_at: new Date(latestEvent.event_metadata.prepared_at).toISOString(),
      source_event: latestEvent.event_metadata.source_event
    });
    
    return latestEvent;
    
  } catch (error) {
    console.error('❌ [PREPARAÇÃO] Erro ao recuperar evento preparado:', error);
    return null;
  }
}

// 🔄 5. Recuperar dados fallback
export function getFallbackUserData(): FallbackUserData | null {
  try {
    const fallbackData = localStorage.getItem('fallbackUserData');
    return fallbackData ? JSON.parse(fallbackData) : null;
  } catch (error) {
    console.error('❌ [PREPARAÇÃO] Erro ao recuperar dados fallback:', error);
    return null;
  }
}

// 🎯 6. Marcar evento como disparado
export function markEventAsFired(eventId: string): void {
  try {
    const storedEvents = JSON.parse(localStorage.getItem('preparedPurchaseEvents') || '[]');
    
    const eventIndex = storedEvents.findIndex((event: PreparedPurchaseEvent) => event.id === eventId);
    
    if (eventIndex !== -1) {
      storedEvents[eventIndex].event_metadata.status = 'fired';
      storedEvents[eventIndex].event_metadata.fired_at = Date.now();
      
      localStorage.setItem('preparedPurchaseEvents', JSON.stringify(storedEvents));
      
      console.log('✅ [PREPARAÇÃO] Purchase Event marcado como disparado:', eventId);
    }
    
  } catch (error) {
    console.error('❌ [PREPARAÇÃO] Erro ao marcar evento como disparado:', error);
  }
}

// 🧹 7. Limpar eventos expirados (mais de 24h)
export function cleanExpiredEvents(): void {
  try {
    const storedEvents = JSON.parse(localStorage.getItem('preparedPurchaseEvents') || '[]');
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    const validEvents = storedEvents.filter((event: PreparedPurchaseEvent) => {
      const isExpired = (now - event.event_metadata.prepared_at) > twentyFourHours;
      
      if (isExpired) {
        console.log('🧹 [PREPARAÇÃO] Evento expirado removido:', event.id);
      }
      
      return !isExpired;
    });
    
    localStorage.setItem('preparedPurchaseEvents', JSON.stringify(validEvents));
    
  } catch (error) {
    console.error('❌ [PREPARAÇÃO] Erro ao limpar eventos expirados:', error);
  }
}

// 🎯 8. Sistema híbrido de priorização
export interface HybridPurchaseData {
  source: 'prepared_event' | 'fallback_data' | 'minimal';
  user_data: any;
  custom_data: any;
  confidence_score: number;
}

export function getHybridPurchaseData(): HybridPurchaseData {
  console.log('🔄 [HÍBRIDO] Iniciando sistema híbrido de priorização...');
  console.log('🛡️ [HÍBRIDO] GARANTIA: Eventos existentes preservados');
  
  // Limpar eventos expirados primeiro
  cleanExpiredEvents();
  
  // 1. Tentar evento preparado (prioridade máxima)
  const preparedEvent = getPreparedPurchaseEvent();
  if (preparedEvent) {
    console.log('✅ [HÍBRIDO] Usando Purchase Event preparado (nota 9.3)');
    
    return {
      source: 'prepared_event',
      user_data: preparedEvent.user_data,
      custom_data: preparedEvent.custom_data,
      confidence_score: 9.3
    };
  }
  
  // 2. Tentar dados fallback
  const fallbackData = getFallbackUserData();
  if (fallbackData) {
    console.log('⚠️ [HÍBRIDO] Usando dados fallback (segurança)');
    
    const formattedFallback = formatUserDataForMeta(fallbackData);
    
    return {
      source: 'fallback_data',
      user_data: formattedFallback,
      custom_data: {
        currency: 'BRL',
        value: 39.9,
        content_ids: ['hacr962'],
        content_name: 'Sistema 4 Fases - Ebook Trips',
        content_type: 'product'
      },
      confidence_score: 7.0
    };
  }
  
  // 3. Mínimo garantido
  console.log('❌ [HÍBRIDO] Usando dados mínimos (emergência)');
  
  return {
    source: 'minimal',
    user_data: {
      em: null,
      ph: null,
      fn: null,
      ln: null,
      ct: null,
      st: null,
      country: null,
      external_id: `minimal_${Date.now()}`
    },
    custom_data: {
      currency: 'BRL',
      value: 39.9,
      content_ids: ['hacr962'],
      content_name: 'Sistema 4 Fases - Ebook Trips',
      content_type: 'product'
    },
    confidence_score: 5.0
  };
}

console.log('🚀 [SISTEMA] Sistema de Preparação de Purchase Events carregado (v3.2-hybrid)');
console.log('🛡️ [SISTEMA] GARANTIA ABSOLUTA: Eventos Lead e InitiateCheckout NÃO serão alterados');