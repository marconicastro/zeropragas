/**
 * 🔗 SISTEMA DE EVENT ID PERSISTENTE
 * 
 * PROBLEMA RESOLVIDO: Correlação entre InitiateCheckout (browser) e Purchase (webhook)
 * 
 * SOLUÇÃO: Armazenar event_id do InitiateCheckout e reutilizar no webhook
 * 
 * BENEFÍCIOS:
 * - Meta consegue correlacionar eventos do funil
 * - Melhor atribuição de conversões
 * - Quality Score mais alto
 * 
 * USO OPCIONAL: Sistema atual continua funcionando normalmente
 */

interface PersistentEventData {
  eventId: string;
  eventName: string;
  timestamp: number;
  transactionId?: string;
  value?: number;
  metadata?: any;
}

// Storage keys
const STORAGE_PREFIX = 'zc_persistent_event_';
const LAST_CHECKOUT_KEY = 'zc_last_checkout_event';
const EVENT_HISTORY_KEY = 'zc_event_history';

/**
 * Salva event_id de forma persistente
 * 
 * @param eventName - Nome do evento (ex: 'InitiateCheckout')
 * @param eventId - ID único do evento gerado pelo pixel
 * @param metadata - Dados adicionais opcionais
 */
export function persistEventId(
  eventName: string,
  eventId: string,
  metadata?: any
): void {
  try {
    const eventData: PersistentEventData = {
      eventId,
      eventName,
      timestamp: Date.now(),
      ...metadata
    };
    
    // Salvar evento específico
    const storageKey = `${STORAGE_PREFIX}${eventName.toLowerCase()}`;
    localStorage.setItem(storageKey, JSON.stringify(eventData));
    
    // Se for InitiateCheckout, salvar como "último checkout"
    if (eventName === 'InitiateCheckout') {
      localStorage.setItem(LAST_CHECKOUT_KEY, JSON.stringify(eventData));
      console.log(`💾 InitiateCheckout event_id persistido: ${eventId}`);
    }
    
    // Adicionar ao histórico
    addToEventHistory(eventData);
    
    console.log(`✅ Event ID persistido: ${eventName} = ${eventId}`);
    
  } catch (error) {
    console.warn('⚠️ Erro ao persistir event_id:', error);
  }
}

/**
 * Recupera event_id do último InitiateCheckout
 * 
 * USO NO WEBHOOK: Usar este event_id para o Purchase Event
 */
export function getLastCheckoutEventId(): string | null {
  try {
    const stored = localStorage.getItem(LAST_CHECKOUT_KEY);
    if (!stored) {
      console.log('⚠️ Nenhum InitiateCheckout event_id encontrado');
      return null;
    }
    
    const eventData: PersistentEventData = JSON.parse(stored);
    
    // Verificar se ainda é válido (últimas 24h)
    const age = Date.now() - eventData.timestamp;
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    if (age > maxAge) {
      console.log('⏰ InitiateCheckout event_id expirado (>24h)');
      localStorage.removeItem(LAST_CHECKOUT_KEY);
      return null;
    }
    
    console.log(`✅ InitiateCheckout event_id recuperado: ${eventData.eventId} (${Math.round(age / 60000)}min atrás)`);
    return eventData.eventId;
    
  } catch (error) {
    console.warn('⚠️ Erro ao recuperar event_id:', error);
    return null;
  }
}

/**
 * Recupera event_id de qualquer evento específico
 */
export function getEventId(eventName: string): string | null {
  try {
    const storageKey = `${STORAGE_PREFIX}${eventName.toLowerCase()}`;
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) return null;
    
    const eventData: PersistentEventData = JSON.parse(stored);
    return eventData.eventId;
    
  } catch (error) {
    console.warn('⚠️ Erro ao recuperar event_id:', error);
    return null;
  }
}

/**
 * Gera event_id correlacionado ao checkout
 * 
 * USO: Webhook pode usar isso para gerar Purchase event_id baseado no InitiateCheckout
 */
export function generateCorrelatedEventId(
  newEventName: string = 'Purchase'
): string {
  const checkoutEventId = getLastCheckoutEventId();
  
  if (checkoutEventId) {
    // Extrair base do checkout event_id e criar novo correlacionado
    const timestamp = Math.floor(Date.now() / 1000);
    const random = Math.random().toString(36).substring(2, 8);
    
    // Formato: {EventName}_{timestamp}_{random}_{checkoutReference}
    const correlatedId = `${newEventName}_${timestamp}_${random}_ref_${checkoutEventId.substring(0, 8)}`;
    
    console.log(`🔗 Event ID correlacionado gerado: ${correlatedId}`);
    return correlatedId;
  }
  
  // Fallback: gerar ID normal
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.random().toString(36).substring(2, 8);
  return `${newEventName}_${timestamp}_${random}`;
}

/**
 * Adiciona evento ao histórico (para análise)
 */
function addToEventHistory(eventData: PersistentEventData): void {
  try {
    const stored = localStorage.getItem(EVENT_HISTORY_KEY);
    const history: PersistentEventData[] = stored ? JSON.parse(stored) : [];
    
    history.push(eventData);
    
    // Manter apenas últimos 50 eventos
    if (history.length > 50) {
      history.shift();
    }
    
    localStorage.setItem(EVENT_HISTORY_KEY, JSON.stringify(history));
    
  } catch (error) {
    console.warn('⚠️ Erro ao adicionar ao histórico:', error);
  }
}

/**
 * Obtém histórico de eventos
 */
export function getEventHistory(): PersistentEventData[] {
  try {
    const stored = localStorage.getItem(EVENT_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.warn('⚠️ Erro ao recuperar histórico:', error);
    return [];
  }
}

/**
 * Limpa dados expirados (> 7 dias)
 */
export function cleanExpiredEventIds(): void {
  try {
    const now = Date.now();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias
    
    let cleanedCount = 0;
    
    // Limpar eventos individuais
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          const eventData: PersistentEventData = JSON.parse(stored);
          const age = now - eventData.timestamp;
          
          if (age > maxAge) {
            localStorage.removeItem(key);
            cleanedCount++;
          }
        }
      }
    }
    
    // Limpar histórico antigo
    const history = getEventHistory();
    const recentHistory = history.filter(e => (now - e.timestamp) < maxAge);
    localStorage.setItem(EVENT_HISTORY_KEY, JSON.stringify(recentHistory));
    
    console.log(`🗑️ ${cleanedCount} event IDs expirados removidos`);
    
  } catch (error) {
    console.warn('⚠️ Erro ao limpar event IDs expirados:', error);
  }
}

/**
 * Valida correlação de eventos no funil
 * 
 * Retorna análise de quais eventos estão correlacionados
 */
export function validateEventCorrelation(): {
  hasInitiateCheckout: boolean;
  checkoutAge?: number;
  correlationReady: boolean;
  recommendation: string;
} {
  const checkoutEventId = getLastCheckoutEventId();
  
  if (!checkoutEventId) {
    return {
      hasInitiateCheckout: false,
      correlationReady: false,
      recommendation: 'InitiateCheckout não encontrado. Usuário não iniciou checkout ainda.'
    };
  }
  
  const stored = localStorage.getItem(LAST_CHECKOUT_KEY);
  const eventData: PersistentEventData = JSON.parse(stored!);
  const age = Date.now() - eventData.timestamp;
  
  return {
    hasInitiateCheckout: true,
    checkoutAge: age,
    correlationReady: true,
    recommendation: `InitiateCheckout encontrado (${Math.round(age / 60000)}min atrás). Purchase pode usar event_id correlacionado.`
  };
}

/**
 * Debug: Exibe todos os eventos persistidos
 */
export function debugPersistentEvents(): void {
  console.group('🔍 DEBUG - Eventos Persistidos');
  
  const history = getEventHistory();
  console.log(`📊 Total de eventos no histórico: ${history.length}`);
  
  const checkoutEventId = getLastCheckoutEventId();
  console.log(`🛒 Último InitiateCheckout: ${checkoutEventId || 'Nenhum'}`);
  
  const correlation = validateEventCorrelation();
  console.log('🔗 Correlação:', correlation);
  
  console.table(history.slice(-10)); // Últimos 10 eventos
  
  console.groupEnd();
}

// Auto-limpeza ao carregar (não interferir com funcionamento normal)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    cleanExpiredEventIds();
  }, 5000); // Após 5s de carregamento
}
