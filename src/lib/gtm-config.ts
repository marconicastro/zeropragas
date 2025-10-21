/**
 * GTM Server Configuration
 * Alinhado com GTM Web Container GTM-567XZCDX
 */

export const GTM_CONFIG = {
  // Container Info
  WEB_CONTAINER_ID: 'GTM-567XZCDX',
  SERVER_URL: 'https://data.maracujazeropragas.com',
  
  // GA4 Configuration
  GA4: {
    MEASUREMENT_ID: 'G-CZ0XMXL3RX',
    API_SECRET: 'YOUR_GA4_API_SECRET', // Configure no GA4
    TRANSPORT_URL: 'https://data.maracujazeropragas.com'
  },
  
  // Meta Configuration
  META: {
    PIXEL_ID: '714277868320104',
    ACCESS_TOKEN: 'EAAUsqHMv8GcBPlCK8fZCCwQzeWZCHF7ahXf6ZC98FcbiHFdFTykqE58YUksFpe7kAFkUzimeH178A3cZCng1Y8HafbNFKw12h0UeUKzJ4EL2CkHln15yZBoFf2PuMBEJNKXvAKJn8iyuk3AdelxYYpAyKtVjfoEIK3uWFwHrqwds6M1jIE7CCObThayaV8gZDZD',
    TEST_EVENT_CODE: 'TEST12345'
  },
  
  // Product Configuration
  PRODUCT: {
    ID: 'ebook-controle-trips',
    NAME: 'E-book Sistema de Controle de Trips',
    CATEGORY: 'E-book',
    PRICE: 39.90,
    CURRENCY: 'BRL'
  },
  
  // Event Mappings
  EVENT_MAPPINGS: {
    // Web Events → Server Events
    'view_content': {
      ga4: 'view_item',
      meta: 'ViewContent'
    },
    'initiate_checkout': {
      ga4: 'begin_checkout',
      meta: 'InitiateCheckout'
    },
    'page_view': {
      ga4: 'page_view',
      meta: 'PageView'
    }
  },
  
  // PII Hashing Configuration
  PII_HASHING: {
    ENABLED: true,
    ALGORITHM: 'SHA-256',
    FIELDS: ['email', 'phone', 'first_name', 'last_name']
  },
  
  // Cookie Configuration
  COOKIES: {
    FBC: '_fbc',
    FBP: '_fbp',
    EXTERNAL_ID: 'x-stape-user-id'
  },
  
  // UTM Parameters
  UTM_PARAMETERS: [
    'utm_source',
    'utm_medium', 
    'utm_campaign',
    'utm_content',
    'utm_term'
  ],
  
  // Validation Rules
  VALIDATION: {
    REQUIRED_FIELDS: {
      'view_content': ['event_id'],
      'initiate_checkout': ['event_id', 'user_data.email'],
      'page_view': ['event_id']
    },
    EMQ_THRESHOLDS: {
      MIN_SCORE: 8.0,
      WEIGHTS: {
        event_id: 0.3,
        user_data: 0.3,
        cookies: 0.2,
        utm: 0.2
      }
    }
  }
};

export default GTM_CONFIG;