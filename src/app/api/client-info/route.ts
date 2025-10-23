import { NextResponse } from "next/server";

// Interface para dados do cliente
interface ClientInfo {
  ip: string;
  city: string;
  region: string;
  regionCode: string;
  country: string;
  countryCode: string;
  postalCode: string;
  timezone: string;
  isp: string;
  org: string;
  as: string;
  lat: number;
  lon: number;
}

// Função para obter IP real do cliente
function getClientIP(request: Request): string {
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
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         '0.0.0.0';
}

// Validação de IP
function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  
  if (ipv4Regex.test(ip)) {
    return ip.split('.').every(octet => parseInt(octet) >= 0 && parseInt(octet) <= 255);
  }
  
  return ipv6Regex.test(ip);
}

// API de geolocalização via ip-api.com
async function getLocationByIP(ip: string): Promise<Partial<ClientInfo>> {
  try {
    // ip-api.com - gratuito e sem necessidade de API key
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'fail') {
      console.warn('❌ Falha na API de geolocalização:', data.message);
      return {};
    }
    
    // Mapear resposta para nosso formato
    return {
      ip: data.query,
      city: data.city?.toLowerCase().trim() || null,
      region: data.regionName?.toLowerCase().trim() || null,
      regionCode: data.regionCode?.toLowerCase() || null,
      country: data.country?.toLowerCase() || null,
      countryCode: data.countryCode?.toLowerCase() || null,
      postalCode: data.zip?.replace(/\D/g, '') || null,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      as: data.as,
      lat: data.lat,
      lon: data.lon
    };
    
  } catch (error) {
    console.error('❌ Erro ao obter localização por IP:', error);
    return {};
  }
}

// API endpoint principal
export async function GET(request: Request) {
  try {
    // 1. Obter IP real do cliente
    const clientIP = getClientIP(request);
    console.log('🌐 IP do cliente detectado:', clientIP);
    
    // 2. Obter informações de geolocalização
    const locationData = await getLocationByIP(clientIP);
    
    // 3. Combinar dados
    const clientInfo: ClientInfo = {
      ip: clientIP,
      city: locationData.city || null,
      region: locationData.region || null,
      regionCode: locationData.regionCode || null,
      country: locationData.country || 'br', // Padrão Brasil
      countryCode: locationData.countryCode || 'br',
      postalCode: locationData.postalCode || null,
      timezone: locationData.timezone || null,
      isp: locationData.isp || null,
      org: locationData.org || null,
      as: locationData.as || null,
      lat: locationData.lat || 0,
      lon: locationData.lon || 0
    };
    
    // 4. Log para debug
    console.log('📍 Informações completas do cliente:', {
      ip: clientInfo.ip,
      city: clientInfo.city,
      region: clientInfo.region,
      country: clientInfo.country,
      postalCode: clientInfo.postalCode,
      source: 'api/client-info'
    });
    
    // 5. Retornar dados
    return NextResponse.json({
      success: true,
      data: clientInfo,
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('❌ Erro na API client-info:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get client information',
      timestamp: Date.now()
    }, { status: 500 });
  }
}

// Método POST para testes
export async function POST(request: Request) {
  return GET(request);
}