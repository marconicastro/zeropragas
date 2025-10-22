/**
 * CAPIG GATEWAY - CONTROLE TOTAL 100%
 * Substitui completamente o envio browser-side por server-side
 * Mantém interface compatível com trackMetaEvent existente
 */

// Interface para eventos CAPIG
interface CapigEvent {
  eventName: string;
  eventTime: number;
  userData: {
    em?: string;          // Email hash
    ph?: string;          // Phone hash  
    fn?: string;          // First name hash
    ln?: string;          // Last name hash
    ct?: string;          // City hash
    st?: string;          // State hash
    zp?: string;          // Zip hash
    country?: string;     // Country hash
    external_id?: string; // Session ID
    fbc?: string;         // Facebook click ID
    fbp?: string;         // Facebook browser ID
    client_ip_address?: string;
    client_user_agent?: string;
  };
  customData: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_category?: string;
    content_type?: string;
    content_ids?: string[];
    lead_type?: string;
    predicted_ltv?: number;
    num_items?: number;
    checkout_step?: number;
    [key: string]: any;
  };
  actionSource: 'website' | 'app' | 'physical_store' | 'system_generated';
  eventSourceUrl: string;
  userAgent: string;
}

/**
 * Hash SHA256 para dados PII (conforme exigência CAPIG)
 */
async function hashData(data: string): Promise<string> {
  if (!data) return '';
  
  const normalized = data.toString().toLowerCase().trim().replace(/\s+/g, '');
  
  try {
    const encoder = new TextEncoder();
    const dataUint8Array = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Erro no hash:', error);
    return '';
  }
}

/**
 * Coleta TODOS os dados do usuário disponíveis
 */
async function collectCompleteUserData(formData?: any): Promise<CapigEvent['userData']> {
  // 1. Dados do formulário (se fornecido)
  const formDataHashed = formData ? {
    em: await hashData(formData.email || ''),
    ph: await hashData(formData.phone || ''),
    fn: await hashData(formData.fullName?.split(' ')[0] || ''),
    ln: await hashData(formData.fullName?.split(' ').slice(1).join(' ') || ''),
    ct: await hashData(formData.city || ''),
    st: await hashData(formData.state || ''),
    zp: await hashData(formData.cep?.replace(/\D/g, '') || ''),
    country: await hashData('br')
  } : {};

  // 2. Dados persistidos no localStorage
  const persistedData = getPersistedUserData();
  const persistedHashed = persistedData ? {
    em: await hashData(persistedData.email || ''),
    ph: await hashData(persistedData.phone || ''),
    fn: await hashData(persistedData.fullName?.split(' ')[0] || ''),
    ln: await hashData(persistedData.fullName?.split(' ').slice(1).join(' ') || ''),
    ct: await hashData(persistedData.city || ''),
    st: await hashData(persistedData.state || ''),
    zp: await hashData(persistedData.cep?.replace(/\D/g, '') || ''),
    country: await hashData('br')
  } : {};

  // 3. Dados dos cookies do Facebook
  const fbc = getCookie('_fbc') || undefined;
  const fbp = getCookie('_fbp') || undefined;

  // 4. Session ID
  const sessionId = getSessionId();

  // 5. Mescla tudo (prioridade: formulário > persistido > vazio)
  const completeUserData: CapigEvent['userData'] = {
    em: formDataHashed.em || persistedHashed.em || undefined,
    ph: formDataHashed.ph || persistedHashed.ph || undefined,
    fn: formDataHashed.fn || persistedHashed.fn || undefined,
    ln: formDataHashed.ln || persistedHashed.ln || undefined,
    ct: formDataHashed.ct || persistedHashed.ct || undefined,
    st: formDataHashed.st || persistedHashed.st || undefined,
    zp: formDataHashed.zp || persistedHashed.zp || undefined,
    country: formDataHashed.country || persistedHashed.country || undefined,
    external_id: sessionId,
    client_ip_address: null, // Será preenchido pelo backend se necessário
    client_user_agent: navigator.userAgent,
    ...(fbc && { fbc }),
    ...(fbp && { fbp })
  };

  // Remove valores vazios
  Object.keys(completeUserData).forEach(key => {
    if (!completeUserData[key]) {
      delete completeUserData[key];
    }
  });

  return completeUserData;
}

/**
 * Obtém dados persistidos
 */
function getPersistedUserData() {
  try {
    const data = localStorage.getItem('user_persistent_data');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/**
 * Obtém cookie
 */
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

/**
 * Obtém Session ID
 */
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('capig_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('capig_session_id', sessionId);
  }
  return sessionId;
}

/**
 * CONVERSOR: Parâmetros trackMetaEvent -> Evento CAPIG
 */
function convertToCapigEvent(eventName: string, parameters?: any): CapigEvent {
  const now = Math.floor(Date.now() / 1000);
  
  // Extrair dados do usuário dos parâmetros
  const userDataFromParams = parameters?.user_data || {};
  
  // Dados customizados
  const customData: any = {
    ...parameters,
    // Remover campos que não pertencem ao custom_data
    user_data: undefined,
    event_source_url: undefined,
    client_user_agent: undefined,
    event_time: undefined,
    session_id: undefined,
    has_persisted_data: undefined
  };

  // Valores padrão para eventos específicos
  switch (eventName) {
    case 'ViewContent':
      customData.value = customData.value || 39.90;
      customData.currency = customData.currency || 'BRL';
      customData.content_name = customData.content_name || 'Sistema 4 Fases - Ebook Trips';
      customData.content_category = customData.content_category || 'digital_product';
      customData.content_type = customData.content_type || 'product';
      customData.content_ids = customData.content_ids || ['I101398692S'];
      customData.predicted_ltv = customData.predicted_ltv || 39.90 * 3.5;
      break;
      
    case 'Lead':
      customData.value = customData.value || 15.00;
      customData.currency = customData.currency || 'BRL';
      customData.lead_type = customData.lead_type || 'contact_request';
      customData.predicted_ltv = customData.predicted_ltv || 180.00;
      break;
      
    case 'InitiateCheckout':
      customData.value = customData.value || 39.90;
      customData.currency = customData.currency || 'BRL';
      customData.content_name = customData.content_name || 'Sistema 4 Fases - Ebook Trips';
      customData.content_category = customData.content_category || 'digital_product';
      customData.content_type = customData.content_type || 'product';
      customData.content_ids = customData.content_ids || ['I101398692S'];
      customData.num_items = customData.num_items || 1;
      customData.checkout_step = customData.checkout_step || 1;
      customData.predicted_ltv = customData.predicted_ltv || 39.90 * 4.0;
      break;
      
    case 'CTAClick':
      customData.value = customData.value || 39.90;
      customData.currency = customData.currency || 'BRL';
      customData.content_type = customData.content_type || 'product';
      customData.predicted_ltv = customData.predicted_ltv || 39.90 * 2.5;
      break;
  }

  return {
    eventName,
    eventTime: now,
    userData: userDataFromParams,
    customData,
    actionSource: 'website',
    eventSourceUrl: window.location.href,
    userAgent: navigator.userAgent
  };
}

/**
 * FUNÇÃO PRINCIPAL - ENVIO 100% CAPIG
 */
export async function sendCapigEvent(eventName: string, parameters?: any) {
  try {
    console.log('🚀 CAPIG: Processando evento:', eventName);
    
    // 1. Converter parâmetros para formato CAPIG
    const baseEvent = convertToCapigEvent(eventName, parameters);
    
    // 2. Enriquecer com dados completos do usuário
    const completeUserData = await collectCompleteUserData();
    
    // 3. Mesclar dados (dados completos > dados dos parâmetros)
    const finalEvent: CapigEvent = {
      ...baseEvent,
      userData: {
        ...completeUserData,
        ...baseEvent.userData // Dados dos parâmetros têm prioridade
      }
    };

    // 4. Preparar payload CAPIG
    const capigPayload = {
      pixel_id: '642933108377475',
      data: [{
        event_name: finalEvent.eventName,
        event_time: finalEvent.eventTime,
        user_data: finalEvent.userData,
        custom_data: finalEvent.customData,
        action_source: finalEvent.actionSource,
        event_source_url: finalEvent.eventSourceUrl,
        user_agent: finalEvent.userAgent,
        ...(finalEvent.userData.fbc && { fbc: finalEvent.userData.fbc }),
        ...(finalEvent.userData.fbp && { fbp: finalEvent.userData.fbp })
      }]
    };

    // 5. Enviar para CAPIG
    const response = await fetch('https://capig.maracujazeropragas.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': navigator.userAgent
      },
      body: JSON.stringify(capigPayload)
    });

    // 6. Validar resposta
    if (!response.ok) {
      throw new Error(`CAPIG Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log('✅ CAPIG Event Sent Successfully:', {
      eventName: finalEvent.eventName,
      hasUserData: !!finalEvent.userData && Object.keys(finalEvent.userData).length > 0,
      userDataFields: Object.keys(finalEvent.userData || {}),
      customDataFields: Object.keys(finalEvent.customData),
      response: result
    });

    // 7. Salvar analytics local
    saveCapigAnalytics(finalEvent, result);

    return result;

  } catch (error) {
    console.error('❌ CAPIG Send Error:', error);
    
    // 8. Fallback para browser (apenas em emergência)
    console.warn('🔄 Fallback: Tentando browser pixel...');
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', eventName, parameters);
    }
    
    throw error;
  }
}

/**
 * Salva analytics CAPIG
 */
function saveCapigAnalytics(event: CapigEvent, response: any) {
  try {
    const analytics = JSON.parse(localStorage.getItem('capig_analytics') || '[]');
    
    analytics.push({
      timestamp: Date.now(),
      eventName: event.eventName,
      hasUserData: !!event.userData && Object.keys(event.userData).length > 0,
      userDataCount: Object.keys(event.userData || {}).length,
      customDataCount: Object.keys(event.customData).length,
      success: true,
      response
    });

    // Mantém últimos 50
    if (analytics.length > 50) {
      analytics.shift();
    }

    localStorage.setItem('capig_analytics', JSON.stringify(analytics));
  } catch (error) {
    console.warn('Erro ao salvar analytics CAPIG:', error);
  }
}

/**
 * Analytics CAPIG
 */
export function getCapigAnalytics() {
  try {
    return JSON.parse(localStorage.getItem('capig_analytics') || '[]');
  } catch {
    return [];
  }
}

/**
 * Teste completo CAPIG
 */
export async function testCapigComplete() {
  console.group('🧪 CAPIG COMPLETE TEST');
  
  try {
    console.log('1. Testando PageView...');
    await sendCapigEvent('PageView');
    
    console.log('2. Testando ViewContent...');
    await sendCapigEvent('ViewContent', { trigger_type: 'test' });
    
    console.log('3. Testando ScrollDepth...');
    await sendCapigEvent('ScrollDepth', { percent: 50 });
    
    console.log('4. Testando Lead...');
    await sendCapigEvent('Lead', {
      email: 'test@example.com',
      phone: '11999999999',
      fullName: 'Test User',
      city: 'São Paulo',
      state: 'SP'
    });
    
    console.log('5. Testando InitiateCheckout...');
    await sendCapigEvent('InitiateCheckout', {
      email: 'test@example.com',
      phone: '11999999999',
      fullName: 'Test User'
    });
    
    console.log('✅ TODOS os eventos CAPIG testados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste CAPIG:', error);
  }
  
  console.groupEnd();
}

// Export para uso global
if (typeof window !== 'undefined') {
  (window as any).sendCapigEvent = sendCapigEvent;
  (window as any).testCapigComplete = testCapigComplete;
  (window as any).getCapigAnalytics = getCapigAnalytics;
}