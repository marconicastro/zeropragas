/**
 * Enhanced Checkout Tracking com Delay Control
 * Garante que os eventos de checkout sejam enviados antes do redirecionamento
 */

interface CheckoutUserData {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  zip?: string;
  fbc?: string;
  fbp?: string;
  ga_client_id?: string;
  external_id?: string;
}

interface TrackingResult {
  success: boolean;
  eventsSent: string[];
  errors: string[];
  processingTime: number;
}

/**
 * Função aprimorada para rastreamento de checkout com controle de tempo
 */
export async function trackCheckoutWithDelay(userData: CheckoutUserData): Promise<TrackingResult> {
  const startTime = Date.now();
  const result: TrackingResult = {
    success: false,
    eventsSent: [],
    errors: [],
    processingTime: 0
  };

  try {
    console.log('🚀 Iniciando tracking de checkout com delay control...');
    
    // Verificar se o ambiente está pronto
    if (typeof window === 'undefined') {
      result.errors.push('Ambiente window não disponível');
      return result;
    }

    if (!window.dataLayer) {
      result.errors.push('dataLayer não disponível');
      return result;
    }

    // Gerar IDs únicos para os eventos
    const baseEventId = `checkout_${Date.now()}_enhanced`;
    
    // 1. Preparar dados do usuário
    const formattedUserData = {
      em: userData.email?.toLowerCase().trim() || '',
      ph: userData.phone?.replace(/\D/g, '') || '',
      fn: userData.firstName?.trim() || '',
      ln: userData.lastName?.trim() || '',
      ct: userData.city || undefined,
      st: userData.state || undefined,
      zp: userData.zip || undefined,
      country: 'BR',
      fbc: userData.fbc,
      fbp: userData.fbp,
      ga_client_id: userData.ga_client_id,
      external_id: userData.external_id
    };

    console.log('📊 Dados formatados:', formattedUserData);

    // 2. Enviar evento begin_checkout para GA4
    const beginCheckoutEvent = {
      event: 'begin_checkout',
      event_id: `${baseEventId}_ga4`,
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
    };

    window.dataLayer.push(beginCheckoutEvent);
    result.eventsSent.push('begin_checkout');
    console.log('✅ begin_checkout enviado para GTM');

    // 3. Enviar evento InitiateCheckout para Meta
    const initiateCheckoutEvent = {
      event: 'InitiateCheckout',
      event_id: `${baseEventId}_meta`,
      content_name: 'E-book Sistema de Controle de Trips',
      content_category: 'E-book',
      content_ids: ['ebook-controle-trips'],
      content_type: 'product',
      value: 39.90,
      currency: 'BRL',
      user_data: formattedUserData,
      timestamp: new Date().toISOString()
    };

    window.dataLayer.push(initiateCheckoutEvent);
    result.eventsSent.push('InitiateCheckout');
    console.log('✅ InitiateCheckout enviado para GTM');

    // 4. Enviar também via API server-side
    try {
      const apiPayload = {
        event_name: 'begin_checkout',
        event_id: `${baseEventId}_server`,
        user_data: formattedUserData,
        custom_data: {
          currency: 'BRL',
          value: 39.9,
          content_name: 'E-book Sistema de Controle de Trips',
          content_category: 'E-book',
          content_ids: ['6080425'],
          items: []
        }
      };

      const apiResponse = await fetch('/api/gtm-server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload)
      });

      if (apiResponse.ok) {
        result.eventsSent.push('server_side_begin_checkout');
        console.log('✅ Evento server-side enviado com sucesso');
      } else {
        const error = await apiResponse.json();
        result.errors.push(`Erro API: ${error.error}`);
      }
    } catch (apiError) {
      result.errors.push(`Erro API: ${apiError.message}`);
    }

    // 5. Aguardar um pouco para garantir processamento
    console.log('⏳ Aguardando processamento dos eventos...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 6. Verificar se os eventos ainda estão no dataLayer (indicam que foram processados)
    const finalDataLayer = [...window.dataLayer];
    const beginCheckoutProcessed = !finalDataLayer.some(item => item.event_id === `${baseEventId}_ga4`);
    const initiateCheckoutProcessed = !finalDataLayer.some(item => item.event_id === `${baseEventId}_meta`);

    if (beginCheckoutProcessed && initiateCheckoutProcessed) {
      console.log('✅ Todos os eventos foram processados pelo GTM');
      result.success = true;
    } else {
      console.log('⚠️ Eventos podem ainda estar sendo processados');
      result.errors.push('Eventos podem ainda estar no dataLayer para processamento');
    }

    result.processingTime = Date.now() - startTime;
    console.log(`🏁 Tracking concluído em ${result.processingTime}ms`);

    return result;

  } catch (error) {
    result.errors.push(`Erro geral: ${error.message}`);
    result.processingTime = Date.now() - startTime;
    console.error('❌ Erro no tracking:', error);
    return result;
  }
}

/**
 * Função para redirecionamento com tracking garantido
 */
export async function redirectToCheckoutWithTracking(url: string, userData: CheckoutUserData): Promise<void> {
  try {
    console.log('🛒 Iniciando fluxo de checkout com tracking...');
    
    // 1. Executar tracking com delay
    const trackingResult = await trackCheckoutWithDelay(userData);
    
    if (!trackingResult.success) {
      console.warn('⚠️ Tracking não concluído com sucesso:', trackingResult.errors);
    }
    
    // 2. Aguardar um tempo mínimo antes de redirecionar
    const minWaitTime = 2000; // 2 segundos mínimo
    const elapsedTime = trackingResult.processingTime;
    const remainingWait = Math.max(0, minWaitTime - elapsedTime);
    
    if (remainingWait > 0) {
      console.log(`⏳ Aguardando ${remainingWait}ms adicionais antes de redirecionar...`);
      await new Promise(resolve => setTimeout(resolve, remainingWait));
    }
    
    // 3. Redirecionar
    console.log('🔄 Redirecionando para checkout...');
    window.location.href = url;
    
  } catch (error) {
    console.error('❌ Erro no fluxo de checkout:', error);
    // Redirecionar mesmo assim para não bloquear o usuário
    window.location.href = url;
  }
}

export default {
  trackCheckoutWithDelay,
  redirectToCheckoutWithTracking
};