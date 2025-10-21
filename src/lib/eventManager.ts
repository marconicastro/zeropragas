import { validateEvent, quickValidate } from './schemaValidator';
import { executeWithRecovery } from './errorRecovery';
import { performanceMonitor, calculateEMQScore } from './performanceMonitor';

/**
 * Gerenciador Simplificado de Eventos - Apenas Eventos Essenciais
 * 
 * FUNCIONALIDADES:
 * 1. Apenas view_content e initiate_checkout
 * 2. Envio via GTM, Server-side e Facebook Pixel
 * 3. Deduplicação adequada
 * 4. Nenhum evento de engajamento excessivo
 * 5. Validação rigorosa de schema
 */

interface EventRecord {
  eventId: string;
  eventName: string;
  timestamp: number;
  channel: 'client' | 'server' | 'gtm' | 'fb';
  data: any;
  status: 'pending' | 'sent' | 'failed';
}

interface EventConfig {
  enableClientSide: boolean;
  enableServerSide: boolean;
  enableGTM: boolean;
  enableGTMServer: boolean; // Nova opção
  deduplicationWindow: number;
  primaryChannel: 'gtm' | 'server' | 'fb' | 'gtm_server'; // Nova opção
}

class EventManager {
  private static instance: EventManager;
  private eventCache: Map<string, EventRecord> = new Map();
  private config: EventConfig;

  private constructor() {
    this.config = {
      enableClientSide: true,
      enableServerSide: false, // Desativado - GTM/Stape já faz server-side
      enableGTM: true, // Ativado - GTM é o canal primário
      enableGTMServer: true, // Nova opção - GTM Server avançado
      primaryChannel: 'gtm_server', // GTM Server como canal primário agora
      deduplicationWindow: 5 * 60 * 1000 // 5 minutos
    };

    // Limpar cache periodicamente
    setInterval(() => this.cleanupCache(), 60000);
    
    console.log('🎯 EventManager configurado para canal único:', this.config.primaryChannel);
    console.log('🚀 GTM Server avançado ativado');
    console.log('🚫 Facebook Pixel fallback desativado para evitar duplicidade com GTM/Stape');
  }

  public static getInstance(): EventManager {
    if (!EventManager.instance) {
      EventManager.instance = new EventManager();
    }
    return EventManager.instance;
  }

  private generateEventId(eventName: string, channel: 'client' | 'server' | 'gtm' | 'fb'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${eventName}_${timestamp}_${random}_${channel}`;
  }

  private registerEvent(eventId: string, eventName: string, channel: 'client' | 'server' | 'gtm' | 'fb' | 'gtm_server', data: any): void {
    // Verificar duplicação por EventID dentro da janela de deduplicação
    const now = Date.now();
    const existingEvent = this.eventCache.get(eventId);
    
    if (existingEvent && (now - existingEvent.timestamp) < this.config.deduplicationWindow) {
      console.log(`⚠️ Evento duplicado detectado e ignorado: ${eventName} (${channel}) - ID: ${eventId}`);
      return;
    }

    const record: EventRecord = {
      eventId,
      eventName,
      timestamp: now,
      channel,
      data,
      status: 'pending'
    };

    this.eventCache.set(eventId, record);
    console.log(`📝 Evento registrado: ${eventName} (${channel}) - ID: ${eventId}`);
  }

  private cleanupCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.eventCache.forEach((record, key) => {
      if (now - record.timestamp > this.config.deduplicationWindow) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.eventCache.delete(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`🧹 Cache limpo: ${expiredKeys.length} eventos expirados removidos`);
    }
  }

  private async sendGTM(eventId: string, eventName: string, data: any): Promise<boolean> {
    if (!this.config.enableGTM || typeof window === 'undefined') {
      return false;
    }

    try {
      console.log(`📤 Enviando evento via GTM: ${eventName}`);
      
      window.dataLayer = window.dataLayer || [];
      
      // Mapear eventos para nomes padrão
      const mappedEventName = this.mapToStandardEventName(eventName);
      
      const eventData = {
        event: mappedEventName,
        event_id: eventId,
        user_data: data.user_data,
        custom_data: data.custom_data,
        // Dados adicionais para GA4
        event_category: data.custom_data?.content_category || 'engagement',
        event_label: data.custom_data?.content_name || 'E-book',
        value: data.custom_data?.value || 0,
        currency: data.custom_data?.currency || 'BRL',
        // Timestamp para debug
        timestamp: new Date().toISOString()
      };

      window.dataLayer.push(eventData);
      
      // Enviar também eventos Meta para GTM
      const metaEventName = this.mapToFacebookEventName(eventName);
      const metaEventData = {
        event: metaEventName,
        event_id: eventId,
        user_data: data.user_data,
        custom_data: data.custom_data,
        timestamp: new Date().toISOString()
      };
      
      window.dataLayer.push(metaEventData);
      console.log(`✅ Evento Meta também enviado para GTM: ${metaEventName}`);
      
      // Enviar também evento específico para GA4 se disponível
      if (typeof window.gtag !== 'undefined') {
        const ga4EventName = this.mapToGA4EventName(eventName);
        window.gtag('event', ga4EventName, {
          event_category: data.custom_data?.content_category || 'engagement',
          event_label: data.custom_data?.content_name || 'E-book',
          value: data.custom_data?.value || 0,
          currency: data.custom_data?.currency || 'BRL',
          custom_parameter_1: eventId,
          send_to: 'G-CZ0XMXL3RX'
        });
        console.log(`✅ Evento GA4 também enviado: ${ga4EventName}`);
      }
      
      console.log(`✅ Evento GTM enviado: ${eventName} -> ${mappedEventName}`);
      return true;
    } catch (error) {
      console.error(`❌ Erro ao enviar evento GTM ${eventName}:`, error);
      return false;
    }
  }

  private async sendServerSide(eventId: string, eventName: string, data: any): Promise<boolean> {
    if (!this.config.enableServerSide) {
      return false;
    }

    try {
      console.log(`📤 Enviando evento server-side: ${eventName}`);
      
      const apiData = {
        event_name: eventName,
        event_id: eventId,
        pixel_id: '714277868320104',
        user_data: data.user_data || {},
        custom_data: data.custom_data || {}
      };

      const response = await fetch('/api/facebook-pixel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ Evento server-side enviado: ${eventName}`, result);
        return true;
      } else {
        const error = await response.json();
        console.error(`❌ Erro ao enviar evento server-side ${eventName}:`, error);
        return false;
      }
    } catch (error) {
      console.error(`❌ Erro ao enviar evento server-side ${eventName}:`, error);
      return false;
    }
  }

  private async sendGTMServer(eventId: string, eventName: string, data: any): Promise<boolean> {
    if (!this.config.enableGTMServer || typeof window === 'undefined') {
      return false;
    }

    try {
      console.log(`📤 Enviando evento via GTM Server: ${eventName}`);
      
      // Transformar dados para formato GTM Server
      const gtmServerData = this.transformDataForGTMServer(eventId, eventName, data);
      
      // Usar sistema de recovery avançado
      const recoveryResult = await executeWithRecovery(
        'gtm_server',
        async () => {
          const response = await fetch('/api/gtm-server', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(gtmServerData)
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(`HTTP ${response.status}: ${error.error || 'Unknown error'}`);
          }

          return await response.json();
        },
        {
          maxRetries: 2,
          baseDelay: 500,
          maxDelay: 3000,
          enableFallbackChannels: true
        }
      );

      if (recoveryResult.success) {
        console.log(`✅ Evento GTM Server enviado: ${eventName}`, recoveryResult.result);
        console.log(`📊 Recovery strategy: ${recoveryResult.recoveryStrategy}`);
        return true;
      } else {
        console.error(`❌ Falha total no envio GTM Server ${eventName}:`, recoveryResult.error);
        console.log(`📊 Recovery strategy: ${recoveryResult.recoveryStrategy}`);
        return false;
      }
    } catch (error) {
      console.error(`❌ Erro crítico no GTM Server ${eventName}:`, error);
      return false;
    }
  }

  // Transformação de dados específica para GTM Server
  private transformDataForGTMServer(eventId: string, eventName: string, data: any): any {
    return {
      event_name: eventName,
      event_id: eventId,
      timestamp: Date.now(), // ← Adicionando timestamp obrigatório
      session_id: this.generateSessionId(),
      user_data: {
        // Dados PII
        em: data.user_data?.em,
        ph: data.user_data?.ph,
        fn: data.user_data?.fn,
        ln: data.user_data?.ln,
        ct: data.user_data?.ct,
        st: data.user_data?.st,
        zp: data.user_data?.zp,
        country: data.user_data?.country || 'BR',
        
        // Identificadores
        ga_client_id: data.user_data?.ga_client_id,
        fbc: data.user_data?.fbc,
        fbp: data.user_data?.fbp,
        external_id: data.user_data?.external_id,
        
        // Dados técnicos
        client_ip_address: data.user_data?.client_ip_address,
        client_user_agent: data.user_data?.client_user_agent
      },
      custom_data: {
        // Dados de e-commerce
        currency: data.custom_data?.currency || 'BRL',
        value: data.custom_data?.value || 0,
        content_name: data.custom_data?.content_name,
        content_category: data.custom_data?.content_category,
        
        // Arrays - garantir formato correto
        content_ids: Array.isArray(data.custom_data?.content_ids) 
          ? data.custom_data.content_ids 
          : data.custom_data?.content_ids 
            ? [data.custom_data.content_ids] 
            : [],
        
        items: Array.isArray(data.custom_data?.items)
          ? data.custom_data.items
          : data.custom_data?.items
            ? [data.custom_data.items]
            : [],
        
        // Dados de página
        page_title: data.custom_data?.page_title,
        page_location: data.custom_data?.page_location,
        page_path: data.custom_data?.page_path
      },
      headers: {
        'user-agent': typeof window !== 'undefined' ? window.navigator.userAgent : undefined
      }
    };
  }

  // Gerar session ID único
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendFacebookPixelDirect(eventId: string, eventName: string, data: any): Promise<boolean> {
    // Facebook Pixel direto desativado para evitar duplicidade com GTM/Stape
    console.log(`🚫 Facebook Pixel direto desativado para ${eventName} (evitar duplicidade com GTM/Stape)`);
    return false;
  }

  private mapToFacebookEventName(internalEventName: string): string {
    const eventMapping: { [key: string]: string } = {
      'view_content': 'ViewContent',
      'initiate_checkout': 'InitiateCheckout'
    };

    return eventMapping[internalEventName] || internalEventName;
  }

  private mapToStandardEventName(internalEventName: string): string {
    const eventMapping: { [key: string]: string } = {
      'view_content': 'view_item',        // Mapeado para GA4 view_item
      'initiate_checkout': 'begin_checkout', // Mapeado para GA4 begin_checkout
      'PageView': 'page_view'
    };

    return eventMapping[internalEventName] || internalEventName;
  }

  private mapToGA4EventName(internalEventName: string): string {
    const eventMapping: { [key: string]: string } = {
      'view_content': 'view_item',
      'initiate_checkout': 'begin_checkout',
      'PageView': 'page_view'
    };

    return eventMapping[internalEventName] || internalEventName;
  }

  private prepareFacebookPixelData(data: any): any {
    const fbData: any = {};

    if (data.custom_data) {
      if (data.custom_data.value) fbData.value = data.custom_data.value;
      if (data.custom_data.currency) fbData.currency = data.custom_data.currency;
      if (data.custom_data.content_name) fbData.content_name = data.custom_data.content_name;
      if (data.custom_data.content_category) fbData.content_category = data.custom_data.content_category;
      if (data.custom_data.content_ids) fbData.content_ids = data.custom_data.content_ids;
      if (data.custom_data.num_items) fbData.num_items = data.custom_data.num_items;
      
      if (data.custom_data.items) {
        fbData.contents = data.custom_data.items.map((item: any) => ({
          id: item.item_id,
          quantity: item.quantity,
          item_price: item.price
        }));
      }
    }

    return fbData;
  }

  public async sendEvent(
    eventName: string,
    data: any
  ): Promise<{ success: boolean; eventId: string; channel: string; validation?: any; performance?: any }> {
    console.group(`🎯 EventManager - ${eventName} (canal único: ${this.config.primaryChannel})`);
    
    const startTime = Date.now();
    const monitoringId = performanceMonitor.startEventMonitoring('', eventName, this.config.primaryChannel);
    
    try {
      const eventId = this.generateEventId(eventName, this.config.primaryChannel);
      
      // Preparar evento para validação
      const eventForValidation = {
        event_name: eventName,
        event_id: eventId,
        user_data: data.user_data,
        custom_data: data.custom_data,
        timestamp: Date.now(),
        session_id: this.generateSessionId()
      };
      
      // 1. Validação rápida
      const validationStartTime = Date.now();
      const quickValidation = quickValidate(eventForValidation);
      const validationTime = Date.now() - validationStartTime;
      
      if (!quickValidation.valid) {
        console.error('❌ Validação rápida falhou:', quickValidation.criticalErrors);
        
        // Registrar performance de falha na validação
        performanceMonitor.recordEventPerformance(eventId, eventName, this.config.primaryChannel, 'failed', {
          totalProcessingTime: Date.now() - startTime,
          validationTime,
          dataQualityScore: 0,
          emqScore: 0,
          successRate: 0,
          errorRate: 100
        }, 'Validation failed');
        
        return { success: false, eventId: '', channel: '', validation: quickValidation };
      }
      
      // 2. Validação completa
      const validation = validateEvent(eventForValidation);
      if (!validation.valid) {
        console.error('❌ Validação completa falhou:', validation.errors);
        
        // Registrar performance de falha na validação
        performanceMonitor.recordEventPerformance(eventId, eventName, this.config.primaryChannel, 'failed', {
          totalProcessingTime: Date.now() - startTime,
          validationTime,
          dataQualityScore: validation.score,
          emqScore: 0,
          successRate: 0,
          errorRate: 100
        }, 'Schema validation failed');
        
        return { success: false, eventId: '', channel: '', validation };
      }
      
      // Log da qualidade dos dados
      if (validation.score < 80) {
        console.warn(`⚠️ Qualidade dos dados: ${validation.score}/100`, validation.warnings);
      } else {
        console.log(`✅ Qualidade dos dados excelente: ${validation.score}/100`);
      }
      
      // 3. Calcular EMQ Score
      const emqResult = calculateEMQScore(data.user_data || {});
      console.log(`🎯 EMQ Score calculado: ${emqResult.score.toFixed(2)}/10`, emqResult.factors);
      
      this.registerEvent(eventId, eventName, this.config.primaryChannel, data);
      
      let result = false;
      let channel = '';
      let performanceMetrics: any = {};

      // Enviar APENAS pelo canal primário configurado
      switch (this.config.primaryChannel) {
        case 'gtm':
          result = await this.sendGTM(eventId, eventName, data);
          channel = 'gtm';
          break;
        case 'server':
          result = await this.sendServerSide(eventId, eventName, data);
          channel = 'server';
          break;
        case 'fb':
          result = await this.sendFacebookPixelDirect(eventId, eventName, data);
          channel = 'fb';
          break;
        case 'gtm_server':
          result = await this.sendGTMServer(eventId, eventName, data);
          channel = 'gtm_server';
          break;
        default:
          console.error(`❌ Canal primário inválido: ${this.config.primaryChannel}`);
          
          // Registrar performance de falha
          performanceMonitor.recordEventPerformance(eventId, eventName, this.config.primaryChannel, 'failed', {
            totalProcessingTime: Date.now() - startTime,
            validationTime,
            dataQualityScore: validation.score,
            emqScore: emqResult.score,
            successRate: 0,
            errorRate: 100
          }, 'Invalid channel');
          
          return { success: false, eventId: '', channel: '', validation };
      }

      const totalProcessingTime = Date.now() - startTime;
      
      // Preparar métricas de performance
      performanceMetrics = {
        totalProcessingTime,
        validationTime,
        networkLatency: totalProcessingTime - validationTime,
        dataQualityScore: validation.score,
        emqScore: emqResult.score,
        emqFactors: emqResult.factors,
        successRate: result ? 100 : 0,
        errorRate: result ? 0 : 100,
        eventsProcessed: 1,
        eventsSuccessful: result ? 1 : 0,
        eventsFailed: result ? 0 : 1
      };

      // Registrar performance
      performanceMonitor.recordEventPerformance(
        eventId, 
        eventName, 
        channel, 
        result ? 'success' : 'failed', 
        performanceMetrics,
        result ? undefined : 'Event send failed'
      );

      console.log(`📊 Resultado do envio único: ${eventName}`, {
        success: result,
        channel,
        eventId,
        validationScore: validation.score,
        emqScore: emqResult.score.toFixed(2),
        processingTime: totalProcessingTime
      });

      return { success: result, eventId, channel, validation, performance: performanceMetrics };

    } catch (error) {
      const totalProcessingTime = Date.now() - startTime;
      console.error(`❌ Erro crítico no EventManager para ${eventName}:`, error);
      
      // Registrar performance de erro crítico
      performanceMonitor.recordEventPerformance('', eventName, this.config.primaryChannel, 'failed', {
        totalProcessingTime,
        dataQualityScore: 0,
        emqScore: 0,
        successRate: 0,
        errorRate: 100
      }, error.message);
      
      return { success: false, eventId: '', channel: '' };
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Métodos específicos para eventos essenciais APENAS
   */
  public async sendViewContent(userData: any = {}): Promise<{ success: boolean; eventId: string; channel: string }> {
    const eventData = {
      user_data: userData,
      custom_data: {
        currency: 'BRL',
        value: 39.90,
        content_name: 'E-book Sistema de Controle de Trips - Maracujá',
        content_category: 'E-book',
        content_ids: ['6080425'],
        num_items: '1'
      }
    };

    return this.sendEvent('view_content', eventData);
  }

  public async sendInitiateCheckout(userData: any = {}): Promise<{ success: boolean; eventId: string; channel: string }> {
    const eventData = {
      user_data: userData,
      custom_data: {
        currency: 'BRL',
        value: 39.90,
        content_name: 'E-book Sistema de Controle de Trips - Maracujá',
        content_category: 'E-book',
        content_ids: ['ebook-controle-trips'],
        num_items: '1',
        items: [{
          item_id: 'ebook-controle-trips',
          item_name: 'E-book Sistema de Controle de Trips',
          quantity: 1,
          price: 39.90,
          item_category: 'E-book',
          item_brand: 'Maracujá Zero Pragas',
          currency: 'BRL'
        }]
      }
    };

    return this.sendEvent('initiate_checkout', eventData);
  }

  /**
   * Métodos utilitários
   */
  public setPrimaryChannel(channel: 'gtm' | 'server' | 'fb' | 'gtm_server'): void {
    this.config.primaryChannel = channel;
    console.log(`🔧 Canal primário alterado para: ${channel}`);
  }

  public getPrimaryChannel(): string {
    return this.config.primaryChannel;
  }

  public getCacheStats(): any {
    return {
      cacheSize: this.eventCache.size,
      config: this.config
    };
  }

  public clearCache(): void {
    this.eventCache.clear();
    console.log('🧹 Cache do EventManager limpo completamente');
  }

  /**
   * Obtém métricas de performance do sistema
   */
  public getPerformanceMetrics(): any {
    return performanceMonitor.generatePerformanceReport();
  }

  /**
   * Obtém métricas em tempo real
   */
  public getRealTimeMetrics(): any {
    return performanceMonitor.getRealTimeMetrics();
  }

  /**
   * Exporta todas as métricas para análise
   */
  public exportAllMetrics(): any {
    return {
      eventManager: {
        cacheStats: this.getCacheStats(),
        config: this.config
      },
      performance: performanceMonitor.exportMetrics()
    };
  }
}

// Exportar instância única
export const eventManager = EventManager.getInstance();