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

// Função para obter dados do cliente (IP, localização, etc)
const getClientData = async () => {
  try {
    const response = await fetch('/api/client-info');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Erro ao obter dados do cliente:', error);
  }
  
  // Retornar dados básicos em caso de erro
  return {
    client_ip_address: null,
    client_user_agent: navigator.userAgent,
    city: null,
    region: null,
    country: null,
    countryName: null,
    zip: null
  };
};

// Função auxiliar para rastreamento de eventos Meta COM PERSISTÊNCIA E HASH
export const trackMetaEvent = async (eventName: string, parameters?: object) => {
  if (typeof window !== 'undefined' && window.fbq) {
    // Obter dados persistidos do usuário
    const persistedUserData = getPersistedUserData();
    const formattedUserData = formatUserDataForMeta(persistedUserData);
    
    // Obter dados do cliente em tempo real
    const clientData = await getClientData();
    
    // Combinar dados formatados com dados do cliente
    const enrichedUserData = {
      ...formattedUserData,
      ct: clientData.city || formattedUserData.ct,
      st: clientData.region || formattedUserData.st,
      country: clientData.country || formattedUserData.country, // Adicionando country
      zip: clientData.zip || formattedUserData.zip,
      client_ip_address: clientData.client_ip_address,
      client_user_agent: clientData.client_user_agent
    };
    
    // HASH DE TODOS OS DADOS PII (Informações Pessoais Identificáveis)
    const hashedUserData = {
      em: await hashData(enrichedUserData.em),
      ph: await hashData(enrichedUserData.ph),
      fn: await hashData(enrichedUserData.fn),
      ln: await hashData(enrichedUserData.ln),
      ct: await hashData(enrichedUserData.ct),
      st: await hashData(enrichedUserData.st),
      country: await hashData(enrichedUserData.country), // Adicionando country
      zip: await hashData(enrichedUserData.zip),
      external_id: enrichedUserData.external_id, // Não hashear external_id
      client_ip_address: enrichedUserData.client_ip_address,
      client_user_agent: enrichedUserData.client_user_agent
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
      clientDataFields: Object.keys(clientData).filter(key => clientData[key as keyof typeof clientData]),
      enrichedFields: Object.keys(enrichedUserData).filter(key => enrichedUserData[key as keyof typeof enrichedUserData]),
      hashedFields: Object.keys(hashedUserData).filter(key => hashedUserData[key as keyof typeof hashedUserData]),
      location: {
        city: clientData.city,
        region: clientData.region,
        country: clientData.country,
        countryName: clientData.countryName,
        zip: clientData.zip,
        ip: clientData.client_ip_address,
        formatted: {
          city: clientData.city?.toLowerCase(),
          region: clientData.region?.toLowerCase(), 
          country: clientData.country?.toLowerCase(),
          zip: clientData.zip // Mantém formatação original
        }
      },
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
        
        // Obter dados do cliente em tempo real
        const clientData = await getClientData();
        
        // Combinar dados formatados com dados do cliente
        const enrichedUserData = {
          ...formattedUserData,
          ct: clientData.city || formattedUserData.ct,
          st: clientData.region || formattedUserData.st,
          country: clientData.country || formattedUserData.country, // Adicionando country
          zip: clientData.zip || formattedUserData.zip,
          client_ip_address: clientData.client_ip_address,
          client_user_agent: clientData.client_user_agent
        };
        
        // HASH dos dados para PageView
        const hashedUserData = {
          em: await hashData(enrichedUserData.em),
          ph: await hashData(enrichedUserData.ph),
          fn: await hashData(enrichedUserData.fn),
          ln: await hashData(enrichedUserData.ln),
          ct: await hashData(enrichedUserData.ct),
          st: await hashData(enrichedUserData.st),
          country: await hashData(enrichedUserData.country), // Adicionando country
          zip: await hashData(enrichedUserData.zip),
          external_id: enrichedUserData.external_id,
          client_ip_address: enrichedUserData.client_ip_address,
          client_user_agent: enrichedUserData.client_user_agent
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
        clientDataFields: Object.keys(clientData).filter(key => clientData[key as keyof typeof clientData]),
        enrichedFields: Object.keys(enrichedUserData).filter(key => enrichedUserData[key as keyof typeof enrichedUserData]),
        hashedFields: Object.keys(hashedUserData).filter(key => hashedUserData[key as keyof typeof hashedUserData]),
        location: {
          city: clientData.city,
          region: clientData.region,
          country: clientData.country,
          countryName: clientData.countryName,
          zip: clientData.zip,
          ip: clientData.client_ip_address,
          formatted: {
            city: clientData.city?.toLowerCase(),
            region: clientData.region?.toLowerCase(), 
            country: clientData.country?.toLowerCase(),
            zip: clientData.zip // Mantém formatação original
          }
        },
        params: pageViewParams
      });
      
      window.fbq('track', 'PageView', pageViewParams);
      
      // Disponibilizar trackMetaEvent globalmente para o EventController
      if (typeof window !== 'undefined') {
        window.trackMetaEvent = trackMetaEvent;
      }
      }
    };
    
    // Chamar a função async
    initializePixelWithHash();
    
  }, [pixelId]);

  return null; // Componente puramente funcional, sem renderização
};

export default MetaPixel;