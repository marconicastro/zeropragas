import { NextRequest, NextResponse } from 'next/server';

// Estatísticas globais do webhook (em memória)
let globalStats = {
  totalProcessed: 0,
  successCount: 0,
  errorCount: 0,
  purchaseApproved: 0,
  checkoutAbandonment: 0,
  purchaseRefused: 0,
  duplicatePrevented: 0,
  averageProcessingTime: 0,
  lastProcessed: null,
  uptime: Date.now(),
  version: '3.1-enterprise-unified-server',
  recentEvents: [] as any[]
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json';
    
    // Calcular métricas
    const successRate = globalStats.totalProcessed > 0 
      ? Math.round((globalStats.successCount / globalStats.totalProcessed) * 100) 
      : 0;
    
    const uptimeHours = Math.round((Date.now() - globalStats.uptime) / (1000 * 60 * 60));
    
    const stats = {
      ...globalStats,
      successRate,
      uptimeHours,
      health: successRate >= 95 ? 'excellent' : successRate >= 85 ? 'good' : 'warning',
      timestamp: new Date().toISOString()
    };
    
    if (format === 'html') {
      // Retornar dashboard HTML
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Webhook Cakto Stats</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px; }
            .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
            .stat-card { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .stat-value { font-size: 2em; font-weight: bold; color: #333; }
            .stat-label { color: #666; margin-top: 5px; }
            .health-excellent { color: #10b981; }
            .health-good { color: #f59e0b; }
            .health-warning { color: #ef4444; }
            .test-mode { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 15px; border-radius: 10px; margin-bottom: 20px; text-align: center; font-weight: bold; box-shadow: 0 4px 6px rgba(251, 191, 36, 0.3); }
            .events-list { background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .event-item { padding: 10px; border-bottom: 1px solid #eee; }
            .event-success { color: #10b981; }
            .event-error { color: #ef4444; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="test-mode">
              🧪 MODO DE TESTE ATIVADO - Código: TEST10150 - Todos os eventos estão sendo enviados como teste para validação
            </div>
            
            <div class="header">
              <h1>🚀 Webhook Cakto Dashboard</h1>
              <p>Version: ${stats.version} | Health: <span class="health-${stats.health}">${stats.health.toUpperCase()}</span></p>
              <p>Uptime: ${stats.uptimeHours}h | Last Updated: ${stats.timestamp}</p>
            </div>
            
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-value">${stats.totalProcessed}</div>
                <div class="stat-label">Total Processed</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.successRate}%</div>
                <div class="stat-label">Success Rate</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.purchaseApproved}</div>
                <div class="stat-label">Purchases Approved</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.duplicatePrevented}</div>
                <div class="stat-label">Duplicates Prevented</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.averageProcessingTime}ms</div>
                <div class="stat-label">Avg Processing Time</div>
              </div>
              <div class="stat-card">
                <div class="stat-value">${stats.checkoutAbandonment}</div>
                <div class="stat-label">Checkout Abandonment</div>
              </div>
            </div>
            
            <div class="events-list">
              <h3>Recent Events</h3>
              ${stats.recentEvents.slice(0, 10).map(event => `
                <div class="event-item">
                  <span class="event-${event.success ? 'success' : 'error'}">${event.success ? '✅' : '❌'}</span>
                  <strong>${event.eventType}</strong> - ${event.transactionId}
                  <br><small>${event.timestamp} | ${event.processingTime}ms | ${event.dataSource}</small>
                </div>
              `).join('')}
            </div>
          </div>
        </body>
        </html>
      `;
      
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    return NextResponse.json(stats);
    
  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao obter estatísticas', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Atualizar estatísticas
    if (data.type === 'event_processed') {
      globalStats.totalProcessed++;
      
      if (data.success) {
        globalStats.successCount++;
        if (data.eventType === 'purchase_approved') {
          globalStats.purchaseApproved++;
        } else if (data.eventType === 'checkout_abandonment') {
          globalStats.checkoutAbandonment++;
        }
      } else {
        globalStats.errorCount++;
      }
      
      if (data.duplicate) {
        globalStats.duplicatePrevented++;
      }
      
      // Atualizar tempo médio de processamento
      if (data.processingTime) {
        globalStats.averageProcessingTime = Math.round(
          (globalStats.averageProcessingTime + data.processingTime) / 2
        );
      }
      
      // Adicionar evento recente
      globalStats.recentEvents.unshift({
        timestamp: new Date().toISOString(),
        eventType: data.eventType,
        transactionId: data.transactionId,
        success: data.success,
        processingTime: data.processingTime,
        dataSource: data.dataSource
      });
      
      // Manter apenas últimos 50 eventos
      if (globalStats.recentEvents.length > 50) {
        globalStats.recentEvents = globalStats.recentEvents.slice(0, 50);
      }
      
      globalStats.lastProcessed = new Date().toISOString();
    }
    
    return NextResponse.json({ success: true, stats: globalStats });
    
  } catch (error) {
    console.error('❌ Erro ao atualizar estatísticas:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar estatísticas', details: error.message },
      { status: 500 }
    );
  }
}