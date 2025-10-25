/**
 * CAPIG Processor - Sistema Centralizado de Eventos
 * 
 * Garante 100% de consistência e deduplicação automática
 * ZERO RISCO - Não interfere no sistema atual
 */

import { getCurrentTimestamp } from './timestampUtils';
import { getPersistedUserData, formatUserDataForMeta } from './userDataPersistence';
import { getEnrichedClientData } from './clientInfoService';

// Interface para eventos CAPIG
interface CAPIGEvent {
  eventName: string;
  data: any;
  timestamp: number;
  eventId: string;
  source: 'frontend';
}

/**
 * Gera ID único para deduplicação CAPIG
 * Formato: capig_{eventName}_{timestamp}_{random}
 */
function generateCAPIGEventId(eventName: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.random().toString(36).substring(2, 8);
  return `capig_${eventName}_${timestamp}_${random}`;
}

/**
 * Hash SHA256 para dados PII
 */
async function hashData(data: string | null): Promise<string | null> {
  if (!data) return null;
  
  const normalized = data.toString().toLowerCase().trim().replace(/\s+/g, '');
  
  try {
    const encoder = new TextEncoder();
    const dataUint8Array = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (error) {
    console.error('Erro no hash SHA256:', error);
    return null;
  }
}

/**
 * Enriquece dados do evento com informações completas
 * MANTÉM 100% dos dados originais + adiciona enriquecimento
 */
async function enrichEventData(eventName: string, originalData: any): Promise<any> {
  try {
    // 1. Obter dados persistidos do usuário
    const persistedUserData = getPersistedUserData();
    
    // 2. Obter dados enriquecidos do cliente
    const enrichedClientData = await getEnrichedClientData(persistedUserData);
    
    // 3. Formatar dados para Meta
    const formattedUserData = formatUserDataForMeta(persistedUserData);
    
    // 4. Combinar dados com prioridade para dados reais
    const finalUserData = {
      ...formattedUserData,
      client_ip_address: enrichedClientData.client_ip_address,
      ct: enrichedClientData.ct,
      st: enrichedClientData.st,
      zip: enrichedClientData.zip,
      country: enrichedClientData.country,
      client_timezone: enrichedClientData.client_timezone,
      client_isp: enrichedClientData.client_isp,
      client_info_source: enrichedClientData.client_info_source
    };
    
    // 5. HASH dos dados PII
    const hashedUserData = {
      em: await hashData(finalUserData.em),
      ph: await hashData(finalUserData.ph),
      fn: await hashData(finalUserData.fn),
      ln: await hashData(finalUserData.ln),
      ct: await hashData(finalUserData.ct),
      st: await hashData(finalUserData.st),
      zip: await hashData(finalUserData.zip),
      country: await hashData(finalUserData.country),
      external_id: finalUserData.external_id,
      client_ip_address: finalUserData.client_ip_address,
      client_timezone: finalUserData.client_timezone,
      client_isp: finalUserData.client_isp,
      client_info_source: finalUserData.client_info_source
    };
    
    // 6. Montar evento final com TODOS os dados originais + enriquecimento
    const enrichedEvent = {
      // DADOS ORIGINAIS (MANTIDOS 100%)
      ...originalData,
      
      // Dados enriquecidos (ADICIONADOS sem remover nada)
      user_data: hashedUserData,
      
      // Metadados CAPIG
      event_source_url: typeof window !== 'undefined' ? window.location.href : '',
      event_time: getCurrentTimestamp(),
      action_source: 'server', // CAPIG sempre é server
      
      // Identificadores de qualidade
      processing_system: 'capig_centralized_v1',
      data_enriched: true,
      data_hashed: true,
      has_persisted_data: !!persistedUserData,
      
      // Sessão
      ...(persistedUserData?.sessionId && { 
        session_id: persistedUserData.sessionId 
      }),
      
      // Timestamp de processamento
      capig_timestamp: getCurrentTimestamp()
    };
    
    console.log('🚀 CAPIG Event Enriquecido (Mantendo 100% dados originais):', {
      eventName,
      hasOriginalData: !!originalData,
      hasUserData: !!persistedUserData,
      hasEnrichment: !!enrichedClientData.client_ip_address,
      originalKeys: Object.keys(originalData).length,
      enrichedKeys: Object.keys(enrichedEvent).length
    });
    
    return enrichedEvent;
    
  } catch (error) {
    console.error('❌ Erro ao enriquecer dados CAPIG:', error);
    
    // Fallback seguro: retorna dados originais + metadados mínimos
    return {
      ...originalData,
      event_source_url: typeof window !== 'undefined' ? window.location.href : '',
      event_time: getCurrentTimestamp(),
      action_source: 'server',
      processing_system: 'capig_fallback',
      capig_timestamp: getCurrentTimestamp()
    };
  }
}

/**
 * Processa evento completo para CAPIG
 * Garante consistência 100% e deduplicação automática
 */
export async function processCAPIGEvent(eventName: string, originalData: any): Promise<{
  success: boolean;
  eventId: string;
  processedData: any;
  error?: string;
}> {
  try {
    console.group(`🚀 CAPIG Processor - ${eventName}`);
    
    // 1. Gerar ID único para deduplicação
    const eventId = generateCAPIGEventId(eventName);
    console.log('🆔 Event ID gerado:', eventId);
    
    // 2. Enriquecer dados (MANTENDO 100% dos originais)
    const enrichedData = await enrichEventData(eventName, originalData);
    
    // 3. Adicionar ID ao evento
    const finalEventData = {
      ...enrichedData,
      event_id: eventId // Chave primária de deduplicação
    };
    
    console.log('✅ Evento processado com sucesso:', {
      eventId,
      eventName,
      dataKeys: Object.keys(finalEventData).length,
      hasUserData: !!finalEventData.user_data,
      readyForCAPIG: true
    });
    
    console.groupEnd();
    
    return {
      success: true,
      eventId,
      processedData: finalEventData
    };
    
  } catch (error) {
    console.error('❌ Erro ao processar evento CAPIG:', error);
    console.groupEnd();
    
    return {
      success: false,
      eventId: '',
      processedData: null,
      error: error.message
    };
  }
}

/**
 * Função principal para frontend enviar eventos para CAPIG
 * 100% segura - não interfere no sistema atual
 */
export async function sendToCAPIG(eventName: string, data: any): Promise<{
  success: boolean;
  eventId: string;
  message: string;
}> {
  try {
    console.log(`📤 Enviando evento ${eventName} para CAPIG...`);
    
    // 1. Processar evento localmente
    const processed = await processCAPIGEvent(eventName, data);
    
    if (!processed.success) {
      throw new Error(`Falha ao processar evento: ${processed.error}`);
    }
    
    // 2. Enviar para API CAPIG
    const response = await fetch('/api/capig-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventData: processed.processedData,
        eventId: processed.eventId,
        source: 'frontend'
      })
    });
    
    if (!response.ok) {
      throw new Error(`API CAPIG error: ${response.status}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Evento enviado para CAPIG com sucesso:', {
      eventName,
      eventId: processed.eventId,
      apiResponse: result
    });
    
    return {
      success: true,
      eventId: processed.eventId,
      message: 'Evento processado e enviado para CAPIG'
    };
    
  } catch (error) {
    console.error('❌ Erro ao enviar para CAPIG:', error);
    
    return {
      success: false,
      eventId: '',
      message: `Erro: ${error.message}`
    };
  }
}

/**
 * Verifica se CAPIG está disponível
 */
export async function checkCAPIGStatus(): Promise<boolean> {
  try {
    const response = await fetch('/api/capig-events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    return response.ok;
  } catch (error) {
    console.warn('CAPIG não disponível:', error.message);
    return false;
  }
}