/**
 * 🎯 SISTEMA UNIFICADO DE DADOS DO USUÁRIO
 * 
 * Consolidação de 3 sistemas anteriores:
 * - userDataPersistence.ts
 * - unifiedUserData.ts  
 * - event-data-persistence.ts
 * 
 * FUNCIONALIDADES:
 * ✅ Persistência (localStorage + sessionStorage)
 * ✅ Geolocalização (IP + Browser API + Persistidos)
 * ✅ Formatação para Meta Pixel
 * ✅ Hashing SHA-256 de PII
 * ✅ Conformidade LGPD
 * ✅ Sistema de cache inteligente
 */

'use client';

import { getBestAvailableLocation } from './locationData';
import { getLocationWithCache } from './geolocation-cache';

// ============================================
// INTERFACES E TIPOS
// ============================================

export interface UserData {
  email?: string;
  phone?: string;
  fullName?: string;
  city?: string;
  state?: string;
  cep?: string;
  country?: string;
  timestamp: number;
  sessionId: string;
  consent: boolean;
  source?: string;
  confidence?: number;
}

export interface MetaFormattedUserData {
  em?: string | null;
  ph?: string | null;
  fn?: string | null;
  ln?: string | null;
  ct?: string | null;
  st?: string | null;
  zp?: string | null;
  country?: string | null;
  external_id?: string;
  client_ip_address?: null;
  client_user_agent?: string | null;
  client_timezone?: string;
  client_isp?: string;
  client_info_source?: string;
}

export interface CompleteUserData extends UserData {
  hashedData?: MetaFormattedUserData;
  locationSource?: string;
}

// ============================================
// CONFIGURAÇÕES
// ============================================

const CONFIG = {
  STORAGE_KEY: 'zc_user_data',
  SESSION_KEY: 'zc_session_id',
  PERSISTENT_SESSION_KEY: 'zc_persistent_session',
  EXPIRY_DAYS: 30,
  COUNTRY_DEFAULT: 'br'
} as const;

// ============================================
// UTILITÁRIOS PRIVADOS
// ============================================

/**
 * Gera ID de sessão único
 */
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Verifica se dados são válidos (não expiraram)
 */
function isDataValid(data: UserData): boolean {
  const now = Date.now();
  const expiryTime = CONFIG.EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  return (now - data.timestamp) < expiryTime;
}

/**
 * Limpa dados expirados do localStorage
 */
function cleanExpiredData(): void {
  try {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (stored) {
      const data: UserData = JSON.parse(stored);
      if (!isDataValid(data)) {
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        console.log('🗑️ Dados expirados removidos');
      }
    }
  } catch (error) {
    console.warn('⚠️ Erro ao limpar dados expirados:', error);
    localStorage.removeItem(CONFIG.STORAGE_KEY);
  }
}

/**
 * Hash SHA-256 para dados PII
 */
async function hashData(data: string | null | undefined): Promise<string | null> {
  if (!data) return null;
  
  const normalized = data.toString().toLowerCase().trim().replace(/\s+/g, '');
  
  try {
    if (typeof window === 'undefined') {
      // Server-side: usar Node.js crypto
      const crypto = await import('crypto');
      return crypto.createHash('sha256').update(normalized).digest('hex');
    } else {
      // Browser-side: usar Web Crypto API
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(normalized);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (error) {
    console.error('❌ Erro no hash SHA256:', error);
    return null;
  }
}

// ============================================
// SISTEMA DE SESSÃO
// ============================================

/**
 * Obtém ou gera ID de sessão UNIFICADO e PERSISTENTE
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();
  
  let sessionId = sessionStorage.getItem(CONFIG.SESSION_KEY);
  
  if (!sessionId) {
    // Tentar recuperar do localStorage (persistência entre abas)
    const storedSessionId = localStorage.getItem(CONFIG.PERSISTENT_SESSION_KEY);
    if (storedSessionId) {
      sessionId = storedSessionId;
      console.log('🔄 Sessão recuperada:', sessionId);
    } else {
      // Gerar nova sessão
      sessionId = generateSessionId();
      console.log('🆕 Nova sessão:', sessionId);
    }
    
    // Salvar em ambos os lugares
    sessionStorage.setItem(CONFIG.SESSION_KEY, sessionId);
    localStorage.setItem(CONFIG.PERSISTENT_SESSION_KEY, sessionId);
  }
  
  return sessionId;
}

/**
 * Força atualização da sessão
 */
export function updateSessionId(): string {
  if (typeof window === 'undefined') return generateSessionId();
  
  const newSessionId = generateSessionId();
  sessionStorage.setItem(CONFIG.SESSION_KEY, newSessionId);
  localStorage.setItem(CONFIG.PERSISTENT_SESSION_KEY, newSessionId);
  console.log('🔄 Sessão atualizada:', newSessionId);
  return newSessionId;
}

/**
 * Verifica se sessão mudou
 */
export function hasSessionChanged(): boolean {
  if (typeof window === 'undefined') return false;
  
  const currentSession = sessionStorage.getItem(CONFIG.SESSION_KEY);
  const persistedSession = localStorage.getItem(CONFIG.PERSISTENT_SESSION_KEY);
  return currentSession !== persistedSession;
}

// ============================================
// PERSISTÊNCIA DE DADOS
// ============================================

/**
 * Salva dados do usuário com persistência
 */
export function saveUserData(
  userData: Partial<UserData>,
  consent: boolean = true,
  overwrite: boolean = true
): void {
  if (typeof window === 'undefined') return;
  
  try {
    cleanExpiredData();
    
    // Se não deve sobrescrever, mesclar com dados existentes
    const existingData = overwrite ? null : getPersistedUserData();
    
    const currentSessionId = getSessionId();
    
    const persistedData: UserData = {
      ...(existingData || {}),
      ...userData,
      timestamp: Date.now(),
      sessionId: currentSessionId,
      consent
    };
    
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(persistedData));
    
    console.log('💾 Dados salvos:', {
      email: !!persistedData.email,
      phone: !!persistedData.phone,
      location: !!(persistedData.city && persistedData.state),
      sessionId: currentSessionId
    });
  } catch (error) {
    console.warn('⚠️ Erro ao salvar dados:', error);
  }
}

/**
 * Recupera dados persistidos
 */
export function getPersistedUserData(): UserData | null {
  if (typeof window === 'undefined') return null;
  
  try {
    cleanExpiredData();
    
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (stored) {
      const data: UserData = JSON.parse(stored);
      if (isDataValid(data) && data.consent) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.warn('⚠️ Erro ao recuperar dados:', error);
    return null;
  }
}

/**
 * Atualiza dados específicos (mantendo existentes)
 */
export function updatePersistedData(updates: Partial<UserData>): void {
  const existingData = getPersistedUserData();
  if (existingData) {
    saveUserData(
      { ...existingData, ...updates },
      existingData.consent,
      true
    );
  } else {
    saveUserData(updates);
  }
}

/**
 * Limpa todos os dados (logout/opt-out)
 */
export function clearPersistedData(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    sessionStorage.removeItem(CONFIG.SESSION_KEY);
    localStorage.removeItem(CONFIG.PERSISTENT_SESSION_KEY);
    console.log('🗑️ Todos os dados removidos');
  } catch (error) {
    console.warn('⚠️ Erro ao limpar dados:', error);
  }
}

/**
 * Verifica se há dados persistidos
 */
export function hasPersistedData(): boolean {
  return getPersistedUserData() !== null;
}

// ============================================
// OBTENÇÃO DE DADOS COMPLETOS
// ============================================

/**
 * Obtém dados completos do usuário
 * COMBINA: Persistidos + Geolocalização API + Fallbacks
 */
export async function getCompleteUserData(): Promise<CompleteUserData> {
  console.group('🔍 Obtendo dados completos do usuário');
  
  // 1. Dados persistidos (prioridade máxima)
  const persistedData = getPersistedUserData();
  console.log('📦 Dados persistidos:', persistedData ? '✅ Disponíveis' : '❌ Não encontrados');
  
  // 2. Geolocalização (se necessário)
  let locationData = null;
  
  if (!persistedData || !persistedData.city || !persistedData.state) {
    try {
      // Usar cache otimizado de geolocalização
      locationData = await getLocationWithCache(
        persistedData?.email,
        persistedData?.phone
      );
      console.log('🌍 Geolocalização obtida:', locationData);
    } catch (error) {
      console.warn('⚠️ Erro na geolocalização:', error);
      // Fallback para getBestAvailableLocation
      locationData = await getBestAvailableLocation();
    }
  }
  
  // 3. Combinar dados inteligentemente
  const completeData: CompleteUserData = {
    // Dados de contato (persistidos têm prioridade)
    email: persistedData?.email,
    phone: persistedData?.phone,
    fullName: persistedData?.fullName,
    
    // Dados geográficos (persistidos > API > fallback)
    city: persistedData?.city || locationData?.city || undefined,
    state: persistedData?.state || locationData?.state || undefined,
    country: persistedData?.country || locationData?.country || CONFIG.COUNTRY_DEFAULT,
    cep: persistedData?.cep || locationData?.zip || undefined,
    
    // Metadados
    sessionId: persistedData?.sessionId || getSessionId(),
    timestamp: Date.now(),
    consent: persistedData?.consent ?? true,
    source: determineSource(persistedData, locationData),
    confidence: calculateConfidence(persistedData, locationData),
    locationSource: locationData?.source
  };
  
  console.log('✅ Dados completos gerados:', {
    hasEmail: !!completeData.email,
    hasPhone: !!completeData.phone,
    hasLocation: !!(completeData.city && completeData.state),
    source: completeData.source,
    confidence: completeData.confidence
  });
  
  console.groupEnd();
  
  return completeData;
}

/**
 * Determina fonte dos dados para debugging
 */
function determineSource(persisted: UserData | null, location: any): string {
  if (persisted && (persisted.city || persisted.state || persisted.cep)) {
    return 'persisted_enriched';
  }
  if (location?.source && location.source !== 'default_brazil') {
    return 'api_enriched';
  }
  return 'minimal';
}

/**
 * Calcula confiança dos dados (0-100)
 */
function calculateConfidence(persisted: UserData | null, location: any): number {
  let confidence = 50; // Base
  
  if (persisted?.email) confidence += 15;
  if (persisted?.phone) confidence += 15;
  if (persisted?.fullName) confidence += 10;
  if (persisted?.city || location?.city) confidence += 5;
  if (persisted?.state || location?.state) confidence += 5;
  
  return Math.min(100, confidence);
}

// ============================================
// FORMATAÇÃO PARA META PIXEL
// ============================================

/**
 * Formata dados para Meta Pixel (sem hash)
 */
export function formatUserDataForMeta(userData: UserData | null): Omit<MetaFormattedUserData, 'em' | 'ph' | 'fn' | 'ln' | 'ct' | 'st' | 'zp' | 'country'> & {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  ct?: string | null;
  st?: string | null;
  zp?: string | null;
  country?: string;
} {
  if (!userData) {
    return {
      country: CONFIG.COUNTRY_DEFAULT,
      external_id: getSessionId(),
      client_ip_address: null,
      client_user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null
    };
  }
  
  // Formatar telefone com código do país (55)
  let phoneWithCountry = '';
  if (userData.phone) {
    const phoneClean = userData.phone.replace(/\D/g, '');
    if (phoneClean.length === 10 || phoneClean.length === 11) {
      phoneWithCountry = `55${phoneClean}`;
    } else {
      phoneWithCountry = phoneClean;
    }
  }
  
  // Separar nome e sobrenome
  const nameParts = userData.fullName?.toLowerCase().trim().split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  // Formatar CEP
  const zipCode = userData.cep?.replace(/\D/g, '') || '';
  
  return {
    em: userData.email?.toLowerCase().trim(),
    ph: phoneWithCountry || undefined,
    fn: firstName || undefined,
    ln: lastName || undefined,
    ct: userData.city?.toLowerCase().trim() || null,
    st: userData.state?.toLowerCase().trim() || null,
    zp: zipCode || null,
    country: userData.country || CONFIG.COUNTRY_DEFAULT,
    external_id: userData.sessionId || getSessionId(),
    client_ip_address: null,
    client_user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null
  };
}

/**
 * Formata e hasheia dados para Meta Pixel
 */
export async function formatAndHashUserData(userData: UserData | null): Promise<MetaFormattedUserData> {
  const formatted = formatUserDataForMeta(userData);
  
  return {
    em: await hashData(formatted.em),
    ph: await hashData(formatted.ph),
    fn: await hashData(formatted.fn),
    ln: await hashData(formatted.ln),
    ct: await hashData(formatted.ct),
    st: await hashData(formatted.st),
    zp: await hashData(formatted.zp),
    country: await hashData(formatted.country),
    external_id: formatted.external_id,
    client_ip_address: null,
    client_user_agent: formatted.client_user_agent
  };
}

/**
 * Obtém dados completos e hasheados para Meta Pixel
 * FUNÇÃO PRINCIPAL para uso em eventos
 */
export async function getHashedUserDataForMeta(): Promise<MetaFormattedUserData> {
  const completeData = await getCompleteUserData();
  return formatAndHashUserData(completeData);
}

// ============================================
// INICIALIZAÇÃO
// ============================================

/**
 * Inicializa sistema de persistência
 */
export function initializePersistence(): UserData | null {
  if (typeof window === 'undefined') return null;
  
  cleanExpiredData();
  const data = getPersistedUserData();
  
  if (data) {
    console.log('🎯 Usuário identificado:', {
      email: !!data.email,
      fullName: !!data.fullName,
      sessionId: data.sessionId,
      daysStored: Math.round((Date.now() - data.timestamp) / (24 * 60 * 60 * 1000))
    });
  } else {
    console.log('👤 Novo usuário detectado');
  }
  
  return data;
}

// ============================================
// EXPORTAÇÕES LEGADAS (COMPATIBILIDADE)
// ============================================

// Manter compatibilidade com código existente
export { getCompleteUserData as getStandardizedUserData };
export { formatAndHashUserData as getCompleteUserDataForMeta };
