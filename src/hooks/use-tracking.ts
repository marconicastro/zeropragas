// Caminho: src/hooks/use-tracking.ts

'use client';

interface UserFormData {
  fullName: string;
  email: string;
  phone: string;
}

const pushToDataLayer = (event: string, data: object) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...data });
  console.log(`[Tracking Event]: ${event}`, { event, ...data });
};

export const useTracking = () => {
  const ebookData = {
    currency: 'BRL',
    value: 39.90,
    items: [{ item_id: 'EBOOK_MARACUJA_01', item_name: 'Ebook Maracujá Zero Pragas' }],
  };

  const track = {
    viewContent: () => {
      pushToDataLayer('view_content_dl', { ecommerce: ebookData });
    },
    initiateCheckout: () => {
      pushToDataLayer('initiate_checkout_dl', { ecommerce: ebookData });
    },
    lead: (userData: UserFormData) => {
      pushToDataLayer('lead_dl', {
        user_data: {
          em: userData.email.toLowerCase(),
          ph: userData.phone.replace(/\D/g, ''),
          fn: userData.fullName.split(' ')[0],
          ln: userData.fullName.split(' ').slice(1).join(' '),
        },
        ecommerce: ebookData,
      });
    },
  };

  return { track };
};