'use client';

import { useEffect } from 'react';
import { sendCapigEvent } from '@/lib/capig-gateway';
import { initializePersistence, formatUserDataForMeta, getPersistedUserData } from '@/lib/userDataPersistence';

// Declaração global para tipagem do fbq (mantido para compatibilidade)
declare global {
  interface Window {
    fbq: (command: string, eventName: string, parameters?: object, options?: object) => void;
    _fbq: any[];
  }
}

/**
 * FUNÇÃO PRINCIPAL - Substituto 100% CAPIG do trackMetaEvent
 * Mantém interface idêntica para não precisar alterar a página
 */
export const trackMetaEvent = async (eventName: string, parameters?: object) => {
  console.log('🎯 CAPIG trackMetaEvent:', eventName, parameters);
  
  try {
    // 100% CAPIG - Sem envio browser-side
    await sendCapigEvent(eventName, parameters);
  } catch (error) {
    console.error('❌ Erro no envio CAPIG:', error);
    
    // Fallback apenas em caso de erro crítico
    if (typeof window !== 'undefined' && window.fbq) {
      console.warn('🔄 Usando fallback browser pixel...');
      window.fbq('track', eventName, parameters);
    }
  }
};

interface CapigPixelProps {
  pixelId?: string;
}

/**
 * COMPONENTE CAPIG PIXEL - Substituto do MetaPixel
 * Inicializa CAPIG e dispara PageView inicial
 */
const CapigPixel: React.FC<CapigPixelProps> = ({ pixelId = '642933108377475' }) => {
  useEffect(() => {
    // Inicializar sistema de persistência
    const persistedUserData = initializePersistence();
    
    console.log('🚀 CAPIG Pixel Inicializado');
    
    // Disparar PageView via CAPIG (100% servidor-side)
    const pageViewParams: any = {
      content_category: 'product_page',
      page_title: document.title,
      page_location: window.location.href,
      referrer: document.referrer || 'direct',
      // Enriquecer com dados persistidos se disponível
      ...(persistedUserData && {
        user_data: formatUserDataForMeta(persistedUserData)
      }),
      // Metadata
      event_source_url: window.location.href,
      client_user_agent: navigator.userAgent,
      event_time: Math.floor(Date.now() / 1000),
      ...(persistedUserData?.sessionId && { 
        session_id: persistedUserData.sessionId 
      }),
      has_persisted_data: !!persistedUserData
    };
    
    // Disparar PageView via CAPIG
    sendCapigEvent('PageView', pageViewParams);
    
    // Opcional: Manter fbq disponível para compatibilidade (mas não usar)
    if (typeof window !== 'undefined' && !window.fbq) {
      // Criar fbq dummy para não quebrar código que dependa dele
      window.fbq = () => {
        console.log('🔄 fbq dummy chamado - eventos redirecionados para CAPIG via trackMetaEvent');
      };
      window.fbq.queue = [];
      window._fbq = [];
    }
    
  }, [pixelId]);

  return null; // Componente puramente funcional, sem renderização
};

export default CapigPixel;