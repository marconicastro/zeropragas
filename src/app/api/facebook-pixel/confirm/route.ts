import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, eventName, status } = body;
    
    if (!eventId || !status) {
      return NextResponse.json({
        success: false,
        error: 'Event ID e status são obrigatórios'
      }, { status: 400 });
    }
    
    console.log(`📧 Confirmação recebida para evento ${eventId}:`, { eventName, status });
    
    // Retornar um script que será executado no cliente para marcar o evento como confirmado
    const clientScript = `
      (function() {
        try {
          const confirmedEvents = JSON.parse(localStorage.getItem('fb_server_confirmed_events') || '[]');
          if (!confirmedEvents.includes('${eventId}')) {
            confirmedEvents.push('${eventId}');
            // Manter apenas os últimos 50 eventos confirmados
            if (confirmedEvents.length > 50) {
              confirmedEvents.splice(0, confirmedEvents.length - 50);
            }
            localStorage.setItem('fb_server_confirmed_events', JSON.stringify(confirmedEvents));
            console.log('✅ Evento ${eventId} marcado como confirmado via API');
          }
        } catch (error) {
          console.error('❌ Erro ao marcar evento como confirmado:', error);
        }
      })();
    `;
    
    return NextResponse.json({
      success: true,
      message: 'Confirmação recebida com sucesso',
      eventId: eventId,
      status: status,
      clientScript: clientScript,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erro ao processar confirmação:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro interno no servidor',
      details: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}