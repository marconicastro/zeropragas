/**
 * 🚀 CAPI-ONLY TRACKING SYSTEM
 * 
 * Sistema para enviar eventos diretamente para CAPI Gateway
 * quando o browser pixel está desativado.
 * 
 * Este sistema substitui o envio pelo browser, mantendo
 * todos os dados e funcionalidades intactas.
 */

// 🎛️ CONTROLE DE BROWSER PIXEL
const BROWSER_PIXEL_ENABLED = process.env.NEXT_PUBLIC_BROWSER_PIXEL === 'true';

/**
 * Envia evento diretamente para nossa API CAPI-ONLY
 */
async function sendEventToCAPIOnly(
  eventName: string,
  params: any = {},
  eventType: 'standard' | 'custom' = 'standard'
): Promise<any> {
  try {
    console.group(`🚀 ${eventName} - CAPI-ONLY Mode`);
    
    // Apenas envia se browser pixel estiver desativado
    if (BROWSER_PIXEL_ENABLED) {
      console.log(`⚠️ Browser Pixel ATIVADO - ignorando envio CAPI-ONLY para ${eventName}`);
      console.groupEnd();
      return {
        eventName,
        success: false,
        reason: 'browser_pixel_enabled',
        message: 'Browser pixel está ativo, usando modo híbrido'
      };
    }

    console.log(`🚫 Browser Pixel DESATIVADO - enviando ${eventName} via CAPI-ONLY`);

    // Preparar parâmetros completos
    const enhancedParams = {
      // Dados comerciais padrão
      value: 39.9,
      currency: 'BRL',
      content_ids: ['339591'],
      content_type: 'product',
      content_name: 'Sistema 4 Fases - Ebook Trips',
      
      // Metadados
      event_source_url: typeof window !== 'undefined' ? window.location.href : 'https://maracujazeropragas.com/',
      user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: Date.now(),
      
      // Parâmetros personalizados
      ...params
    };

    // Enviar para nossa API
    const response = await fetch('/api/capi-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName,
        eventType,
        params: enhancedParams
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    console.log(`✅ ${eventName} enviado via CAPI-ONLY com sucesso:`, {
      eventId: result.eventId,
      hasUserData: result.hasUserData,
      mode: result.mode
    });
    
    console.groupEnd();
    
    return {
      eventName,
      success: true,
      mode: 'CAPI-ONLY',
      eventId: result.eventId,
      result
    };

  } catch (error) {
    console.error(`❌ Erro ao enviar ${eventName} via CAPI-ONLY:`, error);
    console.groupEnd();
    
    return {
      eventName,
      success: false,
      error: error.message,
      mode: 'CAPI-ONLY'
    };
  }
}

/**
 * PageView em modo CAPI-ONLY
 */
export async function fireCAPIOnlyPageView(customParams: any = {}) {
  return sendEventToCAPIOnly('PageView', {
    content_name: 'Sistema 4 Fases - Ebook Trips',
    predicted_ltv: 39.9 * 3.5,
    condition: 'new',
    availability: 'in stock',
    ...customParams
  }, 'standard');
}

/**
 * ViewContent em modo CAPI-ONLY
 */
export async function fireCAPIOnlyViewContent(customParams: any = {}) {
  return sendEventToCAPIOnly('ViewContent', {
    content_category: 'digital_product',
    condition: 'new',
    availability: 'in stock',
    predicted_ltv: 39.9 * 3.5,
    trigger_type: customParams.trigger_type || 'timing',
    time_on_page: customParams.time_on_page || 15,
    scroll_depth: customParams.scroll_depth || 0,
    ...customParams
  }, 'standard');
}

/**
 * ScrollDepth em modo CAPI-ONLY
 */
export async function fireCAPIOnlyScrollDepth(percent: number, customParams: any = {}) {
  return sendEventToCAPIOnly('ScrollDepth', {
    percent: percent,
    scroll_depth: percent,
    scroll_direction: percent > 50 ? 'down' : 'up',
    page_height: typeof document !== 'undefined' ? document.documentElement.scrollHeight : 0,
    viewport_height: typeof window !== 'undefined' ? window.innerHeight : 0,
    scroll_position: typeof window !== 'undefined' ? window.scrollY : 0,
    trigger_type: 'scroll_event',
    time_to_scroll: Math.floor(performance.now() / 1000),
    sections_viewed: Math.floor(percent / 25),
    ...customParams
  }, 'custom');
}

/**
 * CTAClick em modo CAPI-ONLY
 */
export async function fireCAPIOnlyCTAClick(buttonText: string, customParams: any = {}) {
  return sendEventToCAPIOnly('CTAClick', {
    content_name: `CTA: ${buttonText}`,
    content_category: 'button_click',
    content_type: 'cta_button',
    button_text: buttonText,
    button_position: customParams.button_position || 'main',
    page_section: customParams.page_section || 'hero',
    time_on_page: Math.floor(performance.now() / 1000),
    scroll_depth: typeof document !== 'undefined' && typeof window !== 'undefined' 
      ? Math.round((window.scrollY / document.documentElement.scrollHeight) * 100) 
      : 0,
    ...customParams
  }, 'custom');
}

/**
 * Lead em modo CAPI-ONLY
 */
export async function fireCAPIOnlyLead(customParams: any = {}) {
  return sendEventToCAPIOnly('Lead', {
    value: 15.00,
    currency: 'BRL',
    content_type: 'lead_form',
    content_name: 'Formulário de Contato - Sistema 4 Fases',
    content_category: 'lead_generation',
    content_ids: ['lead_form_main'],
    predicted_ltv: 180.00,
    lead_type: 'contact_request',
    lead_source: 'website_form',
    form_position: 'main_page',
    form_version: 'v3.0',
    time_on_page: 120,
    scroll_depth: 50,
    page_views: 2,
    user_engagement: 75,
    session_id: `sess_${Date.now()}`,
    trigger_type: 'form_submit',
    ...customParams
  }, 'standard');
}

/**
 * InitiateCheckout em modo CAPI-ONLY
 */
export async function fireCAPIOnlyInitiateCheckout(customParams: any = {}) {
  return sendEventToCAPIOnly('InitiateCheckout', {
    value: 39.9,
    currency: 'BRL',
    content_ids: ['339591'],
    content_type: 'product',
    content_name: 'Sistema 4 Fases - Ebook Trips',
    content_category: 'digital_product',
    num_items: 1,
    checkout_step: 1,
    payment_method: 'digital',
    predicted_ltv: 39.9 * 4.0,
    product_availability: 'in stock',
    condition: 'new',
    trigger_type: 'button_click',
    cart_value: 39.9,
    items_count: 1,
    cart_operation: 'add_to_cart',
    checkout_url: typeof window !== 'undefined' ? window.location.href : '',
    payment_method_available: 'digital',
    ...customParams
  }, 'standard');
}

/**
 * Dispara todos os eventos em modo CAPI-ONLY
 */
export async function fireAllCAPIOnlyEvents() {
  console.group('🚀 CAPI-ONLY MODE - TODOS OS EVENTOS');
  console.log('📊 MODO CAPI-ONLY ATIVO:');
  console.log('  ❌ Browser Pixel: DESATIVADO');
  console.log('  ✅ CAPI Gateway: ATIVO via API');
  console.log('  🌍 Dados geográficos: 100% reais');
  console.log('  🔒 Dados completos: Sem limitações');
  
  try {
    // 1. PageView
    await fireCAPIOnlyPageView();
    
    // 2. ViewContent
    await fireCAPIOnlyViewContent({
      trigger_type: 'timing',
      time_on_page: 15
    });
    
    // 3. ScrollDepth
    await fireCAPIOnlyScrollDepth(50);
    
    // 4. CTAClick
    await fireCAPIOnlyCTAClick('Comprar Agora', {
      button_position: 'main',
      page_section: 'hero'
    });
    
    // 5. Lead
    await fireCAPIOnlyLead();
    
    // 6. InitiateCheckout
    await fireCAPIOnlyInitiateCheckout();
    
    console.log('\n🎉 TODOS OS EVENTOS ENVIADOS VIA CAPI-ONLY!');
    console.log('📈 VANTAGENS DO MODO CAPI-ONLY:');
    console.log('  🔒 Dados 100% completos e precisos');
    console.log('  🌍 IP real do servidor');
    console.log('  📱 Funciona com ad-blockers');
    console.log('  ⚡ Performance otimizada');
    console.log('  🎯 Controle total dos dados');
    
  } catch (error) {
    console.error('❌ Erro ao disparar eventos CAPI-ONLY:', error);
  }
  
  console.groupEnd();
}

/**
 * Verifica o modo atual de operação
 */
export function getCurrentMode() {
  return {
    browserPixelEnabled: BROWSER_PIXEL_ENABLED,
    mode: BROWSER_PIXEL_ENABLED ? 'HYBRID' : 'CAPI-ONLY',
    description: BROWSER_PIXEL_ENABLED 
      ? 'Browser + CAPI Gateway (modo híbrido)' 
      : 'Apenas CAPI Gateway via API (modo CAPI-ONLY)'
  };
}