/**
 * 🚨 TIPOS DE ERRO ESPECÍFICOS
 * 
 * Melhora error handling com tipos específicos
 * Permite tratamento diferenciado de erros
 */

/**
 * Erro base para erros de tracking
 */
export class TrackingError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, any>
  ) {
    super(message);
    this.name = 'TrackingError';
  }
}

/**
 * Erro de validação
 */
export class ValidationError extends TrackingError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

/**
 * Erro de configuração (variáveis de ambiente)
 */
export class ConfigurationError extends TrackingError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONFIGURATION_ERROR', context);
    this.name = 'ConfigurationError';
  }
}

/**
 * Erro de API (Meta, Cakto, etc)
 */
export class APIError extends TrackingError {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly response?: any,
    context?: Record<string, any>
  ) {
    super(message, 'API_ERROR', { ...context, statusCode, response });
    this.name = 'APIError';
  }
}

/**
 * Erro de hash/normalização
 */
export class DataProcessingError extends TrackingError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'DATA_PROCESSING_ERROR', context);
    this.name = 'DataProcessingError';
  }
}

/**
 * Erro de webhook
 */
export class WebhookError extends TrackingError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'WEBHOOK_ERROR', context);
    this.name = 'WebhookError';
  }
}

/**
 * Helper para criar erros tipados
 */
export function createError(
  type: 'validation' | 'configuration' | 'api' | 'data' | 'webhook',
  message: string,
  context?: Record<string, any>
): TrackingError {
  switch (type) {
    case 'validation':
      return new ValidationError(message, context);
    case 'configuration':
      return new ConfigurationError(message, context);
    case 'api':
      return new APIError(message, context?.statusCode, context?.response, context);
    case 'data':
      return new DataProcessingError(message, context);
    case 'webhook':
      return new WebhookError(message, context);
    default:
      return new TrackingError(message, 'UNKNOWN_ERROR', context);
  }
}

/**
 * Verifica se erro é recuperável
 */
export function isRecoverableError(error: unknown): boolean {
  if (error instanceof APIError) {
    // Erros 5xx são geralmente recuperáveis (retry)
    return error.statusCode !== undefined && error.statusCode >= 500;
  }
  
  if (error instanceof ConfigurationError) {
    // Erros de configuração não são recuperáveis
    return false;
  }
  
  if (error instanceof ValidationError) {
    // Erros de validação não são recuperáveis
    return false;
  }
  
  // Outros erros podem ser recuperáveis
  return true;
}

