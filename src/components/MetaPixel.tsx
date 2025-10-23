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

// Função para hash SHA256 conforme exigência do Facebook
async function hashData(data: string | null): Promise<string | null> {
  if (!data) return null;
  
  // Normalização conforme exigência do Facebook
  const normalized = data.toString().toLowerCase().trim().replace(/\s+/g, '');
  
  try {
    // Encode para UTF-8
    const encoder = new TextEncoder();
    const dataUint8Array = encoder.encode(normalized);
    
    // SHA256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Converte para hex lowercase
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Erro no hash SHA256:', error);
    return null;
  }
}

// Função auxiliar para rastreamento de eventos Meta COM PERSISTÊNCIA E HASH
export const trackMetaEvent = async (eventName: string, parameters?: object) => {
  if (typeof window !== 'undefined' && window.fbq) {
    // Obter dados persistidos do usuário
    const persistedUserData = getPersistedUserData();
    const formattedUserData = formatUserDataForMeta(persistedUserData);
    
    // HASH DE TODOS OS DADOS PII (Informações Pessoais Identificáveis)
    const hashedUserData = {
      em: await hashData(formattedUserData.em),
      ph: await hashData(formattedUserData.ph),
      fn: await hashData(formattedUserData.fn),
      ln: await hashData(formattedUserData.ln),
      ct: await hashData(formattedUserData.ct),
      st: await hashData(formattedUserData.st),
      zip: await hashData(formattedUserData.zip),
      external_id: formattedUserData.external_id, // Não hashear external_id
      client_ip_address: formattedUserData.client_ip_address,
      client_user_agent: formattedUserData.client_user_agent
    };
    
    // Enriquecer parâmetros com dados hasheados
    const enhancedParams = {
      ...parameters,
      // Sempre incluir user_data se disponível (para EQM máxima)
      ...(Object.keys(hashedUserData).length > 0 && { 
        user_data: hashedUserData 
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
      has_persisted_data: !!persistedUserData,
      // Flag para indicar dados hasheados
      data_hashed: true
    };

    // Log detalhado para debug (remover em produção)
    console.log('🎯 Meta Event ENRIQUECIDO E HASHEADO:', eventName, {
      hasUserData: !!persistedUserData,
      userDataFields: Object.keys(formattedUserData),
      hashedFields: Object.keys(hashedUserData).filter(key => hashedUserData[key as keyof typeof hashedUserData]),
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
    
    // Função async para inicializar o pixel com hash
    const initializePixelWithHash = async () => {
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
        
        // Disparar PageView JÁ ENRIQUECIDO com dados persistidos E HASHEADOS
        const formattedUserData = formatUserDataForMeta(persistedUserData);
        
        // HASH dos dados para PageView
        const hashedUserData = {
          em: await hashData(formattedUserData.em),
          ph: await hashData(formattedUserData.ph),
          fn: await hashData(formattedUserData.fn),
          ln: await hashData(formattedUserData.ln),
          ct: await hashData(formattedUserData.ct),
          st: await hashData(formattedUserData.st),
          zip: await hashData(formattedUserData.zip),
          external_id: formattedUserData.external_id,
          client_ip_address: formattedUserData.client_ip_address,
          client_user_agent: formattedUserData.client_user_agent
        };
      
      const pageViewParams: any = {
        // Metadata para CAPI Gateway
        event_source_url: window.location.href,
        client_user_agent: navigator.userAgent,
        event_time: Math.floor(Date.now() / 1000),
        ...(persistedUserData?.sessionId && { 
          session_id: persistedUserData.sessionId 
        }),
        has_persisted_data: !!persistedUserData,
        data_hashed: true
      };
      
      // Enriquecer PageView com user_data hasheado se disponível
      if (Object.keys(hashedUserData).length > 0) {
        pageViewParams.user_data = hashedUserData;
      }
      
      console.log('🚀 PageView ENRIQUECIDO E HASHEADO:', {
        hasUserData: !!persistedUserData,
        userDataFields: Object.keys(formattedUserData),
        hashedFields: Object.keys(hashedUserData).filter(key => hashedUserData[key as keyof typeof hashedUserData]),
        params: pageViewParams
      });
      
      window.fbq('track', 'PageView', pageViewParams);
      }
    };
    
    // Chamar a função async
    initializePixelWithHash();
    
  }, [pixelId]);

  return null; // Componente puramente funcional, sem renderização
};

export default MetaPixel;