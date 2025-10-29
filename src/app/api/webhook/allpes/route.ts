import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getEnhancedClientData } from '@/lib/enrichment';
import { sendMetaEvent } from '@/lib/meta-api';
import ZAI from 'z-ai-web-dev-sdk';

// Configuração CORS para aceitar requisições da Allpes
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(request: NextRequest) {
  console.log('🎯 Webhook Allpes recebido - Iniciando processamento');
  
  try {
    // 1. Obter headers da requisição
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'unknown';
    const allHeaders = Object.fromEntries(headersList.entries());
    
    console.log('📋 Headers recebidos:', allHeaders);
    console.log('🌐 User-Agent:', userAgent);

    // 2. Obter IP real do cliente
    const forwarded = headersList.get('x-forwarded-for');
    const realIP = forwarded ? forwarded.split(',')[0] : 
                   headersList.get('x-real-ip') || 
                   headersList.get('cf-connecting-ip') || 
                   '127.0.0.1';
    
    console.log('📍 IP real detectado:', realIP);

    // 3. Obter corpo da requisição (JSON ou form-data)
    let body;
    const contentType = headersList.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    } else {
      // Tentar detectar automaticamente
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        const params = new URLSearchParams(text);
        body = Object.fromEntries(params.entries());
      }
    }

    console.log('📦 Corpo da requisição recebido:', JSON.stringify(body, null, 2));

    // 4. Verificar se é um evento de compra
    const isPurchase = body.event_type === 'purchase' || 
                      body.type === 'purchase' || 
                      body.status === 'approved' ||
                      body.payment_status === 'completed';

    if (!isPurchase) {
      console.log('⚠️ Não é um evento de compra, ignorando');
      return NextResponse.json({
        success: true,
        message: 'Evento ignorado (não é compra)',
        received_at: new Date().toISOString()
      });
    }

    // 5. Extrair dados do cliente
    const customerData = {
      name: body.customer_name || body.name || body.buyer_name || '',
      email: body.customer_email || body.email || body.buyer_email || '',
      phone: body.customer_phone || body.phone || body.buyer_phone || '',
      document: body.customer_document || body.document || body.cpf || '',
      address: {
        street: body.address_street || body.street || '',
        number: body.address_number || body.number || '',
        complement: body.address_complement || body.complement || '',
        neighborhood: body.address_neighborhood || body.neighborhood || '',
        city: body.address_city || body.city || '',
        state: body.address_state || body.state || '',
        zipcode: body.address_zipcode || body.zipcode || body.postal_code || '',
        country: body.address_country || body.country || 'BR'
      }
    };

    console.log('👤 Dados do cliente extraídos:', customerData);

    // 6. Extrair dados do pedido
    const orderData = {
      order_id: body.order_id || body.id || body.transaction_id || body.code || '',
      transaction_id: body.transaction_id || body.order_id || body.id || '',
      amount: parseFloat(body.amount || body.value || body.total || '0'),
      currency: body.currency || 'BRL',
      payment_method: body.payment_method || body.payment_type || '',
      installments: parseInt(body.installments || '1'),
      status: body.status || body.payment_status || '',
      created_at: body.created_at || body.date || new Date().toISOString(),
      product_name: body.product_name || body.product || body.description || '',
      product_id: body.product_id || body.product_code || '',
      plan: body.plan || body.subscription_plan || '',
      subscription_id: body.subscription_id || '',
      affiliate_id: body.affiliate_id || '',
      utm_source: body.utm_source || '',
      utm_medium: body.utm_medium || '',
      utm_campaign: body.utm_campaign || '',
      utm_term: body.utm_term || '',
      utm_content: body.utm_content || ''
    };

    console.log('🛒 Dados do pedido extraídos:', orderData);

    // 7. Enriquecer dados do cliente
    console.log('🔄 Iniciando enriquecimento de dados...');
    const enrichedData = await getEnhancedClientData(realIP, userAgent);
    console.log('✅ Dados enriquecidos:', enrichedData);

    // 8. Obter informações adicionais do produto (se necessário)
    let productInfo = {};
    if (orderData.product_id && !orderData.product_name) {
      try {
        const zai = await ZAI.create();
        const productResult = await zai.functions.invoke("web_search", {
          query: `produto ID ${orderData.product_id} Allpes Sistema 4 Fases`,
          num: 5
        });
        
        if (productResult && productResult.length > 0) {
          productInfo = {
            product_name: productResult[0].name,
            product_description: productResult[0].snippet
          };
        }
      } catch (error) {
        console.log('⚠️ Erro ao buscar informações do produto:', error);
      }
    }

    // 9. Preparar evento para Meta
    const metaEvent = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: {
        client_ip_address: realIP,
        client_user_agent: userAgent,
        // Dados básicos do cliente
        em: [customerData.email],
        fn: [customerData.name],
        ph: [customerData.phone],
        // Dados enriquecidos
        ct: [enrichedData.city],
        st: [enrichedData.region],
        country: [enrichedData.country],
        zp: [enrichedData.postalCode],
        // Dados do endereço
        db: [customerData.address.city],
        cg: [customerData.address.state],
        // Device e browser
        device: [enrichedData.device],
        os: [enrichedData.os],
        browser: [enrichedData.browser],
        browser_version: [enrichedData.browserVersion],
        // ISP e organização
        isp: [enrichedData.isp],
        org: [enrichedData.org],
        // Tempo e fuso
        timezone: [enrichedData.timezone],
        timestamp: [new Date().toISOString()]
      },
      custom_data: {
        value: orderData.amount.toString(),
        currency: orderData.currency,
        transaction_id: orderData.transaction_id,
        order_id: orderData.order_id,
        payment_method: orderData.payment_method,
        installments: orderData.installments.toString(),
        product_name: orderData.product_name || productInfo.product_name || 'Sistema 4 Fases',
        product_id: orderData.product_id,
        plan: orderData.plan,
        subscription_id: orderData.subscription_id,
        affiliate_id: orderData.affiliate_id,
        utm_source: orderData.utm_source,
        utm_medium: orderData.utm_medium,
        utm_campaign: orderData.utm_campaign,
        utm_term: orderData.utm_term,
        utm_content: orderData.utm_content,
        // Dados adicionais
        customer_document: customerData.document,
        address_city: customerData.address.city,
        address_state: customerData.address.state,
        address_country: customerData.address.country,
        // Dados enriquecidos
        connection_type: enrichedData.connectionType,
        is_mobile: enrichedData.isMobile.toString(),
        is_tablet: enrichedData.isTablet.toString(),
        is_desktop: enrichedData.isDesktop.toString(),
        screen_resolution: enrichedData.screenResolution,
        language: enrichedData.language,
        platform: enrichedData.platform
      }
    };

    console.log('🚀 Enviando evento para Meta:', JSON.stringify(metaEvent, null, 2));

    // 10. Enviar para Meta
    const metaResult = await sendMetaEvent(metaEvent);
    
    console.log('✅ Evento enviado para Meta com sucesso:', metaResult);

    // 11. Retornar sucesso
    const response = {
      success: true,
      message: 'Webhook processado com sucesso',
      data: {
        order_id: orderData.order_id,
        transaction_id: orderData.transaction_id,
        amount: orderData.amount,
        currency: orderData.currency,
        customer_email: customerData.email,
        meta_event_id: metaResult.event_id || 'unknown',
        processed_at: new Date().toISOString()
      },
      enrichment: {
        ip: realIP,
        city: enrichedData.city,
        region: enrichedData.region,
        country: enrichedData.country,
        device: enrichedData.device,
        browser: enrichedData.browser
      }
    };

    console.log('🎉 Webhook processado com sucesso:', response);

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('❌ Erro ao processar webhook Allpes:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro interno ao processar webhook',
      message: error.message,
      timestamp: new Date().toISOString()
    }, {
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}