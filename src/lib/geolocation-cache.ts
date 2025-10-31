/**
 * 🗺️ SISTEMA DE CACHE DE GEOLOCALIZAÇÃO
 * 
 * OBJETIVO: Reduzir latência do webhook eliminando chamadas repetidas à API externa
 * 
 * SEGURANÇA: Este é um NOVO serviço auxiliar que NÃO modifica código existente
 * USO OPCIONAL: Webhook pode continuar usando API direta
 */

interface CachedLocation {
  city: string;
  state: string;
  country: string;
  zip: string;
  timestamp: number;
}

interface LocationCacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  cacheSize: number;
  hitRate: number;
}

// Cache em memória (persiste durante execução do servidor)
const locationCache = new Map<string, CachedLocation>();

// Configurações
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 dias
const MAX_CACHE_SIZE = 10000; // Máximo 10k IPs

/**
 * Busca localização com cache inteligente
 * 
 * FLUXO:
 * 1. Verifica cache em memória (< 1ms)
 * 2. Se não encontrou, consulta API externa
 * 3. Salva resultado no cache
 * 4. Retorna dados
 */
export async function getLocationWithCache(
  email?: string,
  phone?: string,
  fallbackIP?: string
): Promise<CachedLocation> {
  
  // Gerar chave única para cache
  const cacheKey = generateCacheKey(email, phone, fallbackIP);
  
  // 1. TENTAR CACHE PRIMEIRO
  const cached = locationCache.get(cacheKey);
  if (cached) {
    const age = Date.now() - cached.timestamp;
    
    // Se cache ainda é válido, usar
    if (age < CACHE_TTL) {
      console.log(`✅ Cache HIT para ${cacheKey.substring(0, 10)}... (${Math.round(age / 3600000)}h atrás)`);
      incrementStat('hits');
      return cached;
    } else {
      // Cache expirado, remover
      locationCache.delete(cacheKey);
      console.log(`⏰ Cache EXPIRADO para ${cacheKey.substring(0, 10)}...`);
    }
  }
  
  // 2. CACHE MISS - BUSCAR NA API
  console.log(`❌ Cache MISS para ${cacheKey.substring(0, 10)}... - Consultando API`);
  incrementStat('misses');
  
  const location = await fetchLocationFromAPI();
  
  // 3. SALVAR NO CACHE
  const cachedData: CachedLocation = {
    ...location,
    timestamp: Date.now()
  };
  
  // Limitar tamanho do cache
  if (locationCache.size >= MAX_CACHE_SIZE) {
    const firstKey = locationCache.keys().next().value;
    locationCache.delete(firstKey);
    console.log('🗑️ Cache cheio, removendo entrada mais antiga');
  }
  
  locationCache.set(cacheKey, cachedData);
  console.log(`💾 Localização salva no cache: ${location.city}, ${location.state}`);
  
  return cachedData;
}

/**
 * Busca localização na API externa (mesma lógica do webhook)
 */
async function fetchLocationFromAPI(): Promise<Omit<CachedLocation, 'timestamp'>> {
  try {
    const response = await fetch(
      'http://ip-api.com/json/?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query',
      { 
        signal: AbortSignal.timeout(3000) // Timeout de 3s
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.status === 'success') {
        return {
          city: data.city || 'sao paulo',
          state: data.regionName?.toLowerCase() || 'sao paulo',
          country: 'br',
          zip: data.zip || '01310'
        };
      }
    }
    
    throw new Error('API retornou erro');
    
  } catch (error) {
    console.warn('⚠️ Erro ao consultar API de geolocalização, usando fallback:', error);
    
    // Fallback padrão Brasil
    return {
      city: 'sao paulo',
      state: 'sao paulo',
      country: 'br',
      zip: '01310'
    };
  }
}

/**
 * Gera chave única para cache baseada em dados do usuário
 */
function generateCacheKey(email?: string, phone?: string, fallbackIP?: string): string {
  // Usar email/phone como chave quando disponível (mais preciso)
  if (email) {
    return `email_${hashSimple(email)}`;
  }
  if (phone) {
    return `phone_${hashSimple(phone)}`;
  }
  if (fallbackIP) {
    return `ip_${fallbackIP}`;
  }
  
  // Fallback genérico (sempre retorna mesma localização)
  return 'generic_br';
}

/**
 * Hash simples para gerar chaves (não é SHA-256, apenas para cache)
 */
function hashSimple(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

// Estatísticas simples
let stats = {
  hits: 0,
  misses: 0
};

function incrementStat(type: 'hits' | 'misses') {
  stats[type]++;
}

/**
 * Obtém estatísticas do cache
 */
export function getCacheStats(): LocationCacheStats {
  const totalRequests = stats.hits + stats.misses;
  const hitRate = totalRequests > 0 ? (stats.hits / totalRequests) * 100 : 0;
  
  return {
    hits: stats.hits,
    misses: stats.misses,
    totalRequests,
    cacheSize: locationCache.size,
    hitRate: Math.round(hitRate * 100) / 100
  };
}

/**
 * Limpa todo o cache (útil para testes)
 */
export function clearCache(): void {
  locationCache.clear();
  stats = { hits: 0, misses: 0 };
  console.log('🗑️ Cache de geolocalização limpo');
}

/**
 * Pré-aquece cache com localizações comuns
 */
export async function warmupCache(commonEmails: string[]): Promise<void> {
  console.log(`🔥 Pré-aquecendo cache com ${commonEmails.length} emails...`);
  
  for (const email of commonEmails) {
    await getLocationWithCache(email);
  }
  
  console.log(`✅ Cache pré-aquecido: ${locationCache.size} entradas`);
}

/**
 * Exporta cache para persistência (opcional)
 */
export function exportCache(): string {
  const cacheArray = Array.from(locationCache.entries());
  return JSON.stringify(cacheArray);
}

/**
 * Importa cache de persistência (opcional)
 */
export function importCache(cacheData: string): void {
  try {
    const cacheArray = JSON.parse(cacheData);
    for (const [key, value] of cacheArray) {
      locationCache.set(key, value);
    }
    console.log(`📥 Cache importado: ${locationCache.size} entradas`);
  } catch (error) {
    console.error('❌ Erro ao importar cache:', error);
  }
}
