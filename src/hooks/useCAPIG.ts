// 🚀 CAPIG Integration Hook para React
// Hook personalizado para facilitar o uso do CAPIG Manager

import { useCallback, useEffect } from 'react';
import { capigManager } from '@/lib/capigManager';
import { getAllTrackingParams } from '@/lib/cookies';

interface UseCAPIGOptions {
  enableHealthCheck?: boolean;
  enableLogging?: boolean;
}

interface CAPIGUserData {
  em?: string;
  ph?: string;
  fn?: string;
  ln?: string;
  ct?: string;
  st?: string;
  zp?: string;
  country?: string;
  fbc?: string;
  fbp?: string;
  external_id?: string;
}

export const useCAPIG = (options: UseCAPIGOptions = {}) => {
  const { enableHealthCheck = true, enableLogging = true } = options;

  // Health check ao montar o componente
  useEffect(() => {
    if (enableHealthCheck) {
      capigManager.healthCheck().then(isHealthy => {
        if (enableLogging) {
          console.log(`🏥 CAPIG Health Check: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
        }
      });
    }
  }, [enableHealthCheck, enableLogging]);

  // Preparar dados do usuário com tracking parameters
  const prepareUserData = useCallback(async (additionalData: any = {}): Promise<CAPIGUserData> => {
    try {
      // Obter parâmetros de rastreamento existentes
      const trackingParams = await getAllTrackingParams();
      
      // Combinar com dados adicionais
      const userData: CAPIGUserData = {
        em: additionalData.em || additionalData.email || '',
        ph: additionalData.ph || additionalData.phone || '',
        fn: additionalData.fn || additionalData.firstName || additionalData.first_name || '',
        ln: additionalData.ln || additionalData.lastName || additionalData.last_name || '',
        ct: additionalData.ct || additionalData.city || trackingParams.city || '',
        st: additionalData.st || additionalData.state || trackingParams.state || '',
        zp: additionalData.zp || additionalData.zip || trackingParams.zip || '',
        country: additionalData.country || trackingParams.country || 'BR',
        fbc: trackingParams.fbc || '',
        fbp: trackingParams.fbp || '',
        external_id: additionalData.external_id || trackingParams.external_id || ''
      };

      // Log dos dados preparados
      if (enableLogging) {
        console.log('👤 Dados do usuário preparados para CAPIG:', {
          hasEmail: !!userData.em,
          hasPhone: !!userData.ph,
          hasName: !!(userData.fn && userData.ln),
          hasLocation: !!(userData.ct && userData.st),
          hasFBC: !!userData.fbc,
          hasFBP: !!userData.fbp
        });
      }

      return userData;
    } catch (error) {
      console.error('❌ Erro ao preparar dados do usuário:', error);
      return {};
    }
  }, [enableLogging]);

  // Enviar PageView
  const sendPageView = useCallback(async (additionalData: any = {}) => {
    try {
      const userData = await prepareUserData(additionalData);
      const result = await capigManager.sendPageView(userData);
      
      if (enableLogging) {
        console.log('📄 PageView enviado via CAPIG Hook:', result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar PageView via CAPIG Hook:', error);
      return { success: false, eventId: '', channels: [] };
    }
  }, [prepareUserData, enableLogging]);

  // Enviar ViewContent
  const sendViewContent = useCallback(async (additionalData: any = {}) => {
    try {
      const userData = await prepareUserData(additionalData);
      const result = await capigManager.sendViewContent(userData);
      
      if (enableLogging) {
        console.log('👁️ ViewContent enviado via CAPIG Hook:', result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar ViewContent via CAPIG Hook:', error);
      return { success: false, eventId: '', channels: [] };
    }
  }, [prepareUserData, enableLogging]);

  // Enviar InitiateCheckout
  const sendInitiateCheckout = useCallback(async (additionalData: any = {}) => {
    try {
      const userData = await prepareUserData(additionalData);
      const result = await capigManager.sendInitiateCheckout(userData);
      
      if (enableLogging) {
        console.log('🛒 InitiateCheckout enviado via CAPIG Hook:', result);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao enviar InitiateCheckout via CAPIG Hook:', error);
      return { success: false, eventId: '', channels: [] };
    }
  }, [prepareUserData, enableLogging]);

  // Enviar evento customizado
  const sendCustomEvent = useCallback(async (eventName: string, userData: any = {}, customData: any = {}) => {
    try {
      const preparedUserData = await prepareUserData(userData);
      const result = await capigManager.sendDualEvent(eventName, preparedUserData, customData);
      
      if (enableLogging) {
        console.log(`🎯 Evento customizado ${eventName} enviado via CAPIG Hook:`, result);
      }
      
      return result;
    } catch (error) {
      console.error(`❌ Erro ao enviar evento ${eventName} via CAPIG Hook:`, error);
      return { success: false, eventId: '', channels: [] };
    }
  }, [prepareUserData, enableLogging]);

  // Obter estatísticas
  const getStats = useCallback(() => {
    return capigManager.getStats();
  }, []);

  // Health check manual
  const checkHealth = useCallback(async () => {
    const isHealthy = await capigManager.healthCheck();
    
    if (enableLogging) {
      console.log(`🏥 Health Check manual: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}`);
    }
    
    return isHealthy;
  }, [enableLogging]);

  return {
    // Métodos de envio
    sendPageView,
    sendViewContent,
    sendInitiateCheckout,
    sendCustomEvent,
    
    // Utilitários
    getStats,
    checkHealth,
    prepareUserData,
    
    // Status
    isReady: true
  };
};

export default useCAPIG;