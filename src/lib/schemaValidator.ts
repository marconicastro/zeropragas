/**
 * Validador de Schema Rigoroso para Eventos de Rastreamento
 * 
 * Este módulo implementa validação rigorosa de dados para garantir
 * conformidade com as especificações do Meta Ads e GTM Server
 */

// Interface para dados de usuário
export interface UserDataSchema {
  em?: string;        // Email (hasheado)
  ph?: string;        // Phone (hasheado)
  fn?: string;        // First Name (hasheado)
  ln?: string;        // Last Name (hasheado)
  ct?: string;        // City (hasheado)
  st?: string;        // State (hasheado)
  zp?: string;        // Zip Code (hasheado)
  country?: string;   // Country (hasheado)
  fbc?: string;       // Facebook Click ID
  fbp?: string;       // Facebook Browser ID
  ga_client_id?: string; // Google Analytics Client ID
  external_id?: string;  // External ID
  client_ip_address?: string;
  client_user_agent?: string;
}

// Interface para dados customizados
export interface CustomDataSchema {
  currency?: string;
  value?: number;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
  items?: Array<{
    item_id: string;
    item_name: string;
    quantity: number;
    price: number;
    item_category?: string;
    item_brand?: string;
    currency?: string;
  }>;
  page_title?: string;
  page_location?: string;
  page_path?: string;
}

// Interface para evento completo
export interface EventSchema {
  event_name: string;
  event_id: string;
  user_data?: UserDataSchema;
  custom_data?: CustomDataSchema;
  session_id?: string;
  timestamp?: number;
}

// Tipos de eventos válidos
export const VALID_EVENTS = [
  'page_view',
  'view_content',
  'initiate_checkout',
  'purchase',
  'add_to_cart',
  'lead'
] as const;

export type ValidEventType = typeof VALID_EVENTS[number];

// Interface para resultado de validação
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score: number; // 0-100
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
}

// Classe principal de validação
export class SchemaValidator {
  private static instance: SchemaValidator;
  
  private constructor() {}
  
  public static getInstance(): SchemaValidator {
    if (!SchemaValidator.instance) {
      SchemaValidator.instance = new SchemaValidator();
    }
    return SchemaValidator.instance;
  }

  /**
   * Validação completa de evento
   */
  public validateEvent(event: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    
    // 1. Validação básica
    this.validateBasicFields(event, errors);
    
    // 2. Validação de nome do evento
    this.validateEventName(event.event_name, errors);
    
    // 3. Validação de user_data
    if (event.user_data) {
      this.validateUserData(event.user_data, errors, warnings);
    }
    
    // 4. Validação de custom_data
    if (event.custom_data) {
      this.validateCustomData(event.custom_data, event.event_name, errors, warnings);
    }
    
    // 5. Validação específica por tipo de evento
    this.validateEventSpecificData(event, errors, warnings);
    
    // Calcular score
    const score = this.calculateScore(errors, warnings);
    
    return {
      valid: errors.filter(e => e.severity === 'error').length === 0,
      errors,
      warnings,
      score
    };
  }

  /**
   * Validação de campos básicos
   */
  private validateBasicFields(event: any, errors: ValidationError[]): void {
    if (!event.event_name || typeof event.event_name !== 'string') {
      errors.push({
        field: 'event_name',
        message: 'event_name é obrigatório e deve ser string',
        code: 'MISSING_EVENT_NAME',
        severity: 'error'
      });
    }

    if (!event.event_id || typeof event.event_id !== 'string') {
      errors.push({
        field: 'event_id',
        message: 'event_id é obrigatório e deve ser string',
        code: 'MISSING_EVENT_ID',
        severity: 'error'
      });
    }

    // Validar formato do event_id (deve ser único)
    if (event.event_id && event.event_id.length < 10) {
      errors.push({
        field: 'event_id',
        message: 'event_id deve ter pelo menos 10 caracteres para garantir unicidade',
        code: 'INVALID_EVENT_ID_FORMAT',
        severity: 'error'
      });
    }
  }

  /**
   * Validação de nome do evento
   */
  private validateEventName(eventName: string, errors: ValidationError[]): void {
    if (!VALID_EVENTS.includes(eventName as ValidEventType)) {
      errors.push({
        field: 'event_name',
        message: `event_name deve ser um dos: ${VALID_EVENTS.join(', ')}`,
        code: 'INVALID_EVENT_NAME',
        severity: 'error'
      });
    }
  }

  /**
   * Validação de dados do usuário
   */
  private validateUserData(userData: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Validar formato de email (se presente)
    if (userData.em && typeof userData.em === 'string') {
      if (userData.em.length !== 64) { // SHA-256 hash length
        warnings.push({
          field: 'em',
          message: 'Email parece não estar hasheado (deve ter 64 caracteres SHA-256)',
          code: 'UNHASHED_EMAIL'
        });
      }
    }

    // Validar formato de phone (se presente)
    if (userData.ph && typeof userData.ph === 'string') {
      if (userData.ph.length !== 64) {
        warnings.push({
          field: 'ph',
          message: 'Phone parece não estar hasheado (deve ter 64 caracteres SHA-256)',
          code: 'UNHASHED_PHONE'
        });
      }
    }

    // Validar identificadores Meta
    if (!userData.fbc && !userData.fbp) {
      warnings.push({
        field: 'attribution',
        message: 'Nenhum identificador Meta (fbc/fbp) encontrado - pode afetar atribuição',
        code: 'MISSING_ATTRIBUTION'
      });
    }

    // Validar FBC format
    if (userData.fbc && typeof userData.fbc === 'string') {
      const fbcPattern = /^fb\.\d+\.\d+\.[A-Za-z0-9]+$/;
      if (!fbcPattern.test(userData.fbc)) {
        errors.push({
          field: 'fbc',
          message: 'Formato inválido de FBC. Esperado: fb.1.timestamp.subdomain',
          code: 'INVALID_FBC_FORMAT',
          severity: 'error'
        });
      }
    }

    // Validar FBP format
    if (userData.fbp && typeof userData.fbp === 'string') {
      const fbpPattern = /^fb\.\d+\.\d+\.[A-Za-z0-9]+$/;
      if (!fbpPattern.test(userData.fbp)) {
        errors.push({
          field: 'fbp',
          message: 'Formato inválido de FBP. Esperado: fb.1.random.subdomain',
          code: 'INVALID_FBP_FORMAT',
          severity: 'error'
        });
      }
    }
  }

  /**
   * Validação de dados customizados
   */
  private validateCustomData(customData: any, eventName: string, errors: ValidationError[], warnings: ValidationWarning[]): void {
    // Validar currency
    if (customData.currency && typeof customData.currency !== 'string') {
      errors.push({
        field: 'currency',
        message: 'currency deve ser string (ex: BRL, USD)',
        code: 'INVALID_CURRENCY_TYPE',
        severity: 'error'
      });
    }

    // Validar value
    if (customData.value !== undefined && typeof customData.value !== 'number') {
      errors.push({
        field: 'value',
        message: 'value deve ser number',
        code: 'INVALID_VALUE_TYPE',
        severity: 'error'
      });
    }

    // Validar content_ids
    if (customData.content_ids && !Array.isArray(customData.content_ids)) {
      errors.push({
        field: 'content_ids',
        message: 'content_ids deve ser array',
        code: 'INVALID_CONTENT_IDS_TYPE',
        severity: 'error'
      });
    }

    // Validar items
    if (customData.items && !Array.isArray(customData.items)) {
      errors.push({
        field: 'items',
        message: 'items deve ser array',
        code: 'INVALID_ITEMS_TYPE',
        severity: 'error'
      });
    } else if (customData.items && Array.isArray(customData.items)) {
      customData.items.forEach((item: any, index: number) => {
        if (!item.item_id) {
          errors.push({
            field: `items[${index}].item_id`,
            message: 'item_id é obrigatório em cada item',
            code: 'MISSING_ITEM_ID',
            severity: 'error'
          });
        }
        if (!item.item_name) {
          errors.push({
            field: `items[${index}].item_name`,
            message: 'item_name é obrigatório em cada item',
            code: 'MISSING_ITEM_NAME',
            severity: 'error'
          });
        }
        if (typeof item.quantity !== 'number') {
          errors.push({
            field: `items[${index}].quantity`,
            message: 'quantity deve ser number em cada item',
            code: 'INVALID_ITEM_QUANTITY',
            severity: 'error'
          });
        }
        if (typeof item.price !== 'number') {
          errors.push({
            field: `items[${index}].price`,
            message: 'price deve ser number em cada item',
            code: 'INVALID_ITEM_PRICE',
            severity: 'error'
          });
        }
      });
    }
  }

  /**
   * Validação específica por tipo de evento
   */
  private validateEventSpecificData(event: any, errors: ValidationError[], warnings: ValidationWarning[]): void {
    const eventName = event.event_name;
    const customData = event.custom_data || {};

    switch (eventName) {
      case 'view_content':
        if (!customData.content_name) {
          warnings.push({
            field: 'content_name',
            message: 'content_name recomendado para view_content',
            code: 'MISSING_CONTENT_NAME'
          });
        }
        break;

      case 'initiate_checkout':
        if (!customData.currency) {
          errors.push({
            field: 'currency',
            message: 'currency é obrigatório para initiate_checkout',
            code: 'MISSING_CURRENCY_CHECKOUT',
            severity: 'error'
          });
        }
        if (customData.value === undefined) {
          errors.push({
            field: 'value',
            message: 'value é obrigatório para initiate_checkout',
            code: 'MISSING_VALUE_CHECKOUT',
            severity: 'error'
          });
        }
        break;

      case 'purchase':
        if (!customData.currency) {
          errors.push({
            field: 'currency',
            message: 'currency é obrigatório para purchase',
            code: 'MISSING_CURRENCY_PURCHASE',
            severity: 'error'
          });
        }
        if (customData.value === undefined) {
          errors.push({
            field: 'value',
            message: 'value é obrigatório para purchase',
            code: 'MISSING_VALUE_PURCHASE',
            severity: 'error'
          });
        }
        if (!customData.transaction_id) {
          errors.push({
            field: 'transaction_id',
            message: 'transaction_id é obrigatório para purchase',
            code: 'MISSING_TRANSACTION_ID',
            severity: 'error'
          });
        }
        break;
    }

    // Verificar qualidade dos dados PII para EMQ
    const userData = event.user_data || {};
    const piiScore = this.calculatePIIScore(userData);
    
    if (piiScore < 6 && ['initiate_checkout', 'purchase'].includes(eventName)) {
      warnings.push({
        field: 'pii_quality',
        message: `Baixa qualidade de dados PII (score: ${piiScore}/10) - pode afetar EMQ`,
        code: 'LOW_PIQ_QUALITY'
      });
    }
  }

  /**
   * Calcula score de qualidade dos dados PII
   */
  private calculatePIIScore(userData: UserDataSchema): number {
    let score = 0;
    
    if (userData.em) score += 2;
    if (userData.ph) score += 2;
    if (userData.fn) score += 1;
    if (userData.ln) score += 1;
    if (userData.ct) score += 1;
    if (userData.st) score += 1;
    if (userData.zp) score += 1;
    if (userData.fbc) score += 1;
    if (userData.fbp) score += 1;
    
    return Math.min(score, 10);
  }

  /**
   * Calcula score geral de validação
   */
  private calculateScore(errors: ValidationError[], warnings: ValidationWarning[]): number {
    let score = 100;
    
    // Erros críticos reduzem mais o score
    const criticalErrors = errors.filter(e => e.severity === 'error').length;
    score -= criticalErrors * 20;
    
    // Warnings reduzem menos
    score -= warnings.length * 5;
    
    return Math.max(0, score);
  }

  /**
   * Validação rápida para uso em tempo real
   */
  public quickValidate(event: any): { valid: boolean; criticalErrors: string[] } {
    const criticalErrors: string[] = [];
    
    if (!event.event_name) criticalErrors.push('Missing event_name');
    if (!event.event_id) criticalErrors.push('Missing event_id');
    if (event.event_name && !VALID_EVENTS.includes(event.event_name)) {
      criticalErrors.push('Invalid event_name');
    }
    
    return {
      valid: criticalErrors.length === 0,
      criticalErrors
    };
  }
}

// Exportar instância singleton
export const schemaValidator = SchemaValidator.getInstance();

// Funções de conveniência
export const validateEvent = (event: any) => schemaValidator.validateEvent(event);
export const quickValidate = (event: any) => schemaValidator.quickValidate(event);

export default schemaValidator;