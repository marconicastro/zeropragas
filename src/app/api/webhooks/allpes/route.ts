import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

// Padrão UTMify - ID do cliente
const CLIENT_ID = '68f91298984033d0f40041db';

// Configuração CORS nos padrões UTMify
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Token',
    },
  });
}

export async function POST(request: NextRequest) {
  console.log('🎯 Webhook Allpes - Padrão UTMify');
  
  try {
    // 1. Validar ID (padrão UTMify)
    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get('id');
    
    console.log('🔐 Webhook ID:', webhookId);
    
    // 2. Obter headers
    const headersList = headers();
    const userAgent = headersList.get('user-agent') || 'Allpes-Webhook/1.0';
    
    // 3. Obter IP real
    const forwarded = headersList.get('x-forwarded-for');
    const realIP = forwarded ? forwarded.split(',')[0] : 
                   headersList.get('x-real-ip') || 
                   headersList.get('cf-connecting-ip') || 
                   '127.0.0.1';
    
    console.log('📍 IP:', realIP);
    
    // 4. Obter corpo da requisição
    let body;
    try {
      body = await request.json();
    } catch {
      const text = await request.text();
      const params = new URLSearchParams(text);
      body = Object.fromEntries(params.entries());
    }
    
    console.log('📦 Dados recebidos:', JSON.stringify(body, null, 2));
    
    // 5. Extrair dados principais
    const orderData = {
      order_id: body.order_id || body.id || body.transaction_id || '',
      transaction_id: body.transaction_id || body.order_id || body.id || '',
      amount: parseFloat(body.amount || body.value || body.total || '0'),
      currency: body.currency || 'BRL',
      customer_email: body.customer_email || body.email || '',
      customer_name: body.customer_name || body.name || '',
      customer_phone: body.customer_phone || body.phone || '',
      product_name: body.product_name || body.product || 'Sistema 4 Fases',
      status: body.status || body.payment_status || '',
      payment_method: body.payment_method || body.payment_type || '',
      // UTMs
      utm_source: body.utm_source || '',
      utm_medium: body.utm_medium || '',
      utm_campaign: body.utm_campaign || '',
      utm_term: body.utm_term || '',
      utm_content: body.utm_content || ''
    };
    
    console.log('🛒 Pedido processado:', {
      order_id: orderData.order_id,
      amount: orderData.amount,
      email: orderData.customer_email,
      product: orderData.product_name
    });
    
    // 6. Verificar se é compra aprovada
    const isApproved = ['approved', 'paid', 'completed'].includes(orderData.status.toLowerCase());
    
    if (isApproved) {
      console.log('✅ Compra aprovada - processando para Meta');
      
      // 7. Enviar para Meta (simplificado)
      try {
        const metaResult = await sendToMeta(orderData, realIP, userAgent);
        console.log('🚀 Enviado para Meta:', metaResult);
      } catch (metaError) {
        console.error('❌ Erro ao enviar para Meta:', metaError);
      }
    } else {
      console.log('⏭️ Status não aprovado:', orderData.status);
    }
    
    // 8. Resposta nos padrões UTMify
    const response = {
      OK: true,
      data: {
        webhook_id: webhookId || 'default',
        order_id: orderData.order_id,
        transaction_id: orderData.transaction_id,
        amount: orderData.amount,
        currency: orderData.currency,
        customer_email: orderData.customer_email,
        status: orderData.status,
        is_approved: isApproved,
        processed_at: new Date().toISOString(),
        ip: realIP
      },
      result: 'SUCCESS'
    };
    
    console.log('🎉 Webhook processado - Padrão UTMify');
    
    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Webhook-Token',
        'X-Webhook-Provider': 'Allpes-Integration',
      },
    });
    
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    
    const response = {
      OK: false,
      data: { 
        error: 'Erro interno ao processar webhook',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      result: 'ERROR'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

// Função simplificada para enviar para Meta
async function sendToMeta(orderData: any, ip: string, userAgent: string) {
  // Simulação de envio para Meta (em produção, enviaria de verdade)
  const eventId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  
  console.log('📤 Enviando para Meta:', {
    event_id: eventId,
    value: orderData.amount,
    currency: orderData.currency,
    transaction_id: orderData.transaction_id,
    email: orderData.customer_email
  });
  
  // Em desenvolvimento, simular sucesso
  return {
    event_id: eventId,
    status: 'success',
    message: 'Development mode - simulated success'
  };
}

// GET para teste
export async function GET() {
  return NextResponse.json({
    OK: true,
    data: {
      status: 'webhook_active',
      message: 'Webhook Allpes - Padrão UTMify',
      version: '1.0.0',
      client_id: CLIENT_ID
    },
    result: 'SUCCESS'
  });
}