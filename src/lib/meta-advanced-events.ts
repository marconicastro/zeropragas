/**
 * Eventos Avançados para Meta Business Suite
 * Sistema completo de rastreamento com dados enriquecidos
 */

import { MetaEnhancedMatching } from './meta-enhanced-matching';
import { FacebookUTMParser } from './facebook-utm-parser';

interface AdvancedEventParams {
  eventName: string;
  value?: number;
  currency?: string;
  content_name?: string;
  content_ids?: string[];
  content_type?: string;
  user_data?: any;
  custom_data?: any;
  event_source_url?: string;
  action_source?: string;
  user_agent?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  fbc?: string; // Facebook click ID
  fbp?: string; // Facebook browser ID
}

export class MetaAdvancedEvents {
  /**
   * Gera fbc (Facebook Click ID) a partir dos parâmetros da URL
   */
  static generateFBC(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    const fbclid = urlParams.get('fbclid');
    
    if (fbclid) {
      const timestamp = Date.now();
      return `fb.1.${timestamp}.${fbclid}`;
    }
    
    return null;
  }

  /**
   * Gera fbp (Facebook Browser ID) se não existir
   */
  static generateFBP(): string {
    let fbp = this.getCookie('_fbp');
    
    if (!fbp) {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substr(2, 9);
      fbp = `fb.1.${timestamp}.${random}`;
      this.setCookie('_fbp', fbp, 365);
    }
    
    return fbp;
  }

  /**
   * Helper functions para cookies
   */
  static getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  static setCookie(name: string, value: string, days: number) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
  }

  /**
   * Evento ViewContent SUPER Avançado
   */
  static async fireViewContentAdvanced(data: any) {
    // Extrair UTMs do Facebook
    const facebookUTMs = FacebookUTMParser.parseFacebookUTMs(window.location.href);
    const metaEventData = facebookUTMs ? FacebookUTMParser.extractMetaEventData(facebookUTMs) : {};

    const enhancedData = MetaEnhancedMatching.combineData(data, {
      url: window.location.href
    });

    const eventParams: AdvancedEventParams = {
      eventName: 'ViewContent',
      value: data.value || 39.90,
      currency: data.currency || 'BRL',
      content_name: data.content_name || 'Sistema 4 Fases - Ebook Trips',
      content_ids: data.content_ids || ['339591'],
      content_type: data.content_type || 'product',
      event_source_url: window.location.href,
      action_source: 'website',
      user_agent: navigator.userAgent,
      fbc: this.generateFBC(),
      fbp: this.generateFBP(),
      user_data: enhancedData,
      custom_data: {
        ...data.custom_data,
        // 🎯 DADOS DO FACEBOOK ADS
        campaign_name: metaEventData.campaign_name || 'unknown',
        campaign_id: metaEventData.campaign_id || 'unknown',
        adset_name: metaEventData.adset_name || 'unknown',
        adset_id: metaEventData.adset_id || 'unknown',
        ad_name: metaEventData.ad_name || 'unknown',
        ad_id: metaEventData.ad_id || 'unknown',
        placement: metaEventData.placement || 'unknown',
        campaign_type: metaEventData.campaign_type || 'unknown',
        ad_format: metaEventData.ad_format || 'unknown',
        targeting_type: metaEventData.targeting_type || 'unknown',
        audience_segment: metaEventData.audience_segment || 'general',
        creative_type: metaEventData.creative_type || 'standard',
        objective_type: metaEventData.objective_type || 'awareness',
        
        // Dados complementares
        page_language: 'pt-BR',
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        operating_system: this.getOS(),
        time_on_page: data.time_on_page || 0,
        scroll_depth: data.scroll_depth || 0,
        trigger_type: data.trigger_type || 'manual',
        utm_source: new URLSearchParams(window.location.search).get('utm_source') || 'direct',
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || 'none',
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || 'none',
        content_category: 'digital_product',
        product_availability: 'in_stock',
        condition: 'new',
        delivery_category: 'digital_download'
      }
    };

    // Enviar via browser (Pixel)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'ViewContent', {
        value: eventParams.value,
        currency: eventParams.currency,
        content_name: eventParams.content_name,
        content_ids: eventParams.content_ids,
        content_type: eventParams.content_type,
        user_data: enhancedData
      });
    }

    // Enviar via server (Conversions API)
    await this.sendServerEvent(eventParams);
  }

  /**
   * Evento InitiateCheckout SUPER Avançado
   */
  static async fireInitiateCheckoutAdvanced(data: any) {
    const enhancedData = MetaEnhancedMatching.combineData(data, {
      url: window.location.href
    });

    const eventParams: AdvancedEventParams = {
      eventName: 'InitiateCheckout',
      value: data.value || 39.90,
      currency: data.currency || 'BRL',
      content_name: data.content_name || 'Sistema 4 Fases - Ebook Trips',
      content_ids: data.content_ids || ['339591'],
      content_type: data.content_type || 'product',
      event_source_url: window.location.href,
      action_source: 'website',
      user_agent: navigator.userAgent,
      fbc: this.generateFBC(),
      fbp: this.generateFBP(),
      user_data: enhancedData,
      custom_data: {
        ...data.custom_data,
        checkout_step: 1,
        payment_method_available: ['credit_card', 'pix'],
        num_items: 1,
        delivery_type: 'digital',
        order_type: 'online_purchase',
        page_language: 'pt-BR',
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        operating_system: this.getOS(),
        utm_source: new URLSearchParams(window.location.search).get('utm_source') || 'direct',
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || 'none',
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || 'none',
        content_category: 'digital_product',
        product_availability: 'in_stock',
        condition: 'new'
      }
    };

    // Enviar via browser (Pixel)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'InitiateCheckout', {
        value: eventParams.value,
        currency: eventParams.currency,
        content_name: eventParams.content_name,
        content_ids: eventParams.content_ids,
        content_type: eventParams.content_type,
        user_data: enhancedData
      });
    }

    // Enviar via server (Conversions API)
    await this.sendServerEvent(eventParams);
  }

  /**
   * Evento Lead SUPER Avançado
   */
  static async fireLeadAdvanced(data: any) {
    const enhancedData = MetaEnhancedMatching.combineData(data, {
      url: window.location.href
    });

    const eventParams: AdvancedEventParams = {
      eventName: 'Lead',
      value: data.value || 15.00,
      currency: data.currency || 'BRL',
      content_name: data.content_name || 'Lead - Sistema 4 Fases',
      content_category: 'lead_generation',
      event_source_url: window.location.href,
      action_source: 'website',
      user_agent: navigator.userAgent,
      fbc: this.generateFBC(),
      fbp: this.generateFBP(),
      user_data: enhancedData,
      custom_data: {
        ...data.custom_data,
        lead_type: 'form_submission',
        form_name: 'pre_checkout_form',
        page_language: 'pt-BR',
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        operating_system: this.getOS(),
        utm_source: new URLSearchParams(window.location.search).get('utm_source') || 'direct',
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || 'none',
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || 'none',
        content_category: 'potential_customer'
      }
    };

    // Enviar via browser (Pixel)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Lead', {
        value: eventParams.value,
        currency: eventParams.currency,
        content_name: eventParams.content_name,
        user_data: enhancedData
      });
    }

    // Enviar via server (Conversions API)
    await this.sendServerEvent(eventParams);
  }

  /**
   * Evento Purchase (para pós-venda)
   */
  static async firePurchaseAdvanced(data: any) {
    const enhancedData = MetaEnhancedMatching.combineData(data, {
      url: window.location.href
    });

    const eventParams: AdvancedEventParams = {
      eventName: 'Purchase',
      value: data.value || 39.90,
      currency: data.currency || 'BRL',
      content_name: data.content_name || 'Sistema 4 Fases - Ebook Trips',
      content_ids: data.content_ids || ['339591'],
      content_type: data.content_type || 'product',
      event_source_url: window.location.href,
      action_source: 'website',
      user_agent: navigator.userAgent,
      fbc: this.generateFBC(),
      fbp: this.generateFBP(),
      user_data: enhancedData,
      custom_data: {
        ...data.custom_data,
        order_id: data.order_id,
        transaction_id: data.transaction_id,
        payment_method: data.payment_method,
        delivery_type: 'digital_download',
        num_items: 1,
        page_language: 'pt-BR',
        device_type: this.getDeviceType(),
        browser: this.getBrowser(),
        operating_system: this.getOS(),
        utm_source: new URLSearchParams(window.location.search).get('utm_source') || 'direct',
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || 'none',
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || 'none',
        content_category: 'digital_product',
        product_availability: 'in_stock',
        condition: 'new'
      }
    };

    // Enviar via browser (Pixel)
    if (typeof window !== 'undefined' && window.fbq) {
      window.fbq('track', 'Purchase', {
        value: eventParams.value,
        currency: eventParams.currency,
        content_name: eventParams.content_name,
        content_ids: eventParams.content_ids,
        content_type: eventParams.content_type,
        user_data: enhancedData
      });
    }

    // Enviar via server (Conversions API)
    await this.sendServerEvent(eventParams);
  }

  /**
   * Envia eventos via Conversions API (Server-side)
   */
  static async sendServerEvent(eventParams: AdvancedEventParams) {
    try {
      const response = await fetch('/api/meta-conversions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventParams)
      });

      if (!response.ok) {
        console.error('Erro ao enviar evento para Conversions API:', response.statusText);
      } else {
        console.log('✅ Evento enviado via Conversions API:', eventParams.eventName);
      }
    } catch (error) {
      console.error('Erro ao enviar evento server-side:', error);
    }
  }

  /**
   * Device detection
   */
  static getDeviceType(): string {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  static getBrowser(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';
    return 'unknown';
  }

  static getOS(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Windows')) return 'windows';
    if (userAgent.includes('Mac')) return 'macos';
    if (userAgent.includes('Linux')) return 'linux';
    if (userAgent.includes('Android')) return 'android';
    if (userAgent.includes('iOS')) return 'ios';
    return 'unknown';
  }
}