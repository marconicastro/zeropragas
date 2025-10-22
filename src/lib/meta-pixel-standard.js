/**
 * Meta Pixel Standardization
 * Padronização de parâmetros para todos os eventos
 */

// Padrão de parâmetros para todos os eventos
const STANDARD_PARAMETERS = {
  // Dados do usuário (sempre incluídos)
  user_data: {
    em: null,        // email hash
    ph: null,        // phone hash
    fn: null,        // first name hash
    ln: null,        // last name hash
    ct: null,        // city hash
    st: null,        // state hash
    zp: null,        // zip code hash
    country: null    // country hash
  },
  
  // Parâmetros de conteúdo
  content_type: 'product',
  content_category: 'ecommerce',
  currency: 'BRL',
  
  // Metadados padrão
  event_source: 'website',
  platform: 'web'
};

/**
 * Padroniza parâmetros para eventos Meta
 * @param {string} eventName - Nome do evento
 * @param {Object} customParams - Parâmetros personalizados
 * @returns {Object} Parâmetros padronizados
 */
export function standardizeEventParams(eventName, customParams = {}) {
  // Busca dados persistentes do usuário
  const userData = getUserPersistentData();
  
  // Parâmetros base
  const baseParams = {
    ...STANDARD_PARAMETERS,
    user_data: userData,
    event_name: eventName,
    timestamp: Date.now()
  };
  
  // Parâmetros específicos por tipo de evento
  const eventSpecificParams = getEventSpecificParams(eventName, customParams);
  
  // Mescla tudo
  return {
    ...baseParams,
    ...eventSpecificParams,
    ...customParams // Parâmetros customizados sobrescrevem os padrões
  };
}

/**
 * Retorna parâmetros específicos por tipo de evento
 */
function getEventSpecificParams(eventName, customParams) {
  switch (eventName) {
    case 'Lead':
      return {
        content_name: 'Formulário de Lead',
        content_category: 'lead_generation',
        value: 1.00,
        predicted_ltv: 50.00, // LTV previsto para leads
        lead_type: customParams.lead_type || 'newsletter'
      };
      
    case 'InitiateCheckout':
      return {
        content_name: 'Iniciar Checkout',
        content_category: 'checkout',
        num_items: customParams.num_items || 1,
        value: customParams.value || 0,
        checkout_step: 1,
        predicted_ltv: customParams.value * 2.5 // LTV baseado no valor
      };
      
    case 'ViewContent':
      return {
        content_name: customParams.content_name || 'Produto',
        content_category: customParams.content_category || 'product_view',
        content_ids: customParams.content_ids || [],
        value: customParams.value || 0,
        view_type: customParams.trigger_type || 'time_based'
      };
      
    case 'Purchase':
      return {
        content_name: 'Compra Concluída',
        content_category: 'purchase',
        transaction_id: customParams.transaction_id,
        value: customParams.value,
        num_items: customParams.num_items,
        payment_method: customParams.payment_method
      };
      
    default:
      return {};
  }
}

/**
 * Busca dados persistentes do usuário
 */
function getUserPersistentData() {
  try {
    // Tenta buscar do localStorage
    const persistentData = localStorage.getItem('meta_user_data');
    if (persistentData) {
      return JSON.parse(persistentData);
    }
    
    // Tenta buscar dos cookies
    const cookieData = getCookie('meta_user_data');
    if (cookieData) {
      return JSON.parse(cookieData);
    }
    
    return {};
  } catch (error) {
    console.warn('Erro ao buscar dados persistentes:', error);
    return {};
  }
}

/**
 * Helper para ler cookies
 */
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

/**
 * Dispara evento padronizado
 */
export function fireStandardEvent(eventName, customParams = {}) {
  try {
    const standardParams = standardizeEventParams(eventName, customParams);
    
    // Dispara o evento com parâmetros padronizados
    fbq('track', eventName, standardParams);
    
    // Log para debugging
    console.log(`✅ ${eventName} disparado com parâmetros padronizados:`, standardParams);
    
    // Salva no analytics local
    saveEventAnalytics(eventName, standardParams);
    
  } catch (error) {
    console.error(`❌ Erro ao disparar ${eventName}:`, error);
  }
}

/**
 * Salva analytics local para comparação
 */
function saveEventAnalytics(eventName, params) {
  try {
    const analytics = JSON.parse(localStorage.getItem('meta_event_analytics') || '{}');
    
    if (!analytics[eventName]) {
      analytics[eventName] = {
        count: 0,
        first_fired: Date.now(),
        last_fired: Date.now(),
        parameters_history: []
      };
    }
    
    analytics[eventName].count++;
    analytics[eventName].last_fired = Date.now();
    analytics[eventName].parameters_history.push({
      timestamp: Date.now(),
      params: Object.keys(params)
    });
    
    // Mantém apenas últimos 10 registros
    if (analytics[eventName].parameters_history.length > 10) {
      analytics[eventName].parameters_history.shift();
    }
    
    localStorage.setItem('meta_event_analytics', JSON.stringify(analytics));
    
  } catch (error) {
    console.warn('Erro ao salvar analytics:', error);
  }
}

/**
 * Compara qualidade dos eventos (para debugging)
 */
export function compareEventQuality() {
  try {
    const analytics = JSON.parse(localStorage.getItem('meta_event_analytics') || '{}');
    
    console.group('📊 Análise de Qualidade dos Eventos');
    
    Object.entries(analytics).forEach(([eventName, data]) => {
      console.log(`\n🎯 ${eventName}:`);
      console.log(`  - Total: ${data.count}`);
      console.log(`  - Primeiro: ${new Date(data.first_fired).toLocaleString()}`);
      console.log(`  - Último: ${new Date(data.last_fired).toLocaleString()}`);
      console.log(`  - Parâmetros usados:`, [...new Set(data.parameters_history.flatMap(p => p.params))]);
    });
    
    console.groupEnd();
    
  } catch (error) {
    console.error('Erro ao analisar qualidade:', error);
  }
}