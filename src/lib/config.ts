/**
 * ⚙️ CONFIGURAÇÃO CENTRALIZADA
 * 
 * Remove valores hardcoded do código
 * Todas as configurações devem vir daqui ou de variáveis de ambiente
 */

// Validação de variáveis de ambiente obrigatórias
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Variável de ambiente obrigatória não configurada: ${key}`);
  }
  return value;
}

function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Configurações do Meta Pixel
 */
export const MetaConfig = {
  PIXEL_ID: getOptionalEnv('META_PIXEL_ID', '642933108377475'),
  ACCESS_TOKEN: getRequiredEnv('META_ACCESS_TOKEN'), // Obrigatório - sem fallback
  API_VERSION: getOptionalEnv('META_API_VERSION', 'v18.0'),
  SERVER_EVENT_URI: getOptionalEnv('META_SERVER_EVENT_URI', 'https://capig.maracujazeropragas.com/'),
  TEST_EVENT_CODE: getOptionalEnv('META_TEST_EVENT_CODE', 'TEST35751')
} as const;

/**
 * Configurações da Cakto
 */
export const CaktoConfig = {
  SECRET: getRequiredEnv('CAKTO_SECRET'),
  PRODUCT_ID: getOptionalEnv('CAKTO_PRODUCT_ID', 'hacr962')
} as const;

/**
 * Configurações de produto (valores padrão - podem ser sobrescritos)
 */
export const ProductConfig = {
  DEFAULT_VALUE: 39.9,
  CURRENCY: 'BRL',
  CONTENT_ID: 'hacr962',
  CONTENT_NAME: 'Sistema 4 Fases - Ebook Trips',
  CONTENT_CATEGORY: 'digital_product',
  PREDICTED_LTV_MULTIPLIER: 3.5, // Multiplicador para calcular LTV
  COUNTRY_DEFAULT: 'br'
} as const;

/**
 * Configurações de tracking
 */
export const TrackingConfig = {
  BROWSER_PIXEL_ENABLED: process.env.NEXT_PUBLIC_BROWSER_PIXEL === 'true',
  SESSION_EXPIRY_DAYS: 30,
  CACHE_TTL: 300000, // 5 minutos
  MAX_CACHE_SIZE: 10000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  TIMEOUT_MS: 15000
} as const;

/**
 * Configurações de webhook
 */
export const WebhookConfig = {
  VERSION: '3.1-enterprise-unified-server',
  MAX_RETRIES: TrackingConfig.MAX_RETRIES,
  RETRY_DELAY: TrackingConfig.RETRY_DELAY,
  TIMEOUT_MS: TrackingConfig.TIMEOUT_MS
} as const;

/**
 * Valida todas as configurações no startup
 */
export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  try {
    // Validar Meta
    if (!MetaConfig.ACCESS_TOKEN) {
      errors.push('META_ACCESS_TOKEN não configurado');
    }
    
    // Validar Cakto
    if (!CaktoConfig.SECRET) {
      errors.push('CAKTO_SECRET não configurado');
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : 'Erro desconhecido');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

