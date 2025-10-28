// 🎯 Hook React para UTMs v2.0 - Suporte completo para E-commerce
'use client';

import { useEffect, useState } from 'react';
import { initUTMManagerV2, getUTMManagerV2, UTMData, CheckoutData } from '@/lib/utm-manager-v2';

interface UseUTMV2Return {
  // Dados básicos
  utms: UTMData;
  primaryUTMs: Partial<UTMData>;
  ecommerceData: Partial<UTMData>;
  hasUTMs: boolean;
  
  // Dados de checkout
  checkoutData: CheckoutData | null;
  hasEcommerceData: boolean;
  hasCheckoutData: boolean;
  
  // Ações básicas
  getUTM: (key: keyof UTMData) => string | undefined;
  setUTM: (key: keyof UTMData, value: string) => void;
  clearUTMs: () => void;
  
  // Utilidades
  addToURL: (url: string, includeSecure?: boolean) => string;
  toURLString: (includeSecure?: boolean) => string;
  toMetaPixelData: () => any;
  
  // Análise
  getSource: () => string;
  getCampaign: () => string;
  isAffiliateTraffic: () => boolean;
  
  // 🆕 Funcionalidades E-commerce
  processCheckoutURL: (url: string) => CheckoutData | null;
  generateCheckoutURL: (baseURL: string, params?: Record<string, string>) => string;
  validateCheckoutData: (data: CheckoutData) => boolean;
  
  // Debug
  exportData: () => string;
}

export function useUTMsV2(): UseUTMV2Return {
  const [utms, setUtms] = useState<UTMData>({});
  const [manager, setManager] = useState<any>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);

  useEffect(() => {
    // Inicializar no cliente apenas
    if (typeof window !== 'undefined') {
      const utmManager = initUTMManagerV2({
        cookieDays: 30,
        localStorageKey: 'maracuja_utm_data_v2',
        cookiePrefix: 'maracuja_utm_',
        preventSubIds: true,
        preventXcodSck: true,
        enableEcommerceParams: true,
        enableAdvancedTracking: true,
        secureUrlParams: ['session_id', 'event_id', 'success_url', 'cancel_url']
      });
      
      setManager(utmManager);
      setUtms(utmManager.getAll());
      setCheckoutData(utmManager.getCheckoutData());
    }
  }, []);

  // Atualizar estado quando os UTMs mudarem
  const refreshUTMs = () => {
    if (manager) {
      setUtms(manager.getAll());
      setCheckoutData(manager.getCheckoutData());
    }
  };

  const getUTM = (key: keyof UTMData): string | undefined => {
    return manager?.get(key);
  };

  const setUTM = (key: keyof UTMData, value: string): void => {
    manager?.set(key, value);
    refreshUTMs();
  };

  const clearUTMs = (): void => {
    manager?.clear();
    refreshUTMs();
  };

  const addToURL = (url: string, includeSecure: boolean = false): string => {
    return manager?.addToURL(url, includeSecure) || url;
  };

  const toURLString = (includeSecure: boolean = false): string => {
    return manager?.toURLString(includeSecure) || '';
  };

  const toMetaPixelData = (): any => {
    return manager?.toMetaPixelData() || {};
  };

  const getSource = (): string => {
    return getUTM('utm_source') || getUTM('source') || 'direct';
  };

  const getCampaign = (): string => {
    return getUTM('utm_campaign') || getUTM('campaign') || 'no_campaign';
  };

  const isAffiliateTraffic = (): boolean => {
    return !!(getUTM('xcod') || getUTM('sck') || getUTM('afid'));
  };

  const processCheckoutURL = (url: string): CheckoutData | null => {
    return manager?.processCheckoutURL(url) || null;
  };

  const generateCheckoutURL = (baseURL: string, additionalParams: Record<string, string> = {}): string => {
    if (!manager) return baseURL;
    
    // Obter parâmetros atuais
    const currentParams = manager.getAll();
    
    // Mesclar com parâmetros adicionais
    const allParams = { ...currentParams, ...additionalParams };
    
    // Construir URL
    const url = new URL(baseURL);
    Object.entries(allParams).forEach(([key, value]) => {
      if (value) {
        url.searchParams.set(key, value);
      }
    });
    
    return url.toString();
  };

  const validateCheckoutData = (data: CheckoutData): boolean => {
    const requiredFields = ['session_id', 'event_id', 'product_id', 'value', 'currency'];
    return requiredFields.every(field => data[field as keyof CheckoutData]);
  };

  const exportData = (): string => {
    return manager?.export() || '{}';
  };

  const primaryUTMs = manager?.getPrimary() || {};
  const ecommerceData = manager?.getEcommerceData() || {};
  const hasEcommerceData = manager?.hasEcommerceData() || false;
  const hasCheckoutData = manager?.hasCheckoutData() || false;

  return {
    // Dados básicos
    utms,
    primaryUTMs,
    ecommerceData,
    hasUTMs: Object.keys(utms).length > 0,
    
    // Dados de checkout
    checkoutData,
    hasEcommerceData,
    hasCheckoutData,
    
    // Ações básicas
    getUTM,
    setUTM,
    clearUTMs,
    
    // Utilidades
    addToURL,
    toURLString,
    toMetaPixelData,
    
    // Análise
    getSource,
    getCampaign,
    isAffiliateTraffic,
    
    // 🆕 Funcionalidades E-commerce
    processCheckoutURL,
    generateCheckoutURL,
    validateCheckoutData,
    
    // Debug
    exportData
  };
}

export default useUTMsV2;