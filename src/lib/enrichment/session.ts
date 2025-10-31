/**
 * 🎯 DADOS DE SESSÃO E CONTEXTO
 */

import type { SessionData } from './types';

/**
 * Coleta dados de sessão e contexto da página
 */
export function getSessionData(): SessionData {
  return {
    session_start_time: Date.now(),
    page_number: 1,
    user_journey_stage: 'awareness',
    content_language: 'pt-BR',
    market: 'BR',
    platform: 'web'
  };
}
