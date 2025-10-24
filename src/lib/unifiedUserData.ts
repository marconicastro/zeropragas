/**
 * Sistema Unificado de Dados do Usuário
 * COMBINA: Dados Persistidos + Geolocalização API + Sessão Unificada
 * 
 * Esta é a LÓGICA COMPLETA usada pelo PageViewEnriched (100% de cobertura)
 * AGORA PADRONIZADA PARA TODOS OS EVENTOS!
 */

import { getPersistedUserData, formatUserDataForMeta } from './userDataPersistence';
import { getBestAvailableLocation } from './locationData';

/**
 * Interface para dados completos do usuário
 */
interface CompleteUserData {
  // Dados de contato (persistidos)
  email?: string;
  phone?: string;
  fullName?: string;
  
  // Dados geográficos (API + persistidos)
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  
  // Metadados
  sessionId: string;
  timestamp: number;
  source: string;
}

/**
 * SISTEMA UNIFICADO - A LÓGICA COMPLETA!
 * Combina dados persistidos com geolocalização automática
 * 
 * ORDEM DE PRIORIDADE:
 * 1. Dados persistidos (formulário) - MÁXIMA PRIORIDADE
 * 2. Geolocalização por API (IP/Browser) - PREENCHE LACUNAS
 * 3. Padrões seguros - GARANTE COBERTURA
 */
export async function getCompleteUserData(): Promise<CompleteUserData> {
  console.group('🔍 SISTEMA UNIFICADO - Obtendo Dados Completos');
  
  // 1. Obter dados persistidos (formulário)
  const persistedData = getPersistedUserData();
  console.log('📦 Dados Persistidos:', persistedData ? '✅ Disponíveis' : '❌ Não encontrados');
  
  // 2. Obter geolocalização automática (API)
  const locationData = await getBestAvailableLocation();
  console.log('🌍 Geolocalização API:', locationData);
  
  // 3. COMBINAR INTELIGENTEMENTE
  const completeData: CompleteUserData = {
    // Dados de contato: usar persistidos (se existirem)
    email: persistedData?.email,
    phone: persistedData?.phone,
    fullName: persistedData?.fullName,
    
    // Dados geográficos: PRIORIDADE para persistidos, fallback para API
    city: persistedData?.city || locationData.city || undefined,
    state: persistedData?.state || locationData.state || undefined,
    country: persistedData?.country || locationData.country || 'br', // Sempre Brasil
    zip: persistedData?.cep || locationData.zip || undefined,
    
    // Metadados
    sessionId: persistedData?.sessionId || generateSessionId(),
    timestamp: Date.now(),
    source: determineSource(persistedData, locationData)
  };
  
  console.log('🎯 DADOS COMPLETOS GERADOS:', completeData);
  console.groupEnd();
  
  return completeData;
}

/**
 * Determina a fonte dos dados para debugging
 */
function determineSource(persisted: any, location: any): string {
  if (persisted && (persisted.city || persistedData?.state || persistedData?.cep)) {
    return 'persisted_enriched';
  }
  if (location.source !== 'default_brazil') {
    return 'api_enriched';
  }
  return 'minimal';
}

/**
 * Gera ID de sessão se necessário
 */
function generateSessionId(): string {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Formata dados COMPLETOS para Meta Pixel (com HASH)
 * Esta é a função que garante 100% de cobertura!
 */
export async function formatCompleteUserDataForMeta(): Promise<{
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  ct?: string;
  st?: string;
  zp?: string;
  country?: string;
  external_id?: string;
  client_ip_address?: null;
  client_user_agent?: string;
}> {
  // Obter dados completos
  const completeData = await getCompleteUserData();
  
  // Formatar para Meta (já existente, mas com dados completos)
  const formattedData = formatUserDataForMeta(completeData as any);
  
  // Adicionar dados geográficos da API (se não existirem nos persistidos)
  if (!formattedData.ct && completeData.city) {
    formattedData.ct = completeData.city.toLowerCase().trim();
  }
  if (!formattedData.st && completeData.state) {
    formattedData.st = completeData.state.toLowerCase().trim();
  }
  if (!formattedData.zp && completeData.zip) {
    formattedData.zp = completeData.zip.replace(/\D/g, '');
  }
  
  console.log('📤 Dados formatados para Meta:', formattedData);
  return formattedData;
}

/**
 * Hash SHA256 conforme exigência do Facebook
 */
async function hashData(data: string | null | undefined): Promise<string | null> {
  if (!data) return null;
  
  const normalized = data.toString().toLowerCase().trim().replace(/\s+/g, '');
  
  try {
    const encoder = new TextEncoder();
    const dataUint8Array = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Erro no hash:', error);
    return null;
  }
}

/**
 * Formata e hasheia dados completos para Meta Pixel
 * Esta é a FUNÇÃO FINAL que todos os eventos devem usar!
 */
export async function getHashedUserDataForMeta(): Promise<{
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  ct?: string;
  st?: string;
  zp?: string;
  country?: string;
  external_id?: string;
  client_ip_address?: null;
  client_user_agent?: string;
}> {
  // Obter dados formatados (sem hash)
  const formattedData = await formatCompleteUserDataForMeta();
  
  // Aplicar hash nos campos obrigatórios
  const hashedData = {
    em: await hashData(formattedData.em),
    ph: await hashData(formattedData.ph),
    fn: await hashData(formattedData.fn),
    ln: await hashData(formattedData.ln),
    ct: await hashData(formattedData.ct),
    st: await hashData(formattedData.st),
    zp: await hashData(formattedData.zp),
    country: await hashData(formattedData.country),
    external_id: formattedData.external_id, // Não hashear external_id
    client_ip_address: null, // CORRETO: null no frontend
    client_user_agent: formattedData.client_user_agent
  };
  
  console.log('🔐 Dados hasheados para Meta:', hashedData);
  return hashedData;
}

/**
 * Função principal para todos os eventos
 * Garante a mesma lógica do PageViewEnriched para todos
 */
export async function getStandardizedUserData() {
  return await getHashedUserDataForMeta();
}

/**
 * Debug: Compara qualidade dos dados antes/depois
 */
export async function debugDataQuality() {
  console.group('📊 ANÁLISE DE QUALIDADE DE DADOS');
  
  // Dados antigos (apenas persistidos)
  const oldData = formatUserDataForMeta(getPersistedUserData());
  console.log('📦 Dados Antigos (apenas persistidos):', oldData);
  
  // Dados novos (completos)
  const newData = await formatCompleteUserDataForMeta();
  console.log('🚀 Dados Novos (completos + API):', newData);
  
  // Comparação
  const comparison = {
    city_improved: !oldData.ct && newData.ct,
    state_improved: !oldData.st && newData.st,
    zip_improved: !oldData.zp && newData.zp,
    country_improved: !oldData.country && newData.country,
    total_fields_before: Object.values(oldData).filter(v => v).length,
    total_fields_after: Object.values(newData).filter(v => v).length
  };
  
  console.log('📈 MELHORIAS OBTIDAS:', comparison);
  console.groupEnd();
  
  return comparison;
}