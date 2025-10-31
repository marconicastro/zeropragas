/**
 * 🔍 SISTEMA DE VALIDAÇÃO DE DADOS
 * 
 * Valida dados antes de enviar aos eventos Meta Pixel
 * Garante qualidade e previne dados inválidos
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Validadores de dados
 */
export const validators = {
  /**
   * Valida email
   */
  email: (value: string | null | undefined): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'Email vazio' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const sanitized = value.toLowerCase().trim();
    
    if (!emailRegex.test(sanitized)) {
      return { isValid: false, error: 'Email inválido' };
    }
    
    // Validações adicionais
    if (sanitized.length > 254) {
      return { isValid: false, error: 'Email muito longo' };
    }
    
    return { isValid: true, sanitized };
  },

  /**
   * Valida telefone brasileiro
   */
  phone: (value: string | null | undefined): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'Telefone vazio' };
    }
    
    const cleaned = value.replace(/\D/g, '');
    
    // Telefone brasileiro: 10 ou 11 dígitos
    if (cleaned.length !== 10 && cleaned.length !== 11) {
      return { isValid: false, error: 'Telefone deve ter 10 ou 11 dígitos' };
    }
    
    // Validar DDD (11-99)
    const ddd = parseInt(cleaned.substring(0, 2));
    if (ddd < 11 || ddd > 99) {
      return { isValid: false, error: 'DDD inválido' };
    }
    
    // Adicionar código do país
    const sanitized = `55${cleaned}`;
    
    return { isValid: true, sanitized };
  },

  /**
   * Valida CEP brasileiro
   */
  cep: (value: string | null | undefined): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'CEP vazio' };
    }
    
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length !== 8) {
      return { isValid: false, error: 'CEP deve ter 8 dígitos' };
    }
    
    // Validar se não é sequência repetida (00000000, 11111111, etc)
    if (/^(\d)\1{7}$/.test(cleaned)) {
      return { isValid: false, error: 'CEP inválido' };
    }
    
    return { isValid: true, sanitized: cleaned };
  },

  /**
   * Valida Facebook Click ID (fbclid)
   */
  fbclid: (value: string | null | undefined): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'fbclid vazio' };
    }
    
    const sanitized = value.trim();
    
    // fbclid deve ter pelo menos 10 caracteres e apenas alfanuméricos, _ e -
    if (sanitized.length < 10) {
      return { isValid: false, error: 'fbclid muito curto' };
    }
    
    if (!/^[A-Za-z0-9_-]+$/.test(sanitized)) {
      return { isValid: false, error: 'fbclid contém caracteres inválidos' };
    }
    
    return { isValid: true, sanitized };
  },

  /**
   * Valida Campaign ID
   */
  campaignId: (value: string | null | undefined): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'Campaign ID vazio' };
    }
    
    const sanitized = value.trim();
    
    // Campaign ID deve ser numérico
    if (!/^\d+$/.test(sanitized)) {
      return { isValid: false, error: 'Campaign ID deve ser numérico' };
    }
    
    return { isValid: true, sanitized };
  },

  /**
   * Valida nome
   */
  name: (value: string | null | undefined): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'Nome vazio' };
    }
    
    const sanitized = value.toLowerCase().trim();
    
    // Nome deve ter pelo menos 2 caracteres
    if (sanitized.length < 2) {
      return { isValid: false, error: 'Nome muito curto' };
    }
    
    // Nome não deve conter números
    if (/\d/.test(sanitized)) {
      return { isValid: false, error: 'Nome não deve conter números' };
    }
    
    return { isValid: true, sanitized };
  },

  /**
   * Valida cidade
   */
  city: (value: string | null | undefined): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'Cidade vazia' };
    }
    
    const sanitized = value.toLowerCase().trim();
    
    if (sanitized.length < 2) {
      return { isValid: false, error: 'Cidade muito curta' };
    }
    
    return { isValid: true, sanitized };
  },

  /**
   * Valida estado (UF)
   */
  state: (value: string | null | undefined): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'Estado vazio' };
    }
    
    const sanitized = value.toLowerCase().trim();
    
    // UF deve ter 2 caracteres
    if (sanitized.length !== 2) {
      return { isValid: false, error: 'Estado deve ter 2 caracteres' };
    }
    
    // Lista de UFs válidas
    const validStates = [
      'ac', 'al', 'ap', 'am', 'ba', 'ce', 'df', 'es', 'go', 'ma',
      'mt', 'ms', 'mg', 'pa', 'pb', 'pr', 'pe', 'pi', 'rj', 'rn',
      'rs', 'ro', 'rr', 'sc', 'sp', 'se', 'to'
    ];
    
    if (!validStates.includes(sanitized)) {
      return { isValid: false, error: 'Estado inválido' };
    }
    
    return { isValid: true, sanitized };
  },

  /**
   * Valida UTM source
   */
  utmSource: (value: string | null | undefined): ValidationResult => {
    if (!value) {
      return { isValid: false, error: 'UTM source vazio' };
    }
    
    const sanitized = value.toLowerCase().trim();
    
    // UTM não deve conter espaços ou caracteres especiais
    if (!/^[a-z0-9_-]+$/.test(sanitized)) {
      return { isValid: false, error: 'UTM source contém caracteres inválidos' };
    }
    
    return { isValid: true, sanitized };
  },

  /**
   * Valida valor monetário
   */
  currency: (value: number | string | null | undefined): ValidationResult => {
    if (value === null || value === undefined) {
      return { isValid: false, error: 'Valor vazio' };
    }
    
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    if (isNaN(numValue)) {
      return { isValid: false, error: 'Valor não é um número' };
    }
    
    if (numValue < 0) {
      return { isValid: false, error: 'Valor não pode ser negativo' };
    }
    
    if (numValue > 1000000) {
      return { isValid: false, error: 'Valor muito alto' };
    }
    
    return { isValid: true, sanitized: numValue.toFixed(2) };
  }
};

/**
 * Valida múltiplos campos de uma vez
 */
export function validateFields(fields: Record<string, any>, rules: Record<string, keyof typeof validators>): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitized: Record<string, string>;
} {
  const errors: Record<string, string> = {};
  const sanitized: Record<string, string> = {};
  
  for (const [fieldName, validatorName] of Object.entries(rules)) {
    const validator = validators[validatorName];
    if (!validator) {
      console.warn(`⚠️ Validador não encontrado: ${validatorName}`);
      continue;
    }
    
    const result = validator(fields[fieldName]);
    
    if (!result.isValid) {
      errors[fieldName] = result.error || 'Inválido';
    } else if (result.sanitized) {
      sanitized[fieldName] = result.sanitized;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  };
}

/**
 * Sanitiza dados removendo caracteres perigosos
 */
export function sanitizeString(value: string): string {
  return value
    .trim()
    .replace(/[<>\"']/g, '') // Remove caracteres HTML perigosos
    .replace(/\s+/g, ' '); // Normaliza espaços
}

/**
 * Valida e sanitiza dados do usuário para Meta Pixel
 */
export function validateUserDataForMeta(userData: any): {
  isValid: boolean;
  errors: string[];
  sanitized: any;
} {
  const errors: string[] = [];
  const sanitized: any = {};
  
  // Email
  if (userData.email) {
    const result = validators.email(userData.email);
    if (result.isValid) {
      sanitized.email = result.sanitized;
    } else {
      errors.push(`Email: ${result.error}`);
    }
  }
  
  // Telefone
  if (userData.phone) {
    const result = validators.phone(userData.phone);
    if (result.isValid) {
      sanitized.phone = result.sanitized;
    } else {
      errors.push(`Telefone: ${result.error}`);
    }
  }
  
  // Nome
  if (userData.fullName) {
    const result = validators.name(userData.fullName);
    if (result.isValid) {
      sanitized.fullName = result.sanitized;
    } else {
      errors.push(`Nome: ${result.error}`);
    }
  }
  
  // Cidade
  if (userData.city) {
    const result = validators.city(userData.city);
    if (result.isValid) {
      sanitized.city = result.sanitized;
    } else {
      errors.push(`Cidade: ${result.error}`);
    }
  }
  
  // Estado
  if (userData.state) {
    const result = validators.state(userData.state);
    if (result.isValid) {
      sanitized.state = result.sanitized;
    } else {
      errors.push(`Estado: ${result.error}`);
    }
  }
  
  // CEP
  if (userData.cep) {
    const result = validators.cep(userData.cep);
    if (result.isValid) {
      sanitized.cep = result.sanitized;
    } else {
      errors.push(`CEP: ${result.error}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

export default validators;
