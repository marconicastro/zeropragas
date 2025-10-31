/**
 * 📊 SISTEMA DE MONITORAMENTO DE TRACKING
 * 
 * OBJETIVO: Observabilidade completa do sistema de rastreamento
 * 
 * FUNCIONALIDADES:
 * - Métricas em tempo real
 * - Alertas de qualidade
 * - Análise de performance
 * - Health checks automáticos
 * 
 * USO: Totalmente opcional, não interfere com sistema existente
 */

interface TrackingMetrics {
  // Contadores
  totalEvents: number;
  successfulEvents: number;
  failedEvents: number;
  
  // Por tipo de evento
  eventCounts: Record<string, number>;
  
  // Performance
  averageLatency: number;
  p95Latency: number;
  p99Latency: number;
  
  // Qualidade
  eventsWithEmail: number;
  eventsWithPhone: number;
  eventsWithLocation: number;
  estimatedQualityScore: number;
  
  // Cache (se habilitado)
  cacheHitRate?: number;
  
  // Correlação
  correlatedEvents: number;
  uncorrelatedEvents: number;
  
  // Timestamp
  lastUpdated: number;
  periodStart: number;
}

interface TrackingAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: number;
  metric: string;
  value: number;
  threshold: number;
}

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    pixelLoaded: boolean;
    dataLayerActive: boolean;
    persistenceWorking: boolean;
    cacheWorking: boolean;
    webhookReachable: boolean;
  };
  timestamp: number;
}

// Estado do monitor
class TrackingMonitor {
  private metrics: TrackingMetrics;
  private alerts: TrackingAlert[] = [];
  private latencies: number[] = [];
  private maxLatencies = 1000; // Manter últimas 1000 medições
  
  constructor() {
    this.metrics = this.initializeMetrics();
    this.loadPersistedMetrics();
  }
  
  private initializeMetrics(): TrackingMetrics {
    return {
      totalEvents: 0,
      successfulEvents: 0,
      failedEvents: 0,
      eventCounts: {},
      averageLatency: 0,
      p95Latency: 0,
      p99Latency: 0,
      eventsWithEmail: 0,
      eventsWithPhone: 0,
      eventsWithLocation: 0,
      estimatedQualityScore: 0,
      correlatedEvents: 0,
      uncorrelatedEvents: 0,
      lastUpdated: Date.now(),
      periodStart: Date.now()
    };
  }
  
  /**
   * Registra um evento disparado
   */
  recordEvent(
    eventName: string,
    success: boolean,
    latency: number,
    metadata?: {
      hasEmail?: boolean;
      hasPhone?: boolean;
      hasLocation?: boolean;
      isCorrelated?: boolean;
    }
  ): void {
    // Incrementar contadores
    this.metrics.totalEvents++;
    if (success) {
      this.metrics.successfulEvents++;
    } else {
      this.metrics.failedEvents++;
    }
    
    // Contar por tipo de evento
    this.metrics.eventCounts[eventName] = (this.metrics.eventCounts[eventName] || 0) + 1;
    
    // Registrar latência
    this.latencies.push(latency);
    if (this.latencies.length > this.maxLatencies) {
      this.latencies.shift();
    }
    this.updateLatencyMetrics();
    
    // Métricas de qualidade
    if (metadata?.hasEmail) this.metrics.eventsWithEmail++;
    if (metadata?.hasPhone) this.metrics.eventsWithPhone++;
    if (metadata?.hasLocation) this.metrics.eventsWithLocation++;
    if (metadata?.isCorrelated) {
      this.metrics.correlatedEvents++;
    } else {
      this.metrics.uncorrelatedEvents++;
    }
    
    // Calcular quality score estimado
    this.updateQualityScore();
    
    // Atualizar timestamp
    this.metrics.lastUpdated = Date.now();
    
    // Verificar thresholds e gerar alertas
    this.checkThresholds();
    
    // Persistir métricas
    this.persistMetrics();
  }
  
  /**
   * Atualiza métricas de latência (P95, P99)
   */
  private updateLatencyMetrics(): void {
    if (this.latencies.length === 0) return;
    
    const sorted = [...this.latencies].sort((a, b) => a - b);
    
    // Média
    this.metrics.averageLatency = Math.round(
      this.latencies.reduce((sum, val) => sum + val, 0) / this.latencies.length
    );
    
    // P95
    const p95Index = Math.floor(sorted.length * 0.95);
    this.metrics.p95Latency = sorted[p95Index] || 0;
    
    // P99
    const p99Index = Math.floor(sorted.length * 0.99);
    this.metrics.p99Latency = sorted[p99Index] || 0;
  }
  
  /**
   * Calcula quality score estimado baseado em métricas
   */
  private updateQualityScore(): void {
    const total = this.metrics.totalEvents;
    if (total === 0) {
      this.metrics.estimatedQualityScore = 0;
      return;
    }
    
    // Fatores de qualidade
    const emailRate = this.metrics.eventsWithEmail / total;
    const phoneRate = this.metrics.eventsWithPhone / total;
    const locationRate = this.metrics.eventsWithLocation / total;
    const successRate = this.metrics.successfulEvents / total;
    const correlationRate = this.metrics.correlatedEvents / (this.metrics.correlatedEvents + this.metrics.uncorrelatedEvents);
    
    // Pesos (ajustados conforme importância)
    const score = (
      emailRate * 0.30 +
      phoneRate * 0.20 +
      locationRate * 0.15 +
      successRate * 0.25 +
      correlationRate * 0.10
    ) * 10;
    
    this.metrics.estimatedQualityScore = Math.round(score * 10) / 10;
  }
  
  /**
   * Verifica thresholds e gera alertas
   */
  private checkThresholds(): void {
    const thresholds = {
      failureRate: 0.05, // 5% de falha
      avgLatency: 1000, // 1 segundo
      qualityScore: 8.0, // Quality Score mínimo
      emailCoverage: 0.70 // 70% dos eventos com email
    };
    
    const total = this.metrics.totalEvents;
    const failureRate = this.metrics.failedEvents / total;
    const emailCoverage = this.metrics.eventsWithEmail / total;
    
    // Alerta: Taxa de falha alta
    if (failureRate > thresholds.failureRate) {
      this.createAlert(
        'high',
        `Taxa de falha alta: ${(failureRate * 100).toFixed(1)}%`,
        'failureRate',
        failureRate,
        thresholds.failureRate
      );
    }
    
    // Alerta: Latência alta
    if (this.metrics.averageLatency > thresholds.avgLatency) {
      this.createAlert(
        'medium',
        `Latência média alta: ${this.metrics.averageLatency}ms`,
        'avgLatency',
        this.metrics.averageLatency,
        thresholds.avgLatency
      );
    }
    
    // Alerta: Quality Score baixo
    if (this.metrics.estimatedQualityScore < thresholds.qualityScore) {
      this.createAlert(
        'high',
        `Quality Score estimado baixo: ${this.metrics.estimatedQualityScore}`,
        'qualityScore',
        this.metrics.estimatedQualityScore,
        thresholds.qualityScore
      );
    }
    
    // Alerta: Cobertura de email baixa
    if (total > 10 && emailCoverage < thresholds.emailCoverage) {
      this.createAlert(
        'medium',
        `Cobertura de email baixa: ${(emailCoverage * 100).toFixed(1)}%`,
        'emailCoverage',
        emailCoverage,
        thresholds.emailCoverage
      );
    }
  }
  
  /**
   * Cria um alerta
   */
  private createAlert(
    severity: TrackingAlert['severity'],
    message: string,
    metric: string,
    value: number,
    threshold: number
  ): void {
    const alert: TrackingAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      severity,
      message,
      timestamp: Date.now(),
      metric,
      value,
      threshold
    };
    
    // Adicionar alerta
    this.alerts.push(alert);
    
    // Manter apenas últimos 50 alertas
    if (this.alerts.length > 50) {
      this.alerts.shift();
    }
    
    // Log do alerta
    const emoji = {
      low: '💡',
      medium: '⚠️',
      high: '🔥',
      critical: '🚨'
    }[severity];
    
    console.warn(`${emoji} ALERTA DE TRACKING [${severity.toUpperCase()}]: ${message}`);
  }
  
  /**
   * Obtém métricas atuais
   */
  getMetrics(): TrackingMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Obtém alertas ativos
   */
  getAlerts(severityFilter?: TrackingAlert['severity']): TrackingAlert[] {
    if (severityFilter) {
      return this.alerts.filter(a => a.severity === severityFilter);
    }
    return [...this.alerts];
  }
  
  /**
   * Limpa alertas
   */
  clearAlerts(): void {
    this.alerts = [];
    console.log('🗑️ Alertas limpos');
  }
  
  /**
   * Reseta métricas (novo período)
   */
  resetMetrics(): void {
    this.metrics = this.initializeMetrics();
    this.latencies = [];
    this.alerts = [];
    localStorage.removeItem('zc_tracking_metrics');
    console.log('🔄 Métricas resetadas');
  }
  
  /**
   * Realiza health check completo
   */
  async performHealthCheck(): Promise<HealthCheck> {
    const checks = {
      pixelLoaded: this.checkPixelLoaded(),
      dataLayerActive: this.checkDataLayerActive(),
      persistenceWorking: this.checkPersistence(),
      cacheWorking: await this.checkCache(),
      webhookReachable: await this.checkWebhook()
    };
    
    // Determinar status geral
    const failedChecks = Object.values(checks).filter(c => !c).length;
    let status: HealthCheck['status'] = 'healthy';
    if (failedChecks === 1) status = 'degraded';
    if (failedChecks >= 2) status = 'unhealthy';
    
    const healthCheck: HealthCheck = {
      status,
      checks,
      timestamp: Date.now()
    };
    
    console.log('🏥 Health Check:', healthCheck);
    return healthCheck;
  }
  
  private checkPixelLoaded(): boolean {
    return typeof window !== 'undefined' && typeof window.fbq === 'function';
  }
  
  private checkDataLayerActive(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
  
  private checkPersistence(): boolean {
    try {
      localStorage.setItem('zc_health_check', 'ok');
      const value = localStorage.getItem('zc_health_check');
      localStorage.removeItem('zc_health_check');
      return value === 'ok';
    } catch {
      return false;
    }
  }
  
  private async checkCache(): Promise<boolean> {
    try {
      // Verificar se cache está importado e funcionando
      const { getCacheStats } = await import('./geolocation-cache');
      const stats = getCacheStats();
      return true;
    } catch {
      return false; // Cache não disponível (ok, é opcional)
    }
  }
  
  private async checkWebhook(): Promise<boolean> {
    try {
      const response = await fetch('/api/webhook-cakto', {
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  /**
   * Persiste métricas no localStorage
   */
  private persistMetrics(): void {
    try {
      localStorage.setItem('zc_tracking_metrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.warn('⚠️ Erro ao persistir métricas:', error);
    }
  }
  
  /**
   * Carrega métricas persistidas
   */
  private loadPersistedMetrics(): void {
    try {
      const stored = localStorage.getItem('zc_tracking_metrics');
      if (stored) {
        const loadedMetrics = JSON.parse(stored);
        
        // Verificar se métricas não são muito antigas (> 7 dias)
        const age = Date.now() - loadedMetrics.lastUpdated;
        const maxAge = 7 * 24 * 60 * 60 * 1000;
        
        if (age < maxAge) {
          this.metrics = loadedMetrics;
          console.log('📊 Métricas carregadas do localStorage');
        } else {
          console.log('⏰ Métricas antigas, iniciando novo período');
        }
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar métricas:', error);
    }
  }
  
  /**
   * Exporta relatório completo
   */
  exportReport(): string {
    const report = {
      metrics: this.metrics,
      alerts: this.alerts,
      summary: {
        successRate: ((this.metrics.successfulEvents / this.metrics.totalEvents) * 100).toFixed(2) + '%',
        avgLatency: this.metrics.averageLatency + 'ms',
        qualityScore: this.metrics.estimatedQualityScore + '/10',
        period: Math.round((Date.now() - this.metrics.periodStart) / 3600000) + 'h'
      }
    };
    
    return JSON.stringify(report, null, 2);
  }
}

// Instância singleton
let monitorInstance: TrackingMonitor | null = null;

/**
 * Obtém instância do monitor
 */
export function getTrackingMonitor(): TrackingMonitor {
  if (!monitorInstance) {
    monitorInstance = new TrackingMonitor();
  }
  return monitorInstance;
}

/**
 * Helper para registrar evento facilmente
 */
export function recordTrackingEvent(
  eventName: string,
  success: boolean,
  latency: number,
  metadata?: Parameters<TrackingMonitor['recordEvent']>[3]
): void {
  const monitor = getTrackingMonitor();
  monitor.recordEvent(eventName, success, latency, metadata);
}

/**
 * Helper para obter métricas rapidamente
 */
export function getQuickMetrics(): {
  total: number;
  success: number;
  failureRate: string;
  qualityScore: number;
  avgLatency: number;
} {
  const metrics = getTrackingMonitor().getMetrics();
  const failureRate = ((metrics.failedEvents / metrics.totalEvents) * 100).toFixed(1);
  
  return {
    total: metrics.totalEvents,
    success: metrics.successfulEvents,
    failureRate: failureRate + '%',
    qualityScore: metrics.estimatedQualityScore,
    avgLatency: metrics.averageLatency
  };
}

/**
 * Exibe dashboard no console
 */
export function showDashboard(): void {
  const monitor = getTrackingMonitor();
  const metrics = monitor.getMetrics();
  const alerts = monitor.getAlerts();
  
  console.group('📊 TRACKING DASHBOARD');
  
  // Métricas principais
  console.log('📈 Métricas Gerais:');
  console.table({
    'Total de Eventos': metrics.totalEvents,
    'Eventos Bem-sucedidos': metrics.successfulEvents,
    'Eventos Falhados': metrics.failedEvents,
    'Taxa de Sucesso': ((metrics.successfulEvents / metrics.totalEvents) * 100).toFixed(1) + '%',
    'Quality Score Estimado': metrics.estimatedQualityScore + '/10'
  });
  
  // Performance
  console.log('\n⚡ Performance:');
  console.table({
    'Latência Média': metrics.averageLatency + 'ms',
    'P95': metrics.p95Latency + 'ms',
    'P99': metrics.p99Latency + 'ms'
  });
  
  // Qualidade de dados
  console.log('\n🎯 Qualidade de Dados:');
  console.table({
    'Eventos com Email': `${metrics.eventsWithEmail} (${((metrics.eventsWithEmail / metrics.totalEvents) * 100).toFixed(1)}%)`,
    'Eventos com Telefone': `${metrics.eventsWithPhone} (${((metrics.eventsWithPhone / metrics.totalEvents) * 100).toFixed(1)}%)`,
    'Eventos com Localização': `${metrics.eventsWithLocation} (${((metrics.eventsWithLocation / metrics.totalEvents) * 100).toFixed(1)}%)`,
    'Eventos Correlacionados': metrics.correlatedEvents
  });
  
  // Eventos por tipo
  console.log('\n📋 Eventos por Tipo:');
  console.table(metrics.eventCounts);
  
  // Alertas
  if (alerts.length > 0) {
    console.log('\n⚠️ Alertas Ativos:');
    console.table(alerts.map(a => ({
      Severidade: a.severity,
      Mensagem: a.message,
      Timestamp: new Date(a.timestamp).toLocaleString()
    })));
  } else {
    console.log('\n✅ Nenhum alerta ativo');
  }
  
  console.groupEnd();
}

// Exportar classe para uso avançado
export { TrackingMonitor };
