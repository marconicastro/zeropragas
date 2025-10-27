import { NextRequest, NextResponse } from 'next/server';
import { getBestAvailableLocation } from '@/lib/locationData';
import { getPersistedUserData, formatUserDataForMeta } from '@/lib/userDataPersistence';

// 🔗 CAPI Gateway Endpoint
const CAPI_GATEWAY_URL = 'https://capig.maracujazeropragas.com/';
const PIXEL_ID = '642933108377475';

/**
 * Função para hash SHA-256 conforme exigência do Facebook
 */
async function hashData(data: string | null): Promise<string | null> {
  if (!data) return null;
  
  const normalized = data.toString().toLowerCase().trim().replace(/\s+/g, '');
  
  try {
    const encoder = new TextEncoder();
    const dataUint8Array = encoder.encode(normalized);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  } catch (error) {
    console.error('Erro no hash SHA256:', error);
    return null;
  }
}

/**
 * Gera ID único de evento para deduplicação
 */
function generateEventId(eventName: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = Math.random().toString(36).substring(2, 8);
  return `${eventName}_${timestamp}_${random}`;
}

/**
 * Obtém dados completos do usuário para CAPI
 */
async function getCompleteCAPIUserData() {
  try {
    // 1. Obter dados persistidos
    const persistedUserData = getPersistedUserData();
    
    // 2. Obter localização real
    const locationData = await getBestAvailableLocation();
    
    // 3. Combinar dados
    const userData = {
      email: persistedUserData?.email || '',
      phone: persistedUserData?.phone || '',
      fullName: persistedUserData?.fullName || '',
      city: locationData.city,
      state: locationData.state,
      cep: locationData.zip,
      country: 'br',
      timestamp: Date.now(),
      sessionId: persistedUserData?.sessionId || `sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      consent: true
    };
    
    // 4. Formatar e hashear
    const formattedData = formatUserDataForMeta(userData);
    const hashedData = {
      em: await hashData(formattedData.em),
      ph: await hashData(formattedData.ph),
      fn: await hashData(formattedData.fn),
      ln: await hashData(formattedData.ln),
      ct: await hashData(formattedData.ct),
      st: await hashData(formattedData.st),
      zip: await hashData(formattedData.zip),
      country: await hashData(formattedData.country),
      external_id: formattedData.external_id
    };
    
    return {
      userData: hashedData,
      originalData: userData
    };
    
  } catch (error) {
    console.error('Erro ao obter dados CAPI:', error);
    return {
      userData: {},
      originalData: {}
    };
  }
}

/**
 * Envia evento diretamente para o CAPI Gateway
 */
async function sendEventToCAPI(eventType: string, eventName: string, params: any, userData: any) {
  try {
    const eventId = generateEventId(eventName);
    const eventTime = Math.floor(Date.now() / 1000);
    
    // Estrutura do evento para CAPI Gateway
    const capiEvent = {
      event_name: eventName,
      event_time: eventTime,
      event_id: eventId,
      event_source_url: params.event_source_url || 'https://maracujazeropragas.com/',
      action_source: 'website',
      user_data: userData,
      custom_data: {
        value: params.value || 39.9,
        currency: params.currency || 'BRL',
        content_ids: params.content_ids || ['339591'],
        content_type: params.content_type || 'product',
        content_name: params.content_name || 'Sistema 4 Fases - Ebook Trips',
        ...params
      },
      opt_out: false
    };

    // Payload para o CAPI Gateway
    const payload = {
      data: [capiEvent],
      test_event_code: process.env.NODE_ENV === 'development' ? 'TEST' : undefined,
      access_token: process.env.META_ACCESS_TOKEN || 'EAADZCZCJjK9NkB0O' // Token deve ser configurado
    };

    console.log('🚀 Enviando evento diretamente para CAPI Gateway:', {
      eventName,
      eventId,
      hasUserData: Object.keys(userData).length > 0,
      payloadSize: JSON.stringify(payload).length
    });

    // Enviar para CAPI Gateway
    const response = await fetch(CAPI_GATEWAY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; CAPI-ONLY-Mode/1.0)'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`CAPI Gateway error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ Evento enviado com sucesso para CAPI Gateway:', result);

    return {
      success: true,
      eventId,
      result
    };

  } catch (error) {
    console.error('❌ Erro ao enviar evento para CAPI Gateway:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventName, eventType = 'standard', params = {} } = body;

    if (!eventName) {
      return NextResponse.json(
        { error: 'eventName é obrigatório' },
        { status: 400 }
      );
    }

    // Obter dados completos do usuário
    const { userData } = await getCompleteCAPIUserData();

    // Enviar evento para CAPI Gateway
    const result = await sendEventToCAPI(eventType, eventName, params, userData);

    return NextResponse.json({
      success: true,
      eventName,
      mode: 'CAPI-ONLY',
      ...result
    });

  } catch (error) {
    console.error('❌ Erro na API de CAPI Events:', error);
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'CAPI Events API - Modo CAPI-ONLY',
    description: 'API para enviar eventos diretamente para CAPI Gateway quando browser pixel está desativado',
    endpoint: CAPI_GATEWAY_URL,
    pixelId: PIXEL_ID,
    mode: 'CAPI-ONLY'
  });
}