/**
 * API de Conversions API do Meta
 * Envia eventos server-side para melhor precisão e deduplicação
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

interface ConversionsAPIEvent {
  event_name: string;
  event_time: number;
  action_source: string;
  event_source_url: string;
  user_data: {
    em?: string[];
    ph?: string[];
    fn?: string[];
    ln?: string[];
    ct?: string[];
    st?: string[];
    country?: string[];
    zip?: string[];
    ge?: string[];
    dob?: string[];
    fbc?: string;
    fbp?: string;
    client_ip_address?: string;
    client_user_agent?: string;
  };
  custom_data: {
    value?: string;
    currency?: string;
    content_name?: string;
    content_ids?: string[];
    content_type?: string;
    content_category?: string;
    page_language?: string;
    device_type?: string;
    browser?: string;
    operating_system?: string;
    [key: string]: any;
  };
  data_processing_options?: number[];
  data_processing_options_country?: number;
  data_processing_options_state?: number;
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    
    // Obter IP real do cliente
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    '127.0.0.1';
    
    const userAgent = request.headers.get('user-agent') || '';

    // Hash dos dados do usuário (SHA-256)
    const hashData = (data: string): string => {
      return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
    };

    // Preparar dados do usuário para Conversions API
    const userData: any = {};

    // Email e telefone (já vem hash do frontend, mas vamos garantir)
    if (eventData.user_data?.em) {
      userData.em = Array.isArray(eventData.user_data.em) 
        ? eventData.user_data.em 
        : [hashData(eventData.user_data.em)];
    }

    if (eventData.user_data?.ph) {
      userData.ph = Array.isArray(eventData.user_data.ph)
        ? eventData.user_data.ph
        : [hashData(eventData.user_data.ph)];
    }

    // Nome
    if (eventData.user_data?.fn) {
      userData.fn = [hashData(eventData.user_data.fn)];
    }

    if (eventData.user_data?.ln) {
      userData.ln = [hashData(eventData.user_data.ln)];
    }

    // Localização
    if (eventData.user_data?.ct) {
      userData.ct = [hashData(eventData.user_data.ct)];
    }

    if (eventData.user_data?.st) {
      userData.st = [hashData(eventData.user_data.st)];
    }

    if (eventData.user_data?.country) {
      userData.country = [hashData(eventData.user_data.country)];
    }

    if (eventData.user_data?.zip) {
      userData.zip = [hashData(eventData.user_data.zip)];
    }

    // Demográficos
    if (eventData.user_data?.ge) {
      userData.ge = [hashData(eventData.user_data.ge)];
    }

    if (eventData.user_data?.dob) {
      userData.dob = [hashData(eventData.user_data.dob)];
    }

    // Facebook IDs
    if (eventData.fbc) {
      userData.fbc = eventData.fbc;
    }

    if (eventData.fbp) {
      userData.fbp = eventData.fbp;
    }

    // IP e User Agent para matching
    userData.client_ip_address = clientIP;
    userData.client_user_agent = userAgent;

    // Preparar evento para Conversions API
    const conversionsEvent: ConversionsAPIEvent = {
      event_name: eventData.eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: eventData.action_source || 'website',
      event_source_url: eventData.event_source_url,
      user_data: userData,
      custom_data: {
        value: eventData.value?.toString(),
        currency: eventData.currency,
        content_name: eventData.content_name,
        content_ids: eventData.content_ids,
        content_type: eventData.content_type,
        content_category: eventData.custom_data?.content_category,
        page_language: eventData.custom_data?.page_language,
        device_type: eventData.custom_data?.device_type,
        browser: eventData.custom_data?.browser,
        operating_system: eventData.custom_data?.operating_system,
        ...eventData.custom_data
      },
      // Opções de processamento de dados (LGPD compliance)
      data_processing_options: [1, 2, 3], // 1=LDU, 2=CGU, 3=SCU
      data_processing_options_country: 2, // Brasil
      data_processing_options_state: 1000 // São Paulo (padrão)
    };

    // Enviar para Meta Conversions API
    const metaResponse = await sendToMetaConversionsAPI(conversionsEvent);

    // Log para debug
    console.log('🎯 Evento Meta Conversions API:', {
      eventName: eventData.eventName,
      status: metaResponse.success ? 'success' : 'error',
      eventId: metaResponse.eventId,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      eventId: metaResponse.eventId,
      message: 'Evento enviado com sucesso para Meta Conversions API'
    });

  } catch (error) {
    console.error('❌ Erro na API de Conversions:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar evento',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Envia evento para Meta Conversions API
 */
async function sendToMetaConversionsAPI(event: ConversionsAPIEvent) {
  try {
    // Em produção, você usaria o Access Token real da sua conta Meta
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'dummy_token_for_dev';
    const PIXEL_ID = process.env.META_PIXEL_ID || 'dummy_pixel_id';

    const API_URL = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events`;

    const payload = {
      data: [event],
      access_token: ACCESS_TOKEN,
      test_event_code: process.env.NODE_ENV === 'development' ? 'TEST' : undefined
    };

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.data && result.data[0]) {
      return {
        success: true,
        eventId: result.data[0].event_id
      };
    } else {
      console.error('Erro na resposta Meta:', result);
      return {
        success: false,
        error: result.error || 'Unknown Meta API error'
      };
    }

  } catch (error) {
    console.error('Erro ao enviar para Meta API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}