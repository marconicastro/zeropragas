/**
 * Sistema de Dados do Usuário Server-Side
 * Versão server-side para uso em APIs e webhooks
 * Mantém a mesma estrutura dos eventos lead e initiate checkout
 */

import * as crypto from 'crypto';

// Função SHA256 server-side
function sha256(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

// Interface para dados do usuário
interface ServerUserData {
  em?: string | null;
  ph?: string | null;
  fn?: string | null;
  ln?: string | null;
  ct?: string | null;
  st?: string | null;
  zp?: string | null;
  country?: string | null;
  external_id?: string | null;
  client_ip_address?: null;
  client_user_agent?: string | null;
}

/**
 * Obtém dados do usuário no server-side
 * Mantém a mesma lógica do sistema unificado dos eventos lead/checkout
 */
export async function getServerSideUserData(
  customerEmail?: string,
  customerPhone?: string,
  customerName?: string,
  customerCity?: string,
  customerState?: string,
  customerZipcode?: string,
  sessionId?: string
): Promise<ServerUserData> {
  console.log('🔄 Obtendo user_data server-side (mesmo padrão lead/checkout)...');
  
  try {
    // 1. Tentar buscar lead no banco de dados (prioridade máxima)
    let leadData = null;
    
    if (customerEmail || customerPhone) {
      try {
        const { db } = await import('@/lib/db');
        
        if (customerEmail) {
          leadData = await db.leadUserData.findUnique({
            where: { email: customerEmail.toLowerCase().trim() }
          });
        }
        
        if (!leadData && customerPhone) {
          const phoneClean = customerPhone.replace(/\D/g, '').replace(/^55/, '').slice(-11);
          leadData = await db.leadUserData.findFirst({
            where: { phone: phoneClean }
          });
        }
        
        if (leadData) {
          console.log('✅ Lead encontrado no banco - usando dados validados');
        }
      } catch (error) {
        console.log('⚠️ Banco não disponível, usando dados da Cakto');
      }
    }
    
    // 2. Usar dados do lead se encontrado, senão usar dados da Cakto
    const email = leadData?.email || customerEmail || '';
    const phone = leadData?.phone || customerPhone || '';
    const fullName = leadData?.fullName || customerName || '';
    const city = leadData?.city || customerCity || '';
    const state = leadData?.state || customerState || '';
    const zipcode = leadData?.zipcode || customerZipcode || '';
    
    // 3. Formatar dados (mesma lógica do sistema unificado)
    const phoneClean = phone?.replace(/\D/g, '') || '';
    let phoneWithCountry = phoneClean;
    
    if (phoneClean.length === 10) {
      phoneWithCountry = `55${phoneClean}`;
    } else if (phoneClean.length === 11) {
      phoneWithCountry = `55${phoneClean}`;
    }
    
    const nameParts = fullName?.toLowerCase().trim().split(' ') || [];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    const zipCode = zipcode?.replace(/\D/g, '') || '';
    
    // 4. Gerar hashes SHA256 (mesma lógica dos eventos lead/checkout)
    const userData: ServerUserData = {
      em: email ? sha256(email.toLowerCase().trim()) : null,
      ph: phoneWithCountry ? sha256(phoneWithCountry) : null,
      fn: firstName ? sha256(firstName) : null,
      ln: lastName ? sha256(lastName) : null,
      ct: city ? sha256(city.toLowerCase().trim()) : null,
      st: state ? sha256(state.toLowerCase().trim()) : null,
      zp: zipCode ? sha256(zipCode) : null,
      country: sha256('br'), // Sempre Brasil
      external_id: sessionId || leadData?.sessionId || `webhook_${Date.now()}`,
      client_ip_address: null, // CORRETO: null no backend
      client_user_agent: 'Cakto-Webhook/3.1-enterprise-unified'
    };
    
    console.log('✅ User_data server-side gerado:', {
      has_email: !!userData.em,
      has_phone: !!userData.ph,
      has_name: !!userData.fn,
      has_location: !!userData.ct,
      source: leadData ? 'database_lead' : 'cakto_data'
    });
    
    return userData;
    
  } catch (error) {
    console.error('❌ Erro ao obter user_data server-side:', error);
    
    // Fallback seguro
    return {
      em: null,
      ph: null,
      fn: null,
      ln: null,
      ct: null,
      st: null,
      zp: null,
      country: sha256('br'),
      external_id: `fallback_${Date.now()}`,
      client_ip_address: null,
      client_user_agent: 'Cakto-Webhook/3.1-enterprise-unified'
    };
  }
}

/**
 * Função principal para manter compatibilidade
 * Mantém o mesmo nome da função usada nos eventos lead/checkout
 */
export async function getStandardizedUserDataServer(
  customerEmail?: string,
  customerPhone?: string,
  customerName?: string,
  customerCity?: string,
  customerState?: string,
  customerZipcode?: string,
  sessionId?: string
): Promise<ServerUserData> {
  return await getServerSideUserData(
    customerEmail,
    customerPhone,
    customerName,
    customerCity,
    customerState,
    customerZipcode,
    sessionId
  );
}