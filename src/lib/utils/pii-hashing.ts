/**
 * PII Hashing Utilities
 * Conforme LGPD e melhores práticas de privacidade
 */

import crypto from 'crypto';

/**
 * Gera hash SHA-256 de dados PII
 */
export async function hashPII(data: string): Promise<string> {
  if (!data || typeof data !== 'string') {
    return '';
  }

  // Normalização dos dados
  const normalized = data.toLowerCase().trim();
  
  // Gera hash SHA-256
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Valida formato de email antes de fazer hash
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normaliza número de telefone (apenas dígitos)
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

/**
 * Valida formato de telefone brasileiro
 */
export function isValidBrazilianPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  // Telefone brasileiro: 10-11 dígitos
  return /^[0-9]{10,11}$/.test(normalized);
}

/**
 * Normaliza nome (remove caracteres especiais)
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-zà-ú\s]/g, '')
    .replace(/\s+/g, ' ');
}

export default {
  hashPII,
  isValidEmail,
  normalizePhone,
  isValidBrazilianPhone,
  normalizeName
};