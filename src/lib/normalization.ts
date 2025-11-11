/**
 * 🎯 SISTEMA CENTRALIZADO DE NORMALIZAÇÃO
 * 
 * Garante normalização CONSISTENTE de dados em todo o sistema
 * Resolve problema de dados normalizados de forma diferente
 * 
 * USO:
 *   import { normalizeEmail, normalizePhone, normalizeName } from '@/lib/normalization';
 */

/**
 * Normaliza email para hash/armazenamento
 * 
 * @param email - Email a normalizar
 * @returns Email normalizado (lowercase, trimmed) ou null
 * 
 * @example
 * ```typescript
 * normalizeEmail('  User@EXAMPLE.COM  ') // 'user@example.com'
 * ```
 */
export function normalizeEmail(email: string | null | undefined): string | null {
  if (!email) return null;
  
  const normalized = email
    .toString()
    .toLowerCase()
    .trim();
  
  // Validação básica de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalized)) {
    console.warn('⚠️ Email inválido:', email);
    return null;
  }
  
  return normalized;
}

/**
 * Normaliza telefone brasileiro
 * 
 * Remove caracteres não numéricos e adiciona código do país se necessário
 * 
 * @param phone - Telefone a normalizar
 * @param addCountryCode - Se true, adiciona código 55 (Brasil) se não tiver
 * @returns Telefone normalizado (apenas números) ou null
 * 
 * @example
 * ```typescript
 * normalizePhone('(11) 99999-9999') // '11999999999'
 * normalizePhone('11999999999', true) // '5511999999999'
 * ```
 */
export function normalizePhone(
  phone: string | null | undefined,
  addCountryCode: boolean = false
): string | null {
  if (!phone) return null;
  
  // Remove tudo que não é número
  const cleaned = phone.replace(/\D/g, '');
  
  if (!cleaned) return null;
  
  // Remove código do país se existir (55)
  let normalized = cleaned.replace(/^55/, '');
  
  // Validação: deve ter 10 ou 11 dígitos (sem código do país)
  if (normalized.length !== 10 && normalized.length !== 11) {
    console.warn('⚠️ Telefone com formato inválido:', phone);
    return null;
  }
  
  // Adiciona código do país se solicitado
  if (addCountryCode) {
    normalized = `55${normalized}`;
  }
  
  return normalized;
}

/**
 * Normaliza nome completo
 * 
 * @param fullName - Nome completo a normalizar
 * @returns Objeto com firstName e lastName normalizados
 * 
 * @example
 * ```typescript
 * normalizeName('  João  Silva  Santos  ')
 * // { firstName: 'joão', lastName: 'silva santos' }
 * ```
 */
export function normalizeName(
  fullName: string | null | undefined
): { firstName: string | null; lastName: string | null } {
  if (!fullName) {
    return { firstName: null, lastName: null };
  }
  
  const parts = fullName
    .toString()
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(part => part.length > 0);
  
  if (parts.length === 0) {
    return { firstName: null, lastName: null };
  }
  
  const firstName = parts[0] || null;
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : null;
  
  return { firstName, lastName };
}

/**
 * Normaliza cidade
 * 
 * @param city - Nome da cidade
 * @returns Cidade normalizada (lowercase, trimmed) ou null
 */
export function normalizeCity(city: string | null | undefined): string | null {
  if (!city) return null;
  
  return city
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
    || null;
}

/**
 * Normaliza estado (UF)
 * 
 * @param state - Estado (pode ser nome completo ou sigla)
 * @returns Estado normalizado (lowercase, sigla se possível) ou null
 * 
 * @example
 * ```typescript
 * normalizeState('São Paulo') // 'sp'
 * normalizeState('SP') // 'sp'
 * ```
 */
export function normalizeState(state: string | null | undefined): string | null {
  if (!state) return null;
  
  const normalized = state
    .toString()
    .toLowerCase()
    .trim();
  
  // Mapeamento de estados completos para siglas
  const stateMap: Record<string, string> = {
    'são paulo': 'sp',
    'rio de janeiro': 'rj',
    'minas gerais': 'mg',
    'rio grande do sul': 'rs',
    'paraná': 'pr',
    'bahia': 'ba',
    'santa catarina': 'sc',
    'goiás': 'go',
    'pernambuco': 'pe',
    'ceará': 'ce',
    'pará': 'pa',
    'maranhão': 'ma',
    'amazonas': 'am',
    'espírito santo': 'es',
    'paraíba': 'pb',
    'mato grosso': 'mt',
    'rio grande do norte': 'rn',
    'alagoas': 'al',
    'piauí': 'pi',
    'distrito federal': 'df',
    'mato grosso do sul': 'ms',
    'sergipe': 'se',
    'rondônia': 'ro',
    'tocantins': 'to',
    'acre': 'ac',
    'amapá': 'ap',
    'roraima': 'rr'
  };
  
  // Se é sigla (2 caracteres), retorna direto
  if (normalized.length === 2) {
    return normalized;
  }
  
  // Se é nome completo, tenta mapear
  return stateMap[normalized] || normalized;
}

/**
 * Normaliza CEP
 * 
 * @param zipcode - CEP a normalizar
 * @returns CEP apenas com números ou null
 * 
 * @example
 * ```typescript
 * normalizeZipcode('01310-100') // '01310100'
 * ```
 */
export function normalizeZipcode(zipcode: string | null | undefined): string | null {
  if (!zipcode) return null;
  
  const cleaned = zipcode.replace(/\D/g, '');
  
  // CEP deve ter 8 dígitos
  if (cleaned.length !== 8) {
    console.warn('⚠️ CEP com formato inválido:', zipcode);
    return null;
  }
  
  return cleaned;
}

/**
 * Normaliza país
 * 
 * @param country - Código ou nome do país
 * @returns Código do país em lowercase (padrão: 'br')
 */
export function normalizeCountry(country: string | null | undefined): string {
  if (!country) return 'br';
  
  const normalized = country
    .toString()
    .toLowerCase()
    .trim();
  
  // Se já é código de 2 letras, retorna
  if (normalized.length === 2) {
    return normalized;
  }
  
  // Mapeamento de nomes para códigos
  const countryMap: Record<string, string> = {
    'brasil': 'br',
    'brazil': 'br',
    'estados unidos': 'us',
    'united states': 'us'
  };
  
  return countryMap[normalized] || normalized;
}

/**
 * Normaliza todos os dados de usuário de uma vez
 * 
 * @param userData - Objeto com dados do usuário
 * @returns Objeto com dados normalizados
 */
export function normalizeUserData(userData: {
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  city?: string | null;
  state?: string | null;
  zipcode?: string | null;
  country?: string | null;
}): {
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  city: string | null;
  state: string | null;
  zipcode: string | null;
  country: string;
} {
  const { firstName, lastName } = normalizeName(userData.fullName);
  
  return {
    email: normalizeEmail(userData.email),
    phone: normalizePhone(userData.phone, false), // Não adiciona código do país aqui
    firstName,
    lastName,
    city: normalizeCity(userData.city),
    state: normalizeState(userData.state),
    zipcode: normalizeZipcode(userData.zipcode),
    country: normalizeCountry(userData.country)
  };
}

