'use client';

import { useEffect } from 'react';
import { 
  trackEvent, 
  trackPageView, 
  trackFormSubmit, 
  trackButtonClick, 
  trackCheckoutInitiated, 
  trackLeadGenerated,
  initDataLayer,
  GTMEvent 
} from '@/lib/gtm';

export const useGTM = () => {
  // Inicializa o dataLayer quando o hook é montado
  useEffect(() => {
    initDataLayer();
  }, []);

  return {
    // Funções de tracking
    trackEvent,
    trackPageView,
    trackFormSubmit,
    trackButtonClick,
    trackCheckoutInitiated,
    trackLeadGenerated,
  };
};

// Hook para tracking de página
export const usePageTracking = (pagePath?: string, pageTitle?: string) => {
  useEffect(() => {
    // Aguarda um pouco para garantir que o GTM está carregado
    const timer = setTimeout(() => {
      trackPageView(pagePath, pageTitle);
    }, 100);

    return () => clearTimeout(timer);
  }, [pagePath, pageTitle]);
};

// Hook para tracking de formulário
export const useFormTracking = (formName: string) => {
  const { trackFormSubmit } = useGTM();

  const trackSubmit = (formData?: Record<string, any>) => {
    trackFormSubmit(formName, formData);
  };

  return { trackSubmit };
};

// Hook para tracking de cliques
export const useClickTracking = () => {
  const { trackButtonClick } = useGTM();

  const trackClick = (buttonText: string, buttonLocation?: string) => {
    trackButtonClick(buttonText, buttonLocation);
  };

  return { trackClick };
};