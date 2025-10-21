/**
 * Sistema de Performance Monitoring e Métricas EMQ
 * 
 * Monitora qualidade dos dados, performance de envio e calcula
 * métricas de EMQ (Event Match Quality) para Meta Ads
 */

export interface PerformanceMetrics {
  // Métricas de tempo
  totalProcessingTime: number;
  networkLatency: number;
  serverProcessingTime: number;
  validationTime: number;
  
  // Métricas de qualidade
  dataQualityScore: number;
  piiCompletenessScore: number;
  attributionScore: number;
  
  // Métricas de EMQ
  emqScore: number;
  emqFactors: EMQFactors;
  
  // Métricas de sucesso
  successRate: number;
  errorRate: number;
  retryRate: number;
  
  // Métricas de volume
  eventsProcessed: number;
  eventsSuccessful: number;
  eventsFailed: number;
  eventsRetried: number;
}

export interface EMQFactors {
  hasEmail: boolean;
  hasPhone: boolean;
  hasName: boolean;
  hasLocation: boolean;
  hasFBC: boolean;
  hasFBP: boolean;
  hasGA: boolean;
  hasIP: boolean;
  hasUA: boolean;
  hashedDataQuality: number;
}

export interface EventPerformanceRecord {
  eventId: string;
  eventName: string;
  timestamp: number;
  channel: string;
  metrics: PerformanceMetrics;
  status: 'success' | 'failed' | 'retried';
  errorDetails?: string;
}

export interface AggregatedMetrics {
  period: string;
  totalEvents: number;
  averageEMQ: number;
  averageProcessingTime: number;
  successRate: number;
  topErrors: Array<{ error: string; count: number }>;
  channelPerformance: Array<{ channel: string; successRate: number; avgTime: number }>;
  emqDistribution: Array<{ range: string; count: number }>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private eventRecords: Map<string, EventPerformanceRecord> = new Map();
  private metricsHistory: PerformanceMetrics[] = [];
  private errorCounts: Map<string, number> = new Map();
  private channelMetrics: Map<string, { total: number; success: number; totalTime: number }> = new Map();
  
  private constructor() {
    // Limpar registros antigos periodicamente
    setInterval(() => this.cleanup(), 60000); // A cada minuto
  }
  
  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Inicia monitoramento de um evento
   */
  public startEventMonitoring(eventId: string, eventName: string, channel: string): string {
    const monitoringId = `${eventId}_${Date.now()}`;
    
    console.log(`📊 Iniciando monitoramento do evento: ${eventName} (${eventId}) via ${channel}`);
    
    return monitoringId;
  }

  /**
   * Registra performance de um evento
   */
  public recordEventPerformance(
    eventId: string,
    eventName: string,
    channel: string,
    status: 'success' | 'failed' | 'retried',
    metrics: Partial<PerformanceMetrics>,
    errorDetails?: string
  ): void {
    const record: EventPerformanceRecord = {
      eventId,
      eventName,
      timestamp: Date.now(),
      channel,
      metrics: this.calculateCompleteMetrics(metrics, eventName),
      status,
      errorDetails
    };

    this.eventRecords.set(eventId, record);
    this.updateAggregatedMetrics(record);
    
    console.log(`📈 Performance registrada para ${eventName}:`, {
      status,
      emqScore: record.metrics.emqScore,
      processingTime: record.metrics.totalProcessingTime,
      dataQuality: record.metrics.dataQualityScore
    });
  }

  /**
   * Calcula métricas completas de EMQ
   */
  public calculateEMQScore(userData: any): { score: number; factors: EMQFactors } {
    const factors: EMQFactors = {
      hasEmail: !!userData.em,
      hasPhone: !!userData.ph,
      hasName: !!(userData.fn && userData.ln),
      hasLocation: !!(userData.ct && userData.st && userData.zp),
      hasFBC: !!userData.fbc,
      hasFBP: !!userData.fbp,
      hasGA: !!userData.ga_client_id,
      hasIP: !!userData.client_ip_address,
      hasUA: !!userData.client_user_agent,
      hashedDataQuality: this.calculateHashedDataQuality(userData)
    };

    // Calcular score EMQ baseado nos fatores
    let score = 0;
    
    // Fatores primários (peso maior)
    if (factors.hasEmail) score += 2.5;
    if (factors.hasPhone) score += 2.0;
    if (factors.hasName) score += 1.5;
    if (factors.hasLocation) score += 1.5;
    
    // Fatores de atribuição
    if (factors.hasFBC) score += 1.0;
    if (factors.hasFBP) score += 0.8;
    if (factors.hasGA) score += 0.5;
    
    // Fatores técnicos
    if (factors.hasIP) score += 0.3;
    if (factors.hasUA) score += 0.2;
    
    // Bônus por qualidade de hash
    score += factors.hashedDataQuality * 0.2;
    
    // Normalizar para escala 0-10
    score = Math.min(score, 10);
    
    return { score, factors };
  }

  /**
   * Calcula qualidade dos dados hasheados
   */
  private calculateHashedDataQuality(userData: any): number {
    let quality = 0;
    let totalHashed = 0;
    
    const hashedFields = ['em', 'ph', 'fn', 'ln', 'ct', 'st', 'zp'];
    
    for (const field of hashedFields) {
      if (userData[field]) {
        totalHashed++;
        // Verificar se parece com SHA-256 (64 caracteres hexadecimais)
        if (typeof userData[field] === 'string' && userData[field].length === 64) {
          quality++;
        }
      }
    }
    
    return totalHashed > 0 ? quality / totalHashed : 0;
  }

  /**
   * Calcula score de qualidade dos dados
   */
  private calculateDataQualityScore(userData: any, customData: any): number {
    let score = 0;
    let maxScore = 0;
    
    // PII (40% do score)
    if (userData.em) { score += 1; maxScore++; }
    if (userData.ph) { score += 1; maxScore++; }
    if (userData.fn) { score += 0.5; maxScore++; }
    if (userData.ln) { score += 0.5; maxScore++; }
    if (userData.ct) { score += 0.5; maxScore++; }
    if (userData.st) { score += 0.5; maxScore++; }
    if (userData.zp) { score += 0.5; maxScore++; }
    
    // Atribuição (30% do score)
    if (userData.fbc) { score += 1; maxScore++; }
    if (userData.fbp) { score += 1; maxScore++; }
    if (userData.ga_client_id) { score += 0.5; maxScore++; }
    
    // Dados customizados (20% do score)
    if (customData.currency) { score += 0.5; maxScore++; }
    if (customData.value !== undefined) { score += 0.5; maxScore++; }
    if (customData.content_name) { score += 0.5; maxScore++; }
    if (customData.content_ids && Array.isArray(customData.content_ids)) { score += 0.5; maxScore++; }
    
    // Dados técnicos (10% do score)
    if (userData.client_ip_address) { score += 0.25; maxScore++; }
    if (userData.client_user_agent) { score += 0.25; maxScore++; }
    
    return maxScore > 0 ? (score / maxScore) * 100 : 0;
  }

  /**
   * Calcula métricas completas
   */
  private calculateCompleteMetrics(partial: Partial<PerformanceMetrics>, eventName: string): PerformanceMetrics {
    const emqResult = partial.emqScore ? 
      { score: partial.emqScore, factors: partial.emqFactors || {} as EMQFactors } :
      { score: 0, factors: {} as EMQFactors };
    
    return {
      totalProcessingTime: partial.totalProcessingTime || 0,
      networkLatency: partial.networkLatency || 0,
      serverProcessingTime: partial.serverProcessingTime || 0,
      validationTime: partial.validationTime || 0,
      dataQualityScore: partial.dataQualityScore || 0,
      piiCompletenessScore: partial.piiCompletenessScore || 0,
      attributionScore: partial.attributionScore || 0,
      emqScore: emqResult.score,
      emqFactors: emqResult.factors,
      successRate: partial.successRate || 0,
      errorRate: partial.errorRate || 0,
      retryRate: partial.retryRate || 0,
      eventsProcessed: partial.eventsProcessed || 1,
      eventsSuccessful: partial.eventsSuccessful || (partial.successRate ? 1 : 0),
      eventsFailed: partial.eventsFailed || (partial.errorRate ? 1 : 0),
      eventsRetried: partial.eventsRetried || 0
    };
  }

  /**
   * Atualiza métricas agregadas
   */
  private updateAggregatedMetrics(record: EventPerformanceRecord): void {
    // Atualizar contagem de erros
    if (record.status === 'failed' && record.errorDetails) {
      const count = this.errorCounts.get(record.errorDetails) || 0;
      this.errorCounts.set(record.errorDetails, count + 1);
    }
    
    // Atualizar métricas por canal
    const channelMetrics = this.channelMetrics.get(record.channel) || { total: 0, success: 0, totalTime: 0 };
    channelMetrics.total++;
    if (record.status === 'success') {
      channelMetrics.success++;
    }
    channelMetrics.totalTime += record.metrics.totalProcessingTime;
    this.channelMetrics.set(record.channel, channelMetrics);
  }

  /**
   * Obtém métricas agregadas por período
   */
  public getAggregatedMetrics(period: 'hour' | 'day' | 'week' = 'hour'): AggregatedMetrics {
    const now = Date.now();
    let periodMs: number;
    
    switch (period) {
      case 'hour':
        periodMs = 60 * 60 * 1000;
        break;
      case 'day':
        periodMs = 24 * 60 * 60 * 1000;
        break;
      case 'week':
        periodMs = 7 * 24 * 60 * 60 * 1000;
        break;
    }
    
    const cutoffTime = now - periodMs;
    const recentRecords = Array.from(this.eventRecords.values())
      .filter(record => record.timestamp >= cutoffTime);
    
    if (recentRecords.length === 0) {
      return {
        period,
        totalEvents: 0,
        averageEMQ: 0,
        averageProcessingTime: 0,
        successRate: 0,
        topErrors: [],
        channelPerformance: [],
        emqDistribution: []
      };
    }
    
    // Calcular métricas agregadas
    const totalEvents = recentRecords.length;
    const successfulEvents = recentRecords.filter(r => r.status === 'success').length;
    const averageEMQ = recentRecords.reduce((sum, r) => sum + r.metrics.emqScore, 0) / totalEvents;
    const averageProcessingTime = recentRecords.reduce((sum, r) => sum + r.metrics.totalProcessingTime, 0) / totalEvents;
    const successRate = (successfulEvents / totalEvents) * 100;
    
    // Top erros
    const topErrors = Array.from(this.errorCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([error, count]) => ({ error, count }));
    
    // Performance por canal
    const channelPerformance = Array.from(this.channelMetrics.entries())
      .map(([channel, metrics]) => ({
        channel,
        successRate: (metrics.success / metrics.total) * 100,
        avgTime: metrics.totalTime / metrics.total
      }));
    
    // Distribuição EMQ
    const emqRanges = [
      { range: '0-2', min: 0, max: 2, count: 0 },
      { range: '2-4', min: 2, max: 4, count: 0 },
      { range: '4-6', min: 4, max: 6, count: 0 },
      { range: '6-8', min: 6, max: 8, count: 0 },
      { range: '8-10', min: 8, max: 10, count: 0 }
    ];
    
    recentRecords.forEach(record => {
      const emq = record.metrics.emqScore;
      const range = emqRanges.find(r => emq >= r.min && emq < r.max);
      if (range) range.count++;
    });
    
    return {
      period,
      totalEvents,
      averageEMQ,
      averageProcessingTime,
      successRate,
      topErrors,
      channelPerformance,
      emqDistribution: emqRanges.map(r => ({ range: r.range, count: r.count }))
    };
  }

  /**
   * Obtém métricas em tempo real
   */
  public getRealTimeMetrics(): any {
    const now = Date.now();
    const last5Minutes = now - 5 * 60 * 1000;
    const recentRecords = Array.from(this.eventRecords.values())
      .filter(record => record.timestamp >= last5Minutes);
    
    if (recentRecords.length === 0) {
      return {
        eventsLast5Minutes: 0,
        averageEMQ: 0,
        successRate: 0,
        averageProcessingTime: 0,
        activeChannels: []
      };
    }
    
    const successfulEvents = recentRecords.filter(r => r.status === 'success').length;
    const averageEMQ = recentRecords.reduce((sum, r) => sum + r.metrics.emqScore, 0) / recentRecords.length;
    const averageProcessingTime = recentRecords.reduce((sum, r) => sum + r.metrics.totalProcessingTime, 0) / recentRecords.length;
    const successRate = (successfulEvents / recentRecords.length) * 100;
    
    const activeChannels = Array.from(new Set(recentRecords.map(r => r.channel)));
    
    return {
      eventsLast5Minutes: recentRecords.length,
      averageEMQ,
      successRate,
      averageProcessingTime,
      activeChannels
    };
  }

  /**
   * Gera relatório de performance
   */
  public generatePerformanceReport(): any {
    const hourlyMetrics = this.getAggregatedMetrics('hour');
    const dailyMetrics = this.getAggregatedMetrics('day');
    const realTimeMetrics = this.getRealTimeMetrics();
    
    return {
      timestamp: new Date().toISOString(),
      realTime: realTimeMetrics,
      hourly: hourlyMetrics,
      daily: dailyMetrics,
      recommendations: this.generateRecommendations(hourlyMetrics),
      healthScore: this.calculateHealthScore(hourlyMetrics)
    };
  }

  /**
   * Gera recomendações baseadas nas métricas
   */
  private generateRecommendations(metrics: AggregatedMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.averageEMQ < 6) {
      recommendations.push('🔽 EMQ baixo: Aumentar coleta de dados PII (email, phone, name)');
    }
    
    if (metrics.successRate < 90) {
      recommendations.push('❌ Taxa de sucesso baixa: Verificar configurações de API e tokens');
    }
    
    if (metrics.averageProcessingTime > 2000) {
      recommendations.push('⏱️ Latência alta: Otimizar tempo de processamento e rede');
    }
    
    if (metrics.topErrors.length > 0) {
      recommendations.push(`🚨 Erros frequentes: ${metrics.topErrors[0].error}`);
    }
    
    const poorChannel = metrics.channelPerformance.find(c => c.successRate < 80);
    if (poorChannel) {
      recommendations.push(`📉 Canal com baixo desempenho: ${poorChannel.channel}`);
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ Sistema operando dentro dos parâmetros esperados');
    }
    
    return recommendations;
  }

  /**
   * Calcula score geral de saúde do sistema
   */
  private calculateHealthScore(metrics: AggregatedMetrics): number {
    let score = 0;
    
    // EMQ (30%)
    score += Math.min(metrics.averageEMQ / 8, 1) * 30;
    
    // Success Rate (30%)
    score += (metrics.successRate / 100) * 30;
    
    // Processing Time (20%)
    const timeScore = Math.max(0, 1 - (metrics.averageProcessingTime / 5000));
    score += timeScore * 20;
    
    // Error Rate (20%)
    const errorScore = Math.max(0, 1 - (metrics.topErrors.length / 10));
    score += errorScore * 20;
    
    return Math.round(score);
  }

  /**
   * Limpa registros antigos
   */
  private cleanup(): void {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    // Remover registros antigos
    for (const [eventId, record] of this.eventRecords.entries()) {
      if (now - record.timestamp > oneDay) {
        this.eventRecords.delete(eventId);
      }
    }
    
    // Limpar contadores de erro antigos
    for (const [error, count] of this.errorCounts.entries()) {
      if (count === 1) {
        this.errorCounts.delete(error);
      }
    }
    
    console.log('🧹 Performance monitor: cleanup concluído');
  }

  /**
   * Exporta métricas para análise externa
   */
  public exportMetrics(): any {
    return {
      timestamp: new Date().toISOString(),
      eventRecords: Array.from(this.eventRecords.values()),
      aggregatedMetrics: {
        hourly: this.getAggregatedMetrics('hour'),
        daily: this.getAggregatedMetrics('day')
      },
      realTimeMetrics: this.getRealTimeMetrics()
    };
  }
}

// Exportar instância singleton
export const performanceMonitor = PerformanceMonitor.getInstance();

// Funções de conveniência
export const recordEventPerformance = (
  eventId: string,
  eventName: string,
  channel: string,
  status: 'success' | 'failed' | 'retried',
  metrics: Partial<PerformanceMetrics>,
  errorDetails?: string
) => performanceMonitor.recordEventPerformance(eventId, eventName, channel, status, metrics, errorDetails);

export const calculateEMQScore = (userData: any) => performanceMonitor.calculateEMQScore(userData);

export default performanceMonitor;