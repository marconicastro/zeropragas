/**
 * 🚀 SISTEMA DE ENRIQUECIMENTO MODULAR
 * 
 * Orquestra coleta de dados de múltiplas fontes de forma otimizada
 */

import { getDeviceData } from './device';
import { getPerformanceData } from './performance';
import { getFacebookAdsData } from './facebook';
import { getSessionData } from './session';

// Re-exportar tipos
export type { 
  EnrichmentData, 
  DeviceData, 
  PerformanceData, 
  FacebookAdsData, 
  SessionData 
} from './types';

// Importar tipo localmente
import type { EnrichmentData } from './types';

/**
 * Coleta todos os dados de enriquecimento de forma otimizada
 * Executa coletas em paralelo quando possível
 */
export async function getAdvancedEnrichment(): Promise<EnrichmentData> {
  try {
    // Executar coletas em paralelo para otimizar performance
    const [deviceData, performanceData, facebookData, sessionData] = await Promise.all([
      Promise.resolve(getDeviceData()),
      Promise.resolve(getPerformanceData()),
      Promise.resolve(getFacebookAdsData()),
      Promise.resolve(getSessionData())
    ]);
    
    return {
      ...deviceData,
      ...performanceData,
      ...facebookData,
      ...sessionData
    };
  } catch (error) {
    console.error('❌ Erro no enriquecimento:', error);
    
    // Fallback: retornar dados mínimos
    return {
      ...getDeviceData(),
      ...getPerformanceData(),
      ...getFacebookAdsData(),
      ...getSessionData()
    };
  }
}

// Exportar funções individuais para uso específico
export { getDeviceData } from './device';
export { getPerformanceData } from './performance';
export { getFacebookAdsData } from './facebook';
export { getSessionData } from './session';
