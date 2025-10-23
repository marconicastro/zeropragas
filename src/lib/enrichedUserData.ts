/**
 * Enriquecimento de Dados do Cliente em Tempo Real
 * Integração com API /api/client-info para obter IP real e localização
 */

import { getPersistedUserData, formatUserDataForMeta } from './userDataPersistence';

// Interface para dados do cliente da API
interface ClientInfo {
  ip: string;
  city: string;
  region: string;
  regionCode: string;
  country: string;
  countryCode: string;
  postalCode: string;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  lat: number;
  lon: number;
}

// Interface para resposta da API
interface ClientInfoResponse {
  success: boolean;
  data: ClientInfo;
  timestamp: number;
}

// Cache em memória para evitar múltiplas requisições
let clientInfoCache: ClientInfoResponse | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém informações do cliente via API
 */
export async function getClientInfo(): Promise<ClientInfo | null> {
  try {
    // Verificar cache
    if (clientInfoCache && (Date.now() - clientInfoCache.timestamp) < CACHE_DURATION) {
      console.log('📦 Usando cache de informações do cliente');
      return clientInfoCache.data;
    }

    // Fazer requisição para API
    const response = await fetch('/api/client-info', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store' // Sem cache do navegador
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const apiResponse: ClientInfoResponse = await response.json();

    if (!apiResponse.success) {
      throw new Error('API returned error');
    }

    // Atualizar cache
    clientInfoCache = apiResponse;

    console.log('🎯 Informações do cliente obtidas com sucesso:', {
      ip: apiResponse.data.ip,
      city: apiResponse.data.city,
      region: apiResponse.data.region,
      regionCode: apiResponse.data.regionCode,
      country: apiResponse.data.country,
      postalCode: apiResponse.data.postalCode,
      timezone: apiResponse.data.timezone,
      isp: apiResponse.data.isp
    });

    return apiResponse.data;

  } catch (error) {
    console.error('❌ Erro ao obter informações do cliente:', error);
    return null;
  }
}

/**
 * Combina dados persistidos com dados do cliente
 * Prioridade: Dados do formulário > Dados da API > Padrão
 */
export async function getEnrichedUserData() {
  try {
    // 1. Obter dados persistidos (localStorage)
    const persistedData = getPersistedUserData();
    
    // 2. Obter dados do cliente (API)
    const clientData = await getClientInfo();
    
    // 3. Combinar dados inteligentemente
    const enrichedData = {
      // Dados pessoais (prioridade para persistidos)
      email: persistedData?.email || null,
      phone: persistedData?.phone || null,
      fullName: persistedData?.fullName || null,
      
      // Localização (combinação inteligente)
      city: persistedData?.city || clientData?.city || null,
      state: persistedData?.state || clientData?.regionCode || clientData?.region || null,
      cep: persistedData?.cep || clientData?.postalCode || null,
      country: 'br', // Sempre Brasil
      
      // Dados técnicos (API)
      client_ip_address: clientData?.ip || null,
      client_user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null,
      timezone: clientData?.timezone || null,
      isp: clientData?.isp || null,
      
      // Metadados
      sessionId: persistedData?.sessionId || null,
      timestamp: Date.now(),
      dataSource: {
        email: persistedData?.email ? 'persisted' : null,
        phone: persistedData?.phone ? 'persisted' : null,
        fullName: persistedData?.fullName ? 'persisted' : null,
        city: persistedData?.city ? 'persisted' : (clientData?.city ? 'api' : null),
        state: persistedData?.state ? 'persisted' : (clientData?.regionCode ? 'api' : null),
        cep: persistedData?.cep ? 'persisted' : (clientData?.postalCode ? 'api' : null),
        ip: clientData?.ip ? 'api' : null
      }
    };

    console.log('🔥 Dados enriquecidos combinados:', {
      temEmail: !!enrichedData.email,
      temPhone: !!enrichedData.phone,
      temCity: !!enrichedData.city,
      temState: !!enrichedData.state,
      temCEP: !!enrichedData.cep,
      temIP: !!enrichedData.client_ip_address,
      fontes: enrichedData.dataSource
    });

    return enrichedData;

  } catch (error) {
    console.error('❌ Erro ao enriquecer dados do usuário:', error);
    
    // Fallback para dados persistidos
    const persistedData = getPersistedUserData();
    if (persistedData) {
      return formatUserDataForMeta(persistedData);
    }
    
    return {};
  }
}

/**
 * Formata dados enriquecidos para Meta
 */
export async function formatEnrichedDataForMeta() {
  const enrichedData = await getEnrichedUserData();
  
  if (!enrichedData || Object.keys(enrichedData).length === 0) {
    return {};
  }

  // Formatar telefone
  const phoneClean = enrichedData.phone?.replace(/\D/g, '') || '';
  let phoneWithCountry = phoneClean;
  
  if (phoneClean.length === 10) {
    phoneWithCountry = `55${phoneClean}`;
  } else if (phoneClean.length === 11) {
    phoneWithCountry = `55${phoneClean}`;
  }
  
  // Separar nome e sobrenome
  const nameParts = enrichedData.fullName?.toLowerCase().trim().split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  // Formatar CEP
  const zipCode = enrichedData.cep?.replace(/\D/g, '') || '';

  return {
    em: enrichedData.email?.toLowerCase().trim(),
    ph: phoneWithCountry,
    fn: firstName,
    ln: lastName,
    ct: enrichedData.city?.toLowerCase().trim() || null,
    st: enrichedData.state?.toLowerCase().trim() || null,
    zip: zipCode || null,
    country: enrichedData.country?.toLowerCase() || 'br',
    external_id: enrichedData.sessionId,
    client_ip_address: enrichedData.client_ip_address, // ✅ IP REAL DA API
    client_user_agent: enrichedData.client_user_agent,
    timezone: enrichedData.timezone,
    isp: enrichedData.isp
  };
}

/**
 * Limpa cache de informações do cliente
 */
export function clearClientInfoCache(): void {
  clientInfoCache = null;
  console.log('🗑️ Cache de informações do cliente limpo');
}

/**
 * Verifica se há dados enriquecidos disponíveis
 */
export async function hasEnrichedData(): Promise<boolean> {
  const enrichedData = await getEnrichedUserData();
  return !!(enrichedData && (
    enrichedData.city || 
    enrichedData.state || 
    enrichedData.cep || 
    enrichedData.client_ip_address
  ));
}

/**
 * Debug: Mostra status dos dados enriquecidos
 */
export async function debugEnrichedData() {
  const enrichedData = await getEnrichedUserData();
  const clientData = await getClientInfo();
  const persistedData = getPersistedUserData();
  
  console.group('🔍 DEBUG - Dados Enriquecidos');
  console.log('📦 Dados Persistidos:', persistedData);
  console.log('🌐 Dados da API:', clientData);
  console.log('🔥 Dados Combinados:', enrichedData);
  console.log('✅ Tem Dados Enriquecidos?', await hasEnrichedData());
  console.groupEnd();
  
  return {
    persisted: persistedData,
    api: clientData,
    enriched: enrichedData,
    hasEnriched: await hasEnrichedData()
  };
}