/**
 * Configuração Centralizada para Meta Pixel e Rastreamento
 * 
 * INSTRUÇÕES IMPORTANTES:
 * 1. Substitua 'SEU_PIXEL_ID_AQUI' pelo seu ID real do Facebook Pixel
 * 2. O ID geralmente parece com: '123456789012345' (15 dígitos)
 * 3. Você pode encontrar seu Pixel ID no seu Gerenciador de Eventos do Facebook
 */

export const META_CONFIG = {
  // ID DO FACEBOOK PIXEL - OBRIGATÓRIO CONFIGURAR
  PIXEL_ID: '714277868320104', // ← Atualizado com o novo ID real
  
  // Configurações de Ambiente
  ENVIRONMENT: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  
  // Configurações de Rastreamento
  TRACKING: {
    // Habilitar/Desabilitar rastreamento específico
    enablePageView: false, // Gerenciado pelo GTM
    enableViewContent: true,
    enableInitiateCheckout: true,
    enablePurchase: true,
    enableLead: true,
    
    // Delay para view_content (em milissegundos)
    viewContentDelay: 1000,
    
    // Habilitar console logs para depuração
    enableDebugLogs: true, // Habilitado para análise
  },
  
  // Configurações de Qualidade para Meta EQM
  QUALITY: {
    // Score mínimo para considerar um evento de alta qualidade
    minimumQualityScore: 70,
    
    // Habilitar enriquecimento automático de dados
    enableDataEnrichment: true,
    
    // Habilitar hash de dados sensíveis (CRÍTICO para EQM)
    enableDataHashing: true,
    
    // Habilitar envio para Conversions API
    enableConversionsAPI: true, // Habilitado agora que o token está configurado
    
    // Campos obrigatórios para matching de alta qualidade
    requiredFields: ['email', 'phone', 'firstName', 'lastName'],
    
    // Campos opcionais que melhoram o matching
    optionalFields: ['city', 'state', 'zip', 'country'],
    
    // Prioridade de matching (1 = mais importante)
    fieldPriority: {
      email: 1,
      phone: 2,
      firstName: 3,
      lastName: 4,
      city: 5,
      state: 6,
      zip: 7,
      country: 8
    }
  },
  
  // Configurações de Hotmart
  HOTMART: {
    // URL base do checkout
    checkoutUrl: 'https://pay.cakto.com.br/hacr962_605077',
    
    // Parâmetros obrigatórios para pré-preenchimento
    requiredParams: ['name', 'email'],
    
    // Parâmetros opcionais para pré-preenchimento
    optionalParams: ['phone_number', 'city', 'state', 'zip'],
    
    // Habilitar validação de parâmetros
    enableParamValidation: true,
  },
  
  // Configurações de Privacidade
  PRIVACY: {
    // Habilitar hash de dados sensíveis (AGORA HABILITADO por padrão)
    enableDataHashing: true,
    
    // Habilitar armazenamento de consentimento
    enableConsentManagement: false,
    
    // Período de retenção de dados (em dias)
    dataRetentionPeriod: 90,
    
    // Formatos de hash suportados
    supportedHashFormats: ['SHA-256'],
    
    // Nível de anonimização
    anonymizationLevel: 'partial', // 'none', 'partial', 'full'
  }
};

// Função para validar configuração
export const validateMetaConfig = () => {
  const errors = [];
  
  if (META_CONFIG.PIXEL_ID === 'SEU_PIXEL_ID_AQUI') {
    errors.push('⚠️ PIXEL_ID não configurado. Substitua "SEU_PIXEL_ID_AQUI" pelo seu ID real do Facebook Pixel.');
  }
  
  if (!META_CONFIG.PIXEL_ID || META_CONFIG.PIXEL_ID.length !== 15) {
    errors.push('⚠️ PIXEL_ID inválido. O ID deve ter 15 dígitos.');
  }
  
  if (errors.length > 0) {
    console.group('🔍 Validação da Configuração Meta');
    errors.forEach(error => console.error(error));
    console.groupEnd();
    
    if (META_CONFIG.TRACKING.enableDebugLogs) {
      console.warn('📋 Para configurar seu Pixel ID:');
      console.warn('1. Acesse seu Gerenciador de Eventos do Facebook');
      console.warn('2. Crie um novo Pixel ou selecione um existente');
      console.warn('3. Copie o ID (número de 15 dígitos)');
      console.warn('4. Substitua "SEU_PIXEL_ID_AQUI" no arquivo metaConfig.ts');
    }
    
    return false;
  }
  
  if (META_CONFIG.TRACKING.enableDebugLogs) {
    console.log('✅ Configuração Meta validada com sucesso');
    console.log('📊 Pixel ID:', META_CONFIG.PIXEL_ID);
    console.log('🌍 Ambiente:', META_CONFIG.ENVIRONMENT);
  }
  
  return true;
};

// Função para obter dados do usuário formatados para Meta
export const formatUserDataForMeta = (userData: any) => {
  if (!META_CONFIG.QUALITY.enableDataEnrichment) {
    return userData;
  }
  
  const formatted: any = {
    // Dados em formato plain text (Meta requer ambos)
    em: userData.email ? userData.email.toLowerCase().trim() : undefined,
    ph: userData.phone ? userData.phone.replace(/\D/g, '') : undefined,
    fn: userData.firstName ? userData.firstName.trim() : undefined,
    ln: userData.lastName ? userData.lastName.trim() : undefined,
    ct: userData.city ? userData.city.trim() : undefined,
    st: userData.state ? userData.state.trim().toUpperCase() : undefined,
    zp: userData.zip ? userData.zip.replace(/\D/g, '') : undefined,
    country: 'BR', // Brasil como padrão
    
    // Dados de rastreamento para melhor matching
    fbc: userData.fbc,
    fbp: userData.fbp,
    ga_client_id: userData.ga_client_id,
    external_id: userData.external_id
  };
  
  // Validar campos obrigatórios
  const missingFields = META_CONFIG.QUALITY.requiredFields.filter(field => !formatted[field]);
  if (missingFields.length > 0 && META_CONFIG.TRACKING.enableDebugLogs) {
    console.warn('⚠️ Campos obrigatórios ausentes para matching de alta qualidade:', missingFields);
  }
  
  // Remover campos undefined
  Object.keys(formatted).forEach(key => {
    if (formatted[key] === undefined || formatted[key] === '') {
      delete formatted[key];
    }
  });
  
  // Adicionar informação de qualidade dos dados
  if (META_CONFIG.TRACKING.enableDebugLogs) {
    const qualityScore = calculateDataQualityScore(formatted);
    console.log(`📊 Qualidade dos dados para Meta: ${qualityScore}%`);
    console.log('📋 Campos formatados:', Object.keys(formatted));
  }
  
  return formatted;
};

// Função para calcular score de qualidade dos dados
const calculateDataQualityScore = (formattedData: any): number => {
  let score = 0;
  let maxScore = 0;
  
  // Calcular baseado nos campos prioritários
  Object.entries(META_CONFIG.QUALITY.fieldPriority).forEach(([field, priority]) => {
    maxScore += priority;
    if (formattedData[field]) {
      score += priority;
    }
  });
  
  // Adicionar bônus para campos de rastreamento
  if (formattedData.fbc) score += 5;
  if (formattedData.fbp) score += 5;
  if (formattedData.ga_client_id) score += 3;
  if (formattedData.external_id) score += 2;
  
  maxScore += 15; // Bônus máximo possível
  
  return Math.round((score / maxScore) * 100);
};

export default META_CONFIG;