// 🎯 Hook React para UTMs - Fácil integração com componentes
'use client';

import { useEffect, useState } from 'react';
import { initUTMManager, getUTMManager, UTMData } from '@/lib/utm-manager';

interface UseUTMReturn {
  // Dados
  utms: UTMData;
  primaryUTMs: Partial<UTMData>;
  hasUTMs: boolean;
  
  // Ações
  getUTM: (key: keyof UTMData) => string | undefined;
  setUTM: (key: keyof UTMData, value: string) => void;
  clearUTMs: () => void;
  
  // Utilidades
  addToURL: (url: string) => string;
  toURLString: () => string;
  toMetaPixelData: () => any;
  
  // Análise
  getSource: () => string;
  getCampaign: () => string;
  isAffiliateTraffic: () => boolean;
  
  // Debug
  exportData: () => string;
}

export function useUTMs(): UseUTMReturn {
  const [utms, setUtms] = useState<UTMData>({});
  const [manager, setManager] = useState<any>(null);

  useEffect(() => {
    // Inicializar no cliente apenas
    if (typeof window !== 'undefined') {
      const utmManager = initUTMManager({
        cookieDays: 30,
        localStorageKey: 'maracuja_utm_data',
        cookiePrefix: 'maracuja_utm_',
        preventSubIds: true,
        preventXcodSck: true
      });
      
      setManager(utmManager);
      setUtms(utmManager.getAll());
    }
  }, []);

  // Atualizar estado quando os UTMs mudarem
  const refreshUTMs = () => {
    if (manager) {
      setUtms(manager.getAll());
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

  const addToURL = (url: string): string => {
    return manager?.addToURL(url) || url;
  };

  const toURLString = (): string => {
    return manager?.toURLString() || '';
  };

  const toMetaPixelData = (): any => {
    return manager?.toMetaPixelData() || {};
  };

  const getSource = (): string => {
    return getUTM('utm_source') || getUTM('src') || 'direct';
  };

  const getCampaign = (): string => {
    return getUTM('utm_campaign') || 'no_campaign';
  };

  const isAffiliateTraffic = (): boolean => {
    return !!(getUTM('xcod') || getUTM('sck') || getUTM('afid'));
  };

  const exportData = (): string => {
    return manager?.export() || '{}';
  };

  const primaryUTMs = manager?.getPrimary() || {};

  return {
    // Dados
    utms,
    primaryUTMs,
    hasUTMs: Object.keys(utms).length > 0,
    
    // Ações
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
    
    // Debug
    exportData
  };
}

export default useUTMs;