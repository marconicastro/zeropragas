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

// API de geolocalização via ip-api.com (principal)
async function getLocationByIP(ip: string): Promise<Partial<ClientInfo>> {
  try {
    // ip-api.com - gratuito e sem necessidade de API key
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'fail') {
      console.warn('❌ Falha na API principal (ip-api.com):', data.message);
      return await getLocationByIPBackup1(ip);
    }
    
    // Mapear resposta para nosso formato
    const locationData = {
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
    
    // Se dados críticos faltarem, tentar API backup para completar
    if (!locationData.region || !locationData.postalCode) {
      console.log('🔄 Dados incompletos na API principal (region/zip), tentando backup...');
      const backupData = await getLocationByIPBackup1(ip);
      
      // Complementar apenas os dados faltantes
      return {
        ...locationData,
        region: locationData.region || backupData.region,
        postalCode: locationData.postalCode || backupData.postalCode,
        city: locationData.city || backupData.city
      };
    }
    
    console.log('✅ API principal funcionou com dados completos');
    return locationData;
    
  } catch (error) {
    console.error('❌ Erro na API principal:', error);
    return await getLocationByIPBackup1(ip);
  }
}

// API Backup 1: ipgeolocation.io (gratuito)
async function getLocationByIPBackup1(ip: string): Promise<Partial<ClientInfo>> {
  try {
    console.log('🔄 Tentando API Backup 1 (ipgeolocation.io)...');
    
    const response = await fetch(`https://api.ipgeolocation.io/ipgeo?apiKey=free&ip=${ip}&fields=country_code2,country_name,state_prov,city,zipcode,latitude,longitude,time_zone,isp,organization`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    const locationData = {
      ip: ip,
      city: data.city?.toLowerCase().trim() || null,
      region: data.state_prov?.toLowerCase().trim() || null,
      regionCode: data.state_prov?.toLowerCase().trim() || null,
      country: data.country_name?.toLowerCase() || null,
      countryCode: data.country_code2?.toLowerCase() || null,
      postalCode: data.zipcode?.replace(/\D/g, '') || null,
      timezone: data.time_zone?.name,
      isp: data.isp,
      org: data.organization,
      lat: data.latitude,
      lon: data.longitude
    };
    
    // Se ainda faltar dados críticos, tentar próxima API
    if (!locationData.region || !locationData.postalCode) {
      console.log('🔄 Dados ainda incompletos no Backup 1, tentando Backup 2...');
      const backupData = await getLocationByIPBackup2(ip);
      
      return {
        ...locationData,
        region: locationData.region || backupData.region,
        postalCode: locationData.postalCode || backupData.postalCode,
        city: locationData.city || backupData.city
      };
    }
    
    console.log('✅ API Backup 1 funcionou');
    return locationData;
    
  } catch (error) {
    console.error('❌ Erro na API Backup 1:', error);
    return await getLocationByIPBackup2(ip);
  }
}

// API Backup 2: ipapi.co (gratuito)
async function getLocationByIPBackup2(ip: string): Promise<Partial<ClientInfo>> {
  try {
    console.log('🔄 Tentando API Backup 2 (ipapi.co)...');
    
    const response = await fetch(`https://ipapi.co/${ip}/json/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    const locationData = {
      ip: ip,
      city: data.city?.toLowerCase().trim() || null,
      region: data.region?.toLowerCase().trim() || null,
      regionCode: data.region_code?.toLowerCase() || null,
      country: data.country_name?.toLowerCase() || null,
      countryCode: data.country_code?.toLowerCase() || null,
      postalCode: data.postal?.replace(/\D/g, '') || null,
      timezone: data.timezone,
      isp: data.org,
      org: data.org,
      lat: data.latitude,
      lon: data.longitude
    };
    
    // Se ainda faltar dados, tentar última API
    if (!locationData.region || !locationData.postalCode) {
      console.log('🔄 Dados ainda incompletos no Backup 2, tentando Backup 3...');
      const backupData = await getLocationByIPBackup3(ip);
      
      return {
        ...locationData,
        region: locationData.region || backupData.region,
        postalCode: locationData.postalCode || backupData.postalCode,
        city: locationData.city || backupData.city
      };
    }
    
    console.log('✅ API Backup 2 funcionou');
    return locationData;
    
  } catch (error) {
    console.error('❌ Erro na API Backup 2:', error);
    return await getLocationByIPBackup3(ip);
  }
}

// API Backup 3: ip-api.com (endpoint alternativo)
async function getLocationByIPBackup3(ip: string): Promise<Partial<ClientInfo>> {
  try {
    console.log('🔄 Tentando API Backup 3 (ip-api.com alternativo)...');
    
    const response = await fetch(`http://ip-api.com/json/${ip}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status === 'fail') {
      console.warn('❌ Todas as APIs falharam, usando dados padrão Brasil');
      return getDefaultBrazilData(ip);
    }
    
    const locationData = {
      ip: ip,
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
    
    console.log('✅ API Backup 3 funcionou');
    return locationData;
    
  } catch (error) {
    console.error('❌ Erro na API Backup 3:', error);
    return getDefaultBrazilData(ip);
  }
}

// Dados padrão Brasil (último recurso)
function getDefaultBrazilData(ip: string): Partial<ClientInfo> {
  console.log('🇧🇷 Usando dados padrão Brasil (último recurso)');
  
  return {
    ip: ip,
    city: null,
    region: null,
    regionCode: null,
    country: 'brasil',
    countryCode: 'br',
    postalCode: null,
    timezone: 'America/Sao_Paulo',
    isp: null,
    org: null,
    lat: -14.235,
    lon: -51.925
  };
}

// API endpoint principal
export async function GET(request: Request) {
  try {
    // 1. Obter IP real do cliente
    const clientIP = getClientIP(request);
    console.log('🌐 IP do cliente detectado:', clientIP);
    
    // 2. Obter informações de geolocalização com múltiplos backups
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