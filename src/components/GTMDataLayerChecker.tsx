'use client';

import { useEffect } from 'react';

export default function GTMDataLayerChecker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Função para verificar e logar o estado da dataLayer
    const checkDataLayer = () => {
      console.log('🔍 Verificando estado da dataLayer...');
      
      if (!window.dataLayer) {
        console.error('❌ dataLayer não encontrada!');
        return;
      }
      
      console.log('✅ dataLayer encontrada com', window.dataLayer.length, 'itens');
      
      // Verificar os últimos itens da dataLayer
      const lastItems = window.dataLayer.slice(-5);
      console.log('📊 Últimos 5 itens da dataLayer:', lastItems);
      
      // Verificar se há eventos de rastreamento
      const trackingEvents = window.dataLayer.filter(item => 
        item.event && ['page_view', 'view_content', 'initiate_checkout'].includes(item.event)
      );
      
      console.log('🎯 Eventos de rastreamento encontrados:', trackingEvents);
      
      // Verificar dados do usuário nos eventos
      trackingEvents.forEach((event, index) => {
        console.log(`📋 Evento ${index + 1} (${event.event}):`);
        console.log('   - Event ID:', event.event_id);
        console.log('   - User Data:', event.user_data);
        console.log('   - Custom Data:', event.custom_data);
        
        if (event.user_data) {
          const { em, ph, fn, ln, ct, st, zp, country, fbc, fbp } = event.user_data;
          console.log('   - Email:', em ? '✅' : '❌');
          console.log('   - Telefone:', ph ? '✅' : '❌');
          console.log('   - Nome:', fn && ln ? '✅' : '❌');
          console.log('   - Cidade:', ct ? '✅' : '❌');
          console.log('   - Estado:', st ? '✅' : '❌');
          console.log('   - CEP:', zp ? '✅' : '❌');
          console.log('   - País:', country ? '✅' : '❌');
          console.log('   - FBC:', fbc ? '✅' : '❌');
          console.log('   - FBP:', fbp ? '✅' : '❌');
        }
        
        if (event.custom_data) {
          const { currency, value, content_name, content_category, contents } = event.custom_data;
          console.log('   - Moeda:', currency ? '✅' : '❌');
          console.log('   - Valor:', value ? '✅' : '❌');
          console.log('   - Nome do conteúdo:', content_name ? '✅' : '❌');
          console.log('   - Categoria:', content_category ? '✅' : '❌');
          console.log('   - Conteúdos:', contents ? '✅' : '❌');
        }
      });
    };

    // Verificar imediatamente
    checkDataLayer();
    
    // Verificar a cada 10 segundos para capturar eventos dinâmicos
    const interval = setInterval(checkDataLayer, 10000);
    
    // Limpar intervalo ao desmontar
    return () => clearInterval(interval);
  }, []);

  return null; // Componente não renderiza nada
}