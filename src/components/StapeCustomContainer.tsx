'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getAllTrackingParams, initializeTracking } from '@/lib/cookies';
import { eventManager } from '@/lib/eventManager';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    fbq: (...args: any[]) => void;
    eventManager?: any;
  }
}

interface StapeCustomContainerProps {
  gtmId: string;
}

export default function StapeCustomContainer({ gtmId = 'GTM-567XZCDX' }: StapeCustomContainerProps) {
  const pathname = usePathname();
  const gtmInitialized = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined' || gtmInitialized.current) return;
    
    // Inicializar dataLayer se não existir
    window.dataLayer = window.dataLayer || [];
    
    // Expor EventManager no window para depuração
    window.eventManager = eventManager;
    
    // Função gtag simplificada
    window.gtag = function gtag(...args: any[]) {
      // Não enviar eventos de rastreamento automáticos - deixar para o EventManager
      if (args[0] === 'event' && ['page_view', 'view_content', 'initiate_checkout'].includes(args[1])) {
        console.log(`🚫 Evento ${args[1]} bloqueado no GTM - gerenciado pelo EventManager`);
        return;
      }
      window.dataLayer.push(args);
    };

    // Configuração inicial do GTM com otimizações Server-Side
    window.gtag('js', new Date());
    window.gtag('config', gtmId, { 
      send_page_view: false, // Desativar envio automático de page_view
      server_container_url: 'https://data.maracujazeropragas.com',
      transport_type: 'beacon',
      debug_mode: process.env.NODE_ENV === 'development',
      parameter: {
        // Parâmetros avançados para GTM Server
        event_timeout: 2000,
        user_properties: {
          tracking_version: 'server_side_v2'
        }
      }
    });

    // Enviar PageView via EventManager (coordenado)
    const sendPageView = async () => {
      console.log('📍 Enviando PageView via EventManager...');
      
      try {
        // 1. Capturar FBC PRIMEIRO (crítico para qualidade)
        await initializeTracking();
        
        // 2. Pequeno delay para garantir processamento do cookie FBC
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 3. Obter todos os parâmetros de rastreamento com FBC garantido
        const trackingParams = await getAllTrackingParams();
        
        // 4. Garantir captura do FBC - TENTATIVA AGRESSIVA
        let fbc = trackingParams.fbc;
        
        // Se não tiver FBC, tentar capturar da URL novamente
        if (!fbc && typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const fbclid = urlParams.get('fbclid');
          
          if (fbclid) {
            // Criar FBC no formato correto
            const timestamp = Date.now();
            fbc = `fb.1.${timestamp}.${fbclid}`;
            
            // Salvar no cookie para futuros eventos
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 90);
            document.cookie = `_fbc=${fbc}; expires=${expirationDate.toUTCString()}; path=/; domain=${window.location.hostname}; SameSite=Lax`;
            
            console.log('🎯 FBC capturado e salvo no PageView:', fbc);
            
            // Atualizar trackingParams com o FBC capturado
            trackingParams.fbc = fbc;
          }
        }
        
        // Se ainda não tiver FBC, tentar obter do cookie novamente
        if (!fbc && typeof window !== 'undefined') {
          const fbcCookie = document.cookie.match(new RegExp('(^| )_fbc=([^;]+)'));
          if (fbcCookie) {
            fbc = fbcCookie[2];
            trackingParams.fbc = fbc;
            console.log('🎯 FBC obtido do cookie no PageView:', fbc);
          }
        }
        
        // Log do status do FBC para depuração
        console.log('📊 Status FBC no PageView:', fbc ? '✅ Presente' : '❌ Ausente');
        if (fbc) {
          console.log('🔑 FBC value:', fbc);
        }
        
        // 5. Preparar dados do usuário para PageView
        const pageViewUserData = {
          ct: trackingParams.city,
          st: trackingParams.state,
          zp: trackingParams.zip,
          country: trackingParams.country,
          fbc: trackingParams.fbc,
          fbp: trackingParams.fbp,
          ga_client_id: trackingParams.ga_client_id,
          external_id: trackingParams.external_id
        };
        
        // 6. Enviar PageView via EventManager (não envia via GTM para evitar duplicação)
        console.log('📍 Enviando PageView com FBC garantido via EventManager');
        
        // Enviar apenas client-side para PageView (server-side não é necessário para page views)
        const pageViewResult = await eventManager.sendEvent('page_view', {
          user_data: pageViewUserData,
          custom_data: {
            page_title: document.title,
            page_location: window.location.href,
            page_path: pathname
          }
        }, { forceClient: true }); // Forçar apenas client-side para page_view
        
        console.log('✅ PageView enviado via EventManager:', pageViewResult);
        
        // 7. Enviar ViewContent após um pequeno delay (lógica do AdvancedTracking)
        setTimeout(async () => {
          console.log('🎯 Enviando ViewContent via EventManager (integrado do AdvancedTracking)...');
          
          // Obter dados de localização e pessoais de alta qualidade com múltiplas fontes
          const { getHighQualityLocationData, getEnhancedPersonalData } = await import('@/lib/cookies');
          const locationData = await getHighQualityLocationData();
          const personalData = await getEnhancedPersonalData(); // Usar a nova função enhanced
          
          // Preparar dados do usuário formatados
          const viewContentUserData = {
            em: personalData.em,
            ph: personalData.ph,
            fn: personalData.fn,
            ln: personalData.ln,
            ct: locationData.city,
            st: locationData.state,
            zp: locationData.zip,
            country: locationData.country,
            fbc: trackingParams.fbc,
            fbp: trackingParams.fbp,
            ga_client_id: trackingParams.ga_client_id,
            external_id: trackingParams.external_id
          };
          
          console.log('📊 Dados pessoais para ViewContent:', {
            em: personalData.em ? '✅ Presente' : '❌ Ausente',
            ph: personalData.ph ? '✅ Presente' : '❌ Ausente',
            fn: personalData.fn ? '✅ Presente' : '❌ Ausente',
            ln: personalData.ln ? '✅ Presente' : '❌ Ausente'
          });
          
          // Enviar ViewContent via EventManager
          const viewContentResult = await eventManager.sendViewContent(viewContentUserData);
          
          if (viewContentResult.success) {
            console.log('✅ ViewContent enviado com sucesso via EventManager (integrado):', viewContentResult);
          } else {
            console.error('❌ Falha ao enviar ViewContent via EventManager (integrado)');
          }
        }, 500);
        
        // 8. Expor funções globais para checkout (lógica do AdvancedTracking)
        if (typeof window !== 'undefined') {
          // Importar a função trackCheckout do AdvancedTracking
          const { trackCheckout } = await import('@/components/AdvancedTracking');
          
          window.advancedTracking = {
            trackCheckout,
            trackViewContentWithUserData: async (userData: any) => {
              console.log('🚀 Enviando ViewContent com dados do usuário via EventManager...');
              const result = await eventManager.sendViewContent(userData);
              if (result.success) {
                console.log('✅ ViewContent com dados do usuário enviado com sucesso:', result);
              } else {
                console.error('❌ Falha ao enviar ViewContent com dados do usuário');
              }
            },
            // Função de teste para o Pixel Helper
            testCheckout: () => {
              console.log('🧪 TESTANDO CHECKOUT NO PIXEL HELPER');
              trackCheckout({
                email: 'teste@email.com',
                phone: '11999999999',
                firstName: 'Teste',
                lastName: 'Usuario',
                city: 'São Paulo',
                state: 'SP',
                zip: '01310-100',
                country: 'BR'
              });
            },
            // Funções de depuração do EventManager
            getEventManagerStats: () => {
              return eventManager.getCacheStats();
            },
            clearEventManagerCache: () => {
              eventManager.clearCache();
            },
            testEventManagerDeduplication: () => {
              console.log('🧪 Testando deduplicação do EventManager...');
              // Testar envio do mesmo evento múltiplas vezes
              const testData = {
                email: 'teste@deduplicacao.com',
                phone: '11999999999',
                firstName: 'Teste',
                lastName: 'Deduplicação'
              };
              
              // Enviar o mesmo evento 3 vezes - só o primeiro deve passar
              eventManager.sendInitiateCheckout(testData);
              setTimeout(() => eventManager.sendInitiateCheckout(testData), 100);
              setTimeout(() => eventManager.sendInitiateCheckout(testData), 200);
            }
          };
        }
        
        // 9. Marcar GTM como inicializado
        gtmInitialized.current = true;
        
      } catch (error) {
        console.error('❌ Erro ao enviar eventos via EventManager:', error);
        gtmInitialized.current = true; // Marcar como inicializado mesmo com erro
      }
    };

    // Enviar PageView de forma assíncrona
    sendPageView();
    
  }, [pathname, gtmId]);

  return (
    <>
      {/* Stape.io Custom Container - Anti-AdBlock */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src="https://data.maracujazeropragas.com/24rckptuywp.js?"+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','4n13l=GRNEMiA9RlZGQCEvNzQzRQZKS1tFVg8NTRoYBxUTHgkRDRwHGwAZAhcWClsXHwY%3D');
          `,
        }}
      />
      
      {/* Stape.io Custom Container (noscript) */}
      <noscript>
        <iframe
          src="https://data.maracujazeropragas.com/ns.html?id=GTM-567XZCDX"
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}