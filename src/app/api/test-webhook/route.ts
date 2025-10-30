import { NextRequest, NextResponse } from 'next/server';

// Endpoint para testar o webhook Cakto em modo teste
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType = 'purchase' } = body;
    
    console.log('🧪 TESTE WEBHOOK - TIPO:', testType);
    
    // Dados de teste para Purchase
    if (testType === 'purchase') {
      const testPurchaseData = {
        secret: '12f4848f-35e9-41a8-8da4-1032642e3e89', // Secret da Cakto para testes
        event: 'purchase_approved',
        data: {
          id: `test_${Date.now()}`,
          amount: 39.90,
          status: 'paid', // Status correto esperado pelo webhook
          paymentMethod: 'pix',
          product: {
            id: 'hacr962',
            name: 'Sistema 4 Fases - Ebook Trips',
            short_id: 'hacr962'
          },
          offer: {
            id: 'hacr962_605077',
            price: 39.90
          },
          customer: {
            email: 'teste@exemplo.com',
            name: 'João da Silva Teste',
            phone: '11987654321',
            address: {
              city: 'São Paulo',
              state: 'SP',
              zipcode: '01310'
            }
          }
        }
      };
      
      // Enviar para o webhook
      const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhook-cakto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPurchaseData)
      });
      
      const result = await webhookResponse.json();
      
      return NextResponse.json({
        success: true,
        message: 'Teste de Purchase enviado para o webhook',
        testData: testPurchaseData,
        webhookResponse: result
      });
    }
    
    // Dados de teste para Lead (Checkout Abandonment)
    if (testType === 'lead') {
      const testLeadData = {
        secret: '12f4848f-35e9-41a8-8da4-1032642e3e89', // Secret da Cakto para testes
        event: 'checkout_abandonment',
        data: {
          customerEmail: 'teste@exemplo.com',
          customerName: 'João da Silva Teste',
          offer: {
            price: 39.90
          },
          checkoutUrl: 'https://pay.cakto.com.br/hacr962_605077'
        }
      };
      
      // Enviar para o webhook
      const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/webhook-cakto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testLeadData)
      });
      
      const result = await webhookResponse.json();
      
      return NextResponse.json({
        success: true,
        message: 'Teste de Lead (Checkout Abandonment) enviado para o webhook',
        testData: testLeadData,
        webhookResponse: result
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Tipo de teste não suportado. Use: purchase ou lead'
    });
    
  } catch (error) {
    console.error('❌ Erro no teste do webhook:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// GET para mostrar instruções
export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de teste para webhook Cakto',
    instructions: {
      purchase: {
        method: 'POST',
        body: { testType: 'purchase' },
        description: 'Testa evento de Purchase (compra aprovada)'
      },
      lead: {
        method: 'POST',
        body: { testType: 'lead' },
        description: 'Testa evento de Lead (abandono de checkout)'
      }
    },
    webhook_mode: 'TESTE - CÓDIGO: TEST35751',
    webhook_url: '/api/webhook-cakto'
  });
}