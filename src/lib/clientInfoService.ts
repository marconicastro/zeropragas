/**
 * Serviço de Informações do Cliente
 * Obtém dados em tempo real do IP e localização
 */

interface ClientInfo {
  ip: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  regionCode: string | null;
  timezone: string | null;
  isp: string | null;
  timestamp: number;
}

interface ClientInfoResponse {
  success: boolean;
  data: ClientInfo;
  error?: string;
}

/**
 * Cache para evitar múltiplas requisições
 */
let clientInfoCache: ClientInfo | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém informações do cliente em tempo real
 */
export async function getClientInfo(): Promise<ClientInfo> {
  try {
    // Verificar cache
    if (clientInfoCache && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      console.log('📦 Usando client info do cache');
      return clientInfoCache;
    }

    console.log('🌐 Obtendo client info em tempo real...');
    
    const response = await fetch('/api/client-info', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result: ClientInfoResponse = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Falha ao obter client info');
    }

    // Atualizar cache
    clientInfoCache = result.data;
    cacheTimestamp = Date.now();

    console.log('✅ Client info obtida com sucesso:', {
      ip: result.data.ip,
      city: result.data.city,
      state: result.data.state,
      zip: result.data.zip,
      country: result.data.country
    });

    return result.data;

  } catch (error) {
    console.error('❌ Erro ao obter client info:', error);
    
    // Retornar dados básicos como fallback
    const fallbackData: ClientInfo = {
      ip: '0.0.0.0',
      city: null,
      state: null,
      zip: null,
      country: 'br',
      regionCode: null,
      timezone: null,
      isp: null,
      timestamp: Date.now()
    };

    return fallbackData;
  }
}

/**
 * Limpa o cache forçadamente
 */
export function clearClientInfoCache(): void {
  clientInfoCache = null;
  cacheTimestamp = 0;
  console.log('🗑️ Cache de client info limpo');
}

/**
 * Verifica se o cache é válido
 */
export function isClientInfoCacheValid(): boolean {
  return clientInfoCache !== null && (Date.now() - cacheTimestamp) < CACHE_DURATION;
}

/**
 * Obtém informações do cliente sem cache (força requisição)
 */
export async function getFreshClientInfo(): Promise<ClientInfo> {
  clearClientInfoCache();
  return getClientInfo();
}

/**
 * Combina dados persistidos com dados do cliente
 * Prioridade: Dados do formulário > Dados do cliente > Padrão
 */
export async function getEnrichedClientData(persistedData?: any) {
  try {
    // 1. Obter dados do cliente em tempo real
    const clientInfo = await getClientInfo();
    
    // 2. Combinar com dados persistidos
    const enrichedData = {
      // Dados do cliente (prioridade para IP real)
      client_ip_address: clientInfo.ip !== '0.0.0.0' ? clientInfo.ip : null,
      client_timezone: clientInfo.timezone,
      client_isp: clientInfo.isp,
      
      // Localização (mesclar dados)
      ct: persistedData?.city || clientInfo.city || null,
      st: persistedData?.state || clientInfo.state || null,
      zip: persistedData?.cep || clientInfo.zip || null,
      country: 'br', // Sempre Brasil
      
      // Metadados
      client_info_source: clientInfo.ip !== '0.0.0.0' ? 'api' : 'fallback',
      client_info_timestamp: clientInfo.timestamp,
      
      // Dados persistidos (se disponíveis)
      ...(persistedData && {
        em: persistedData.email?.toLowerCase().trim(),
        ph: persistedData.phone?.replace(/\D/g, ''),
        fn: persistedData.fullName?.toLowerCase().trim().split(' ')[0] || '',
        ln: persistedData.fullName?.toLowerCase().trim().split(' ').slice(1).join(' ') || '',
        external_id: persistedData.sessionId
      })
    };

    console.log('🎯 Dados enriquecidos combinados:', {
      hasPersistedData: !!persistedData,
      hasRealIP: !!enrichedData.client_ip_address,
      city: enrichedData.ct,
      state: enrichedData.st,
      zip: enrichedData.zip,
      country: enrichedData.country,
      source: enrichedData.client_info_source
    });

    return enrichedData;

  } catch (error) {
    console.error('❌ Erro ao enriquecer dados do cliente:', error);
    
    // Fallback básico
    return {
      client_ip_address: null,
      client_timezone: null,
      client_isp: null,
      ct: persistedData?.city || null,
      st: persistedData?.state || null,
      zip: persistedData?.cep || null,
      country: 'br',
      client_info_source: 'error',
      client_info_timestamp: Date.now(),
      ...(persistedData && {
        em: persistedData.email?.toLowerCase().trim(),
        ph: persistedData.phone?.replace(/\D/g, ''),
        fn: persistedData.fullName?.toLowerCase().trim().split(' ')[0] || '',
        ln: persistedData.fullName?.toLowerCase().trim().split(' ').slice(1).join(' ') || '',
        external_id: persistedData.sessionId
      })
    };
  }
}