'use client';
import { useEffect, useRef } from 'react';
import { eventManager } from '@/lib/eventManager';
import { getAllTrackingParams, initializeTracking, getHighQualityLocationData, getHighQualityPersonalData, getFacebookCookies, captureFbclid } from '@/lib/cookies';

// --- FUNÇÕES ESSENCIAIS APENAS ---

// Função trackViewContent simplificada
const trackViewContent = async (viewContentHasBeenTracked: any) => {
  if (viewContentHasBeenTracked.current) {
    return;
  }

  console.log('🚀 Enviando ViewContent único...');

  // initializeTracking() já foi chamado no useEffect principal
  await new Promise(resolve => setTimeout(resolve, 100));

  const locationData = await getHighQualityLocationData();
  const personalData = await getHighQualityPersonalData();
  const trackingParams = await getAllTrackingParams();

  // Preparar dados do usuário formatados
  const userData = {
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

  // 📊 ENVIAR EVENTOS COM ESTRUTURA CORRETA PARA GTM
  const eventId = `viewcontent_${Date.now()}_gtm`;
  
  // 1. Evento view_item para GA4
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'view_item',
      event_id: eventId,
      ecommerce: {
        currency: 'BRL',
        value: 39.90,
        items: [{
          item_id: 'ebook-controle-trips',
          item_name: 'E-book Sistema de Controle de Trips',
          category: 'E-book',
          price: 39.90,
          quantity: 1
        }]
      },
      user_data: userData,
      timestamp: new Date().toISOString()
    });
    console.log('✅ view_item enviado para GTM com estrutura ecommerce');
  }

  // 2. Evento ViewContent para Meta
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'ViewContent',
      event_id: `${eventId}_meta`,
      content_name: 'E-book Sistema de Controle de Trips',
      content_category: 'E-book',
      content_ids: ['ebook-controle-trips'],
      content_type: 'product',
      value: 39.90,
      currency: 'BRL',
      user_data: userData,
      timestamp: new Date().toISOString()
    });
    console.log('✅ ViewContent enviado para GTM com estrutura Meta');
  }

  // Enviar via EventManager (server-side)
  const result = await eventManager.sendViewContent(userData);
  
  if (result.success) {
    console.log('✅ ViewContent enviado com sucesso (todos os canais):', result);
    viewContentHasBeenTracked.current = true;
  } else {
    console.error('❌ Falha ao enviar ViewContent');
  }
};

// Função trackCheckout essencial
export const trackCheckout = async (userData: any) => {
  console.log('🚀 Enviando InitiateCheckout único...');

  await new Promise(resolve => setTimeout(resolve, 50));

  const locationData = await getHighQualityLocationData();
  const personalData = await getHighQualityPersonalData();
  
  // 🌍 Capturar endereço IP para otimização
  const { getUserIP } = await import('@/lib/cookies');
  const userIP = await getUserIP();

  // Preparar dados do usuário com prioridade para dados do formulário
  const formattedUserData = {
    em: userData.email ? userData.email.toLowerCase().trim() : personalData.em,
    ph: userData.phone ? userData.phone.replace(/\D/g, '') : personalData.ph,
    fn: userData.firstName ? userData.firstName.trim() : personalData.fn,
    ln: userData.lastName ? userData.lastName.trim() : personalData.ln,
    ct: locationData.city || userData.city || undefined,
    st: locationData.state || userData.state || undefined,
    zp: locationData.zip || userData.zip || undefined,
    country: locationData.country || userData.country || 'BR',
    fbc: userData.fbc,
    fbp: userData.fbp,
    ga_client_id: userData.ga_client_id,
    external_id: userData.external_id,
    // 🌍 Adicionar IP e User Agent para máxima otimização
    ip: userIP,
    user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
  };

  // Salvar os dados pessoais no localStorage para uso futuro
  if (userData.email || userData.phone || userData.firstName || userData.lastName) {
    const { savePersonalDataToLocalStorage } = await import('@/lib/cookies');
    const personalDataToSave = {
      fn: userData.firstName ? userData.firstName.trim() : personalData.fn,
      ln: userData.lastName ? userData.lastName.trim() : personalData.ln,
      em: userData.email ? userData.email.toLowerCase().trim() : personalData.em,
      ph: userData.phone ? userData.phone.replace(/\D/g, '') : personalData.ph
    };
    savePersonalDataToLocalStorage(personalDataToSave);
    console.log('💾 Dados pessoais salvos:', personalDataToSave);
  }

  console.log('📊 Dados formatados:', formattedUserData);

  // 📊 ENVIAR EVENTOS COM ESTRUTURA CORRETA PARA GTM
  const eventId = `checkout_${Date.now()}_gtm`;
  
  // 1. Evento begin_checkout para GA4
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'begin_checkout',
      event_id: eventId,
      ecommerce: {
        currency: 'BRL',
        value: 39.90,
        items: [{
          item_id: 'ebook-controle-trips',
          item_name: 'E-book Sistema de Controle de Trips',
          category: 'E-book',
          price: 39.90,
          quantity: 1
        }]
      },
      user_data: formattedUserData,
      timestamp: new Date().toISOString()
    });
    console.log('✅ begin_checkout enviado para GTM com estrutura ecommerce');
  }

  // 2. Evento InitiateCheckout para Meta
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push({
      event: 'InitiateCheckout',
      event_id: `${eventId}_meta`,
      content_name: 'E-book Sistema de Controle de Trips',
      content_category: 'E-book',
      content_ids: ['ebook-controle-trips'],
      content_type: 'product',
      value: 39.90,
      currency: 'BRL',
      user_data: formattedUserData,
      timestamp: new Date().toISOString()
    });
    console.log('✅ InitiateCheckout enviado para GTM com estrutura Meta');
  }

  // Enviar via EventManager (server-side)
  const result = await eventManager.sendInitiateCheckout(formattedUserData);
  
  if (result.success) {
    console.log('✅ InitiateCheckout enviado com sucesso (todos os canais):', result);
  } else {
    console.error('❌ Falha ao enviar InitiateCheckout');
  }
};

// --- COMPONENTE PRINCIPAL SIMPLIFICADO ---
export default function AdvancedTracking() {
  const viewContentHasBeenTracked = useRef(false);
  const pageViewHasBeenTracked = useRef(false);

  useEffect(() => {
    // � CRÍTICO: Inicializar tracking IMEDIATAMENTE para capturar fbclid
    console.log('🚀 Inicializando tracking imediatamente...');
    initializeTracking();
    
    // Otimizado: iniciar tracking sem bloquear renderização
    const initTimer = requestIdleCallback(() => {
      // Adicionar logs detalhados para debug do PageView
      console.log('🔍 Debug do PageView (após idle callback):');
      console.log('- window.dataLayer existe:', !!window.dataLayer);
      console.log('- window.fbq existe:', !!window.fbq);
      console.log('- pageViewHasBeenTracked:', pageViewHasBeenTracked.current);
      console.log('- dataLayer content:', window.dataLayer);
      
      // Dispara PageView via GTM assim que o componente monta
      if (!pageViewHasBeenTracked.current && typeof window !== 'undefined' && window.dataLayer) {
        console.log('📄 Enviando PageView único via GTM...');
        
        // Adicionar log detalhado antes de enviar
        const pageViewEvent = {
          event: 'page_view',
          event_id: `pageview_${Date.now()}_gtm`,
          page_title: document.title,
          page_location: window.location.href,
          page_referrer: document.referrer,
          // Dados adicionais para GA4
          event_category: 'navigation',
          event_label: document.title,
          timestamp: new Date().toISOString()
        };
        
        console.log('📤 Evento PageView que será enviado:', pageViewEvent);
        
        window.dataLayer.push(pageViewEvent);
        
        // Enviar também diretamente para GA4 se disponível
        if (typeof window.gtag !== 'undefined') {
          window.gtag('config', 'G-CZ0XMXL3RX', {
            page_title: document.title,
            page_location: window.location.href,
            page_referrer: document.referrer
          });
          window.gtag('event', 'page_view', {
            page_title: document.title,
            page_location: window.location.href,
            page_referrer: document.referrer,
            send_to: 'G-CZ0XMXL3RX'
          });
          console.log('✅ PageView também enviado diretamente para GA4');
        }
        
        pageViewHasBeenTracked.current = true;
        console.log('✅ PageView enviado via GTM');
        console.log('📊 dataLayer após PageView:', window.dataLayer);
        
        // Verificar se o evento foi realmente adicionado
        setTimeout(() => {
          console.log('🔍 Verificando se PageView está no dataLayer...');
          const hasPageView = window.dataLayer?.some(item => item.event === 'page_view');
          console.log('- PageView encontrado no dataLayer:', hasPageView);
          
          // Fallback desativado para evitar duplicidade com GTM/Stape
          if (!hasPageView) {
            console.log('⚠️ PageView não encontrado no dataLayer, mas fallback desativado para evitar duplicidade');
            console.log('💡 Verifique sua configuração GTM/Stape');
          }
        }, 2000);
      } else {
        console.log('❌ Condições para PageView não atendidas:', {
          hasWindow: typeof window !== 'undefined',
          hasDataLayer: !!window.dataLayer,
          alreadyTracked: pageViewHasBeenTracked.current
        });
      }
    }, { timeout: 3000 }); // Timeout de 3 segundos como fallback

    // Dispara o view_content apenas uma vez após 5 segundos (otimizado para performance)
    const timer = setTimeout(async () => {
      console.log('🎯 Disparando ViewContent único...');
      await trackViewContent(viewContentHasBeenTracked);
    }, 5000);

    // Expondo as funções essenciais na janela global
    if (typeof window !== 'undefined') {
      window.advancedTracking = {
        trackCheckout,
        trackViewContentWithUserData: trackViewContent,
        // Função de teste para debug
        testCheckout: () => {
          console.log('🧪 Testando checkout...');
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
        // Função para testar ViewContent manualmente
        testViewContent: () => {
          console.log('🧪 Testando ViewContent...');
          trackViewContent(viewContentHasBeenTracked);
        },
        // Função para testar PageView manualmente
        testPageView: () => {
          console.log('🧪 Testando PageView...');
          if (typeof window !== 'undefined' && window.dataLayer) {
            const testEvent = {
              event: 'page_view',
              event_id: `pageview_test_${Date.now()}_gtm`,
              page_title: document.title,
              page_location: window.location.href,
              page_referrer: document.referrer,
              event_category: 'navigation',
              event_label: document.title,
              test_mode: true,
              timestamp: new Date().toISOString()
            };
            
            console.log('📤 Enviando PageView de teste:', testEvent);
            window.dataLayer.push(testEvent);
            console.log('✅ PageView de teste enviado via GTM');
            
            // Testar GA4 também
            if (typeof window.gtag !== 'undefined') {
              console.log('🧪 Testando PageView via GA4 direto...');
              window.gtag('event', 'page_view', {
                page_title: document.title,
                page_location: window.location.href,
                page_referrer: document.referrer,
                send_to: 'G-CZ0XMXL3RX',
                test_mode: true
              });
              console.log('✅ PageView de teste enviado via GA4 direto');
            }
            
            // Facebook Pixel fallback desativado para evitar duplicidade
            console.log('🚫 Facebook Pixel fallback desativado para teste (evitar duplicidade)');
          } else {
            console.log('❌ dataLayer não disponível para teste');
          }
        },
        // Função para verificar status do tracking
        checkTrackingStatus: () => {
          console.log('📊 Status do Tracking:');
          console.log('- dataLayer:', !!window.dataLayer);
          console.log('- fbq:', !!window.fbq);
          console.log('- gtag:', !!window.gtag);
          console.log('- pageView já trackeado:', pageViewHasBeenTracked.current);
          console.log('- viewContent já trackeado:', viewContentHasBeenTracked.current);
          
          // Verificar cookies Facebook
          const { fbc, fbp } = getFacebookCookies();
          console.log('📊 Status dos cookies Facebook:');
          console.log('- _fbc:', fbc || '❌ Não encontrado');
          console.log('- _fbp:', fbp || '❌ Não encontrado');
          
          // Verificar parâmetros da URL atual
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const fbclid = urlParams.get('fbclid');
            console.log('🔍 Parâmetros da URL atual:');
            console.log('- fbclid:', fbclid || '❌ Não encontrado');
            console.log('- URL completa:', window.location.href);
          }
          
          if (window.dataLayer) {
            console.log('- dataLayer items:', window.dataLayer.length);
            console.log('- dataLayer content:', window.dataLayer);
          }
        },
        // Função para testar captura de fbclid
        // Função para testar todos os eventos
        testAllEvents: () => {
          console.log('🧪 Iniciando teste completo de todos os eventos...');
          
          // 1. Testar PageView
          console.log('1️⃣ Testando PageView...');
          if (typeof window !== 'undefined' && window.dataLayer) {
            const pageViewEvent = {
              event: 'page_view',
              event_id: `pageview_test_${Date.now()}_gtm`,
              page_title: document.title,
              page_location: window.location.href,
              page_referrer: document.referrer,
              test_mode: true,
              timestamp: new Date().toISOString()
            };
            window.dataLayer.push(pageViewEvent);
            console.log('✅ PageView de teste enviado');
          }
          
          // 2. Testar view_item (GA4)
          setTimeout(() => {
            console.log('2️⃣ Testando view_item (GA4)...');
            if (typeof window !== 'undefined' && window.dataLayer) {
              const viewItemEvent = {
                event: 'view_item',
                event_id: `viewitem_test_${Date.now()}_gtm`,
                user_data: {
                  em: 'teste@email.com',
                  ph: '11999999999'
                },
                custom_data: {
                  value: 39.90,
                  currency: 'BRL',
                  content_name: 'E-book Sistema de Controle de Trips',
                  content_category: 'E-book'
                },
                test_mode: true,
                timestamp: new Date().toISOString()
              };
              window.dataLayer.push(viewItemEvent);
              console.log('✅ view_item de teste enviado');
            }
          }, 1000);
          
          // 3. Testar ViewContent (Meta)
          setTimeout(() => {
            console.log('3️⃣ Testando ViewContent (Meta)...');
            if (typeof window !== 'undefined' && window.dataLayer) {
              const viewContentEvent = {
                event: 'ViewContent',
                event_id: `viewcontent_test_${Date.now()}_gtm`,
                user_data: {
                  em: 'teste@email.com',
                  ph: '11999999999'
                },
                custom_data: {
                  value: 39.90,
                  currency: 'BRL',
                  content_name: 'E-book Sistema de Controle de Trips',
                  content_category: 'E-book'
                },
                test_mode: true,
                timestamp: new Date().toISOString()
              };
              window.dataLayer.push(viewContentEvent);
              console.log('✅ ViewContent de teste enviado');
            }
          }, 2000);
          
          // 4. Testar begin_checkout (GA4)
          setTimeout(() => {
            console.log('4️⃣ Testando begin_checkout (GA4)...');
            if (typeof window !== 'undefined' && window.dataLayer) {
              const beginCheckoutEvent = {
                event: 'begin_checkout',
                event_id: `begincheckout_test_${Date.now()}_gtm`,
                user_data: {
                  em: 'teste@email.com',
                  ph: '11999999999',
                  fn: 'Teste',
                  ln: 'Usuario'
                },
                custom_data: {
                  value: 39.90,
                  currency: 'BRL',
                  content_name: 'E-book Sistema de Controle de Trips',
                  content_category: 'E-book'
                },
                test_mode: true,
                timestamp: new Date().toISOString()
              };
              window.dataLayer.push(beginCheckoutEvent);
              console.log('✅ begin_checkout de teste enviado');
            }
          }, 3000);
          
          // 5. Testar InitiateCheckout (Meta)
          setTimeout(() => {
            console.log('5️⃣ Testando InitiateCheckout (Meta)...');
            if (typeof window !== 'undefined' && window.dataLayer) {
              const initiateCheckoutEvent = {
                event: 'InitiateCheckout',
                event_id: `initiatecheckout_test_${Date.now()}_gtm`,
                user_data: {
                  em: 'teste@email.com',
                  ph: '11999999999',
                  fn: 'Teste',
                  ln: 'Usuario'
                },
                custom_data: {
                  value: 39.90,
                  currency: 'BRL',
                  content_name: 'E-book Sistema de Controle de Trips',
                  content_category: 'E-book'
                },
                test_mode: true,
                timestamp: new Date().toISOString()
              };
              window.dataLayer.push(initiateCheckoutEvent);
              console.log('✅ InitiateCheckout de teste enviado');
            }
          }, 4000);
          
          // 6. Testar view_content (GTM Server)
          setTimeout(() => {
            console.log('6️⃣ Testando view_content (GTM Server)...');
            if (typeof window !== 'undefined' && window.dataLayer) {
              const viewContentServerEvent = {
                event: 'view_content',
                event_id: `viewcontent_server_test_${Date.now()}_gtm`,
                user_data: {
                  em: 'teste@email.com',
                  ph: '11999999999'
                },
                custom_data: {
                  value: 39.90,
                  currency: 'BRL',
                  content_name: 'E-book Sistema de Controle de Trips',
                  content_category: 'E-book'
                },
                test_mode: true,
                timestamp: new Date().toISOString()
              };
              window.dataLayer.push(viewContentServerEvent);
              console.log('✅ view_content (GTM Server) de teste enviado');
            }
          }, 5000);
          
          // 7. Testar initiate_checkout (GTM Server)
          setTimeout(() => {
            console.log('7️⃣ Testando initiate_checkout (GTM Server)...');
            if (typeof window !== 'undefined' && window.dataLayer) {
              const initiateCheckoutServerEvent = {
                event: 'initiate_checkout',
                event_id: `initiatecheckout_server_test_${Date.now()}_gtm`,
                user_data: {
                  em: 'teste@email.com',
                  ph: '11999999999',
                  fn: 'Teste',
                  ln: 'Usuario'
                },
                custom_data: {
                  value: 39.90,
                  currency: 'BRL',
                  content_name: 'E-book Sistema de Controle de Trips',
                  content_category: 'E-book'
                },
                test_mode: true,
                timestamp: new Date().toISOString()
              };
              window.dataLayer.push(initiateCheckoutServerEvent);
              console.log('✅ initiate_checkout (GTM Server) de teste enviado');
            }
            
            console.log('🎉 Teste completo finalizado! Verifique o Google Tag Assistant.');
          }, 6000);
        },
      };
    }

    return () => {
      if (initTimer) cancelIdleCallback(initTimer);
      clearTimeout(timer);
    };
  }, []);

  return null; // Componente invisível
}

// --- TIPAGEM GLOBAL SIMPLIFICADA ---
declare global {
  interface Window {
    dataLayer?: any[];
    fbq?: any;
    gtag?: any;
    advancedTracking?: {
      trackCheckout: (userData: any) => Promise<void>;
      trackViewContentWithUserData: (userData: any) => Promise<void>;
      testCheckout: () => void;
      testViewContent: () => void;
      testPageView: () => void;
      testAllEvents: () => void;
      checkTrackingStatus: () => void;
      testFbclidCapture: () => void;
    };
  }
}