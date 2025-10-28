// 🎯 SISTEMA PRÓPRIO DE GERENCIAMENTO UTM v2.0 - COM SUPORTE E-COMMERCE
// ✅ 100% Conforme LGPD • ✅ Performance Otimizada • ✅ Controle Total
// ✅ Suporte completo para parâmetros de checkout e e-commerce

interface UTMData {
  // UTMs padrão
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  
  // Parâmetros de afiliados
  xcod?: string;
  sck?: string;
  subid?: string;
  afid?: string;
  click_id?: string;
  
  // Parâmetros personalizados
  src?: string;
  s1?: string;
  s2?: string;
  s3?: string;
  
  // 🆕 Parâmetros de E-commerce e Checkout
  session_id?: string;
  event_id?: string;
  product_id?: string;
  value?: string;
  currency?: string;
  source?: string;
  campaign?: string;
  success_url?: string;
  cancel_url?: string;
  coupon?: string;
  discount?: string;
  payment_method?: string;
  installment?: string;
  
  // 🆕 Parâmetros de rastreamento avançado
  fbclid?: string;
  gclid?: string;
  ttclid?: string;
  dclid?: string;
  ref?: string;
  utm_referrer?: string;
}

interface TrackingConfig {
  cookieDays: number;
  localStorageKey: string;
  cookiePrefix: string;
  preventSubIds: boolean;
  preventXcodSck: boolean;
  enableEcommerceParams: boolean;
  enableAdvancedTracking: boolean;
  secureUrlParams: string[];
}

interface CheckoutData {
  session_id: string;
  event_id: string;
  product_id: string;
  value: string;
  currency: string;
  source: string;
  campaign: string;
  success_url: string;
  cancel_url: string;
  utm_data?: Partial<UTMData>;
}

class UTMManagerV2 {
  private config: TrackingConfig;
  private currentUTMs: UTMData = {};
  private checkoutData: CheckoutData | null = null;

  constructor(config: Partial<TrackingConfig> = {}) {
    this.config = {
      cookieDays: 30,
      localStorageKey: 'maracuja_utm_data_v2',
      cookiePrefix: 'maracuja_utm_',
      preventSubIds: true,
      preventXcodSck: true,
      enableEcommerceParams: true,
      enableAdvancedTracking: true,
      secureUrlParams: ['session_id', 'event_id', 'success_url', 'cancel_url'],
      ...config
    };

    this.init();
  }

  /**
   * Inicializa o sistema UTM v2.0
   */
  private init(): void {
    if (typeof window === 'undefined') return;

    // Capturar todos os parâmetros da URL atual
    this.captureFromURL();
    
    // Recuperar dados salvos
    this.loadFromStorage();
    
    // Mesclar dados (URL > Storage > Novos)
    this.mergeUTMData();
    
    // Extrair dados de checkout se presentes
    this.extractCheckoutData();
    
    // Salvar dados atualizados
    this.saveToStorage();
    
    console.log('🎯 UTM Manager v2.0 inicializado:', {
      utms: this.currentUTMs,
      checkout: this.checkoutData,
      hasEcommerce: this.hasEcommerceData(),
      hasCheckout: this.hasCheckoutData()
    });
  }

  /**
   * Captura todos os parâmetros relevantes da URL atual
   */
  private captureFromURL(): void {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Parâmetros UTM padrão
    const utmParams: UTMData = {};
    
    // UTMs oficiais
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(param => {
      const value = urlParams.get(param);
      if (value) {
        utmParams[param as keyof UTMData] = value;
      }
    });

    // Parâmetros de afiliados (configurável)
    if (!this.config.preventXcodSck) {
      const xcod = urlParams.get('xcod');
      const sck = urlParams.get('sck');
      if (xcod) utmParams.xcod = xcod;
      if (sck) utmParams.sck = sck;
    }

    // SubIDs (configurável)
    if (!this.config.preventSubIds) {
      const subid = urlParams.get('subid');
      if (subid) utmParams.subid = subid;
    }

    // Outros parâmetros comuns
    ['afid', 'click_id', 'src', 's1', 's2', 's3'].forEach(param => {
      const value = urlParams.get(param);
      if (value) {
        utmParams[param as keyof UTMData] = value;
      }
    });

    // 🆕 Parâmetros de E-commerce e Checkout
    if (this.config.enableEcommerceParams) {
      const ecommerceParams = [
        'session_id', 'event_id', 'product_id', 'value', 'currency',
        'source', 'campaign', 'success_url', 'cancel_url',
        'coupon', 'discount', 'payment_method', 'installment'
      ];
      
      ecommerceParams.forEach(param => {
        const value = urlParams.get(param);
        if (value) {
          utmParams[param as keyof UTMData] = value;
        }
      });
    }

    // 🆕 Parâmetros de rastreamento avançado
    if (this.config.enableAdvancedTracking) {
      const trackingParams = ['fbclid', 'gclid', 'ttclid', 'dclid', 'ref', 'utm_referrer'];
      
      trackingParams.forEach(param => {
        const value = urlParams.get(param);
        if (value) {
          utmParams[param as keyof UTMData] = value;
        }
      });
    }

    this.currentUTMs = utmParams;
  }

  /**
   * Extrai dados de checkout dos parâmetros atuais
   */
  private extractCheckoutData(): void {
    const requiredParams = ['session_id', 'event_id', 'product_id', 'value', 'currency'];
    const hasAllRequired = requiredParams.every(param => this.currentUTMs[param as keyof UTMData]);
    
    if (hasAllRequired) {
      this.checkoutData = {
        session_id: this.currentUTMs.session_id!,
        event_id: this.currentUTMs.event_id!,
        product_id: this.currentUTMs.product_id!,
        value: this.currentUTMs.value!,
        currency: this.currentUTMs.currency!,
        source: this.currentUTMs.source || 'unknown',
        campaign: this.currentUTMs.campaign || 'unknown',
        success_url: this.currentUTMs.success_url || '',
        cancel_url: this.currentUTMs.cancel_url || '',
        utm_data: this.getPrimary()
      };
      
      console.log('🛒 Dados de checkout extraídos:', this.checkoutData);
    }
  }

  /**
   * Carrega UTMs do storage
   */
  private loadFromStorage(): UTMData {
    try {
      // Tentar localStorage primeiro
      const stored = localStorage.getItem(this.config.localStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.utms || parsed;
      }

      // Fallback para cookies
      const cookies = this.getCookies();
      return cookies;
    } catch (error) {
      console.warn('⚠️ Erro ao carregar UTMs do storage:', error);
      return {};
    }
  }

  /**
   * Mescla dados da URL com dados salvos
   */
  private mergeUTMData(): void {
    const stored = this.loadFromStorage();
    
    // Dados da URL têm prioridade
    this.currentUTMs = { ...stored, ...this.currentUTMs };
  }

  /**
   * Salva UTMs no storage
   */
  private saveToStorage(): void {
    try {
      const dataToSave = {
        utms: this.currentUTMs,
        checkout: this.checkoutData,
        timestamp: new Date().toISOString(),
        version: '2.0'
      };
      
      // Salvar no localStorage
      localStorage.setItem(this.config.localStorageKey, JSON.stringify(dataToSave));
      
      // Salvar nos cookies (backup)
      this.saveToCookies();
      
      console.log('💾 UTMs v2.0 salvos no storage:', dataToSave);
    } catch (error) {
      console.warn('⚠️ Erro ao salvar UTMs no storage:', error);
    }
  }

  /**
   * Salva UTMs nos cookies
   */
  private saveToCookies(): void {
    const expires = new Date();
    expires.setDate(expires.getDate() + this.config.cookieDays);

    Object.entries(this.currentUTMs).forEach(([key, value]) => {
      if (value && !this.config.secureUrlParams.includes(key)) {
        document.cookie = `${this.config.cookiePrefix}${key}=${value}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
      }
    });
  }

  /**
   * Recupera UTMs dos cookies
   */
  private getCookies(): UTMData {
    const cookies: UTMData = {};
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    cookieArray.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name.startsWith(this.config.cookiePrefix)) {
        const key = name.replace(this.config.cookiePrefix, '');
        cookies[key as keyof UTMData] = value;
      }
    });

    return cookies;
  }

  /**
   * Retorna todos os UTMs atuais
   */
  public getAll(): UTMData {
    return { ...this.currentUTMs };
  }

  /**
   * Retorna um UTM específico
   */
  public get(key: keyof UTMData): string | undefined {
    return this.currentUTMs[key];
  }

  /**
   * Define um UTM manualmente
   */
  public set(key: keyof UTMData, value: string): void {
    this.currentUTMs[key] = value;
    this.extractCheckoutData(); // Re-extrair dados de checkout se necessário
    this.saveToStorage();
  }

  /**
   * Limpa todos os UTMs
   */
  public clear(): void {
    this.currentUTMs = {};
    this.checkoutData = null;
    localStorage.removeItem(this.config.localStorageKey);
    
    // Limpar cookies
    Object.keys(this.getCookies()).forEach(key => {
      document.cookie = `${this.config.cookiePrefix}${key}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    console.log('🧹 UTMs v2.0 limpos');
  }

  /**
   * Verifica se há dados de e-commerce
   */
  public hasEcommerceData(): boolean {
    const ecommerceParams = ['product_id', 'value', 'currency', 'session_id'];
    return ecommerceParams.some(param => !!this.currentUTMs[param as keyof UTMData]);
  }

  /**
   * Verifica se há dados de checkout completos
   */
  public hasCheckoutData(): boolean {
    return this.checkoutData !== null;
  }

  /**
   * Retorna dados de checkout se disponíveis
   */
  public getCheckoutData(): CheckoutData | null {
    return this.checkoutData;
  }

  /**
   * Gera string de parâmetros UTM para URL (apenas parâmetros seguros)
   */
  public toURLString(includeSecure: boolean = false): string {
    const params = new URLSearchParams();
    
    Object.entries(this.currentUTMs).forEach(([key, value]) => {
      if (value) {
        // Incluir parâmetros seguros apenas se solicitado
        if (!this.config.secureUrlParams.includes(key) || includeSecure) {
          params.append(key, value);
        }
      }
    });

    return params.toString();
  }

  /**
   * Adiciona UTMs a uma URL
   */
  public addToURL(baseURL: string, includeSecure: boolean = false): string {
    const utmString = this.toURLString(includeSecure);
    
    if (!utmString) return baseURL;
    
    const separator = baseURL.includes('?') ? '&' : '?';
    return `${baseURL}${separator}${utmString}`;
  }

  /**
   * Gera objeto para Meta Pixel com dados enriquecidos
   */
  public toMetaPixelData(): any {
    const data: any = {};
    
    // UTMs padrão
    if (this.currentUTMs.utm_source) data.content_category = this.currentUTMs.utm_source;
    if (this.currentUTMs.utm_campaign) data.content_name = this.currentUTMs.utm_campaign;
    
    // Dados de e-commerce
    if (this.currentUTMs.product_id) data.content_ids = [this.currentUTMs.product_id];
    if (this.currentUTMs.value) data.value = parseFloat(this.currentUTMs.value);
    if (this.currentUTMs.currency) data.currency = this.currentUTMs.currency;
    
    // IDs de rastreamento
    if (this.currentUTMs.event_id) data.event_id = this.currentUTMs.event_id;
    if (this.currentUTMs.session_id) data.session_id = this.currentUTMs.session_id;
    
    return data;
  }

  /**
   * Verifica se há UTMs ativos
   */
  public hasUTMs(): boolean {
    return Object.keys(this.currentUTMs).length > 0;
  }

  /**
   * Retorna os UTMs mais importantes
   */
  public getPrimary(): Partial<UTMData> {
    const primary: Partial<UTMData> = {};
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'xcod', 'sck', 'source', 'campaign'].forEach(key => {
      const value = this.currentUTMs[key as keyof UTMData];
      if (value) {
        primary[key as keyof UTMData] = value;
      }
    });

    return primary;
  }

  /**
   * Retorna apenas parâmetros de e-commerce
   */
  public getEcommerceData(): Partial<UTMData> {
    const ecommerce: Partial<UTMData> = {};
    
    ['product_id', 'value', 'currency', 'session_id', 'event_id', 'coupon', 'discount'].forEach(key => {
      const value = this.currentUTMs[key as keyof UTMData];
      if (value) {
        ecommerce[key as keyof UTMData] = value;
      }
    });

    return ecommerce;
  }

  /**
   * Processa uma URL de checkout e extrai informações
   */
  public processCheckoutURL(url: string): CheckoutData | null {
    try {
      const urlObj = new URL(url);
      const params = new URLSearchParams(urlObj.search);
      
      const requiredParams = ['session_id', 'event_id', 'product_id', 'value', 'currency'];
      const hasAllRequired = requiredParams.every(param => params.has(param));
      
      if (!hasAllRequired) {
        console.warn('⚠️ URL de checkout incompleta:', url);
        return null;
      }
      
      const checkoutData: CheckoutData = {
        session_id: params.get('session_id')!,
        event_id: params.get('event_id')!,
        product_id: params.get('product_id')!,
        value: params.get('value')!,
        currency: params.get('currency')!,
        source: params.get('source') || 'unknown',
        campaign: params.get('campaign') || 'unknown',
        success_url: params.get('success_url') || '',
        cancel_url: params.get('cancel_url') || '',
        utm_data: this.getPrimary()
      };
      
      console.log('🛒 URL de checkout processada:', checkoutData);
      return checkoutData;
      
    } catch (error) {
      console.error('❌ Erro ao processar URL de checkout:', error);
      return null;
    }
  }

  /**
   * Exporta dados para análise
   */
  public export(): string {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      version: '2.0',
      utms: this.currentUTMs,
      checkout: this.checkoutData,
      hasEcommerce: this.hasEcommerceData(),
      hasCheckout: this.hasCheckoutData(),
      primary: this.getPrimary(),
      ecommerce: this.getEcommerceData(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }, null, 2);
  }
}

// Instância global
let utmManagerV2: UTMManagerV2 | null = null;

/**
 * Inicializa o gerenciador UTM v2.0
 */
export function initUTMManagerV2(config?: Partial<TrackingConfig>): UTMManagerV2 {
  if (typeof window === 'undefined') {
    console.warn('⚠️ UTM Manager v2.0 não disponível no servidor');
    return {} as UTMManagerV2;
  }

  if (!utmManagerV2) {
    utmManagerV2 = new UTMManagerV2(config);
  }

  return utmManagerV2;
}

/**
 * Retorna a instância do UTM Manager v2.0
 */
export function getUTMManagerV2(): UTMManagerV2 | null {
  return utmManagerV2;
}

export default UTMManagerV2;