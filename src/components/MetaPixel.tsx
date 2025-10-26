'use client';

import { useEffect } from 'react';
import { initializePersistence, formatUserDataForMeta, getPersistedUserData } from '@/lib/userDataPersistence';
import { formatEnrichedDataForMeta, getEnrichedUserData } from '@/lib/enrichedUserData';
import { getEnrichedClientData } from '@/lib/clientInfoService';
import { getCurrentTimestamp } from '@/lib/timestampUtils';

// 🎛️ CONTROLE DE BROWSER PIXEL
const BROWSER_PIXEL_ENABLED = process.env.NEXT_PUBLIC_BROWSER_PIXEL === 'true';

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

// Função auxiliar para rastreamento de eventos Meta COM DADOS ENRIQUECIDOS
export const trackMetaEvent = async (eventName: string, parameters?: object, deduplicationOptions?: { orderId?: string; userEmail?: string }) => {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      // 1. Obter dados persistidos do usuário
      const persistedUserData = getPersistedUserData();
      
      // 2. Obter dados enriquecidos do cliente em tempo real
      const enrichedClientData = await getEnrichedClientData(persistedUserData);
      
      // 3. Formatar dados para Meta
      const formattedUserData = formatUserDataForMeta(persistedUserData);
      
      // 4. Sobrescrever com dados enriquecidos (prioridade para dados reais)
      const finalUserData = {
        ...formattedUserData,
        // Dados do cliente com prioridade máxima
        client_ip_address: enrichedClientData.client_ip_address,
        ct: enrichedClientData.ct,
        st: enrichedClientData.st,
        zip: enrichedClientData.zip,
        country: enrichedClientData.country,
        // Metadados adicionais
        client_timezone: enrichedClientData.client_timezone,
        client_isp: enrichedClientData.client_isp,
        client_info_source: enrichedClientData.client_info_source
      };
      
      // 5. HASH DE TODOS OS DADOS PII (Informações Pessoais Identificáveis) - sem user agent redundante
      const hashedUserData = {
        em: await hashData(finalUserData.em),
        ph: await hashData(finalUserData.ph),
        fn: await hashData(finalUserData.fn),
        ln: await hashData(finalUserData.ln),
        ct: await hashData(finalUserData.ct),
        st: await hashData(finalUserData.st),
        zip: await hashData(finalUserData.zip),
        country: await hashData(finalUserData.country),
        external_id: finalUserData.external_id, // Não hashear external_id
        client_ip_address: finalUserData.client_ip_address, // IP não hashear
        client_timezone: finalUserData.client_timezone,
        client_isp: finalUserData.client_isp,
        client_info_source: finalUserData.client_info_source
      };
      
      // 6. Gerar chaves unificadas se disponível
      let fbqOptions = {};
      let deduplicationKeys = {};
      
      if (deduplicationOptions?.orderId) {
        const baseId = `purchase_${deduplicationOptions.orderId}_${Date.now()}`;
        const eventID = `${baseId}_${Math.random().toString(36).substr(2, 5)}`;
        
        fbqOptions = {
          eventID
        };
        
        // Chaves de deduplicação nos PARÂMETROS (correção principal)
        deduplicationKeys = {
          event_id: eventID, // ✅ ADICIONADO: event_id nos parâmetros
          transaction_id: deduplicationOptions.orderId,
          email_hash: deduplicationOptions.userEmail ? await hashData(deduplicationOptions.userEmail) : undefined
        };
        
        console.log('🔑 Usando chaves unificadas de deduplicação:', {
          eventID,
          event_id: eventID, // Log para debug
          transaction_id: deduplicationOptions.orderId,
          eventName
        });
      } else {
        // Para eventos sem orderId, gerar eventID anyway para consistência
        const eventID = `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        fbqOptions = { eventID };
        deduplicationKeys = { event_id: eventID };
      }
      
      // 7. Enriquecer parâmetros com dados hasheados
      const enhancedParams = {
        ...parameters,
        // Sempre incluir user_data se disponível (para EQM máxima)
        ...(Object.keys(hashedUserData).length > 0 && { 
          user_data: hashedUserData 
        }),
        // Metadata para CAPI Gateway (removendo client_user_agent redundante)
        event_source_url: window.location.href,
        event_time: getCurrentTimestamp(),
        // Informações de sessão
        ...(persistedUserData?.sessionId && { 
          session_id: persistedUserData.sessionId 
        }),
        // Flag para indicar se tem dados persistidos
        has_persisted_data: !!persistedUserData,
        // Flag para indicar dados hasheados
        data_hashed: true,
        // Flag para indicar dados enriquecidos
        data_enriched: true,
        // Metadados de qualidade (padronizado para segundos)
        enrichment_timestamp: getCurrentTimestamp(),
        // ✅ CHAVES DE DEDUPLICAÇÃO NOS PARÂMETROS (correção principal)
        ...deduplicationKeys
      };

      // Log detalhado para debug (remover em produção)
      console.log('🎯 Meta Event ENRIQUECIDO COM DADOS REAIS:', eventName, {
        hasUserData: !!persistedUserData,
        hasRealIP: !!finalUserData.client_ip_address,
        city: finalUserData.ct,
        state: finalUserData.st,
        zip: finalUserData.zip,
        country: finalUserData.country,
        enrichmentSource: finalUserData.client_info_source,
        hasDeduplication: !!deduplicationOptions?.orderId,
        browserPixelEnabled: BROWSER_PIXEL_ENABLED,
        params: enhancedParams
      });
      
      // 🎛️ CONTROLE DE ENVIO BROWSER PIXEL
      if (BROWSER_PIXEL_ENABLED) {
        // ✅ MODO HÍBRIDO: Browser + CAPI
        window.fbq('track', eventName, enhancedParams, Object.keys(fbqOptions).length > 0 ? fbqOptions : undefined);
        console.log(`🌐 Browser Pixel ATIVADO - ${eventName} enviado via browser`);
      } else {
        // ❌ MODO CAPI-ONLY: Apenas CAPI Gateway
        console.log(`🚫 Browser Pixel DESATIVADO - ${eventName} enviado apenas via CAPI Gateway`);
        // Não envia pelo browser, mas CAPI Gateway ainda recebe via server_event_uri
      }
      
    } catch (error) {
      console.error('❌ Erro ao fazer trackMetaEvent com dados enriquecidos:', error);
      
      // Fallback para método original sem enriquecimento
      const persistedUserData = getPersistedUserData();
      const formattedUserData = formatUserDataForMeta(persistedUserData);
      
      const hashedUserData = {
        em: await hashData(formattedUserData.em),
        ph: await hashData(formattedUserData.ph),
        fn: await hashData(formattedUserData.fn),
        ln: await hashData(formattedUserData.ln),
        ct: await hashData(formattedUserData.ct),
        st: await hashData(formattedUserData.st),
        zip: await hashData(formattedUserData.zip),
        country: await hashData(formattedUserData.country),
        external_id: formattedUserData.external_id,
        client_ip_address: formattedUserData.client_ip_address
        // Removido client_user_agent redundante
      };
      
      // Gerar eventID mesmo no fallback para consistência
      const fallbackEventID = `${eventName}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      
      const fallbackParams = {
        ...parameters,
        ...(Object.keys(hashedUserData).length > 0 && { 
          user_data: hashedUserData 
        }),
        event_source_url: window.location.href,
        event_time: getCurrentTimestamp(),
        data_enriched: false,
        fallback_used: true,
        // ✅ ADICIONADO: event_id mesmo no fallback
        event_id: fallbackEventID
      };
      
      console.log('🔄 Usando fallback sem enriquecimento:', eventName, { event_id: fallbackEventID });
      
      // 🎛️ CONTROLE DE ENVIO BROWSER PIXEL NO FALLBACK
      if (BROWSER_PIXEL_ENABLED) {
        window.fbq('track', eventName, fallbackParams, { eventID: fallbackEventID });
        console.log(`🌐 Browser Pixel ATIVADO - ${eventName} fallback enviado via browser`);
      } else {
        console.log(`🚫 Browser Pixel DESATIVADO - ${eventName} fallback enviado apenas via CAPI Gateway`);
        // Não envia pelo browser, mas CAPI Gateway ainda recebe
      }
    }
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
        
        // Gerar eventID para PageView padrão (correção deduplicação)
        const pageViewEventID = `PageView_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
        // ✅ MELHORIA: PageView com dados comerciais para nota 9+
        const pageViewParams = {
          value: 39.9,
          currency: 'BRL',
          content_ids: ['339591'],
          content_type: 'product',
          content_name: 'Sistema 4 Fases - Ebook Trips',
          predicted_ltv: 39.9 * 3.5,
          condition: 'new',
          availability: 'in stock',
          event_id: pageViewEventID // ✅ Para deduplicação
        };
        
        // 🎛️ CONTROLE DE ENVIO PAGEVIEW PADRÃO
        if (BROWSER_PIXEL_ENABLED) {
          // ✅ MODO HÍBRIDO: Browser + CAPI
          window.fbq('track', 'PageView', pageViewParams, { eventID: pageViewEventID });
          console.log('🌐 Browser Pixel ATIVADO - PageView padrão enviado via browser');
        } else {
          // ❌ MODO CAPI-ONLY: Apenas CAPI Gateway
          console.log('🚫 Browser Pixel DESATIVADO - PageView padrão enviado apenas via CAPI Gateway');
          // Não envia pelo browser, mas CAPI Gateway ainda recebe via server_event_uri
        }
        
        // Disparar evento separado com dados enriquecidos para CAPI
        try {
          const persistedUserData = getPersistedUserData();
          const enrichedClientData = await getEnrichedClientData(persistedUserData);
          const formattedUserData = formatUserDataForMeta(persistedUserData);
          
          // Combinar dados com prioridade para dados reais
          const finalUserData = {
            ...formattedUserData,
            client_ip_address: enrichedClientData.client_ip_address,
            ct: enrichedClientData.ct,
            st: enrichedClientData.st,
            zip: enrichedClientData.zip,
            country: enrichedClientData.country,
            client_timezone: enrichedClientData.client_timezone,
            client_isp: enrichedClientData.client_isp,
            client_info_source: enrichedClientData.client_info_source
          };
          
          // HASH dos dados para o evento enriquecido (sem user agent redundante)
          const hashedUserData = {
            em: await hashData(finalUserData.em),
            ph: await hashData(finalUserData.ph),
            fn: await hashData(finalUserData.fn),
            ln: await hashData(finalUserData.ln),
            ct: await hashData(finalUserData.ct),
            st: await hashData(finalUserData.st),
            zip: await hashData(finalUserData.zip),
            country: await hashData(finalUserData.country),
            external_id: finalUserData.external_id,
            client_ip_address: finalUserData.client_ip_address,
            client_timezone: finalUserData.client_timezone,
            client_isp: finalUserData.client_isp,
            client_info_source: finalUserData.client_info_source
          };
        
          // Gerar eventID para PageViewEnriched
          const pageViewEnrichedEventID = `PageViewEnriched_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        
          const pageViewEnrichedParams: any = {
            // ✅ MELHORIA: Dados comerciais para nota 9+
            value: 39.9,
            currency: 'BRL',
            content_ids: ['339591'],
            content_type: 'product',
            content_name: 'Sistema 4 Fases - Ebook Trips',
            predicted_ltv: 39.9 * 3.5,
            condition: 'new',
            availability: 'in stock',
            
            // Metadata essencial para CAPI Gateway (sem user agent redundante)
            event_source_url: window.location.href,
            event_time: getCurrentTimestamp(),
            // ✅ ADICIONADO: event_id nos parâmetros para deduplicação
            event_id: pageViewEnrichedEventID,
            ...(persistedUserData?.sessionId && { 
              session_id: persistedUserData.sessionId 
            }),
            has_persisted_data: !!persistedUserData,
            data_hashed: true,
            data_enriched: true,
            enrichment_timestamp: getCurrentTimestamp()
          };
          
          // Enriquecer com user_data hasheado se disponível
          if (Object.keys(hashedUserData).length > 0) {
            pageViewEnrichedParams.user_data = hashedUserData;
          }
          
          console.log('🚀 PageView PADRÃO disparado + evento enriquecido:', {
            hasUserData: !!persistedUserData,
            hasRealIP: !!finalUserData.client_ip_address,
            city: finalUserData.ct,
            state: finalUserData.st,
            zip: finalUserData.zip,
            country: finalUserData.country,
            enrichmentSource: finalUserData.client_info_source,
            pageViewEventID,
            pageViewEnrichedEventID
          });
          
          // Disparar evento customizado com dados enriquecidos (não afeta PageView padrão)
          // 🎛️ CONTROLE DE ENVIO PAGEVIEW ENRICHED
          if (BROWSER_PIXEL_ENABLED) {
            // ✅ MODO HÍBRIDO: Browser + CAPI
            window.fbq('trackCustom', 'PageViewEnriched', pageViewEnrichedParams, { eventID: pageViewEnrichedEventID });
            console.log('🌐 Browser Pixel ATIVADO - PageViewEnriched enviado via browser');
          } else {
            // ❌ MODO CAPI-ONLY: Apenas CAPI Gateway
            console.log('🚫 Browser Pixel DESATIVADO - PageViewEnriched enviado apenas via CAPI Gateway');
            // Não envia pelo browser, mas CAPI Gateway ainda recebe via server_event_uri
          }
          
        } catch (error) {
          console.error('❌ Erro ao enriquecer PageView:', error);
          
          // PageView padrão sem parâmetros (fallback)
          console.log('🔄 PageView padrão (fallback)');
          // PageView já foi disparado no início, não precisa disparar novamente
        }
      }
    };
    
    // Chamar a função async
    initializePixelWithHash();
    
  }, [pixelId]);

  return null; // Componente puramente funcional, sem renderização
};

export default MetaPixel;