/**
 * Detecção de IP do Cliente
 * Explicação: client_ip_address: null é CORRETO no frontend
 * 
 * PRIVACIDADE E SEGURANÇA:
 * - Navegadores modernos BLOQUEIAM acesso a IP real no frontend
 * - IP só pode ser obtido no backend (server-side)
 * - Enviar IP null no frontend é PRÁTICA RECOMENDADA pela Meta
 */

/**
 * Tenta obter IP via serviços públicos (limitado)
 * NOTA: Pode não funcionar devido a CORS/bloqueios
 */
export async function getClientIPFromFrontend(): Promise<string | null> {
  try {
    // Serviços públicos de detecção de IP
    const ipServices = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://api.ipgeolocation.io/ipgeo'
    ];

    for (const service of ipServices) {
      try {
        const response = await fetch(service);
        if (response.ok) {
          const data = await response.json();
          const ip = data.ip || data.IPv4 || data.ip_address;
          if (ip && isValidIP(ip)) {
            console.log(`🌐 IP obtido via ${service}:`, ip);
            return ip;
          }
        }
      } catch (error) {
        console.warn(`❌ Falha ao obter IP de ${service}:`, error);
        continue;
      }
    }

    console.log('⚠️ Não foi possível obter IP no frontend (normal e esperado)');
    return null;
  } catch (error) {
    console.warn('❌ Erro na detecção de IP:', error);
    return null;
  }
}

/**
 * Valida formato de IP
 */
function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(octet => parseInt(octet) >= 0 && parseInt(octet) <= 255);
  }
  
  return ipv6Regex.test(ip);
}

/**
 * EXPLICAÇÃO: Por que client_ip_address: null é CORRETO?
 * 
 * 1. PRIVACIDADE DO NAVEGADOR:
 *    - Chrome, Firefox, Safari bloqueiam acesso direto ao IP
 *    - WebRTC pode vazar IP, mas é considerado bug/vulnerabilidade
 *    - Meta NÃO espera IP real do frontend
 * 
 * 2. ARQUITETURA META CAPI:
 *    - Frontend envia null (indicando "não disponível")
 *    - Backend/servidor CAPI deve fornecer IP real
 *    - CAPI Gateway usa IP do servidor como fallback
 * 
 * 3. CONFORMIDADE GDPR/LGPD:
 *    - IP é considerado dado pessoal sensível
 *    - Coleta de IP no frontend requer consentimento explícito
 *    - null é mais seguro e compliant
 */
export const IP_EXPLANATION = {
  why_null_is_correct: {
    title: "POR QUE client_ip_address: null É CORRETO?",
    points: [
      "Navegadores modernos BLOQUEIAM acesso ao IP no frontend",
      "Meta espera IP do backend/servidor, não do cliente",
      "null é o valor padrão e seguro para frontend",
      "CAPI Gateway usa IP do servidor automaticamente",
      "Conforme GDPR/LGPD - IP é dado sensível"
    ]
  },
  how_meta_gets_ip: {
    title: "COMO META OBTÉM O IP REAL:",
    methods: [
      "Backend API envia IP real para CAPI",
      "CAPI Gateway usa IP do servidor",
      "Meta correlaciona com outros dados de sessão",
      "Cookies de terceiros (quando permitidos)",
      "Fingerprinting do dispositivo"
    ]
  }
};

/**
 * Função para backend (quando disponível)
 * Esta seria a implementação correta no servidor
 */
export const getServerSideIP = (request: Request): string => {
  const headers = request.headers;
  
  // Ordem de prioridade para headers de IP
  const ipHeaders = [
    'cf-connecting-ip',        // Cloudflare
    'x-forwarded-for',         // Proxy/load balancer
    'x-real-ip',              // Nginx
    'x-client-ip',            // Custom
    'x-forwarded',            // Legacy
    'forwarded-for',          // Legacy
    'forwarded'               // RFC 7239
  ];

  for (const header of ipHeaders) {
    const ip = headers.get(header);
    if (ip) {
      // x-forwarded-for pode ter múltiplos IPs: "client, proxy1, proxy2"
      const clientIP = ip.split(',')[0].trim();
      if (isValidIP(clientIP)) {
        return clientIP;
      }
    }
  }

  // Fallback para conexão direta
  return '0.0.0.0'; // Indica que não foi possível detectar
};