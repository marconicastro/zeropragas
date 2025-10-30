// 🗄️ Cache Server-Side para Dados Preparados do Client-Side
// Permite que o webhook acesse dados do localStorage sem requisições HTTP

interface PreparedDataCache {
  preparedEvent: any;
  fallbackData: any;
  timestamp: number;
  source: string;
}

// Cache em memória no server-side
let cache: PreparedDataCache | null = null;

// 📤 Armazenar dados preparados no cache server-side
export function setServerPreparedData(preparedEvent: any, fallbackData: any, source: string = 'client_side'): void {
  console.log('📤 [CACHE-SERVER] Armazenando dados preparados no cache server-side:', {
    source,
    has_prepared_event: !!preparedEvent,
    prepared_event_id: preparedEvent?.id,
    has_fallback_data: !!fallbackData,
    timestamp: Date.now()
  });
  
  cache = {
    preparedEvent,
    fallbackData,
    timestamp: Date.now(),
    source
  };
  
  // Limpar cache após 30 minutos para evitar dados obsoletos
  setTimeout(() => {
    if (cache && cache.timestamp === Date.now()) {
      console.log('🧹 [CACHE-SERVER] Cache expirado e limpo automaticamente');
      cache = null;
    }
  }, 30 * 60 * 1000); // 30 minutos
}

// 🔍 Recuperar dados preparados do cache server-side
export function getServerPreparedData(): PreparedDataCache | null {
  if (!cache) {
    console.log('⚠️ [CACHE-SERVER] Nenhum dado encontrado no cache');
    return null;
  }
  
  // Verificar se o cache não está muito antigo (mais de 30 minutos)
  const age = Date.now() - cache.timestamp;
  if (age > 30 * 60 * 1000) {
    console.log('⏰ [CACHE-SERVER] Cache expirado, limpando...');
    cache = null;
    return null;
  }
  
  console.log('✅ [CACHE-SERVER] Dados recuperados do cache:', {
    source: cache.source,
    has_prepared_event: !!cache.preparedEvent,
    prepared_event_id: cache.preparedEvent?.id,
    has_fallback_data: !!cache.fallbackData,
    cache_age_minutes: Math.round(age / 60000),
    timestamp: cache.timestamp
  });
  
  return cache;
}

// 🧹 Limpar cache manualmente
export function clearServerPreparedData(): void {
  console.log('🧹 [CACHE-SERVER] Cache limpo manualmente');
  cache = null;
}

// 📊 Obter informações do cache
export function getCacheInfo(): any {
  if (!cache) {
    return {
      has_data: false,
      message: 'Cache vazio'
    };
  }
  
  const age = Date.now() - cache.timestamp;
  
  return {
    has_data: true,
    source: cache.source,
    has_prepared_event: !!cache.preparedEvent,
    has_fallback_data: !!cache.fallbackData,
    cache_age_minutes: Math.round(age / 60000),
    timestamp: cache.timestamp,
    is_expired: age > 30 * 60 * 1000
  };
}

console.log('🗄️ [CACHE-SERVER] Sistema de cache server-side para dados preparados carregado');