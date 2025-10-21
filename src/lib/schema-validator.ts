/**
 * Schema Validator para GTM Server
 * Valida eventos e calcula EMQ Score
 */

import { GTM_CONFIG } from './gtm-config';

interface GTMEvent {
  event_name: string;
  event_id: string;
  timestamp: number;
  page_location?: string;
  user_data?: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  fbc?: string;
  fbp?: string;
  external_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Valida evento recebido do GTM Web
 */
export function validateEvent(event: GTMEvent): ValidationResult {
  const result: ValidationResult = {
    valid: true,
    errors: [],
    warnings: []
  };

  // Validações básicas
  if (!event.event_name) {
    result.errors.push('event_name é obrigatório');
    result.valid = false;
  }

  if (!event.event_id) {
    result.errors.push('event_id é obrigatório');
    result.valid = false;
  }

  if (!event.timestamp) {
    result.errors.push('timestamp é obrigatório');
    result.valid = false;
  }

  // Validações específicas por evento
  const requiredFields = GTM_CONFIG.VALIDATION.REQUIRED_FIELDS[event.event_name as keyof typeof GTM_CONFIG.VALIDATION.REQUIRED_FIELDS];
  if (requiredFields) {
    for (const field of requiredFields) {
      if (!getNestedValue(event, field)) {
        result.errors.push(`Campo obrigatório ausente: ${field}`);
        result.valid = false;
      }
    }
  }

  // Validações de formato
  if (event.user_data?.email && !isValidEmail(event.user_data.email)) {
    result.warnings.push('Formato de email inválido');
  }

  if (event.user_data?.phone && !isValidPhone(event.user_data.phone)) {
    result.warnings.push('Formato de telefone inválido');
  }

  if (event.page_location && !isValidUrl(event.page_location)) {
    result.warnings.push('Formato de URL inválido');
  }

  return result;
}

/**
 * Calcula Event Matching Quality (EMQ) Score
 */
export function calculateEMQ(event: GTMEvent): number {
  const weights = GTM_CONFIG.VALIDATION.EMQ_THRESHOLDS.WEIGHTS;
  let score = 0;

  // Event ID (30%)
  if (event.event_id) {
    score += weights.event_id;
  }

  // User Data (30%)
  if (event.user_data) {
    const userDataScore = calculateUserDataScore(event.user_data);
    score += weights.user_data * userDataScore;
  }

  // Cookies (20%)
  if (event.fbc || event.fbp) {
    score += weights.cookies;
  }

  // UTM Parameters (20%)
  const utmScore = calculateUTMScore(event);
  score += weights.utm * utmScore;

  return Math.min(score, 1.0); // Máximo 1.0
}

/**
 * Calcula score para user data
 */
function calculateUserDataScore(userData: any): number {
  let score = 0;
  const fields = ['email', 'phone', 'first_name', 'last_name'];
  
  for (const field of fields) {
    if (userData[field]) {
      score += 0.25;
    }
  }
  
  return Math.min(score, 1.0);
}

/**
 * Calcula score para UTM parameters
 */
function calculateUTMScore(event: GTMEvent): number {
  let score = 0;
  const utmFields = GTM_CONFIG.UTM_PARAMETERS;
  
  for (const field of utmFields) {
    if (event[field as keyof GTMEvent]) {
      score += 0.2;
    }
  }
  
  return Math.min(score, 1.0);
}

/**
 * Valida formato de email
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de telefone
 */
function isValidPhone(phone: string): boolean {
  // Remove caracteres não numéricos
  const cleaned = phone.replace(/[^0-9]/g, '');
  // Telefone válido: 10-15 dígitos
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Valida formato de URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtém valor aninhado de objeto usando dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Enriquece evento com dados adicionais
 */
export function enrichEvent(event: GTMEvent): GTMEvent {
  const enriched = { ...event };

  // Adiciona timestamp se não existir
  if (!enriched.timestamp) {
    enriched.timestamp = Date.now();
  }

  // Adiciona page_location se não existir
  if (!enriched.page_location) {
    enriched.page_location = 'https://ebooktrips.com.br';
  }

  // Normaliza UTM parameters
  GTM_CONFIG.UTM_PARAMETERS.forEach(param => {
    if (enriched[param as keyof GTMEvent]) {
      enriched[param as keyof GTMEvent] = (enriched[param as keyof GTMEvent] as string).toLowerCase().trim();
    }
  });

  return enriched;
}

export default {
  validateEvent,
  calculateEMQ,
  enrichEvent
};