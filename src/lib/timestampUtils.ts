/**
 * Utilitários para padronização de timestamps
 * Garante consistência em todos os eventos Meta
 */

/**
 * Obtém timestamp atual em segundos (padrão Facebook)
 * @returns {number} Timestamp em segundos
 */
export function getCurrentTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Obtém timestamp atual em milissegundos (para metadados)
 * @returns {number} Timestamp em milissegundos
 */
export function getCurrentTimestampMs(): number {
  return Date.now();
}

/**
 * Formata timestamp para exibição
 * @param {number} timestamp - Timestamp em segundos
 * @returns {string} Data formatada
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Converte milissegundos para segundos
 * @param {number} ms - Timestamp em milissegundos
 * @returns {number} Timestamp em segundos
 */
export function msToSeconds(ms: number): number {
  return Math.floor(ms / 1000);
}

/**
 * Converte segundos para milissegundos
 * @param {number} seconds - Timestamp em segundos
 * @returns {number} Timestamp em milissegundos
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Verifica se timestamp é válido
 * @param {number} timestamp - Timestamp para verificar
 * @returns {boolean} True se válido
 */
export function isValidTimestamp(timestamp: number): boolean {
  return !isNaN(timestamp) && timestamp > 0;
}

/**
 * Obtém timestamp atual com validação
 * @returns {number} Timestamp validado em segundos
 */
export function getValidatedTimestamp(): number {
  const timestamp = getCurrentTimestamp();
  if (!isValidTimestamp(timestamp)) {
    throw new Error('Timestamp inválido gerado');
  }
  return timestamp;
}