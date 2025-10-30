import { NextRequest, NextResponse } from 'next/server';
import { setServerPreparedData, getServerPreparedData, getCacheInfo } from '@/lib/serverPreparedDataCache';

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
    
    // Armazenar dados no cache server-side
    setServerPreparedData(preparedEvent, fallbackData, source || 'client_side');
    
    return NextResponse.json({
      success: true,
      message: 'Dados preparados armazenados no cache server-side',
      stored_at: Date.now(),
      cache_info: getCacheInfo()
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
    console.log('🔍 [SEND-PREPARED] Recuperando dados preparados do cache server-side...');
    
    const data = getServerPreparedData();
    const cacheInfo = getCacheInfo();
    
    return NextResponse.json({
      success: true,
      preparedEvent: data?.preparedEvent || null,
      fallbackData: data?.fallbackData || null,
      timestamp: data?.timestamp || null,
      cache_info: cacheInfo
    });
    
  } catch (error) {
    console.error('❌ [SEND-PREPARED] Erro ao recuperar dados:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}