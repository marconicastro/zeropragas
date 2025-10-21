import { NextRequest, NextResponse } from 'next/server';
import GTMServerProcessor from '@/lib/gtm-server';
import { validateEvent, enrichEvent } from '@/lib/schema-validator';
import { GTM_CONFIG } from '@/lib/gtm-config';

// Schema validator para eventos GTM Server
interface GTMServerEvent {
  event: string;
  event_id: string;
  event_timestamp: number;
  user_data: {
    client_id?: string;
    session_id?: string;
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
    client_ip_address?: string;
    client_user_agent?: string;
  };
  custom_data: {
    currency?: string;
    value?: number;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    items?: Array<{
      item_id: string;
      item_name: string;
      quantity: number;
      price: number;
      item_category?: string;
      item_brand?: string;
      currency?: string;
    }>;
    page_title?: string;
    page_location?: string;
    page_path?: string;
  };
  gtm_metadata: {
    source: 'client' | 'server';
    version: string;
    processing_time?: number;
  };
}

// Validador de schema rigoroso
function validateEventSchema(event: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Campos obrigatórios
  if (!event.event || typeof event.event !== 'string') {
    errors.push('event é obrigatório e deve ser string');
  }
  if (!event.event_id || typeof event.event_id !== 'string') {
    errors.push('event_id é obrigatório e deve ser string');
  }
  if (!event.user_data || typeof event.user_data !== 'object') {
    errors.push('user_data é obrigatório e deve ser objeto');
  }
  if (!event.custom_data || typeof event.custom_data !== 'object') {
    errors.push('custom_data é obrigatório e deve ser objeto');
  }

  // Validação de eventos específicos
  const validEvents = ['page_view', 'view_content', 'initiate_checkout', 'purchase'];
  if (event.event && !validEvents.includes(event.event)) {
    errors.push(`event deve ser um dos: ${validEvents.join(', ')}`);
  }

  // Validação de dados customizados por evento
  if (event.event === 'view_content' || event.event === 'initiate_checkout') {
    if (!event.custom_data.currency || typeof event.custom_data.currency !== 'string') {
      errors.push('currency é obrigatório para view_content/initiate_checkout');
    }
    if (event.custom_data.value === undefined || typeof event.custom_data.value !== 'number') {
      errors.push('value é obrigatório e deve ser number para view_content/initiate_checkout');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Obter cookies da requisição
function getCookiesFromRequest(request: NextRequest): { fbc?: string; fbp?: string; _ga?: string } {
  const cookies: { fbc?: string; fbp?: string; _ga?: string } = {};
  
  // Tentar obter dos headers da requisição
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    const cookieArray = cookieHeader.split(';');
    for (const cookie of cookieArray) {
      const [name, value] = cookie.trim().split('=');
      if (name === '_fbc') cookies.fbc = value;
      if (name === '_fbp') cookies.fbp = value;
      if (name === '_ga') cookies._ga = value;
    }
  }
  
  console.log('🍪 Cookies extraídos da requisição:', cookies);
  return cookies;
}

// Transformação de dados para GTM Server
function transformDataForGTM(event: any, request?: NextRequest): GTMServerEvent {
  // Extrair cookies da requisição
  const requestCookies = request ? getCookiesFromRequest(request) : {};
  
  const transformedEvent: GTMServerEvent = {
    event: event.event_name || event.event,
    event_id: event.event_id,
    event_timestamp: Date.now(),
    user_data: {
      // Dados de identificação
      client_id: event.user_data?.ga_client_id,
      session_id: event.session_id || generateSessionId(),
      
      // Dados PII (já hasheados se vierem do client)
      em: event.user_data?.em,
      ph: event.user_data?.ph,
      fn: event.user_data?.fn,
      ln: event.user_data?.ln,
      ct: event.user_data?.ct,
      st: event.user_data?.st,
      zp: event.user_data?.zp,
      country: event.user_data?.country || 'BR',
      
      // Identificadores de atribuição - PRIORIDADE: cookies da requisição > dados do evento
      fbc: event.user_data?.fbc || requestCookies.fbc,
      fbp: event.user_data?.fbp || requestCookies.fbp,
      external_id: event.user_data?.external_id,
      
      // Dados técnicos
      client_ip_address: event.user_data?.client_ip_address || getClientIP(request),
      client_user_agent: event.user_data?.client_user_agent || request?.headers?.get('user-agent')
    },
    custom_data: {
      // Dados de e-commerce
      currency: event.custom_data?.currency || 'BRL',
      value: event.custom_data?.value || 0,
      content_name: event.custom_data?.content_name,
      content_category: event.custom_data?.content_category,
      
      // Arrays - garantir que sejam arrays válidos
      content_ids: Array.isArray(event.custom_data?.content_ids) 
        ? event.custom_data.content_ids 
        : event.custom_data?.content_ids 
          ? [event.custom_data.content_ids] 
          : [],
      
      items: Array.isArray(event.custom_data?.items)
        ? event.custom_data.items
        : event.custom_data?.items
          ? [event.custom_data.items]
          : [],
      
      // Dados de página
      page_title: event.custom_data?.page_title,
      page_location: event.custom_data?.page_location,
      page_path: event.custom_data?.page_path
    },
    gtm_metadata: {
      source: 'server',
      version: '2.0.0',
      processing_time: 0 // Será preenchido depois
    }
  };

  return transformedEvent;
}

// Gerar session ID único
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Obter IP do cliente
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.ip;
  
  return forwarded?.split(',')[0] || realIP || clientIP || 'unknown';
}

// Enviar evento para GTM Server
async function sendToGTMServer(event: GTMServerEvent): Promise<{ success: boolean; response?: any; error?: string }> {
  try {
    const startTime = Date.now();
    
    // Endpoint do Stape GTM Server
    const gtmServerEndpoint = 'https://data.maracujazeropragas.com';
    
    // Preparar payload para GTM Server
    const payload = {
      ...event,
      gtm_metadata: {
        ...event.gtm_metadata,
        processing_time: Date.now() - startTime
      }
    };

    console.log('📤 Enviando evento para GTM Server:', {
      event: event.event,
      event_id: event.event_id,
      has_user_data: !!event.user_data,
      has_custom_data: !!event.custom_data,
      endpoint: gtmServerEndpoint
    });

    const response = await fetch(`${gtmServerEndpoint}/collect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Maracuja-Zero-Pragas-GTM-Server/2.0.0'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      const result = await response.json();
      console.log('✅ Evento enviado com sucesso para GTM Server:', result);
      return { success: true, response: result };
    } else {
      const errorText = await response.text();
      console.error('❌ Erro ao enviar evento para GTM Server:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }

  } catch (error) {
    console.error('❌ Falha na requisição para GTM Server:', error);
    return { success: false, error: error.message };
  }
}

// Retry com backoff exponencial
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`⚠️ Tentativa ${attempt}/${maxRetries} falhou:`, error.message);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  try {
    console.log(`📥 [${requestId}] Recebido evento do GTM Web`);
    
    const body = await request.json();
    console.log(`📊 [${requestId}] Evento recebido:`, JSON.stringify(body, null, 2));
    
    // 1. Enriquecer evento primeiro (adicionar timestamp se não existir)
    const enrichedEvent = enrichEvent(body);
    
    // 2. Validar evento enriquecido
    const validation = validateEvent(enrichedEvent);
    if (!validation.valid) {
      console.error(`❌ [${requestId}] Evento inválido:`, validation.errors);
      return NextResponse.json({
        success: false,
        error: 'Evento inválido',
        details: validation.errors,
        emq_score: 0,
        requestId
      }, { status: 400 });
    }
    
    // 3. Processar com GTM Server Processor (passando a requisição para capturar cookies)
    const processor = new GTMServerProcessor(request);
    const result = await processor.processEvent(enrichedEvent);
    
    const processingTime = Date.now() - startTime;
    
    if (result.success) {
      console.log(`✅ [${requestId}] Evento processado com sucesso em ${processingTime}ms`);
      console.log(`📈 [${requestId}] EMQ Score: ${result.emq_score.toFixed(2)}`);
      
      return NextResponse.json({
        success: true,
        message: 'Evento processado com sucesso',
        eventId: enrichedEvent.event_id,
        emq_score: result.emq_score,
        ga4_sent: result.ga4_sent,
        meta_sent: result.meta_sent,
        processingTime,
        requestId,
        warnings: result.warnings
      });
    } else {
      console.error(`❌ [${requestId}] Falha no processamento:`, result.errors);
      
      return NextResponse.json({
        success: false,
        error: 'Falha no processamento do evento',
        details: result.errors,
        emq_score: result.emq_score,
        eventId: enrichedEvent.event_id,
        processingTime,
        requestId,
        warnings: result.warnings
      }, { status: 502 });
    }
    
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`❌ [${requestId}] Erro no processamento:`, error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno no servidor',
      details: error.message,
      processingTime,
      requestId
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'GTM Server API',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    config: {
      web_container_id: GTM_CONFIG.WEB_CONTAINER_ID,
      server_url: GTM_CONFIG.SERVER_URL,
      ga4_measurement_id: GTM_CONFIG.GA4.MEASUREMENT_ID,
      meta_pixel_id: GTM_CONFIG.META.PIXEL_ID
    }
  });
}