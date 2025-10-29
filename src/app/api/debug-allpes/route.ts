import { NextRequest, NextResponse } from 'next/server';

// Webhook de debug para capturar exatamente o que a Allpes envia
export async function POST(request: NextRequest) {
  console.log('🔍 DEBUG WEBHOOK - Iniciando captura de dados');
  
  try {
    // Capturar headers completos
    const headers = Object.fromEntries(request.headers.entries());
    console.log('📋 HEADERS COMPLETOS:', JSON.stringify(headers, null, 2));
    
    // Capturar body completo
    const body = await request.text();
    console.log('📦 BODY BRUTO:', body);
    
    // Tentar parsear JSON
    let jsonData;
    try {
      jsonData = JSON.parse(body);
      console.log('📊 BODY PARSEADO:', JSON.stringify(jsonData, null, 2));
      console.log('🔑 CHAVES DISPONÍVEIS:', Object.keys(jsonData));
      
      // Mostrar valores de campos importantes
      console.log('📋 VALORES ESPECÍFICOS:');
      console.log('  - customer_email:', jsonData.customer_email);
      console.log('  - email:', jsonData.email);
      console.log('  - buyer_email:', jsonData.buyer_email);
      console.log('  - amount:', jsonData.amount);
      console.log('  - value:', jsonData.value);
      console.log('  - total:', jsonData.total);
      console.log('  - price:', jsonData.price);
      console.log('  - status:', jsonData.status);
      
    } catch (parseError) {
      console.log('❌ ERRO AO PARSEAR JSON:', parseError);
      jsonData = { raw_body: body };
    }
    
    // Retornar sucesso com todos os dados capturados
    return NextResponse.json({
      status: 'debug_captured',
      timestamp: new Date().toISOString(),
      headers: headers,
      body_raw: body,
      body_parsed: jsonData,
      available_keys: jsonData ? Object.keys(jsonData) : [],
      important_fields: {
        customer_email: jsonData?.customer_email,
        email: jsonData?.email,
        buyer_email: jsonData?.buyer_email,
        amount: jsonData?.amount,
        value: jsonData?.value,
        total: jsonData?.total,
        price: jsonData?.price,
        status: jsonData?.status
      }
    });
    
  } catch (error) {
    console.error('❌ ERRO NO DEBUG WEBHOOK:', error);
    return NextResponse.json({
      status: 'debug_error',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'debug_webhook_active',
    message: 'Webhook de debug para capturar dados da Allpes',
    url: '/api/debug-allpes',
    usage: 'Faça um POST para este endpoint para ver exatamente o que a Allpes envia'
  });
}