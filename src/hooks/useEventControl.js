/**
 * VERSÃO CORRIGIDA DA LÓGICA DE EVENTOS
 * Substitui o código existente em page.tsx
 * Usa controlador centralizado para garantir regras estritas
 */

import { useEffect } from 'react';
import { initializeEventController, getEventStatus } from '@/lib/event-controller.js';

/**
 * Hook personalizado para controle de eventos
 * Substitui o useEffect existente em page.tsx
 */
export function useEventControl() {
  // Inicializa o controlador apenas no cliente
  useEffect(() => {
    // Verifica se está no browser antes de inicializar
    if (typeof window !== 'undefined') {
      console.log('🚀 useEventControl: Inicializando no cliente...');
      initializeEventController();
      console.log('✅ useEventControl: EventController inicializado!');
    }
  }, []);
  
  // Função para verificar status (debug)
  const checkEventStatus = () => {
    if (process.env.NODE_ENV === 'development') {
      const status = getEventStatus();
      console.log('📊 Status dos Eventos:', status);
      return status;
    }
  };
  
  return {
    checkEventStatus,
    eventStatus: getEventStatus()
  };
}

/**
 * Código para substituir o useEffect existente em page.tsx
 * 
 * ANTES (código com problemas):
 * useEffect(() => {
 *   // Seu código atual com múltiplos disparos...
 * }, [viewContentFired]);
 * 
 * DEPOIS (código corrigido):
 * // Simplesmente use o hook acima
 */

/**
 * Instruções de implementação:
 * 
 * 1. Em page.tsx, remova todo o useEffect existente (linhas ~98-157)
 * 2. Adicione o hook useEventControl() no início do componente
 * 3. Remova o estado viewContentFired (não é mais necessário)
 * 4. Pronto! Eventos agora são controlados centralizadamente
 */

export default useEventControl;