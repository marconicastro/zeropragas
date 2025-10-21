// Google Tag Manager - DataLayer Helper
// GTM Container ID: GTM-WPDKD23S

export interface GTMEvent {
  event: string;
  [key: string]: any;
}

declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Inicializa o dataLayer se não existir
export const initDataLayer = () => {
  if (typeof window !== 'undefined' && !window.dataLayer) {
    window.dataLayer = [];
  }
};

// Envia eventos para o GTM
export const trackEvent = (event: GTMEvent) => {
  if (typeof window !== 'undefined' && window.dataLayer) {
    window.dataLayer.push(event);
  }
};

// Eventos comuns pré-definidos
export const GTM_EVENTS = {
  // Page View
  PAGE_VIEW: 'page_view',
  
  // E-commerce
  VIEW_ITEM: 'view_item',
  ADD_TO_CART: 'add_to_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',
  
  // Engagement
  FORM_SUBMIT: 'form_submit',
  BUTTON_CLICK: 'button_click',
  
  // Custom
  LEAD_GENERATED: 'lead_generated',
  CHECKOUT_INITIATED: 'checkout_initiated',
} as const;

// Track de visualização de página
export const trackPageView = (pagePath?: string, pageTitle?: string) => {
  trackEvent({
    event: GTM_EVENTS.PAGE_VIEW,
    page_path: pagePath || window.location.pathname,
    page_title: pageTitle || document.title,
    page_location: window.location.href,
  });
};

// Track de envio de formulário
export const trackFormSubmit = (formName: string, formData?: Record<string, any>) => {
  trackEvent({
    event: GTM_EVENTS.FORM_SUBMIT,
    form_name: formName,
    ...formData,
  });
};

// Track de clique em botão
export const trackButtonClick = (buttonText: string, buttonLocation?: string) => {
  trackEvent({
    event: GTM_EVENTS.BUTTON_CLICK,
    button_text: buttonText,
    button_location: buttonLocation,
  });
};

// Track de início de checkout
export const trackCheckoutInitiated = (userData: {
  fullName: string;
  email: string;
  phone: string;
}) => {
  trackEvent({
    event: GTM_EVENTS.CHECKOUT_INITIATED,
    user_data: {
      full_name: userData.fullName,
      email: userData.email,
      phone: userData.phone,
    },
  });
};

// Track de lead gerado
export const trackLeadGenerated = (leadData: {
  fullName: string;
  email: string;
  phone: string;
  source?: string;
}) => {
  trackEvent({
    event: GTM_EVENTS.LEAD_GENERATED,
    lead_data: {
      full_name: leadData.fullName,
      email: leadData.email,
      phone: leadData.phone,
      source: leadData.source || 'pre_checkout_modal',
    },
  });
};