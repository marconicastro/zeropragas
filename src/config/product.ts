/**
 * 🎯 CONFIGURAÇÃO CENTRALIZADA DO PRODUTO
 * 
 * OBJETIVO: Único lugar para alterar preços, IDs e informações do produto
 * BENEFÍCIO: Evita valores hardcoded espalhados pelo código
 * 
 * ⚠️ ALTERE APENAS AQUI - Mudanças refletem em TODO o sistema
 */

export const PRODUCT_CONFIG = {
  // 💰 PREÇOS (altere aqui para mudar em todo sistema)
  BASE_PRICE: 39.90,
  COMPARE_AT_PRICE: 297.00,
  DISCOUNT_PERCENTAGE: 87,
  INSTALLMENTS: 12,
  INSTALLMENT_PRICE: 3.99,
  
  // 🆔 IDENTIFICADORES
  CONTENT_IDS: ['hacr962', '339591'], // Ambos IDs do produto
  SHORT_ID: 'hacr962',
  CAKTO_PRODUCT_ID: 'hacr962_605077',
  
  // 📦 INFORMAÇÕES DO PRODUTO
  NAME: 'Sistema 4 Fases - Ebook Trips',
  CATEGORY: 'digital_product',
  SUBCATEGORY: 'agricultura',
  DESCRIPTION: 'Sistema completo para eliminação de trips no maracujazeiro',
  
  // 🌐 URLs
  CHECKOUT_URL: 'https://pay.cakto.com.br/hacr962_605077',
  SUCCESS_URL: '/obrigado',
  CANCEL_URL: '/checkout',
  
  // 💱 META
  CURRENCY: 'BRL',
  PREDICTED_LTV_MULTIPLIER: 3.5, // Lifetime Value = BASE_PRICE * 3.5
  
  // 🛒 E-COMMERCE
  NUM_ITEMS: 1,
  CONDITION: 'new' as const,
  AVAILABILITY: 'in stock' as const,
  
  // 📈 NEGÓCIO
  BRAND: 'Maracujá Zero Pragas',
  BUSINESS_EMAIL: 'maracujalucrativo@gmail.com',
  SUPPORT_EMAIL: 'suporte@maracujazeropragas.com'
} as const;

/**
 * 🔧 HELPERS - Funções auxiliares para cálculos
 */
export const ProductHelpers = {
  /**
   * Calcula Lifetime Value (LTV) previsto
   */
  getLTV: () => PRODUCT_CONFIG.BASE_PRICE * PRODUCT_CONFIG.PREDICTED_LTV_MULTIPLIER,
  
  /**
   * Calcula valor do desconto em reais
   */
  getDiscountAmount: () => PRODUCT_CONFIG.COMPARE_AT_PRICE - PRODUCT_CONFIG.BASE_PRICE,
  
  /**
   * Verifica se o valor indica Order Bump (compra com adicional)
   */
  isOrderBump: (amount: number) => amount > PRODUCT_CONFIG.BASE_PRICE * 1.1,
  
  /**
   * Calcula valor base do produto se houver Order Bump
   */
  getBaseValue: (totalAmount: number) => {
    if (ProductHelpers.isOrderBump(totalAmount)) {
      return PRODUCT_CONFIG.BASE_PRICE;
    }
    return totalAmount;
  },
  
  /**
   * Calcula valor do Order Bump (se houver)
   */
  getBumpValue: (totalAmount: number) => {
    if (ProductHelpers.isOrderBump(totalAmount)) {
      return totalAmount - PRODUCT_CONFIG.BASE_PRICE;
    }
    return 0;
  },
  
  /**
   * Retorna número de itens na compra (detecta Order Bump)
   */
  getItemsCount: (totalAmount: number) => {
    return ProductHelpers.isOrderBump(totalAmount) ? 2 : 1;
  },
  
  /**
   * Formata preço para exibição (R$ 39,90)
   */
  formatPrice: (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  },
  
  /**
   * Gera URL de checkout completa com parâmetros
   */
  buildCheckoutURL: (params?: Record<string, string>) => {
    const url = new URL(PRODUCT_CONFIG.CHECKOUT_URL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }
    
    return url.toString();
  }
};

/**
 * 📊 DADOS PARA META PIXEL
 * Estrutura completa para eventos Meta
 */
export const MetaProductData = {
  // Dados básicos
  content_ids: PRODUCT_CONFIG.CONTENT_IDS,
  content_name: PRODUCT_CONFIG.NAME,
  content_type: 'product',
  content_category: PRODUCT_CONFIG.CATEGORY,
  
  // Preço e moeda
  value: PRODUCT_CONFIG.BASE_PRICE,
  currency: PRODUCT_CONFIG.CURRENCY,
  
  // E-commerce
  condition: PRODUCT_CONFIG.CONDITION,
  availability: PRODUCT_CONFIG.AVAILABILITY,
  num_items: PRODUCT_CONFIG.NUM_ITEMS,
  
  // Qualidade (para nota 9.3+)
  predicted_ltv: ProductHelpers.getLTV(),
  brand: PRODUCT_CONFIG.BRAND,
  description: PRODUCT_CONFIG.DESCRIPTION
};

// Tipo TypeScript para segurança de tipo
export type ProductConfig = typeof PRODUCT_CONFIG;
export type ProductMeta = typeof MetaProductData;
