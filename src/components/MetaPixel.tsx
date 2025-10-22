'use client';

import { useEffect } from 'react';
import { initializePersistence, formatUserDataForMeta, getPersistedUserData } from '@/lib/userDataPersistence';

// Declaração global para tipagem do fbq
declare global {
  interface Window {
    fbq: (command: string, eventName: string, parameters?: object, options?: object) => void;
    _fbq: any[];
  }
}

// Função auxiliar para rastreamento de eventos Meta COM PERSISTÊNCIA
export const trackMetaEvent = (eventName: string, parameters?: object) => {
  if (typeof window !== 'undefined' && window.fbq) {
    // Obter dados persistidos do usuário
    const persistedUserData = getPersistedUserData();
    const formattedUserData = formatUserDataForMeta(persistedUserData);
    
    // Enriquecer parâmetros com dados persistidos
    const enhancedParams = {
      ...parameters,
      // Sempre incluir user_data se disponível (para EQM máxima)
      ...(Object.keys(formattedUserData).length > 0 && { 
        user_data: formattedUserData 
      }),
      // Metadata para CAPI Gateway
      event_source_url: window.location.href,
      client_user_agent: navigator.userAgent,
      event_time: Math.floor(Date.now() / 1000),
      // Informações de sessão
      ...(persistedUserData?.sessionId && { 
        session_id: persistedUserData.sessionId 
      }),
      // Flag para indicar se tem dados persistidos
      has_persisted_data: !!persistedUserData
    };

    // Log detalhado para debug (remover em produção)
    console.log('🎯 Meta Event ENRIQUECIDO:', eventName, {
      hasUserData: !!persistedUserData,
      userDataFields: Object.keys(formattedUserData),
      params: enhancedParams
    });
    
    window.fbq('track', eventName, enhancedParams);
  }
};

interface MetaPixelProps {
  pixelId?: string;
}

const MetaPixel: React.FC<MetaPixelProps> = ({ pixelId = '642933108377475' }) => {
  useEffect(() => {
    // Inicializar sistema de persistência
    const persistedUserData = initializePersistence();
    
    // Inicialização do Meta Pixel com configuração otimizada para CAPI Gateway
    (function(f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function(...args: any[]) {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        n.callMethod ? n.callMethod(...args) : n.queue.push(args);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];
      t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      if (s.parentNode) {
        s.parentNode.insertBefore(t, s);
      }
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js'
    );

    // Configuração do Pixel com CAPI Gateway
    if (window.fbq) {
      window.fbq('init', pixelId);
      
      // Desativar configuração automática de cookies de terceiros
      window.fbq('set', 'autoConfig', false, pixelId);
      
      // Definir agente como stape para CAPI Gateway
      window.fbq('set', 'agent', 'stape');
      
      // Configurar endpoint do CAPI Gateway
      window.fbq('set', 'server_event_uri', 'https://capig.maracujazeropragas.com/');
      
      // Disparar PageView JÁ ENRIQUECIDO com dados persistidos
      const formattedUserData = formatUserDataForMeta(persistedUserData);
      const pageViewParams: any = {
        // Metadata para CAPI Gateway
        event_source_url: window.location.href,
        client_user_agent: navigator.userAgent,
        event_time: Math.floor(Date.now() / 1000),
        ...(persistedUserData?.sessionId && { 
          session_id: persistedUserData.sessionId 
        }),
        has_persisted_data: !!persistedUserData
      };
      
      // Enriquecer PageView com user_data se disponível
      if (Object.keys(formattedUserData).length > 0) {
        pageViewParams.user_data = formattedUserData;
      }
      
      console.log('🚀 PageView ENRIQUECIDO:', {
        hasUserData: !!persistedUserData,
        userDataFields: Object.keys(formattedUserData),
        params: pageViewParams
      });
      
      window.fbq('track', 'PageView', pageViewParams);
    }
    
  }, [pixelId]);

  return null; // Componente puramente funcional, sem renderização
};

export default MetaPixel;