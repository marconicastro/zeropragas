/**
 * API CAPIG Events - Endpoint Centralizado
 * 
 * Processa e envia eventos para Meta CAPI
 * ZERO RISCO - Não interfere no sistema atual
 */

import { NextRequest, NextResponse } from 'next/server';

// Configuração CAPIG
const CAPIG_CONFIG = {
  endpoint: 'https://capig.maracujazeropragas.com/',
  pixelId: '642933108377475',
  testEventCode: 'TEST74219' // Código de teste da Meta
};

/**
 * Envia evento diretamente para Meta CAPI
 */
async function sendToCAPIGateway(eventName: string, eventData: any): Promise<{
  success: boolean;
  response?: any;
  error?: string;
}> {
  try {
    console.log('🚀 Enviando para Meta CAPI:', {
      eventName,
      pixelId: CAPIG_CONFIG.pixelId,
      hasEventData: !!eventData,
      dataKeys: Object.keys(eventData).length
    });
    
    // Preparar evento para Meta CAPI
    const capiEvent = {
      data: [
        {
          event_name: eventName,
          event_time: eventData.event_time || Math.floor(Date.now() / 1000),
          action_source: eventData.action_source || 'server',
          event_source_url: eventData.event_source_url,
          user_data: eventData.user_data,
          custom_data: {
            ...eventData,
            // Remover campos que não pertencem ao custom_data
            event_time: undefined,
            action_source: undefined,
            event_source_url: undefined,
            user_data: undefined,
            event_id: undefined,
            processing_timestamp: undefined,
            api_version: undefined
          },
          event_id: eventData.event_id,
          ...(eventData.test_event_code && {
            test_event_code: eventData.test_event_code
          })
        }
      ],
      test_event_code: CAPIG_CONFIG.testEventCode
    };
    
    // Enviar diretamente para Meta CAPI via HTTP
    const response = await fetch(`https://graph.facebook.com/v18.0/${CAPIG_CONFIG.pixelId}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Aqui normalmente precisaríamos de um access token
        // 'Authorization': `Bearer ${ACCESS_TOKEN}`
      },
      body: JSON.stringify(capiEvent)
    });
    
    const responseData = await response.json();
    
    if (response.ok) {
      console.log('✅ Evento enviado para Meta CAPI:', responseData);
      return {
        success: true,
        response: responseData
      };
    } else {
      console.error('❌ Erro na resposta Meta CAPI:', responseData);
      return {
        success: false,
        error: responseData.error?.message || 'Erro desconhecido na Meta CAPI'
      };
    }
    
  } catch (error) {
    console.error('❌ Erro ao enviar para Meta CAPI:', error);
    
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * GET - Verificar status da API CAPIG
 */
export async function GET() {
  try {
    return NextResponse.json({
      status: 'active',
      message: 'CAPIG Events API está funcionando',
      config: {
        pixelId: CAPIG_CONFIG.pixelId,
        endpoint: CAPIG_CONFIG.endpoint
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Erro na API CAPIG',
      error: error.message
    }, { status: 500 });
  }
}

/**
 * POST - Processar e enviar eventos para CAPIG
 */
export async function POST(request: NextRequest) {
  try {
    console.group('📥 CAPIG Events API - POST');
    
    // 1. Parse do request
    const body = await request.json();
    const { eventName, eventData, eventId, source } = body;
    
    console.log('📋 Dados recebidos:', {
      eventName,
      eventId,
      source,
      hasEventData: !!eventData,
      dataKeys: eventData ? Object.keys(eventData).length : 0
    });
    
    // 2. Validação básica
    if (!eventName || !eventData) {
      throw new Error('eventName e eventData são obrigatórios');
    }
    
    // 3. Garantir que o evento tenha ID
    const finalEventData = {
      ...eventData,
      event_id: eventId || eventData.event_id || `capig_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      processing_timestamp: Math.floor(Date.now() / 1000),
      api_version: 'v1'
    };
    
    console.log('🔧 Evento final preparado:', {
      eventName,
      eventId: finalEventData.event_id,
      hasUserData: !!finalEventData.user_data,
      readyForCAPIG: true
    });
    
    // 4. Enviar para CAPI Gateway
    const capigResult = await sendToCAPIGateway(eventName, finalEventData);
    
    if (!capigResult.success) {
      throw new Error(`Falha no CAPI Gateway: ${capigResult.error}`);
    }
    
    // 5. Retornar sucesso
    const result = {
      success: true,
      message: 'Evento processado e enviado para CAPIG',
      eventName,
      eventId: finalEventData.event_id,
      capigResponse: capigResult.response,
      timestamp: new Date().toISOString()
    };
    
    console.log('✅ Sucesso na API CAPIG:', result);
    console.groupEnd();
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Erro na API CAPIG:', error);
    console.groupEnd();
    
    return NextResponse.json({
      success: false,
      message: 'Erro ao processar evento CAPIG',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}