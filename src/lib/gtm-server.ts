/**
 * GTM Server Integration
 * Processa eventos do GTM Web e envia para plataformas adequadas
 */

import { GTM_CONFIG } from './gtm-config';
import { hashPII } from './utils/pii-hashing';
import { validateEvent, calculateEMQ } from './schema-validator';
import { eventManager } from './eventManager';

interface GTMEvent {
  event_name: string;
  event_id: string;
  timestamp: number;
  page_location?: string;
  user_data?: {
    email?: string;
    phone?: string;
    first_name?: string;
    last_name?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  fbc?: string;
    fbp?: string;
  external_id?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    category: string;
    quantity: number;
    price: number;
  }>;
  value?: number;
  currency?: string;
}

interface ProcessingResult {
  success: boolean;
  emq_score: number;
  ga4_sent: boolean;
  meta_sent: boolean;
  errors: string[];
  warnings: string[];
}

export class GTMServerProcessor {
  private eventManager: typeof eventManager;
  private request?: any; // Para capturar cookies da requisição

  constructor(request?: any) {
    this.eventManager = eventManager;
    this.request = request;
  }

  /**
   * Captura cookies da requisição HTTP
   */
  private getCookiesFromRequest(): { fbc?: string; fbp?: string; _ga?: string } {
    if (!this.request) return {};
    
    const cookies: { fbc?: string; fbp?: string; _ga?: string } = {};
    
    // Tentar obter dos headers da requisição
    const cookieHeader = this.request.headers?.get?.('cookie') || this.request.headers?.cookie;
    if (cookieHeader) {
      const cookieArray = cookieHeader.split(';');
      for (const cookie of cookieArray) {
        const [name, value] = cookie.trim().split('=');
        if (name === '_fbc') cookies.fbc = value;
        if (name === '_fbp') cookies.fbp = value;
        if (name === '_ga') cookies._ga = value;
      }
    }
    
    console.log('🍪 GTM Server - Cookies extraídos da requisição:', cookies);
    return cookies;
  }

  /**
   * Processa evento recebido do GTM Web
   */
  async processEvent(event: GTMEvent): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      success: false,
      emq_score: 0,
      ga4_sent: false,
      meta_sent: false,
      errors: [],
      warnings: []
    };

    try {
      // 1. Capturar cookies da requisição
      const requestCookies = this.getCookiesFromRequest();
      
      // 2. Enriquecer evento com cookies da requisição (se não existirem no evento)
      const enrichedEvent = {
        ...event,
        fbc: event.fbc || requestCookies.fbc,
        fbp: event.fbp || requestCookies.fbp,
        // Adicionar timestamp se não existir
        timestamp: event.timestamp || Date.now()
      };
      
      console.log('🔧 Evento enriquecido com cookies:', {
        original_fbc: event.fbc,
        request_fbc: requestCookies.fbc,
        final_fbc: enrichedEvent.fbc,
        original_fbp: event.fbp,
        request_fbp: requestCookies.fbp,
        final_fbp: enrichedEvent.fbp
      });

      // 3. Validar evento
      const validation = validateEvent(enrichedEvent);
      if (!validation.valid) {
        result.errors.push(...validation.errors);
        return result;
      }

      // 4. Calcular EMQ Score
      const emqScore = calculateEMQ(enrichedEvent);
      result.emq_score = emqScore;

      if (emqScore < GTM_CONFIG.VALIDATION.EMQ_THRESHOLDS.MIN_SCORE) {
        result.warnings.push(`EMQ Score baixo: ${emqScore.toFixed(2)}`);
      }

      // 5. Processar PII (hashing)
      const processedEvent = await this.processPII(enrichedEvent);

      // 6. Enviar para GA4
      const ga4Result = await this.sendToGA4(processedEvent);
      result.ga4_sent = ga4Result.success;
      if (!ga4Result.success) {
        result.errors.push(`GA4 Error: ${ga4Result.error}`);
      }

      // 7. Enviar para Meta
      const metaResult = await this.sendToMeta(processedEvent);
      result.meta_sent = metaResult.success;
      if (!metaResult.success) {
        result.errors.push(`Meta Error: ${metaResult.error}`);
      }

      // 8. Log via EventManager
      await this.eventManager.sendEvent('gtm_server_processed', {
        user_data: {},
        custom_data: {
          event_name: enrichedEvent.event_name,
          event_id: enrichedEvent.event_id,
          emq_score: emqScore,
          ga4_sent: result.ga4_sent,
          meta_sent: result.meta_sent,
          processing_time: Date.now()
        }
      });

      result.success = result.ga4_sent || result.meta_sent;

    } catch (error) {
      result.errors.push(`Processing Error: ${error.message}`);
      
      await this.eventManager.sendEvent('gtm_server_error', {
        user_data: {},
        custom_data: {
          event_name: event.event_name,
          event_id: event.event_id,
          error: error.message
        }
      });
    }

    return result;
  }

  /**
   * Processa PII com hashing
   */
  private async processPII(event: GTMEvent): Promise<GTMEvent> {
    if (!GTM_CONFIG.PII_HASHING.ENABLED || !event.user_data) {
      return event;
    }

    const processedEvent = { ...event };
    const { user_data } = processedEvent;

    // Hash de campos PII
    if (user_data.email) {
      user_data.email = await hashPII(user_data.email);
    }
    if (user_data.phone) {
      user_data.phone = await hashPII(user_data.phone);
    }
    if (user_data.first_name) {
      user_data.first_name = await hashPII(user_data.first_name);
    }
    if (user_data.last_name) {
      user_data.last_name = await hashPII(user_data.last_name);
    }

    return processedEvent;
  }

  /**
   * Envia evento para GA4
   */
  private async sendToGA4(event: GTMEvent): Promise<{ success: boolean; error?: string }> {
    try {
      const mapping = GTM_CONFIG.EVENT_MAPPINGS[event.event_name as keyof typeof GTM_CONFIG.EVENT_MAPPINGS];
      if (!mapping) {
        return { success: false, error: 'No GA4 mapping found' };
      }

      const payload = {
        client_id: event.fbp || 'unknown',
        user_id: event.external_id,
        timestamp_micros: event.timestamp * 1000,
        non_personalized_ads: false,
        events: [{
          name: mapping.ga4,
          params: {
            event_id: event.event_id,
            page_location: event.page_location,
            items: event.items || [this.getDefaultItem()],
            value: event.value || GTM_CONFIG.PRODUCT.PRICE,
            currency: event.currency || GTM_CONFIG.PRODUCT.CURRENCY,
            // User Properties
            user_properties: event.user_data ? {
              email: event.user_data.email,
              first_name: event.user_data.first_name,
              last_name: event.user_data.last_name,
              phone: event.user_data.phone
            } : undefined,
            // UTM Parameters
            utm_source: event.utm_source,
            utm_medium: event.utm_medium,
            utm_campaign: event.utm_campaign,
            utm_content: event.utm_content,
            utm_term: event.utm_term
          }
        }]
      };

      const response = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${GTM_CONFIG.GA4.MEASUREMENT_ID}&api_secret=${GTM_CONFIG.GA4.API_SECRET}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`GA4 API Error: ${response.status} ${response.statusText}`);
      }

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Envia evento para Meta Conversions API
   */
  private async sendToMeta(event: GTMEvent): Promise<{ success: boolean; error?: string }> {
    try {
      const mapping = GTM_CONFIG.EVENT_MAPPINGS[event.event_name as keyof typeof GTM_CONFIG.EVENT_MAPPINGS];
      if (!mapping) {
        return { success: false, error: 'No Meta mapping found' };
      }

      const payload = {
        event_name: mapping.meta,
        event_time: Math.floor(event.timestamp / 1000),
        event_source_url: event.page_location,
        action_source: 'website',
        event_id: event.event_id,
        user_data: {
          em: event.user_data?.email,
          ph: event.user_data?.phone,
          fn: event.user_data?.first_name,
          ln: event.user_data?.last_name,
          ct: event.user_data?.city,
          st: event.user_data?.state,
          zp: event.user_data?.zip,
          country: event.user_data?.country,
          fbc: event.fbc,
          fbp: event.fbp,
          external_id: event.external_id
        },
        custom_data: {
          content_name: GTM_CONFIG.PRODUCT.NAME,
          content_category: GTM_CONFIG.PRODUCT.CATEGORY,
          content_ids: [GTM_CONFIG.PRODUCT.ID],
          content_type: 'product',
          value: event.value || GTM_CONFIG.PRODUCT.PRICE,
          currency: event.currency || GTM_CONFIG.PRODUCT.CURRENCY,
          ...(event.event_name === 'initiate_checkout' && { num_items: 1 })
        },
        test_event_code: GTM_CONFIG.META.TEST_EVENT_CODE
      };

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${GTM_CONFIG.META.PIXEL_ID}/events?access_token=${GTM_CONFIG.META.ACCESS_TOKEN}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: [payload] })
        }
      );

      const responseData = await response.json();

      if (!response.ok || responseData.error) {
        throw new Error(`Meta API Error: ${responseData.error?.message || response.statusText}`);
      }

      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Retorna item padrão do produto
   */
  private getDefaultItem() {
    return {
      item_id: GTM_CONFIG.PRODUCT.ID,
      item_name: GTM_CONFIG.PRODUCT.NAME,
      category: GTM_CONFIG.PRODUCT.CATEGORY,
      quantity: 1,
      price: GTM_CONFIG.PRODUCT.PRICE
    };
  }
}

export default GTMServerProcessor;