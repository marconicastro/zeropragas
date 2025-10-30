'use client';

import { useEffect } from 'react';
import { getPreparedPurchaseEvent, getFallbackUserData } from '@/lib/purchaseEventPreparation';

export default function PreparedDataSender() {
  useEffect(() => {
    // 🔄 Enviar dados preparados para o server-side quando a página carregar
    const sendPreparedDataToServer = async () => {
      try {
        console.log('📤 [PREPARED-SENDER] Enviando dados preparados para o server-side...');
        
        // Recuperar dados do localStorage
        const preparedEvent = getPreparedPurchaseEvent();
        const fallbackData = getFallbackUserData();
        
        if (preparedEvent || fallbackData) {
          console.log('📊 [PREPARED-SENDER] Dados encontrados:', {
            has_prepared_event: !!preparedEvent,
            prepared_event_id: preparedEvent?.id,
            has_fallback_data: !!fallbackData,
            fallback_timestamp: fallbackData?.timestamp
          });
          
          // Enviar para server-side
          const response = await fetch('/api/send-prepared-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              preparedEvent,
              fallbackData,
              source: 'client-side-localstorage'
            })
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log('✅ [PREPARED-SENDER] Dados enviados com sucesso:', result);
          } else {
            console.error('❌ [PREPARED-SENDER] Erro ao enviar dados:', response.status);
          }
        } else {
          console.log('⚠️ [PREPARED-SENDER] Nenhum dado preparado encontrado no localStorage');
        }
        
      } catch (error) {
        console.error('❌ [PREPARED-SENDER] Erro ao enviar dados preparados:', error);
      }
    };
    
    // Enviar dados imediatamente
    sendPreparedDataToServer();
    
    // Enviar dados periodicamente (a cada 30 segundos) para manter sincronizado
    const interval = setInterval(sendPreparedDataToServer, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Este componente não renderiza nada visualmente
  return null;
}