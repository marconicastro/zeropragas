/**
 * 🚦 SISTEMA DE RATE LIMITING
 * 
 * Previne abuso de APIs e webhooks
 * Implementa algoritmo Token Bucket
 */

interface RateLimitConfig {
  limit: number;      // Número máximo de requisições
  window: number;    // Janela de tempo em ms
  identifier?: string; // Identificador único (IP, user ID, etc)
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

/**
 * Rate Limiter usando Token Bucket
 */
export class RateLimiter {
  private buckets = new Map<string, {
    tokens: number;
    lastRefill: number;
    limit: number;
    window: number;
  }>();

  /**
   * Verifica se requisição está dentro do limite
   */
  check(identifier: string, limit: number, window: number): RateLimitResult {
    const now = Date.now();
    const key = `${identifier}_${limit}_${window}`;
    
    let bucket = this.buckets.get(key);
    
    if (!bucket) {
      // Criar novo bucket
      bucket = {
        tokens: limit,
        lastRefill: now,
        limit,
        window
      };
      this.buckets.set(key, bucket);
    }
    
    // Refill tokens baseado no tempo decorrido
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor((timePassed / window) * limit);
    
    if (tokensToAdd > 0) {
      bucket.tokens = Math.min(bucket.limit, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;
    }
    
    // Verificar se tem tokens disponíveis
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      const resetAt = now + window;
      
      return {
        allowed: true,
        remaining: Math.floor(bucket.tokens),
        resetAt
      };
    }
    
    // Rate limit excedido
    const retryAfter = Math.ceil((1 - bucket.tokens) * (window / limit));
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: bucket.lastRefill + window,
      retryAfter
    };
  }

  /**
   * Limpa buckets expirados (prevenção de memory leak)
   */
  cleanExpired(maxAge: number = 3600000): void {
    const now = Date.now();
    
    for (const [key, bucket] of this.buckets.entries()) {
      const age = now - bucket.lastRefill;
      if (age > maxAge) {
        this.buckets.delete(key);
      }
    }
  }

  /**
   * Reseta rate limit para um identificador
   */
  reset(identifier: string, limit: number, window: number): void {
    const key = `${identifier}_${limit}_${window}`;
    this.buckets.delete(key);
  }

  /**
   * Obtém estatísticas de rate limit
   */
  getStats(identifier: string, limit: number, window: number): {
    remaining: number;
    resetAt: number;
  } | null {
    const key = `${identifier}_${limit}_${window}`;
    const bucket = this.buckets.get(key);
    
    if (!bucket) {
      return null;
    }
    
    const now = Date.now();
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = Math.floor((timePassed / window) * limit);
    const currentTokens = Math.min(bucket.limit, bucket.tokens + tokensToAdd);
    
    return {
      remaining: Math.floor(currentTokens),
      resetAt: bucket.lastRefill + window
    };
  }
}

// Instância singleton global
let globalRateLimiter: RateLimiter | null = null;

/**
 * Obtém instância global do rate limiter
 */
export function getRateLimiter(): RateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = new RateLimiter();
    
    // Limpeza automática a cada hora
    setInterval(() => {
      globalRateLimiter?.cleanExpired();
    }, 3600000);
  }
  
  return globalRateLimiter;
}

/**
 * Helper para criar middleware de rate limiting
 */
export function createRateLimitMiddleware(config: {
  limit: number;
  window: number;
  getIdentifier: (request: Request) => string;
}) {
  const limiter = getRateLimiter();
  
  return async (request: Request): Promise<RateLimitResult> => {
    const identifier = config.getIdentifier(request);
    return limiter.check(identifier, config.limit, config.window);
  };
}

