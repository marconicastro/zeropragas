/**
 * Enriquecimento de Dados do Cliente
 * Combina múltiplas fontes de dados para máximo matching
 */

import { getClientInfo } from './clientInfoService';

export interface EnhancedClientData {
  // Dados básicos
  ip: string;
  userAgent: string;
  
  // Localização
  city: string;
  region: string;
  country: string;
  postalCode: string;
  
  // Device e Browser
  device: string;
  os: string;
  browser: string;
  browserVersion: string;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  
  // Conexão
  connectionType: string;
  isp: string;
  org: string;
  
  // Tempo e Fuso
  timezone: string;
  timestamp: string;
  
  // Tela
  screenResolution: string;
  language: string;
  platform: string;
}

/**
 * Obtém dados enriquecidos do cliente
 */
export async function getEnhancedClientData(
  ip: string, 
  userAgent: string
): Promise<EnhancedClientData> {
  try {
    console.log('🔄 Iniciando enriquecimento de dados para IP:', ip);
    
    // 1. Obter informações básicas do cliente
    const clientInfo = await getClientInfo();
    
    // 2. Detectar device e browser
    const deviceInfo = detectDevice(userAgent);
    
    // 3. Detectar conexão
    const connectionInfo = detectConnection(ip);
    
    // 4. Combinar tudo
    const enrichedData: EnhancedClientData = {
      // Dados básicos
      ip: ip || clientInfo.ip || '0.0.0.0',
      userAgent: userAgent,
      
      // Localização
      city: clientInfo.city || 'unknown',
      region: clientInfo.state || clientInfo.regionCode || 'unknown',
      country: clientInfo.country || 'BR',
      postalCode: clientInfo.zip || '00000-000',
      
      // Device e Browser
      device: deviceInfo.device,
      os: deviceInfo.os,
      browser: deviceInfo.browser,
      browserVersion: deviceInfo.version,
      isMobile: deviceInfo.isMobile,
      isTablet: deviceInfo.isTablet,
      isDesktop: deviceInfo.isDesktop,
      
      // Conexão
      connectionType: connectionInfo.type,
      isp: clientInfo.isp || 'unknown',
      org: connectionInfo.org,
      
      // Tempo e Fuso
      timezone: clientInfo.timezone || 'America/Sao_Paulo',
      timestamp: new Date().toISOString(),
      
      // Tela
      screenResolution: '1920x1080', // Default
      language: 'pt-BR',
      platform: deviceInfo.platform
    };
    
    console.log('✅ Dados enriquecidos com sucesso:', {
      ip: enrichedData.ip,
      city: enrichedData.city,
      region: enrichedData.region,
      country: enrichedData.country,
      device: enrichedData.device,
      browser: enrichedData.browser
    });
    
    return enrichedData;
    
  } catch (error) {
    console.error('❌ Erro no enriquecimento de dados:', error);
    
    // Fallback seguro
    return {
      ip: ip || '0.0.0.0',
      userAgent: userAgent,
      city: 'unknown',
      region: 'unknown',
      country: 'BR',
      postalCode: '00000-000',
      device: 'desktop',
      os: 'unknown',
      browser: 'unknown',
      browserVersion: 'unknown',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      connectionType: 'unknown',
      isp: 'unknown',
      org: 'unknown',
      timezone: 'America/Sao_Paulo',
      timestamp: new Date().toISOString(),
      screenResolution: '1920x1080',
      language: 'pt-BR',
      platform: 'unknown'
    };
  }
}

/**
 * Detecta informações do device e browser
 */
function detectDevice(userAgent: string) {
  const ua = userAgent.toLowerCase();
  
  // Mobile
  const isMobile = /mobile|android|iphone|ipod|blackberry|opera mini|iemobile/.test(ua);
  
  // Tablet
  const isTablet = /tablet|ipad|android(?!.*mobile)|silk/.test(ua);
  
  // Desktop
  const isDesktop = !isMobile && !isTablet;
  
  // Device type
  let device = 'desktop';
  if (isMobile) device = 'mobile';
  else if (isTablet) device = 'tablet';
  
  // OS
  let os = 'unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac')) os = 'Mac';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
  
  // Browser
  let browser = 'unknown';
  let version = 'unknown';
  
  if (ua.includes('chrome')) {
    browser = 'Chrome';
    const match = ua.match(/chrome\/(\d+)/);
    version = match ? match[1] : 'unknown';
  } else if (ua.includes('firefox')) {
    browser = 'Firefox';
    const match = ua.match(/firefox\/(\d+)/);
    version = match ? match[1] : 'unknown';
  } else if (ua.includes('safari')) {
    browser = 'Safari';
    const match = ua.match(/safari\/(\d+)/);
    version = match ? match[1] : 'unknown';
  } else if (ua.includes('edge')) {
    browser = 'Edge';
    const match = ua.match(/edge\/(\d+)/);
    version = match ? match[1] : 'unknown';
  }
  
  return {
    device,
    os,
    browser,
    version,
    isMobile,
    isTablet,
    isDesktop,
    platform: os
  };
}

/**
 * Detecta informações de conexão
 */
function detectConnection(ip: string) {
  // Lógica simplificada para detectar tipo de conexão
  const isLocal = ip.startsWith('192.168.') || 
                  ip.startsWith('10.') || 
                  ip.startsWith('172.') ||
                  ip === '127.0.0.1';
  
  return {
    type: isLocal ? 'local' : 'internet',
    org: isLocal ? 'local' : 'isp'
  };
}