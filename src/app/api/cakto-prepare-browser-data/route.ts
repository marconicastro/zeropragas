import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Endpoint para preparar dados do navegador para a Cakto
// Armazena FBP/FBC para serem usados no webhook de purchase

export async function POST(request: NextRequest) {
  try {
    const browserData = await request.json();
    
    console.log('📩 Dados do navegador recebidos:', {
      has_fbp: !!browserData.fbp,
      has_fbc: !!browserData.fbc,
      fbp_value: browserData.fbp || 'not_provided',
      fbc_value: browserData.fbc || 'not_provided',
      user_agent: browserData.userAgent,
      url: browserData.url,
      timestamp: new Date().toISOString()
    });

    // Armazenar no banco de dados para uso futuro
    try {
      // Criar registro temporário dos dados do navegador
      const browserRecord = await db.browserData.create({
        data: {
          fbp: browserData.fbp,
          fbc: browserData.fbc,
          userAgent: browserData.userAgent,
          url: browserData.url,
          referrer: browserData.referrer,
          timestamp: new Date(),
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
        }
      });

      console.log('✅ Dados do navegador armazenados:', {
        id: browserRecord.id,
        sessionId: browserRecord.sessionId,
        has_fbp: !!browserRecord.fbp,
        has_fbc: !!browserRecord.fbc
      });

      return NextResponse.json({
        success: true,
        message: 'Dados do navegador armazenados com sucesso',
        sessionId: browserRecord.sessionId,
        stored_at: browserRecord.timestamp
      });

    } catch (dbError) {
      console.log('⚠️ Banco não disponível, usando cache temporário');
      
      // Fallback: armazenar em cache global
      global.browserDataCache = global.browserDataCache || new Map();
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      
      global.browserDataCache.set(sessionId, {
        ...browserData,
        timestamp: new Date(),
        sessionId
      });

      return NextResponse.json({
        success: true,
        message: 'Dados armazenados em cache temporário',
        sessionId,
        stored_at: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('❌ Erro ao processar dados do navegador:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao processar dados do navegador'
    }, { status: 500 });
  }
}

// Endpoint GET para recuperar dados armazenados
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID não fornecido'
      }, { status: 400 });
    }

    // Tentar buscar no banco primeiro
    try {
      const browserRecord = await db.browserData.findUnique({
        where: { sessionId }
      });

      if (browserRecord) {
        return NextResponse.json({
          success: true,
          data: {
            fbp: browserRecord.fbp,
            fbc: browserRecord.fbc,
            userAgent: browserRecord.userAgent,
            url: browserRecord.url,
            timestamp: browserRecord.timestamp
          }
        });
      }
    } catch (dbError) {
      console.log('⚠️ Banco não disponível, buscando no cache');
    }

    // Fallback: buscar no cache global
    if (global.browserDataCache && global.browserDataCache.has(sessionId)) {
      const cachedData = global.browserDataCache.get(sessionId);
      
      return NextResponse.json({
        success: true,
        data: cachedData
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Dados não encontrados para esta sessão'
    }, { status: 404 });

  } catch (error) {
    console.error('❌ Erro ao recuperar dados do navegador:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Erro ao recuperar dados'
    }, { status: 500 });
  }
}