/**
 * SISTEMA DE HASH SEGURO - Não interfere no código existente
 * Uso opcional para melhorar conformidade sem alterar o que já funciona
 */

/**
 * Função de hash SHA256 segura conforme exigência do Facebook
 * @param {string} data - Dados para hashear
 * @returns {Promise<string|null>} - Hash SHA256 em hex lowercase
 */
export async function hashDataSecure(data) {
  if (!data) return null;
  
  // Normalização conforme padrão Facebook
  const normalized = data.toString().toLowerCase().trim().replace(/\s+/g, '');
  
  try {
    // Encode UTF-8
    const encoder = new TextEncoder();
    const dataUint8Array = encoder.encode(normalized);
    
    // SHA256 hash
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataUint8Array);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    
    // Converte para hex lowercase
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
  } catch (error) {
    console.error('Erro no hash SHA256:', error);
    return null;
  }
}

/**
 * Prepara dados do usuário com hash seguro
 * @param {Object} userData - Dados brutos do usuário
 * @returns {Promise<Object>} - Dados com hash aplicado
 */
export async function prepareHashedUserData(userData) {
  if (!userData) return {};
  
  // Formatar telefone (adicionar 55 se necessário)
  const phoneClean = userData.phone?.replace(/\D/g, '') || '';
  let phoneWithCountry = phoneClean;
  if (phoneClean.length === 10 || phoneClean.length === 11) {
    phoneWithCountry = `55${phoneClean}`;
  }
  
  // Separar nome
  const nameParts = userData.fullName?.toLowerCase().trim().split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  // Aplicar hash apenas nos dados PII
  return {
    em: await hashDataSecure(userData.email?.toLowerCase().trim()),
    ph: await hashDataSecure(phoneWithCountry),
    fn: await hashDataSecure(firstName),
    ln: await hashDataSecure(lastName),
    ct: await hashDataSecure(userData.city?.toLowerCase().trim()),
    st: await hashDataSecure(userData.state?.toLowerCase().trim()),
    zp: await hashDataSecure(userData.cep?.replace(/\D/g, '')),
    country: await hashDataSecure('br'),
    // Campos não hasheados
    external_id: userData.sessionId,
    client_ip_address: userData.client_ip_address,
    client_user_agent: userData.client_user_agent
  };
}

/**
 * Verifica se dados já estão hasheados
 * @param {string} data - Dados para verificar
 * @returns {boolean} - True se parece ser hash SHA256
 */
export function isHashedData(data) {
  if (!data || typeof data !== 'string') return false;
  // Hash SHA256 tem 64 caracteres hexadecimais
  return /^[a-f0-9]{64}$/.test(data);
}

/**
 * Função segura para hash condicional
 * @param {string} data - Dados para processar
 * @returns {Promise<string|null>} - Hash se não estiver hasheado
 */
export async function ensureHashed(data) {
  if (!data) return null;
  
  // Se já parece ser hash, retorna como está
  if (isHashedData(data)) {
    return data;
  }
  
  // Se não está hasheado, aplica hash
  return await hashDataSecure(data);
}

/**
 * Teste de segurança do sistema de hash
 * Exportado para uso no console em desenvolvimento
 */
export async function testHashSystem() {
  console.group('🔐 Teste do Sistema de Hash Seguro');
  
  const testData = {
    email: 'test@example.com',
    phone: '11987654321',
    name: 'Test User',
    city: 'São Paulo'
  };
  
  console.log('📥 Dados originais:', testData);
  
  const hashedData = await prepareHashedUserData(testData);
  console.log('🔒 Dados hasheados:', hashedData);
  
  // Verificações
  console.log('\n✅ Verificações:');
  console.log('Email hash length:', hashedData.em?.length || 0, '(deve ser 64)');
  console.log('Phone hash length:', hashedData.ph?.length || 0, '(deve ser 64)');
  console.log('Name hash length:', hashedData.fn?.length || 0, '(deve ser 64)');
  console.log('É hash válido?', isHashedData(hashedData.em));
  
  console.groupEnd();
  
  return hashedData;
}

// Exportar para uso global em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.testHashSystem = testHashSystem;
  window.hashDataSecure = hashDataSecure;
  window.prepareHashedUserData = prepareHashedUserData;
  window.isHashedData = isHashedData;
}