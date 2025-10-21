'use client';

import { useEffect } from 'react';

export default function FacebookPixelDebugger() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    console.group('🔍 Facebook Pixel Debugger');
    
    // Verificar formato dos eventos
    const checkEventFormat = (eventName: string, eventData: any) => {
      console.log(`\n📊 Verificando formato do evento: ${eventName}`);
      
      // Verificar content_ids
      if (eventData.custom_data?.content_ids) {
        const contentIds = eventData.custom_data.content_ids;
        if (Array.isArray(contentIds)) {
          console.log('✅ content_ids: ARRAY CORRETO', contentIds);
        } else {
          console.error('❌ content_ids: FORMATO INCORRETO (deve ser array)', contentIds);
        }
      }
      
      // Verificar items
      if (eventData.custom_data?.items) {
        const items = eventData.custom_data.items;
        if (Array.isArray(items)) {
          console.log('✅ items: ARRAY CORRETO', items);
        } else {
          console.error('❌ items: FORMATO INCORRETO (deve ser array)', items);
        }
      }
      
      // Verificar contents
      if (eventData.custom_data?.contents) {
        const contents = eventData.custom_data.contents;
        if (Array.isArray(contents)) {
          console.log('✅ contents: ARRAY CORRETO', contents);
        } else {
          console.error('❌ contents: FORMATO INCORRETO (deve ser array)', contents);
        }
      }
      
      // Verificar user_data
      if (eventData.user_data) {
        console.log('✅ user_data: FORMATO CORRETO', Object.keys(eventData.user_data));
      }
    };

    // Interceptar dataLayer pushes
    const originalPush = window.dataLayer?.push;
    if (originalPush) {
      window.dataLayer.push = function(...args) {
        const event = args[0];
        if (event && (event.event === 'view_content' || event.event === 'initiate_checkout')) {
          checkEventFormat(event.event, event);
        }
        return originalPush.apply(this, args);
      };
    }

    // Verificar formato dos eventos de teste
    console.log('\n📋 Exemplo de formato CORRETO para InitiateCheckout:');
    console.log({
      event: 'initiate_checkout',
      event_id: 'example_id',
      custom_data: {
        currency: 'BRL',
        value: 39.90,
        content_name: 'E-book Sistema de Controle de Trips - Maracujá',
        content_category: 'E-book',
        content_ids: ['ebook-controle-trips'], // ✅ ARRAY
        num_items: '1',
        items: [{ // ✅ ARRAY
          item_id: 'ebook-controle-trips',
          item_name: 'E-book Sistema de Controle de Trips',
          quantity: 1,
          price: 39.90,
          item_category: 'E-book',
          item_brand: 'Maracujá Zero Pragas',
          currency: 'BRL'
        }]
      },
      user_data: {
        em: 'email@example.com',
        ph: '11999999999',
        fn: 'Nome',
        ln: 'Sobrenome',
        ct: 'São Paulo',
        st: 'SP',
        zp: '01310100',
        country: 'BR',
        fbc: 'fb.1.1234567890.abc123',
        fbp: 'fb.1.1234567890.1234567890'
      }
    });

    console.log('\n📋 Exemplo de formato INCORRETO (evitar):');
    console.log({
      event: 'initiate_checkout',
      custom_data: {
        content_ids: "[\"ebook-controle-trips\"]", // ❌ STRING JSON
        items: "[{\"item_id\":\"ebook-controle-trips\"}]" // ❌ STRING JSON
      }
    });

    console.groupEnd();

    return () => {
      // Restaurar função original
      if (originalPush && window.dataLayer) {
        window.dataLayer.push = originalPush;
      }
    };
  }, []);

  return null; // Componente não renderiza nada
}