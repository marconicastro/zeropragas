import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testType } = body;

    // Simular diferentes tipos de teste GTM
    const testResults = {
      'web-gtm-connection': {
        status: 'warning',
        message: 'Web GTM está carregado mas eventos não estão chegando ao server',
        details: {
          containerId: 'GTM-WPDKD23S',
          domain: 'maracujazeropragas.com',
          dataLayerEvents: 4,
          serverReception: 0
        }
      },
      'server-gtm-status': {
        status: 'error',
        message: 'Server GTM não está processando eventos',
        details: {
          containerId: 'GTM-PVHVLNR9',
          receivedEvents: 4,
          processedEvents: 0,
          tagsFired: 0
        }
      },
      'facebook-capi': {
        status: 'success',
        message: 'Facebook CAPI recebendo eventos parcialmente',
        details: {
          eventsReceived: 3,
          eventsProcessed: 3,
          lastEvent: 'Incluir finalização da compra',
          timestamp: '2025-10-22 09:04:35'
        }
      },
      'full-diagnosis': {
        status: 'error',
        message: 'Problema crítico identificado na comunicação Web→Server',
        issues: [
          'Server GTM não está disparando tags',
          'Eventos Web estão sendo triggerados mas não processados',
          'Inconsistência na contagem de eventos'
        ],
        recommendations: [
          'Verificar configuração de triggers no server container',
          'Testar endpoint manualmente',
          'Revisar formatação dos dados enviados'
        ]
      }
    };

    const result = testResults[testType] || testResults['full-diagnosis'];

    // Simular tempo de processamento
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      testType,
      timestamp: new Date().toISOString(),
      ...result
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Falha ao executar teste',
      details: error.message
    }, { status: 500 });
  }
}