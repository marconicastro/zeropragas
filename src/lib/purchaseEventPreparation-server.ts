// 🚀 Sistema de Preparação de Purchase Events - Versão Server-Side
// GARANTIA ABSOLUTA: Eventos existentes NÃO serão alterados
// VERSÃO SERVER-SIDE: Sem dependências de localStorage/window

import { getPersistedUserData, formatUserDataForMeta } from './userDataPersistence-server';

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

// 📦 Armazenamento em memória server-side
let serverStorage: {
  preparedPurchaseEvents: PreparedPurchaseEvent[];
  fallbackUserData: FallbackUserData | null;
} = {
  preparedPurchaseEvents: [],
  fallbackUserData: null
};

// 🎯 1. Criar Purchase Event Preparado (SEM DISPARAR - apenas armazenar)
export function createPreparedPurchaseEventServer(sourceEvent: 'lead' | 'initiate_checkout', additionalData: any = {}): PreparedPurchaseEvent {
  const timestamp = Date.now();
  const eventId = `PreparedPurchase_${timestamp}_${Math.random().toString(36).substr(2, 6)}`;
  
  console.log(`🎯 [PREPARAÇÃO-SERVER] Criando Purchase Event preparado a partir de: ${sourceEvent}`);
  console.log(`🛡️ [PREPARAÇÃO-SERVER] GARANTIA: Eventos existentes NÃO serão alterados!`);
  
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
      prepared_by: 'hybrid_system_v3.2-server',
      status: 'ready_to_fire',
      version: '3.2-prepared-purchase-server',
      source_event: sourceEvent
    }
  };
  
  console.log('✅ [PREPARAÇÃO-SERVER] Purchase Event preparado criado:', {
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
export function storePreparedPurchaseEventServer(event: PreparedPurchaseEvent): void {
  try {
    // Armazenar em memória server-side
    serverStorage.preparedPurchaseEvents.push(event);
    
    // Manter apenas últimos 5 eventos (limpeza automática)
    if (serverStorage.preparedPurchaseEvents.length > 5) {
      serverStorage.preparedPurchaseEvents.splice(0, serverStorage.preparedPurchaseEvents.length - 5);
    }
    
    console.log('💾 [PREPARAÇÃO-SERVER] Purchase Event preparado armazenado:', {
      id: event.id,
      total_events: serverStorage.preparedPurchaseEvents.length,
      status: event.event_metadata.status,
      guarantee: 'Apenas armazenamento, sem disparo'
    });
    
  } catch (error) {
    console.error('❌ [PREPARAÇÃO-SERVER] Erro ao armazenar evento preparado:', error);
  }
}

// 🔄 3. Armazenar dados brutos como fallback (segurança adicional)
export function storeFallbackUserDataServer(userData: FallbackUserData): void {
  try {
    serverStorage.fallbackUserData = userData;
    console.log('💾 [PREPARAÇÃO-SERVER] Dados fallback armazenados para segurança');
  } catch (error) {
    console.error('❌ [PREPARAÇÃO-SERVER] Erro ao armazenar dados fallback:', error);
  }
}

// 🎯 4. Recuperar evento preparado mais recente
export function getPreparedPurchaseEventServer(): PreparedPurchaseEvent | null {
  try {
    // Encontrar evento mais recente com status 'ready_to_fire'
    const readyEvents = serverStorage.preparedPurchaseEvents.filter(event => 
      event.event_metadata.status === 'ready_to_fire'
    );
    
    if (readyEvents.length === 0) {
      console.log('⚠️ [PREPARAÇÃO-SERVER] Nenhum Purchase Event preparado encontrado');
      return null;
    }
    
    // Retornar o mais recente
    const latestEvent = readyEvents.reduce((latest, current) => 
      current.event_metadata.prepared_at > latest.event_metadata.prepared_at ? current : latest
    );
    
    console.log('✅ [PREPARAÇÃO-SERVER] Purchase Event preparado recuperado:', {
      id: latestEvent.id,
      prepared_at: new Date(latestEvent.event_metadata.prepared_at).toISOString(),
      source_event: latestEvent.event_metadata.source_event
    });
    
    return latestEvent;
    
  } catch (error) {
    console.error('❌ [PREPARAÇÃO-SERVER] Erro ao recuperar evento preparado:', error);
    return null;
  }
}

// 🔄 5. Recuperar dados fallback
export function getFallbackUserDataServer(): FallbackUserData | null {
  try {
    return serverStorage.fallbackUserData;
  } catch (error) {
    console.error('❌ [PREPARAÇÃO-SERVER] Erro ao recuperar dados fallback:', error);
    return null;
  }
}

// 🎯 6. Marcar evento como disparado
export function markEventAsFiredServer(eventId: string): void {
  try {
    const eventIndex = serverStorage.preparedPurchaseEvents.findIndex(event => event.id === eventId);
    
    if (eventIndex !== -1) {
      serverStorage.preparedPurchaseEvents[eventIndex].event_metadata.status = 'fired';
      serverStorage.preparedPurchaseEvents[eventIndex].event_metadata.fired_at = Date.now();
      
      console.log('✅ [PREPARAÇÃO-SERVER] Purchase Event marcado como disparado:', eventId);
    }
    
  } catch (error) {
    console.error('❌ [PREPARAÇÃO-SERVER] Erro ao marcar evento como disparado:', error);
  }
}

// 🧹 7. Limpar eventos expirados (mais de 24h)
export function cleanExpiredEventsServer(): void {
  try {
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    const validEvents = serverStorage.preparedPurchaseEvents.filter(event => {
      const isExpired = (now - event.event_metadata.prepared_at) > twentyFourHours;
      
      if (isExpired) {
        console.log('🧹 [PREPARAÇÃO-SERVER] Evento expirado removido:', event.id);
      }
      
      return !isExpired;
    });
    
    serverStorage.preparedPurchaseEvents = validEvents;
    
  } catch (error) {
    console.error('❌ [PREPARAÇÃO-SERVER] Erro ao limpar eventos expirados:', error);
  }
}

// 🎯 8. Sistema híbrido de priorização
export interface HybridPurchaseData {
  source: 'prepared_event' | 'fallback_data' | 'minimal';
  user_data: any;
  custom_data: any;
  confidence_score: number;
}

export function getHybridPurchaseDataServer(): HybridPurchaseData {
  console.log('🔄 [HÍBRIDO-SERVER] Iniciando sistema híbrido de priorização...');
  console.log('🛡️ [HÍBRIDO-SERVER] GARANTIA: Eventos existentes preservados');
  
  // Limpar eventos expirados primeiro
  cleanExpiredEventsServer();
  
  // 1. Tentar evento preparado (prioridade máxima)
  const preparedEvent = getPreparedPurchaseEventServer();
  if (preparedEvent) {
    console.log('✅ [HÍBRIDO-SERVER] Usando Purchase Event preparado (nota 9.3)');
    
    return {
      source: 'prepared_event',
      user_data: preparedEvent.user_data,
      custom_data: preparedEvent.custom_data,
      confidence_score: 9.3
    };
  }
  
  // 2. Tentar dados fallback
  const fallbackData = getFallbackUserDataServer();
  if (fallbackData) {
    console.log('⚠️ [HÍBRIDO-SERVER] Usando dados fallback (segurança)');
    
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
  console.log('❌ [HÍBRIDO-SERVER] Usando dados mínimos (emergência)');
  
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

console.log('🚀 [SISTEMA] Sistema de Preparação de Purchase Events carregado (v3.2-hybrid-server)');
console.log('🛡️ [SISTEMA] GARANTIA ABSOLUTA: Eventos Lead e InitiateCheckout NÃO serão alterados');