/**
 * 🔐 SISTEMA CENTRALIZADO DE HASHING
 * 
 * ÚNICA FONTE DE VERDADE para hash SHA-256 de dados PII
 * Resolve problema de duplicação de código em 4 lugares diferentes
 * 
 * USO:
 *   import { hashData, hashMultiple } from '@/lib/hashing';
 *   const emailHash = await hashData('user@example.com');
 */

/**
 * Normaliza string antes de hash (consistente em todo sistema)
 */
function normalizeForHash(data: string): string {
  return data
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ''); // Remove todos os espaços
}

/**
 * Hash SHA-256 para dados PII (PII = Personally Identifiable Information)
 * 
 * Suporta browser (Web Crypto API) e server (Node.js crypto)
 * 
 * @param data - String a ser hasheada (email, telefone, nome, etc)
 * @returns Hash SHA-256 em hexadecimal ou null se erro
 * 
 * @example
 * ```typescript
 * const emailHash = await hashData('user@example.com');
 * // Retorna: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
 * ```
 */
export async function hashData(data: string | null | undefined): Promise<string | null> {
  if (!data) return null;
  
  const normalized = normalizeForHash(data);
  
  if (!normalized) return null;
  
  try {
    if (typeof window === 'undefined') {
      // Server-side: usar Node.js crypto
      const crypto = await import('crypto');
      return crypto.createHash('sha256').update(normalized).digest('hex');
    } else {
      // Browser-side: usar Web Crypto API
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(normalized);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (error) {
    console.error('❌ Erro no hash SHA256:', error);
    return null;
  }
}

/**
 * Hasheia múltiplos valores em paralelo
 * 
 * @param dataArray - Array de strings para hashear
 * @returns Array de hashes na mesma ordem (null para valores inválidos)
 * 
 * @example
 * ```typescript
 * const [emailHash, phoneHash] = await hashMultiple(['user@example.com', '11999999999']);
 * ```
 */
export async function hashMultiple(
  dataArray: (string | null | undefined)[]
): Promise<(string | null)[]> {
  return Promise.all(dataArray.map(data => hashData(data)));
}

/**
 * Hasheia objeto com múltiplos campos
 * 
 * @param data - Objeto com campos a serem hasheados
 * @returns Objeto com mesmas chaves mas valores hasheados
 * 
 * @example
 * ```typescript
 * const hashed = await hashObject({
 *   email: 'user@example.com',
 *   phone: '11999999999',
 *   name: 'João Silva'
 * });
 * // Retorna: { email: 'abc123...', phone: 'def456...', name: 'ghi789...' }
 * ```
 */
export async function hashObject<T extends Record<string, string | null | undefined>>(
  data: T
): Promise<Record<keyof T, string | null>> {
  const keys = Object.keys(data) as (keyof T)[];
  const values = keys.map(key => data[key]);
  const hashedValues = await hashMultiple(values);
  
  const result = {} as Record<keyof T, string | null>;
  keys.forEach((key, index) => {
    result[key] = hashedValues[index];
  });
  
  return result;
}

/**
 * Valida se string é um hash SHA-256 válido
 * 
 * @param hash - String a validar
 * @returns true se é hash válido (64 caracteres hexadecimais)
 */
export function isValidHash(hash: string | null | undefined): boolean {
  if (!hash) return false;
  return /^[a-f0-9]{64}$/i.test(hash);
}

