/**
 * Meta Conversions API Integration
 * Envia eventos para o Facebook/Meta Marketing API
 */

interface MetaEvent {
  event_name: string;
  event_time: number;
  action_source: string;
  user_data: {
    client_ip_address?: string;
    client_user_agent?: string;
    em?: string[];
    fn?: string[];
    ph?: string[];
    ct?: string[];
    st?: string[];
    country?: string[];
    zp?: string[];
    db?: string[];
    cg?: string[];
    device?: string[];
    os?: string[];
    browser?: string[];
    browser_version?: string[];
    isp?: string[];
    org?: string[];
    timezone?: string[];
    timestamp?: string[];
  };
  custom_data: {
    value?: string;
    currency?: string;
    transaction_id?: string;
    order_id?: string;
    payment_method?: string;
    installments?: string;
    product_name?: string;
    product_id?: string;
    plan?: string;
    subscription_id?: string;
    affiliate_id?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
    customer_document?: string;
    address_city?: string;
    address_state?: string;
    address_country?: string;
    connection_type?: string;
    is_mobile?: string;
    is_tablet?: string;
    is_desktop?: string;
    screen_resolution?: string;
    language?: string;
    platform?: string;
  };
}

interface MetaResponse {
  event_id?: string;
  fbtrace_id?: string;
  messages?: string[];
  error?: {
    message: string;
    type: string;
    code: number;
  };
}

/**
 * Envia evento para Meta Conversions API
 */
export async function sendMetaEvent(event: MetaEvent): Promise<MetaResponse> {
  try {
    console.log('🚀 Enviando evento para Meta Conversions API');
    
    // Configurações da API
    const PIXEL_ID = process.env.META_PIXEL_ID || '123456789012345';
    const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || 'test_token';
    const API_VERSION = 'v19.0';
    
    // URL da API
    const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events`;
    
    // Dados da requisição
    const requestData = {
      data: [event],
      access_token: ACCESS_TOKEN,
      test_event_code: 'TEST35751' // ✅ MODO TESTE ATIVADO
    };
    
    console.log('📤 Dados enviados para Meta:', JSON.stringify(requestData, null, 2));
    
    // Enviar requisição
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData)
    });
    
    const result: MetaResponse = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erro na API Meta:', result);
      throw new Error(`Meta API Error: ${result.error?.message || 'Unknown error'}`);
    }
    
    console.log('✅ Evento enviado com sucesso para Meta:', result);
    
    return {
      event_id: result.event_id,
      fbtrace_id: result.fbtrace_id,
      messages: result.messages
    };
    
  } catch (error) {
    console.error('❌ Erro ao enviar evento para Meta:', error);
    
    // Em desenvolvimento, simular sucesso
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Modo desenvolvimento: simulando envio bem-sucedido');
      return {
        event_id: `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        fbtrace_id: `dev_trace_${Date.now()}`,
        messages: ['Development mode - simulated success']
      };
    }
    
    throw error;
  }
}

/**
 * Valida formato do evento antes de enviar
 */
export function validateMetaEvent(event: MetaEvent): boolean {
  try {
    // Verificar campos obrigatórios
    if (!event.event_name || !event.event_time) {
      console.error('❌ Campos obrigatórios faltando: event_name ou event_time');
      return false;
    }
    
    // Verificar se há pelo menos um dado do usuário
    const hasUserData = Object.keys(event.user_data).length > 0;
    if (!hasUserData) {
      console.error('❌ Nenhum dado de usuário fornecido');
      return false;
    }
    
    // Verificar se há dados customizados
    const hasCustomData = Object.keys(event.custom_data).length > 0;
    if (!hasCustomData) {
      console.error('❌ Nenhum dado customizado fornecido');
      return false;
    }
    
    console.log('✅ Evento validado com sucesso');
    return true;
    
  } catch (error) {
    console.error('❌ Erro na validação do evento:', error);
    return false;
  }
}

/**
 * Formata valor monetário para Meta
 */
export function formatValueForMeta(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return numValue.toFixed(2);
}

/**
 * Limpa e formata dados do usuário para Meta
 */
export function formatUserData(userData: any): MetaEvent['user_data'] {
  const formatted: MetaEvent['user_data'] = {};
  
  // Email (hash se necessário)
  if (userData.em) {
    formatted.em = Array.isArray(userData.em) ? userData.em : [userData.em];
  }
  
  // Phone (limpar e hash se necessário)
  if (userData.ph) {
    const phones = Array.isArray(userData.ph) ? userData.ph : [userData.ph];
    formatted.ph = phones.map(phone => phone.replace(/\D/g, ''));
  }
  
  // Nomes
  if (userData.fn) formatted.fn = Array.isArray(userData.fn) ? userData.fn : [userData.fn];
  if (userData.ln) formatted.ln = Array.isArray(userData.ln) ? userData.ln : [userData.ln];
  
  // Localização
  if (userData.ct) formatted.ct = Array.isArray(userData.ct) ? userData.ct : [userData.ct];
  if (userData.st) formatted.st = Array.isArray(userData.st) ? userData.st : [userData.st];
  if (userData.country) formatted.country = Array.isArray(userData.country) ? userData.country : [userData.country];
  if (userData.zp) formatted.zp = Array.isArray(userData.zp) ? userData.zp : [userData.zp];
  
  // Dados técnicos
  if (userData.client_ip_address) formatted.client_ip_address = userData.client_ip_address;
  if (userData.client_user_agent) formatted.client_user_agent = userData.client_user_agent;
  
  // Device e browser
  if (userData.device) formatted.device = Array.isArray(userData.device) ? userData.device : [userData.device];
  if (userData.os) formatted.os = Array.isArray(userData.os) ? userData.os : [userData.os];
  if (userData.browser) formatted.browser = Array.isArray(userData.browser) ? userData.browser : [userData.browser];
  
  return formatted;
}