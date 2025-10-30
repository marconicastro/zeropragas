import { NextRequest, NextResponse } from 'next/server';
import { getPreparedPurchaseEvent, getFallbackUserData } from '@/lib/purchaseEventPreparation';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [RETRIEVE] Recuperando Purchase Event preparado do localStorage...');
    
    // Recuperar evento preparado mais recente
    const preparedEvent = getPreparedPurchaseEvent();
    
    // Recuperar dados fallback
    const fallbackData = getFallbackUserData();
    
    console.log('📊 [RETRIEVE] Dados recuperados:', {
      has_prepared_event: !!preparedEvent,
      prepared_event_id: preparedEvent?.id,
      has_fallback_data: !!fallbackData,
      fallback_timestamp: fallbackData?.timestamp
    });
    
    return NextResponse.json({
      success: true,
      preparedEvent: preparedEvent,
      fallbackData: fallbackData,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('❌ [RETRIEVE] Erro ao recuperar dados preparados:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      preparedEvent: null,
      fallbackData: null
    }, { status: 500 });
  }
}