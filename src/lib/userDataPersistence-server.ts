// 🚀 Sistema de Persistência de Dados do Usuário - Versão Server-Side
// VERSÃO SERVER-SIDE: Sem dependências de localStorage/sessionStorage/window

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
const EXPIRY_DAYS = 30; // 30 dias de persistência

// 📦 Armazenamento em memória server-side
let serverStorage: {
  userData: PersistedUserData | null;
  sessionId: string | null;
} = {
  userData: null,
  sessionId: null
};

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
    if (serverStorage.userData) {
      if (!isDataValid(serverStorage.userData)) {
        serverStorage.userData = null;
        console.log('🗑️ Dados expirados removidos do servidor');
      }
    }
  } catch (error) {
    console.warn('⚠️ Erro ao limpar dados expirados:', error);
    serverStorage.userData = null;
  }
};

// Salvar dados do usuário com persistência (MANTENDO SESSÃO UNIFICADA)
export const saveUserDataServer = (userData: {
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
    const currentSessionId = getSessionIdServer();
    
    const persistedData: PersistedUserData = {
      ...userData,
      timestamp: Date.now(),
      sessionId: currentSessionId, // Usar sessão existente
      consent
    };
    
    serverStorage.userData = persistedData;
    console.log('💾 [SERVER] Dados do usuário salvos com sessão mantida:', {
      ...persistedData,
      sessionId: currentSessionId
    });
  } catch (error) {
    console.warn('⚠️ [SERVER] Erro ao salvar dados do usuário:', error);
  }
};

// Recuperar dados persistidos
export const getPersistedUserDataServer = (): PersistedUserData | null => {
  try {
    cleanExpiredData(); // Limpar dados expirados primeiro
    
    if (serverStorage.userData) {
      if (isDataValid(serverStorage.userData) && serverStorage.userData.consent) {
        console.log('📥 [SERVER] Dados recuperados do servidor:', serverStorage.userData);
        return serverStorage.userData;
      }
    }
    return null;
  } catch (error) {
    console.warn('⚠️ [SERVER] Erro ao recuperar dados persistidos:', error);
    return null;
  }
};

// Obter ou gerar ID de sessão UNIFICADO e PERSISTENTE
export const getSessionIdServer = (): string => {
  if (!serverStorage.sessionId) {
    // Gerar nova sessão apenas se não existir
    serverStorage.sessionId = generateSessionId();
    console.log('🆕 [SERVER] Nova sessão gerada:', serverStorage.sessionId);
  }
  
  return serverStorage.sessionId;
};

// Forçar atualização da sessão (usado após formulário)
export const updateSessionIdServer = (): string => {
  const newSessionId = generateSessionId();
  serverStorage.sessionId = newSessionId;
  console.log('🔄 [SERVER] Sessão atualizada:', newSessionId);
  return newSessionId;
};

// Limpar todos os dados (logout/opt-out)
export const clearPersistedDataServer = (): void => {
  try {
    serverStorage.userData = null;
    serverStorage.sessionId = null;
    console.log('🗑️ [SERVER] Todos os dados do usuário foram removidos');
  } catch (error) {
    console.warn('⚠️ [SERVER] Erro ao limpar dados:', error);
  }
};

// Verificar se há dados persistidos
export const hasPersistedDataServer = (): boolean => {
  const data = getPersistedUserDataServer();
  return data !== null;
};

// Atualizar dados específicos (mantendo os existentes)
export const updatePersistedDataServer = (updates: Partial<PersistedUserData>): void => {
  const existingData = getPersistedUserDataServer();
  if (existingData) {
    saveUserDataServer({
      ...existingData,
      ...updates
    }, existingData.consent);
  } else {
    saveUserDataServer(updates);
  }
};

// Formatar dados para Meta (Advanced Matching) - CORRIGIDO E MELHORADO
export const formatUserDataForMetaServer = (userData: PersistedUserData | null) => {
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
    client_ip_address: null, // EXPLICAÇÃO: null é CORRETO no server-side!
    client_user_agent: 'server-side-webhook' // User agent genérico para server-side
  };
};

// Inicializar sistema de persistência
export const initializePersistenceServer = (): PersistedUserData | null => {
  cleanExpiredData();
  const data = getPersistedUserDataServer();
  
  if (data) {
    console.log('🎯 [SERVER] Usuário identificado via dados persistidos:', {
      email: data.email,
      fullName: data.fullName,
      sessionId: data.sessionId,
      daysStored: Math.round((Date.now() - data.timestamp) / (24 * 60 * 60 * 1000))
    });
  } else {
    console.log('👤 [SERVER] Novo usuário detectado, sem dados persistidos');
  }
  
  return data;
};

// Exportar usando os mesmos nomes da versão client para compatibilidade
export const getPersistedUserData = getPersistedUserDataServer;
export const formatUserDataForMeta = formatUserDataForMetaServer;