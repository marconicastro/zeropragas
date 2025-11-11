/**
 * 📊 SISTEMA DE MÉTRICAS E OBSERVABILIDADE
 * 
 * Coleta métricas de performance, erros e eventos
 * Permite observabilidade completa do sistema
 */

export interface Metric {
  name: string;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
}

export interface EventMetric {
  eventName: string;
  success: boolean;
  latency: number;
  metadata?: Record<string, any>;
}

export interface ErrorMetric {
  error: Error;
  context: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Coletor de métricas
 */
export class MetricsCollector {
  private metrics: Metric[] = [];
  private maxMetrics = 10000; // Limite de métricas em memória
  
  /**
   * Registra uma métrica
   */
  record(name: string, value: number, tags?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      timestamp: Date.now(),
      tags
    };
    
    this.metrics.push(metric);
    
    // Limitar tamanho do array
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
    
    // Em produção, enviar para sistema de métricas (DataDog, New Relic, etc)
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(metric);
    }
  }

  /**
   * Registra métrica de evento
   */
  recordEvent(event: EventMetric): void {
    this.record(`event.${event.eventName}`, event.latency, {
      success: event.success.toString(),
      ...event.metadata
    });
    
    if (!event.success) {
      this.record(`event.${event.eventName}.error`, 1, event.metadata);
    }
  }

  /**
   * Registra métrica de erro
   */
  recordError(error: ErrorMetric): void {
    this.record(`error.${error.severity}`, 1, {
      message: error.error.message,
      name: error.error.name,
      ...error.context
    });
    
    // Em produção, enviar para error tracking (Sentry, etc)
    if (process.env.NODE_ENV === 'production') {
      this.sendErrorToExternalService(error);
    }
  }

  /**
   * Obtém métricas agregadas
   */
  getAggregated(metricName: string, timeWindow: number = 3600000): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
  } {
    const now = Date.now();
    const cutoff = now - timeWindow;
    
    const relevant = this.metrics.filter(
      m => m.name === metricName && m.timestamp >= cutoff
    );
    
    if (relevant.length === 0) {
      return { count: 0, sum: 0, avg: 0, min: 0, max: 0 };
    }
    
    const values = relevant.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    
    return {
      count: relevant.length,
      sum,
      avg: sum / relevant.length,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  /**
   * Obtém todas as métricas
   */
  getAll(): Metric[] {
    return [...this.metrics];
  }

  /**
   * Limpa métricas antigas
   */
  clean(maxAge: number = 86400000): void {
    const now = Date.now();
    const cutoff = now - maxAge;
    
    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff);
  }

  /**
   * Envia métrica para serviço externo (implementar conforme necessário)
   */
  private sendToExternalService(metric: Metric): void {
    // Implementar integração com DataDog, New Relic, etc
    // Exemplo:
    // fetch('https://api.datadog.com/api/v1/metrics', {
    //   method: 'POST',
    //   body: JSON.stringify(metric)
    // });
  }

  /**
   * Envia erro para serviço externo (implementar conforme necessário)
   */
  private sendErrorToExternalService(error: ErrorMetric): void {
    // Implementar integração com Sentry, etc
    // Exemplo:
    // Sentry.captureException(error.error, {
    //   extra: error.context,
    //   level: error.severity
    // });
  }
}

// Instância singleton
let globalMetricsCollector: MetricsCollector | null = null;

/**
 * Obtém instância global do coletor de métricas
 */
export function getMetricsCollector(): MetricsCollector {
  if (!globalMetricsCollector) {
    globalMetricsCollector = new MetricsCollector();
    
    // Limpeza automática diária
    setInterval(() => {
      globalMetricsCollector?.clean();
    }, 86400000);
  }
  
  return globalMetricsCollector;
}

/**
 * Helper para medir latência de operações
 */
export async function measureLatency<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  const metrics = getMetricsCollector();
  
  try {
    const result = await fn();
    const latency = Date.now() - start;
    
    metrics.recordEvent({
      eventName: operation,
      success: true,
      latency
    });
    
    return result;
  } catch (error) {
    const latency = Date.now() - start;
    
    metrics.recordEvent({
      eventName: operation,
      success: false,
      latency,
      metadata: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    throw error;
  }
}

