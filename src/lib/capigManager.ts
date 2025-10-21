// 🚀 CAPIG Stape Integration - Enhanced Event Manager
// Implementação otimizada para o projeto Maracujá Zero Pragas

interface CAPIGEvent {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url: string;
  action_source: string;
  user_data: {
    client_ip_address?: string;
    client_user_agent?: string;
    em?: string;
    ph?: string;
    fn?: string;
    ln?: string;
    ct?: string;
    st?: string;
    zp?: string;
    country?: string;
    fbc?: string;
    fbp?: string;
    external_id?: string;
  };
  custom_data?: {
    currency?: string;
    value?: number;
    content_name?: string;
    content_category?: string;
    content_ids?: string[];
    content_type?: string;
    num_items?: number;
    items?: Array<{
      id: string;
      quantity: number;
      item_price: number;
    }>;
    page_title?: string;
    page_location?: string;
    page_path?: string;
  };
}

class CAPIGManager {
  private static instance: CAPIGManager;
  private readonly CAPIG_ENDPOINT = 'https://eventos.maracujazeropragas.com';
  private readonly ACCESS_TOKEN = 'EAAUsqHMv8GcBPlCK8fZCCwQzeWZCHF7ahXf6ZC98FcbiHFdFTykqE58YUksFpe7kAFkUzimeH178A3cZCng1Y8HafbNFKw12h0UeUKzJ4EL2CkHln15yZBoFf2PuMBEJNKXvAKJn8iyuk3AdelxYYpAyKtVjfoEIK3uWFwHrqwds6M1jIE7CCObThayaV8gZDZD';
  private readonly PIXEL_ID = '714277868320104';

  private constructor() {
    console.log('🎯 CAPIG Manager inicializado');
  }

  public static getInstance(): CAPIGManager {
    if (!CAPIGManager.instance) {
      CAPIGManager.instance = new CAPIGManager();
    }
    return CAPIGManager.instance;
  }

  /**
   * Gera Event ID único para deduplicação
   */
  private generateEventId(eventName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `${eventName}_${timestamp}_${random}`;
  }

  /**
   * Prepara dados do usuário para CAPIG
   */
  private prepareUserData(userData: any): CAPIGEvent['user_data'] {
    return {
      client_ip_address: userData.ip || '',
      client_user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : '',
      em: userData.em || userData.email || '',
      ph: userData.ph || userData.phone || '',
      fn: userData.fn || userData.firstName || '',
      ln: userData.ln || userData.lastName || '',
      ct: userData.ct || userData.city || '',
      st: userData.st || userData.state || '',
      zp: userData.zp || userData.zip || '',
      country: userData.country || 'BR',
      fbc: userData.fbc || '',
      fbp: userData.fbp || '',
      external_id: userData.external_id || ''
    };
  }

  /**
   * Envia evento para CAPIG Stape
   */
  private async sendToCAPIG(event: CAPIGEvent): Promise<boolean> {
    try {
      const payload = {
        data: [event],
        access_token: this.ACCESS_TOKEN
      };

      console.log('📤 Enviando evento para CAPIG:', {
        event_name: event.event_name,
        event_id: event.event_id,
        has_user_data: !!event.user_data,
        has_custom_data: !!event.custom_data
      });

      const response = await fetch(this.CAPIG_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Evento enviado com sucesso para CAPIG:', result);
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Erro ao enviar evento para CAPIG:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Falha na requisição CAPIG:', error);
      return false;
    }
  }

  /**
   * Envia evento para Facebook Pixel (client-side)
   */
  private sendToPixel(eventName: string, customData: any, eventId: string): void {
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        // Mapear nomes de eventos
        const fbEventName = this.mapToFacebookEventName(eventName);
        
        window.fbq('track', fbEventName, customData, { eventID: eventId });
        console.log('✅ Evento enviado via Facebook Pixel:', fbEventName);
      } catch (error) {
        console.error('❌ Erro ao enviar evento para Facebook Pixel:', error);
      }
    } else {
      console.log('📤 Facebook Pixel não disponível');
    }
  }

  /**
   * Mapeia nomes de eventos internos para Facebook Pixel
   */
  private mapToFacebookEventName(internalEventName: string): string {
    const eventMapping: { [key: string]: string } = {
      'page_view': 'PageView',
      'view_content': 'ViewContent',
      'initiate_checkout': 'InitiateCheckout',
      'purchase': 'Purchase',
      'add_to_cart': 'AddToCart'
    };
    return eventMapping[internalEventName] || internalEventName;
  }

  /**
   * Envia evento dual (Pixel + CAPIG)
   */
  public async sendDualEvent(
    eventName: string,
    userData: any = {},
    customData: any = {}
  ): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const eventId = this.generateEventId(eventName);
    const channels: string[] = [];
    const results: boolean[] = [];

    console.group(`🎯 CAPIG Manager - ${eventName}`);

    try {
      // Preparar dados do usuário
      const preparedUserData = this.prepareUserData(userData);

      // Preparar dados completos do evento
      const event: CAPIGEvent = {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: typeof window !== 'undefined' ? window.location.href : '',
        action_source: 'website',
        user_data: preparedUserData,
        custom_data: customData
      };

      // 1. Enviar para Facebook Pixel (client-side)
      this.sendToPixel(eventName, { ...customData, ...preparedUserData }, eventId);
      channels.push('pixel');

      // 2. Enviar para CAPIG (server-side)
      const capigResult = await this.sendToCAPIG(event);
      if (capigResult) {
        channels.push('capig');
        results.push(true);
      } else {
        results.push(false);
      }

      const success = results.some(result => result);

      console.log('📊 Resultado do envio dual:', {
        success,
        channels,
        eventId,
        totalAttempts: results.length,
        successfulAttempts: results.filter(r => r).length
      });

      return { success, eventId, channels };

    } catch (error) {
      console.error('❌ Erro crítico no CAPIG Manager:', error);
      return { success: false, eventId, channels };
    } finally {
      console.groupEnd();
    }
  }

  /**
   * Métodos específicos para eventos
   */
  public async sendPageView(userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const customData = {
      page_title: typeof document !== 'undefined' ? document.title : '',
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      page_path: typeof window !== 'undefined' ? window.location.pathname : ''
    };

    return this.sendDualEvent('page_view', userData, customData);
  }

  public async sendViewContent(userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const customData = {
      currency: 'BRL',
      value: 39.90,
      content_name: 'E-book Sistema de Controle de Trips',
      content_category: 'E-book',
      content_ids: ['6080425'],
      content_type: 'product',
      num_items: 1,
      items: [{
        id: '6080425',
        quantity: 1,
        item_price: 39.90
      }]
    };

    return this.sendDualEvent('view_content', userData, customData);
  }

  public async sendInitiateCheckout(userData: any = {}): Promise<{ success: boolean; eventId: string; channels: string[] }> {
    const customData = {
      currency: 'BRL',
      value: 39.90,
      content_name: 'E-book Sistema de Controle de Trips',
      content_category: 'E-book',
      content_ids: ['ebook-controle-trips'],
      content_type: 'product',
      num_items: 1,
      items: [{
        id: 'ebook-controle-trips',
        quantity: 1,
        item_price: 39.90
      }]
    };

    return this.sendDualEvent('initiate_checkout', userData, customData);
  }

  /**
   * Health check do endpoint CAPIG
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.CAPIG_ENDPOINT, {
        method: 'HEAD',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return response.ok;
    } catch (error) {
      console.error('❌ Health check CAPIG falhou:', error);
      return false;
    }
  }

  /**
   * Obtém estatísticas do CAPIG Manager
   */
  public getStats(): any {
    return {
      endpoint: this.CAPIG_ENDPOINT,
      pixel_id: this.PIXEL_ID,
      timestamp: new Date().toISOString(),
      status: 'active'
    };
  }
}

// Exportar instância singleton
export const capigManager = CAPIGManager.getInstance();

// Expor globalmente para debugging
if (typeof window !== 'undefined') {
  window.capigManager = capigManager;
}

export default capigManager;