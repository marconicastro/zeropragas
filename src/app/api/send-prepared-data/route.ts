import { NextRequest, NextResponse } from 'next/server';

// 📦 Armazenamento server-side para dados preparados
let serverPreparedData: any = null;
let serverFallbackData: any = null;

export async function POST(request: NextRequest) {
  try {
    const { preparedEvent, fallbackData, source } = await request.json();
    
    console.log('📤 [SEND-PREPARED] Recebendo dados preparados do client-side:', {
      source,
      has_prepared_event: !!preparedEvent,
      prepared_event_id: preparedEvent?.id,
      has_fallback_data: !!fallbackData,
      timestamp: Date.now()
    });
    
    // Armazenar dados no server-side
    serverPreparedData = preparedEvent;
    serverFallbackData = fallbackData;
    
    return NextResponse.json({
      success: true,
      message: 'Dados preparados armazenados no server-side',
      stored_at: Date.now()
    });
    
  } catch (error) {
    console.error('❌ [SEND-PREPARED] Erro ao armazenar dados preparados:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('🔍 [SEND-PREPARED] Recuperando dados preparados do server-side...');
    
    return NextResponse.json({
      success: true,
      preparedEvent: serverPreparedData,
      fallbackData: serverFallbackData,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('❌ [SEND-PREPARED] Erro ao recuperar dados:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}