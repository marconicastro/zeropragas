'use client';

// Tipagem para dados do usuário persistidos
interface PersistedUserData {
  email?: string;
  phone?: string;
  fullName?: string;
  city?: string;
  state?: string;
  cep?: string;
  timestamp: number;
  sessionId: string;
  consent: boolean;
}

// Configurações
const STORAGE_KEY = 'zc_user_data';
const EXPIRY_DAYS = 30; // 30 dias de persistência
const SESSION_KEY = 'zc_session_id';

// Gerar ID de sessão único
const generateSessionId = (): string => {
  return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Verificar se dados são válidos (não expiraram)
const isDataValid = (data: PersistedUserData): boolean => {
  const now = Date.now();
  const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000; // 30 dias em ms
  return (now - data.timestamp) < expiryTime;
};

// Limpar dados expirados
const cleanExpiredData = (): void => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: PersistedUserData = JSON.parse(stored);
      if (!isDataValid(data)) {
        localStorage.removeItem(STORAGE_KEY);
        console.log('🗑️ Dados expirados removidos do localStorage');
      }
    }
  } catch (error) {
    console.warn('⚠️ Erro ao limpar dados expirados:', error);
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Salvar dados do usuário com persistência (MANTENDO SESSÃO UNIFICADA)
export const saveUserData = (userData: {
  email?: string;
  phone?: string;
  fullName?: string;
  city?: string;
  state?: string;
  cep?: string;
}, consent: boolean = true): void => {
  try {
    cleanExpiredData(); // Limpar dados expirados primeiro
    
    // Obter sessão unificada (não gerar nova)
    const currentSessionId = getSessionId();
    
    const persistedData: PersistedUserData = {
      ...userData,
      timestamp: Date.now(),
      sessionId: currentSessionId, // Usar sessão existente
      consent
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedData));
    console.log('💾 Dados do usuário salvos com sessão mantida:', {
      ...persistedData,
      sessionId: currentSessionId
    });
  } catch (error) {
    console.warn('⚠️ Erro ao salvar dados do usuário:', error);
  }
};

// Recuperar dados persistidos
export const getPersistedUserData = (): PersistedUserData | null => {
  try {
    cleanExpiredData(); // Limpar dados expirados primeiro
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: PersistedUserData = JSON.parse(stored);
      if (isDataValid(data) && data.consent) {
        console.log('📥 Dados recuperados do localStorage:', data);
        return data;
      }
    }
    return null;
  } catch (error) {
    console.warn('⚠️ Erro ao recuperar dados persistidos:', error);
    return null;
  }
};

// Obter ou gerar ID de sessão UNIFICADO e PERSISTENTE
export const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  
  if (!sessionId) {
    // Tentar recuperar do localStorage primeiro (para unificar sessões)
    const storedSessionId = localStorage.getItem('zc_persistent_session');
    if (storedSessionId) {
      sessionId = storedSessionId;
      console.log('🔄 Sessão recuperada do localStorage:', sessionId);
    } else {
      // Gerar nova sessão apenas se não existir em nenhum lugar
      sessionId = generateSessionId();
      console.log('🆕 Nova sessão gerada:', sessionId);
    }
    
    // Armazenar em ambos os lugares para persistência
    sessionStorage.setItem(SESSION_KEY, sessionId);
    localStorage.setItem('zc_persistent_session', sessionId);
  }
  
  return sessionId;
};

// Forçar atualização da sessão (usado após formulário)
export const updateSessionId = (): string => {
  const newSessionId = generateSessionId();
  sessionStorage.setItem(SESSION_KEY, newSessionId);
  localStorage.setItem('zc_persistent_session', newSessionId);
  console.log('🔄 Sessão atualizada:', newSessionId);
  return newSessionId;
};

// Verificar se a sessão atual é diferente da persistida
export const hasSessionChanged = (): boolean => {
  const currentSession = sessionStorage.getItem(SESSION_KEY);
  const persistedSession = localStorage.getItem('zc_persistent_session');
  return currentSession !== persistedSession;
};

// Limpar todos os dados (logout/opt-out)
export const clearPersistedData = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    console.log('🗑️ Todos os dados do usuário foram removidos');
  } catch (error) {
    console.warn('⚠️ Erro ao limpar dados:', error);
  }
};

// Verificar se há dados persistidos
export const hasPersistedData = (): boolean => {
  const data = getPersistedUserData();
  return data !== null;
};

// Atualizar dados específicos (mantendo os existentes)
export const updatePersistedData = (updates: Partial<PersistedUserData>): void => {
  const existingData = getPersistedUserData();
  if (existingData) {
    saveUserData({
      ...existingData,
      ...updates
    }, existingData.consent);
  } else {
    saveUserData(updates);
  }
};

// Formatar dados para Meta (Advanced Matching) - CORRIGIDO E MELHORADO
export const formatUserDataForMeta = (userData: PersistedUserData | null) => {
  if (!userData) return {};
  
  // Formatar telefone - Adicionar código do país (55)
  const phoneClean = userData.phone?.replace(/\D/g, '') || '';
  let phoneWithCountry = phoneClean;
  
  // Se não tiver código do país, adicionar 55
  if (phoneClean.length === 10) {
    phoneWithCountry = `55${phoneClean}`;
  } else if (phoneClean.length === 11) {
    phoneWithCountry = `55${phoneClean}`;
  }
  
  // Separar nome e sobrenome - converter para lowercase
  const nameParts = userData.fullName?.toLowerCase().trim().split(' ') || [];
  const firstName = nameParts[0] || '';
  // CORREÇÃO: Capturar todo o sobrenome independente da quantidade
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
  
  // Formatar CEP no padrão Facebook (apenas números, já está correto)
  const zipCode = userData.cep?.replace(/\D/g, '') || '';
  
  // Adicionar country padrão Brasil
  const country = 'br';
  
  return {
    em: userData.email?.toLowerCase().trim(),
    ph: phoneWithCountry,
    fn: firstName,
    ln: lastName,
    ct: userData.city?.toLowerCase().trim() || null,
    st: userData.state?.toLowerCase().trim() || null,
    zip: zipCode || null,
    country: country,
    external_id: userData.sessionId,
    client_ip_address: null, // EXPLICAÇÃO: null é CORRETO no frontend!
    client_user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : null
  };
};

// Inicializar sistema de persistência
export const initializePersistence = (): PersistedUserData | null => {
  cleanExpiredData();
  const data = getPersistedUserData();
  
  if (data) {
    console.log('🎯 Usuário identificado via dados persistidos:', {
      email: data.email,
      fullName: data.fullName,
      sessionId: data.sessionId,
      daysStored: Math.round((Date.now() - data.timestamp) / (24 * 60 * 60 * 1000))
    });
  } else {
    console.log('👤 Novo usuário detectado, sem dados persistidos');
  }
  
  return data;
};