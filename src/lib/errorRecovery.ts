/**
 * Sistema Avançado de Recuperação de Erros e Retry
 * 
 * Implementa estratégias sofisticadas de retry com backoff exponencial,
 * circuit breaker e análise de padrões de falha
 */

export interface ErrorRecoveryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterEnabled: boolean;
  circuitBreakerThreshold: number;
  circuitBreakerTimeout: number;
  enableFallbackChannels: boolean;
}

export interface ErrorContext {
  operation: string;
  attempt: number;
  maxRetries: number;
  totalAttempts: number;
  startTime: number;
  lastError?: Error;
  retryDelay: number;
}

export interface RecoveryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  context: ErrorContext;
  recoveryStrategy: string;
  totalDuration: number;
}

export interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

export class ErrorRecoveryManager {
  private static instance: ErrorRecoveryManager;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private errorPatterns: Map<string, number> = new Map();
  
  private constructor() {}
  
  public static getInstance(): ErrorRecoveryManager {
    if (!ErrorRecoveryManager.instance) {
      ErrorRecoveryManager.instance = new ErrorRecoveryManager();
    }
    return ErrorRecoveryManager.instance;
  }

  /**
   * Configuração padrão para diferentes tipos de operação
   */
  private getDefaultConfig(operation: string): ErrorRecoveryConfig {
    const configs: { [key: string]: ErrorRecoveryConfig } = {
      'facebook_api': {
        maxRetries: 3,
        baseDelay: 1000,
        maxDelay: 10000,
        backoffMultiplier: 2,
        jitterEnabled: true,
        circuitBreakerThreshold: 5,
        circuitBreakerTimeout: 60000, // 1 minuto
        enableFallbackChannels: true
      },
      'gtm_server': {
        maxRetries: 2,
        baseDelay: 500,
        maxDelay: 5000,
        backoffMultiplier: 2,
        jitterEnabled: true,
        circuitBreakerThreshold: 3,
        circuitBreakerTimeout: 30000, // 30 segundos
        enableFallbackChannels: true
      },
      'client_side': {
        maxRetries: 1,
        baseDelay: 100,
        maxDelay: 1000,
        backoffMultiplier: 1.5,
        jitterEnabled: false,
        circuitBreakerThreshold: 10,
        circuitBreakerTimeout: 120000, // 2 minutos
        enableFallbackChannels: false
      }
    };
    
    return configs[operation] || configs['client_side'];
  }

  /**
   * Executa operação com retry avançado
   */
  public async executeWithRecovery<T>(
    operation: string,
    fn: () => Promise<T>,
    customConfig?: Partial<ErrorRecoveryConfig>
  ): Promise<RecoveryResult<T>> {
    const config = { ...this.getDefaultConfig(operation), ...customConfig };
    const startTime = Date.now();
    const context: ErrorContext = {
      operation,
      attempt: 0,
      maxRetries: config.maxRetries,
      totalAttempts: 0,
      startTime,
      retryDelay: 0
    };

    console.log(`🔄 Iniciando operação com recovery: ${operation}`);

    // Verificar circuit breaker
    if (this.isCircuitBreakerOpen(operation)) {
      const waitTime = this.getCircuitBreakerWaitTime(operation);
      console.warn(`⚡ Circuit breaker aberto para ${operation}, aguardando ${waitTime}ms`);
      
      return {
        success: false,
        error: new Error(`Circuit breaker aberto para ${operation}`),
        context,
        recoveryStrategy: 'circuit_breaker',
        totalDuration: 0
      };
    }

    // Tentar executar com retry
    for (let attempt = 1; attempt <= config.maxRetries + 1; attempt++) {
      context.attempt = attempt;
      context.totalAttempts = attempt;
      
      try {
        console.log(`🎯 Tentativa ${attempt}/${config.maxRetries + 1} para ${operation}`);
        
        const result = await fn();
        
        // Sucesso! Resetar circuit breaker
        this.resetCircuitBreaker(operation);
        
        const duration = Date.now() - startTime;
        console.log(`✅ Sucesso na operação ${operation} em ${duration}ms (tentativa ${attempt})`);
        
        return {
          success: true,
          result,
          context,
          recoveryStrategy: attempt > 1 ? 'retry_success' : 'direct_success',
          totalDuration: duration
        };
        
      } catch (error) {
        context.lastError = error as Error;
        this.recordFailure(operation, error as Error);
        
        console.warn(`❌ Falha na tentativa ${attempt} para ${operation}:`, error.message);
        
        // Se for a falha não recuperável, não tentar novamente
        if (this.isNonRecoverableError(error as Error)) {
          console.error(`🛑 Erro não recuperável detectado para ${operation}:`, error.message);
          break;
        }
        
        // Se for a falha de autenticação, não tentar novamente
        if (this.isAuthError(error as Error)) {
          console.error(`🔐 Erro de autenticação detectado para ${operation}:`, error.message);
          this.triggerCircuitBreaker(operation);
          break;
        }
        
        // Se não for a última tentativa, calcular delay e esperar
        if (attempt <= config.maxRetries) {
          context.retryDelay = this.calculateRetryDelay(attempt, config);
          console.log(`⏳ Aguardando ${context.retryDelay}ms antes da próxima tentativa...`);
          await this.delay(context.retryDelay);
        }
      }
    }

    // Todas as tentativas falharam
    const duration = Date.now() - startTime;
    console.error(`💥 Todas as tentativas falharam para ${operation} após ${duration}ms`);
    
    // Tentar fallback se disponível
    if (config.enableFallbackChannels) {
      const fallbackResult = await this.attemptFallback(operation, context);
      if (fallbackResult.success) {
        return fallbackResult;
      }
    }
    
    return {
      success: false,
      error: context.lastError,
      context,
      recoveryStrategy: 'all_attempts_failed',
      totalDuration: duration
    };
  }

  /**
   * Calcula delay com backoff exponencial e jitter
   */
  private calculateRetryDelay(attempt: number, config: ErrorRecoveryConfig): number {
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, config.maxDelay);
    
    // Adicionar jitter para evitar thundering herd
    if (config.jitterEnabled) {
      const jitter = delay * 0.1 * Math.random(); // Até 10% de jitter
      delay += jitter;
    }
    
    return Math.floor(delay);
  }

  /**
   * Verifica se o erro é recuperável
   */
  private isNonRecoverableError(error: Error): boolean {
    const nonRecoverablePatterns = [
      'invalid oauth access token',
      'permission denied',
      'invalid parameter',
      'rate_limit_exceeded',
      'too many requests'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return nonRecoverablePatterns.some(pattern => errorMessage.includes(pattern));
  }

  /**
   * Verifica se o erro é de autenticação
   */
  private isAuthError(error: Error): boolean {
    const authPatterns = [
      'invalid oauth access token',
      'permission denied',
      'unauthorized',
      'access denied'
    ];
    
    const errorMessage = error.message.toLowerCase();
    return authPatterns.some(pattern => errorMessage.includes(pattern));
  }

  /**
   * Gerenciamento de Circuit Breaker
   */
  private isCircuitBreakerOpen(operation: string): boolean {
    const state = this.circuitBreakers.get(operation);
    if (!state) return false;
    
    if (!state.isOpen) return false;
    
    // Verificar se já pode tentar novamente
    if (Date.now() >= state.nextAttemptTime) {
      console.log(`🔓 Circuit breaker para ${operation} pode ser testado novamente`);
      state.isOpen = false;
      state.failureCount = 0;
      return false;
    }
    
    return true;
  }

  private triggerCircuitBreaker(operation: string): void {
    const state = this.circuitBreakers.get(operation) || {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      nextAttemptTime: 0
    };
    
    state.failureCount++;
    state.lastFailureTime = Date.now();
    
    const config = this.getDefaultConfig(operation);
    if (state.failureCount >= config.circuitBreakerThreshold) {
      state.isOpen = true;
      state.nextAttemptTime = Date.now() + config.circuitBreakerTimeout;
      console.warn(`⚡ Circuit breaker aberto para ${operation} (${state.failureCount} falhas)`);
    }
    
    this.circuitBreakers.set(operation, state);
  }

  private resetCircuitBreaker(operation: string): void {
    const state = this.circuitBreakers.get(operation);
    if (state) {
      state.failureCount = 0;
      state.isOpen = false;
      console.log(`🔓 Circuit breaker resetado para ${operation}`);
    }
  }

  private getCircuitBreakerWaitTime(operation: string): number {
    const state = this.circuitBreakers.get(operation);
    return state ? Math.max(0, state.nextAttemptTime - Date.now()) : 0;
  }

  /**
   * Registra falhas para análise de padrões
   */
  private recordFailure(operation: string, error: Error): void {
    const errorKey = `${operation}:${error.message}`;
    const count = this.errorPatterns.get(errorKey) || 0;
    this.errorPatterns.set(errorKey, count + 1);
    
    // Trigger circuit breaker se muitas falhas
    this.triggerCircuitBreaker(operation);
  }

  /**
   * Tenta fallback para outros canais
   */
  private async attemptFallback<T>(operation: string, context: ErrorContext): Promise<RecoveryResult<T>> {
    console.log(`🔄 Tentando fallback para ${operation}`);
    
    // Implementar lógica de fallback específica por operação
    switch (operation) {
      case 'facebook_api':
        // Tentar GTM Server como fallback
        return this.tryGTMServerFallback(context);
      
      case 'gtm_server':
        // Tentar client-side como fallback
        return this.tryClientSideFallback(context);
      
      default:
        console.log(`❌ Nenhum fallback disponível para ${operation}`);
        return {
          success: false,
          error: new Error(`Nenhum fallback disponível para ${operation}`),
          context,
          recoveryStrategy: 'no_fallback',
          totalDuration: 0
        };
    }
  }

  private async tryGTMServerFallback<T>(context: ErrorContext): Promise<RecoveryResult<T>> {
    console.log(`🔄 Tentando fallback GTM Server`);
    
    // Implementar lógica específica de fallback
    // Por enquanto, retorna falha
    return {
      success: false,
      error: new Error('Fallback GTM Server não implementado'),
      context,
      recoveryStrategy: 'gtm_server_fallback_failed',
      totalDuration: 0
    };
  }

  private async tryClientSideFallback<T>(context: ErrorContext): Promise<RecoveryResult<T>> {
    console.log(`🔄 Tentando fallback Client-side`);
    
    // Implementar lógica específica de fallback
    // Por enquanto, retorna falha
    return {
      success: false,
      error: new Error('Fallback client-side não implementado'),
      context,
      recoveryStrategy: 'client_side_fallback_failed',
      totalDuration: 0
    };
  }

  /**
   * Utilitário de delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtém estatísticas de recovery
   */
  public getRecoveryStats(): any {
    const stats: any = {
      circuitBreakers: {},
      errorPatterns: {},
      summary: {
        totalOperations: 0,
        totalFailures: 0,
        openCircuitBreakers: 0
      }
    };

    // Estatísticas de circuit breakers
    for (const [operation, state] of this.circuitBreakers.entries()) {
      stats.circuitBreakers[operation] = {
        isOpen: state.isOpen,
        failureCount: state.failureCount,
        lastFailureTime: state.lastFailureTime,
        nextAttemptTime: state.nextAttemptTime
      };
      
      if (state.isOpen) {
        stats.summary.openCircuitBreakers++;
      }
      stats.summary.totalFailures += state.failureCount;
    }

    // Padrões de erro
    for (const [errorKey, count] of this.errorPatterns.entries()) {
      stats.errorPatterns[errorKey] = count;
      stats.summary.totalFailures += count;
    }

    return stats;
  }

  /**
   * Limpa estatísticas antigas
   */
  public cleanup(): void {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    
    // Limpar circuit breakers antigos
    for (const [operation, state] of this.circuitBreakers.entries()) {
      if (now - state.lastFailureTime > oneHour && !state.isOpen) {
        this.circuitBreakers.delete(operation);
      }
    }
    
    // Limpar padrões de erro antigos
    for (const [errorKey] of this.errorPatterns.entries()) {
      // Manter apenas erros recentes
      if (Math.random() < 0.1) { // Remover 10% aleatoriamente
        this.errorPatterns.delete(errorKey);
      }
    }
  }
}

// Exportar instância singleton
export const errorRecovery = ErrorRecoveryManager.getInstance();

// Funções de conveniência
export const executeWithRecovery = <T>(
  operation: string,
  fn: () => Promise<T>,
  config?: Partial<ErrorRecoveryConfig>
) => errorRecovery.executeWithRecovery(operation, fn, config);

export default errorRecovery;